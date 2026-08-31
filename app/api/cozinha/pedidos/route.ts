// Caminho: C:\valente_conecta\app\api\cozinha\pedidos\route.ts
//
// Checkout completo da Cozinha Chef Neide: cria pedido (POST), acompanha
// pro cliente e lista pro admin (GET), avanca status/despacha entrega
// (PUT). Fecha o fluxo RECEITA -> CATALOGO -> PEDIDO documentado em
// docs/cozinha-chef-neide/01_ARQUITETURA_FUNCIONAL.md.
//
// Regra de seguranca central: preco e perfil (revendedor) SEMPRE
// recalculados/revalidados aqui, nunca confiados ao valor que vem do
// client -- ver recalcularItens() e resolverPerfilEfetivo().

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromDbToCanonical } from '../receitas/canonical';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const ORDEM_STATUS_ENTREGA = ['aguardando_confirmacao', 'confirmado', 'em_producao', 'saiu_para_entrega', 'entregue'];
const ORDEM_STATUS_RETIRADA = ['aguardando_confirmacao', 'confirmado', 'em_producao', 'pronto_para_retirada', 'entregue'];

function ordemStatus(tipoEntrega: string) {
  return tipoEntrega === 'entrega' ? ORDEM_STATUS_ENTREGA : ORDEM_STATUS_RETIRADA;
}

async function lerConfigJson<T extends Record<string, any>>(supabase: ReturnType<typeof createClient>, chave: string, fallback: T): Promise<T> {
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', chave).maybeSingle();
  if (!data?.valor) return fallback;
  try {
    return { ...fallback, ...JSON.parse(data.valor) };
  } catch {
    return fallback;
  }
}

async function calcularDescontoPerfil(supabase: ReturnType<typeof createClient>, perfil: string): Promise<number> {
  const config = await lerConfigJson(supabase, 'cozinha_descontos', { descontoAssinante: 15, descontoRevendedor: 19 });
  if (perfil === 'assinante') return Number(config.descontoAssinante) || 0;
  if (perfil === 'revendedor') return Number(config.descontoRevendedor) || 0;
  return 0;
}

// Fecha a brecha do `?perfil=revendedor` na URL (hoje sem verificacao
// nenhuma, ver app/admin-master/cozinha-chef/hooks/usePerfilCozinha.ts):
// so' aceita perfil revendedor se existir cadastro ATIVO em
// cozinha_revendedores pra esse whatsapp. Qualquer outra alegacao e'
// rebaixada pra publico.
async function resolverPerfilEfetivo(supabase: ReturnType<typeof createClient>, perfilAlegado: string, whatsapp: string) {
  if (perfilAlegado !== 'revendedor') return { perfil: perfilAlegado, revendedor: null as any };
  const { data: revendedor } = await supabase
    .from('cozinha_revendedores')
    .select('*')
    .eq('whatsapp', whatsapp)
    .eq('ativo', true)
    .maybeSingle();
  if (!revendedor) return { perfil: 'publico', revendedor: null as any };
  return { perfil: 'revendedor', revendedor };
}

// Recalcula cada item do carrinho a partir da receita/cardapio reais --
// preco da receita nao e' coluna simples, fica dentro de
// receitas.instrucoes (JSON), so' fromDbToCanonical decodifica direito
// (ver app/api/cozinha/receitas/canonical.ts).
async function recalcularItens(
  supabase: ReturnType<typeof createClient>,
  itensBody: any[],
  perfilEfetivo: string
) {
  const descontoPercentual = await calcularDescontoPerfil(supabase, perfilEfetivo);
  const itens: any[] = [];
  let subtotalSemDesconto = 0;
  let subtotalComDesconto = 0;

  for (const itemBody of itensBody) {
    const quantidade = Math.max(0, parseInt(itemBody?.quantidade, 10) || 0);
    const receitaId = String(itemBody?.receitaId || '').trim();
    if (quantidade <= 0 || !receitaId) continue;

    const { data: receitaRow } = await supabase.from('receitas').select('*').eq('id', receitaId).maybeSingle();
    if (!receitaRow) continue;
    const receita = fromDbToCanonical(receitaRow);
    if (receita.status === 'inativo') continue;

    let precoBase = receita.preco_venda;
    const cardapioId = itemBody?.cardapioId ? String(itemBody.cardapioId) : null;
    if (cardapioId) {
      const { data: cardapioRow } = await supabase.from('cardapio').select('*').eq('id', cardapioId).maybeSingle();
      if (cardapioRow && cardapioRow.usar_preco_da_receita === false && cardapioRow.preco_customizado != null) {
        precoBase = Number(cardapioRow.preco_customizado);
      }
    }

    const precoComDesconto = parseFloat((precoBase * (1 - descontoPercentual / 100)).toFixed(2));
    const subtotalItemSemDesconto = precoBase * quantidade;
    const subtotalItemComDesconto = parseFloat((precoComDesconto * quantidade).toFixed(2));

    subtotalSemDesconto += subtotalItemSemDesconto;
    subtotalComDesconto += subtotalItemComDesconto;

    itens.push({
      receita_id: receitaId,
      cardapio_id: cardapioId,
      titulo: receita.nome,
      preco_unitario: precoComDesconto,
      quantidade,
      subtotal: subtotalItemComDesconto,
    });
  }

  return {
    itens,
    subtotal: parseFloat(subtotalComDesconto.toFixed(2)),
    descontoPercentual,
    descontoValor: parseFloat((subtotalSemDesconto - subtotalComDesconto).toFixed(2)),
  };
}

