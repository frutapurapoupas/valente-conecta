// Caminho: C:\valente_conecta\app\api\saude-fila\entrar\route.ts
//
// Paciente entra na fila do dia de uma unidade (ver proposta "Modo
// Valente Facil", item 5, passo 1-3 da jornada). Autodeclaracao de
// prioridade legal (lib/saude/prioridadeLegal.ts) e pre-triagem simples
// vao junto no mesmo request.
//
// Pagamento em unidade particular/hibrida: "online" cria um checkout no
// Mercado Pago da PROPRIA conta do diretor (split automatico, precisa
// estar conectada -- ver .../mercadopago/conectar), "dinheiro" so' marca
// "aguardando" pro atendente confirmar na chegada. A comissao usada no
// marketplace_fee e' a mesma configurada pro dinheiro
// (unidade_saude_config.comissao_pagamento_dinheiro_pct) -- nao criamos
// um campo separado só pra isso.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { calcularPrioridade, type AutodeclaracaoPrioridade } from '@/lib/saude/prioridadeLegal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const unidadeId = String(body.unidadeId || '').trim();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!unidadeId || !usuarioId) {
      return NextResponse.json({ success: false, error: 'unidadeId e usuarioId são obrigatórios' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: jaNaFila } = await supabase
      .from('fila_saude_senhas')
      .select('id')
      .eq('unidade_id', unidadeId)
      .eq('usuario_id', usuarioId)
      .in('status', ['aguardando', 'presente', 'em_atendimento'])
      .maybeSingle();
    if (jaNaFila) {
      return NextResponse.json({ success: false, error: 'Você já está na fila dessa unidade hoje.' }, { status: 409 });
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('fila_saude_senhas')
      .select('*', { count: 'exact', head: true })
      .eq('unidade_id', unidadeId)
      .gte('created_at', inicioDoDia.toISOString());
    const numero = (count || 0) + 1;

    const autodeclaracao: AutodeclaracaoPrioridade = body.autodeclaracao || {};
    const { tier, motivo } = calcularPrioridade(autodeclaracao);

    // Le regime/nome separado de mp_access_token: se a migration 111
    // (pagamento online) ainda nao foi aplicada nesse banco, a segunda
    // consulta falha sozinha sem derrubar o fluxo de dinheiro/SUS, que
    // nao depende dela.
    const { data: unidadeBase } = await supabase.from('unidades_saude').select('regime, nome').eq('id', unidadeId).maybeSingle();
    const { data: unidadeMp, error: erroMp } = await supabase.from('unidades_saude').select('mp_access_token').eq('id', unidadeId).maybeSingle();
    const mpAccessToken = erroMp ? null : (unidadeMp?.mp_access_token || null);
    const unidade = unidadeBase ? { ...unidadeBase, mp_access_token: mpAccessToken } : null;

    let formaPagamento: string | null = null;
    let statusPagamento = 'nao_aplicavel';
    let valorPagamento: number | null = null;
    let servicoNome = '';

    if (unidade && unidade.regime !== 'sus') {
      const formaEscolhida = body.formaPagamento === 'online' ? 'online' : 'dinheiro';
      formaPagamento = formaEscolhida;
      statusPagamento = 'aguardando';
      if (body.servicoId) {
        const { data: servico } = await supabase.from('unidade_saude_servicos').select('nome, preco').eq('id', body.servicoId).maybeSingle();
        valorPagamento = servico ? Number(servico.preco) : null;
        servicoNome = servico?.nome || '';
      }
      if (formaEscolhida === 'online') {
        if (!valorPagamento || valorPagamento <= 0) {
          return NextResponse.json({ success: false, error: 'Escolha um serviço com valor definido pra pagar online.' }, { status: 400 });
        }
        if (!unidade.mp_access_token) {
          return NextResponse.json({ success: false, error: 'Essa unidade ainda não conectou o Mercado Pago — escolha pagar em dinheiro.' }, { status: 400 });
        }
      }
    }

    const { data: senha, error } = await supabase
      .from('fila_saude_senhas')
      .insert({
        unidade_id: unidadeId,
        usuario_id: usuarioId,
        numero,
        origem: 'app',
        prioridade_tier: tier,
        motivo_prioridade: motivo,
        servico_id: body.servicoId || null,
        pre_triagem: body.preTriagem || null,
        status: 'aguardando',
        forma_pagamento: formaPagamento,
        status_pagamento: statusPagamento,
        valor_pagamento: valorPagamento,
      })
      .select('*')
      .single();
    if (error) throw error;

    if (formaPagamento !== 'online') {
      return NextResponse.json({ success: true, data: senha, checkoutUrl: null });
    }

    const { data: config } = await supabase.from('unidade_saude_config').select('comissao_pagamento_dinheiro_pct').eq('unidade_id', unidadeId).maybeSingle();
    const pct = Number(config?.comissao_pagamento_dinheiro_pct || 0);
    const marketplaceFee = Number((Number(valorPagamento) * (pct / 100)).toFixed(2));

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${unidade!.mp_access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        external_reference: `fila_saude_senha_${senha.id}`,
        notification_url: notificationUrl,
        marketplace_fee: marketplaceFee,
        items: [{ id: senha.id, title: `${servicoNome || 'Consulta'} — ${unidade!.nome}`, quantity: 1, currency_id: 'BRL', unit_price: Number(valorPagamento) }],
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
        metadata: { senhaId: senha.id, origem: 'fila_saude' },
      }),
    });
    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      // A senha ja foi criada -- nao desfaz, so' avisa que o checkout
      // falhou. O paciente pode tentar de novo ou pagar em dinheiro na
      // chegada.
      return NextResponse.json({ success: true, data: senha, checkoutUrl: null, avisoPagamento: mpData?.message || 'Não foi possível gerar o link de pagamento agora.' });
    }

    return NextResponse.json({ success: true, data: senha, checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '' });
  } catch (error: any) {
    console.error('Erro ao entrar na fila de saúde:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