function resolverStatusInicial(perfilEfetivo: string, revendedor: any, formaPagamentoBody: string) {
  if (perfilEfetivo === 'revendedor' && revendedor) {
    if (revendedor.forma_confirmacao === 'aprovacao_manual') {
      return { formaPagamento: 'combinado_admin' as const, status: 'aguardando_confirmacao' as const, statusPagamento: 'combinado_admin' as const, confirmadoEm: null as string | null };
    }
    // 'fiado_prazo' ou 'pagamento_entrega' -- confirmacao automatica, sem
    // esperar admin (combinacao ja aprovada previamente pro revendedor).
    return { formaPagamento: 'combinado_admin' as const, status: 'confirmado' as const, statusPagamento: 'combinado_admin' as const, confirmadoEm: new Date().toISOString() };
  }

  // Pix manual sempre exige confirmacao manual do admin (nunca o cliente
  // se autodeclara "ja paguei") -- mesmo padrao de seguranca do resto do
  // checkout.
  const formaPagamento = formaPagamentoBody === 'mercado_pago' ? ('mercado_pago' as const) : ('pix_manual' as const);
  return { formaPagamento, status: 'aguardando_confirmacao' as const, statusPagamento: 'aguardando_pagamento' as const, confirmadoEm: null as string | null };
}

async function criarPreferenciaMercadoPago(pedido: any, request: NextRequest): Promise<string | null> {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado — pedido criado sem link de pagamento.');
    return null;
  }

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
  const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

  try {
    const resposta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_reference: `cozinha_pedido_${pedido.id}`,
        notification_url: notificationUrl,
        payer: { name: pedido.cliente_nome },
        items: [{ id: pedido.id, title: 'Pedido Cozinha Chef Neide', quantity: 1, currency_id: 'BRL', unit_price: Number(pedido.total) }],
        metadata: { pedidoId: pedido.id, origem: 'cozinha' },
      }),
    });
    const dadosMp = await resposta.json();
    if (!resposta.ok) {
      console.error('Erro ao criar preferência Mercado Pago (cozinha):', dadosMp);
      return null;
    }

    const supabase = createClient();
    await supabase.from('cozinha_pedidos').update({ mp_preference_id: dadosMp.id }).eq('id', pedido.id);
    return dadosMp.init_point || dadosMp.sandbox_init_point || null;
  } catch (error) {
    console.error('Falha ao chamar Mercado Pago (cozinha):', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clienteNome = String(body.clienteNome || '').trim();
    const clienteWhatsapp = String(body.clienteWhatsapp || '').replace(/\D/g, '');
    const perfilAlegado = ['publico', 'assinante', 'revendedor'].includes(body.perfil) ? body.perfil : 'publico';
    const tipoEntrega = body.tipoEntrega === 'entrega' ? 'entrega' : 'retirada';
    const enderecoEntrega = tipoEntrega === 'entrega' ? String(body.enderecoEntrega || '').trim() : null;
    const observacao = body.observacao ? String(body.observacao).trim() : null;
    const itensBody = Array.isArray(body.itens) ? body.itens : [];

    if (!clienteNome) return NextResponse.json({ success: false, error: 'Informe seu nome' }, { status: 400 });
    if (clienteWhatsapp.length < 10) return NextResponse.json({ success: false, error: 'Informe um WhatsApp válido' }, { status: 400 });
    if (itensBody.length === 0) return NextResponse.json({ success: false, error: 'Carrinho vazio' }, { status: 400 });
    if (tipoEntrega === 'entrega' && !enderecoEntrega) {
      return NextResponse.json({ success: false, error: 'Informe o endereço de entrega' }, { status: 400 });
    }

    const supabase = createClient();

    const { perfil: perfilEfetivo, revendedor } = await resolverPerfilEfetivo(supabase, perfilAlegado, clienteWhatsapp);
    const { itens, subtotal, descontoPercentual, descontoValor } = await recalcularItens(supabase, itensBody, perfilEfetivo);
    if (itens.length === 0) return NextResponse.json({ success: false, error: 'Nenhum item válido no carrinho' }, { status: 400 });

    let taxaEntrega = 0;
    if (tipoEntrega === 'entrega') {
      const configEntrega = await lerConfigJson(supabase, 'entrega_avulsa_config', { taxaEntregaPadrao: 5 });
      taxaEntrega = Number(configEntrega.taxaEntregaPadrao) || 0;
    }
    const total = parseFloat((subtotal + taxaEntrega).toFixed(2));

    const resolucao = resolverStatusInicial(perfilEfetivo, revendedor, body.formaPagamento);

    // Religa cliente_usuario_id por whatsapp, melhor esforco (mesmo padrao
    // de fiado_clientes) -- so' assim da' pra mandar push de status depois.
    const { data: usuarioExistente } = await supabase.from('usuarios').select('id').eq('whatsapp', clienteWhatsapp).maybeSingle();

    const { data: pedido, error } = await supabase
      .from('cozinha_pedidos')
      .insert({
        cliente_usuario_id: usuarioExistente?.id || null,
        cliente_nome: clienteNome,
        cliente_whatsapp: clienteWhatsapp,
        perfil: perfilEfetivo,
        itens,
        subtotal,
        desconto_percentual: descontoPercentual,
        desconto_valor: descontoValor,
        taxa_entrega: taxaEntrega,
        total,
        tipo_entrega: tipoEntrega,
        endereco_entrega: enderecoEntrega,
        observacao,
        forma_pagamento: resolucao.formaPagamento,
        status_pagamento: resolucao.statusPagamento,
        status: resolucao.status,
        confirmado_em: resolucao.confirmadoEm,
      })
      .select('*')
      .single();
    if (error) throw error;

    // Pagamento online agora acontece embutido no proprio checkout via
    // Payment Brick (components/cozinha/PagamentoMercadoPago.tsx), sem
    // preferencia/redirect -- criarPreferenciaMercadoPago fica sem uso
    // aqui de proposito, mantida abaixo caso outro fluxo precise dela.
    return NextResponse.json({ success: true, data: pedido, checkoutUrl: null });
  } catch (error: any) {
    console.error('Erro ao criar pedido da Cozinha:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao criar pedido' }, { status: 500 });
  }
}

// Sincroniza entregas_avulsas.status a partir da mototaxi_corridas ligada,
// sempre que o pedido for consultado -- assim o cliente/admin ve o
// progresso sem precisar de um cron a parte so' pra isso.
async function sincronizarEntrega(supabase: ReturnType<typeof createClient>, pedido: any) {
  const { data: entrega } = await supabase
    .from('entregas_avulsas')
    .select('*')
    .eq('origem_modulo', 'cozinha_pedido')
    .eq('origem_id', pedido.id)
    .maybeSingle();
  if (!entrega) return { entrega: null, motorista: null, entregadorProprio: null };

  let motorista: any = null;
  if (entrega.tipo_entregador === 'mototaxi_pool' && entrega.mototaxi_corrida_id) {
    const { data: corrida } = await supabase.from('mototaxi_corridas').select('*').eq('id', entrega.mototaxi_corrida_id).maybeSingle();
    if (corrida) {
      let novoStatus = entrega.status;
      if (corrida.status === 'aceita' && entrega.status === 'aguardando_aceite') novoStatus = 'aceita';
      else if (corrida.status === 'em_andamento') novoStatus = 'em_entrega';
      else if (corrida.status === 'cancelada') novoStatus = 'cancelada';
      if (novoStatus !== entrega.status) {
        await supabase.from('entregas_avulsas').update({ status: novoStatus, updated_at: new Date().toISOString() }).eq('id', entrega.id);
        entrega.status = novoStatus;
      }
      if (corrida.motorista_id) {
        const { data: motoristaRow } = await supabase.from('mototaxi_motoristas').select('nome, telefone').eq('id', corrida.motorista_id).maybeSingle();
        motorista = { nome: motoristaRow?.nome, telefone: motoristaRow?.telefone, latitude: corrida.motorista_lat, longitude: corrida.motorista_lng };
      }
    }
  }

  let entregadorProprio: any = null;
  if (entrega.tipo_entregador === 'proprio' && entrega.entregador_proprio_id) {
    const { data: entregadorRow } = await supabase.from('entregadores_proprios').select('*').eq('id', entrega.entregador_proprio_id).maybeSingle();
    if (entregadorRow) entregadorProprio = entregadorRow;
  }

  return { entrega, motorista, entregadorProprio };
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const id = request.nextUrl.searchParams.get('id');

  if (id) {
    const { data: pedido, error } = await supabase.from('cozinha_pedidos').select('*').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!pedido) return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 });

    const [{ data: avaliacao }, { entrega, motorista, entregadorProprio }] = await Promise.all([
      supabase.from('cozinha_avaliacoes').select('id').eq('pedido_id', id).maybeSingle(),
      sincronizarEntrega(supabase, pedido),
    ]);

    return NextResponse.json({
      success: true,
      data: { ...pedido, jaAvaliado: !!avaliacao, entrega, motorista, entregadorProprio },
    });
  }

  const status = request.nextUrl.searchParams.get('status');
  const limit = Math.min(200, parseInt(request.nextUrl.searchParams.get('limit') || '50', 10) || 50);
  let query = supabase.from('cozinha_pedidos').select('*').order('created_at', { ascending: false }).limit(limit);
  if (status && status !== 'todos') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

// Verifica se ja existe entregador proprio ativo pra Cozinha; se sim,
// entrega vai direto pra ele. Senao, abre uma encomenda no pool
// compartilhado do Moto Taxi (mesmo mecanismo que os motoristas ja usam
// hoje em app/mototaxi/motorista -- eles fazem polling em corridas
// 'aguardando_motorista', entao essa encomenda aparece pra eles sem
// nenhuma mudanca no app do motorista).
async function despacharEntrega(supabase: ReturnType<typeof createClient>, pedido: any) {
  const { data: entregadorProprio } = await supabase
    .from('entregadores_proprios')
    .select('*')
    .eq('origem_modulo', 'cozinha')
    .eq('ativo', true)
    .limit(1)
    .maybeSingle();

  if (entregadorProprio) {
    await supabase.from('entregas_avulsas').insert({
      origem_modulo: 'cozinha_pedido',
      origem_id: pedido.id,
      cliente_nome: pedido.cliente_nome,
      cliente_whatsapp: pedido.cliente_whatsapp,
      endereco_entrega: pedido.endereco_entrega,
      taxa_entrega: pedido.taxa_entrega,
      tipo_entregador: 'proprio',
      entregador_proprio_id: entregadorProprio.id,
      status: 'aceita',
      aceita_em: new Date().toISOString(),
    });
    return;
  }

  const idCurto = String(pedido.id).slice(0, 8);
  const { data: corrida, error: erroCorrida } = await supabase
    .from('mototaxi_corridas')
    .insert({
      passageiro_id: pedido.cliente_usuario_id || null,
      passageiro_nome: pedido.cliente_nome,
      passageiro_plano: 'gratis',
      motorista_id: null,
      tipo: 'encomenda',
      encomenda_descricao: `Entrega Cozinha Chef Neide — Pedido #${idCurto}`,
      destinatario_nome: pedido.cliente_nome,
      destinatario_telefone: pedido.cliente_whatsapp,
      // Endereco do cliente e' texto livre (sem geocoding no projeto) --
      // mesma limitacao ja aceita no rastreio do Agua e Gas: sem rota
      // calculada, so' a posicao do entregador se aproximando.
      origem: 'Cozinha Chef Neide',
      destino: pedido.endereco_entrega,
      origem_lat: 0,
      origem_lng: 0,
      destino_lat: 0,
      destino_lng: 0,
      preco: pedido.taxa_entrega,
      metodo_pagamento: 'combinado',
      status: 'aguardando_motorista',
    })
    .select('*')
    .single();
  if (erroCorrida) throw erroCorrida;

  await supabase.from('entregas_avulsas').insert({
    origem_modulo: 'cozinha_pedido',
    origem_id: pedido.id,
    cliente_nome: pedido.cliente_nome,
    cliente_whatsapp: pedido.cliente_whatsapp,
    endereco_entrega: pedido.endereco_entrega,
    taxa_entrega: pedido.taxa_entrega,
    tipo_entregador: 'mototaxi_pool',
    mototaxi_corrida_id: corrida.id,
    status: 'aguardando_aceite',
  });
}

const MENSAGEM_STATUS: Record<string, string> = {
  confirmado: 'Pedido confirmado! A Chef Neide já está preparando.',
  em_producao: 'Seu pedido está sendo preparado.',
  pronto_para_retirada: 'Seu pedido está pronto pra retirada!',
  saiu_para_entrega: 'Seu pedido saiu para entrega!',
  entregue: 'Pedido entregue — obrigado!',
  cancelado: 'Seu pedido foi cancelado.',
};

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const novoStatus = String(body.novoStatus || '');
    const recebidoPor = body.recebidoPor ? String(body.recebidoPor).trim() : null;

    const supabase = createClient();
    const { data: pedido, error: erroBusca } = await supabase.from('cozinha_pedidos').select('*').eq('id', id).maybeSingle();
    if (erroBusca) throw erroBusca;
    if (!pedido) return NextResponse.json({ success: false, error: 'Pedido não encontrado' }, { status: 404 });

    if (novoStatus === 'cancelado') {
      if (pedido.status === 'entregue' || pedido.status === 'cancelado') {
        return NextResponse.json({ success: false, error: 'Pedido já finalizado, não pode ser cancelado' }, { status: 409 });
      }
    } else {
      const ordem = ordemStatus(pedido.tipo_entrega);
      const indiceAtual = ordem.indexOf(pedido.status);
      const indiceNovo = ordem.indexOf(novoStatus);
      if (indiceNovo === -1 || indiceNovo !== indiceAtual + 1) {
        return NextResponse.json({ success: false, error: `Transição inválida de "${pedido.status}" para "${novoStatus}"` }, { status: 409 });
      }
    }

    if (novoStatus === 'entregue' && (!recebidoPor || recebidoPor.length === 0)) {
      return NextResponse.json({ success: false, error: 'Informe o nome de quem recebeu o pedido' }, { status: 400 });
    }

    const agora = new Date().toISOString();
    const atualizacao: Record<string, any> = { status: novoStatus, updated_at: agora };
    if (novoStatus === 'confirmado') atualizacao.confirmado_em = agora;
    if (novoStatus === 'em_producao') atualizacao.em_producao_em = agora;
    if (novoStatus === 'pronto_para_retirada') atualizacao.pronto_em = agora;
    if (novoStatus === 'saiu_para_entrega') atualizacao.saiu_para_entrega_em = agora;
    if (novoStatus === 'entregue') {
      atualizacao.entregue_em = agora;
      atualizacao.recebido_por = recebidoPor;
    }
    if (novoStatus === 'cancelado') atualizacao.cancelado_em = agora;

    // Despacha a entrega (moto-taxi ou entregador proprio) so' na hora que
    // o pedido sai pra entrega -- nao faz sentido acionar motoboy antes da
    // comida ficar pronta.
    if (novoStatus === 'saiu_para_entrega' && pedido.tipo_entrega === 'entrega') {
      await despacharEntrega(supabase, pedido);
    }

    const { data: pedidoAtualizado, error: erroUpdate } = await supabase
      .from('cozinha_pedidos')
      .update(atualizacao)
      .eq('id', id)
      .select('*')
      .single();
    if (erroUpdate) throw erroUpdate;

    if (pedidoAtualizado.cliente_usuario_id && MENSAGEM_STATUS[novoStatus]) {
      try {
        await enviarPushParaUsuario(pedidoAtualizado.cliente_usuario_id, {
          titulo: novoStatus === 'entregue' ? 'Pedido entregue!' : 'Atualização do seu pedido',
          corpo: MENSAGEM_STATUS[novoStatus],
          url: `/cozinha/pedido/${pedidoAtualizado.id}`,
        });
      } catch {
        // push e' best-effort, nunca deve quebrar a atualizacao de status
      }
    }

    return NextResponse.json({ success: true, data: pedidoAtualizado });
  } catch (error: any) {
    console.error('Erro ao atualizar pedido da Cozinha:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
