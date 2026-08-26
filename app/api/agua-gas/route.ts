// Caminho: C:\valente_conecta\app\api\agua-gas\route.ts
//
// Reescrita sobre Supabase (014_agua_gas_supabase.sql) — antes gravava em
// data/agua_gas_*.json, que nao sobrevive a runtime serverless. Mantem
// EXATAMENTE o mesmo contrato de request/response (campos em camelCase,
// mesmos query params) para as 3 telas que ja consomem essa rota nao
// precisarem mudar uma linha: app/agua-gas/page.tsx, app/agua-gas/fornecedor
// /page.tsx e app/admin-master/agua-gas/page.tsx.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';

function fornecedorParaApi(f: any) {
  // mp_access_token/mp_refresh_token NUNCA saem pro navegador -- so' o
  // booleano de "esta conectado" (ver 081_agua_gas_pedido_expresso.sql),
  // mesmo padrao ja usado em app/api/carona/motoristas/route.ts.
  return {
    id: f.id,
    donoId: f.dono_id || null,
    nome: f.nome,
    responsavel: f.responsavel || '',
    telefone: f.telefone,
    whatsapp: f.whatsapp || f.telefone,
    bairro: f.bairro || '',
    endereco: f.endereco || '',
    cidade: f.cidade || 'Valente',
    descricao: f.descricao || '',
    foto: f.foto || '',
    horario: f.horario || '',
    atendimento24h: f.atendimento_24h ?? false,
    diasFuncionamento: f.dias_funcionamento || null,
    temEntrega: f.tem_entrega,
    taxaEntrega: Number(f.taxa_entrega || 0),
    freteGratisAcima: Number(f.frete_gratis_acima || 0),
    produtos: f.produtos || [],
    precoAguaPadrao: f.preco_agua_padrao != null ? Number(f.preco_agua_padrao) : null,
    descricaoAguaPadrao: f.descricao_agua_padrao || '',
    precoGasPadrao: f.preco_gas_padrao != null ? Number(f.preco_gas_padrao) : null,
    descricaoGasPadrao: f.descricao_gas_padrao || '',
    status: f.status,
    destaque: f.destaque,
    latitude: f.latitude,
    longitude: f.longitude,
    aceitaDinheiro: f.aceita_dinheiro ?? true,
    aceitaCartao: f.aceita_cartao ?? false,
    aceitaPix: f.aceita_pix ?? false,
    aceitaValeGas: f.aceita_vale_gas ?? false,
    aceitaFiado: f.aceita_fiado ?? false,
    mpConectado: !!f.mp_access_token,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  };
}

function pedidoParaApi(p: any) {
  return {
    id: p.id,
    fornecedorId: p.fornecedor_id,
    fornecedorNome: p.fornecedor_nome || '',
    clienteNome: p.cliente_nome,
    clienteTelefone: p.cliente_telefone,
    produto: p.produto,
    quantidade: p.quantidade,
    valorTotal: p.valor_total,
    endereco: p.endereco || '',
    observacoes: p.observacoes || '',
    formaPagamento: p.forma_pagamento || '',
    entregadorId: p.entregador_id || null,
    origem: p.origem || 'whatsapp',
    categoria: p.categoria || null,
    pagamentoStatus: p.pagamento_status || 'nao_aplicavel',
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function entregadorParaApi(e: any) {
  return {
    id: e.id,
    fornecedorId: e.fornecedor_id,
    nome: e.nome,
    telefone: e.telefone,
    fotoUrl: e.foto_url || '',
    veiculo: e.veiculo || '',
    ativo: e.ativo,
    latitude: e.latitude,
    longitude: e.longitude,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const supabase = createClient();

  if (recurso === 'financeiro') {
    // Movimentacoes financeiras do modulo, pro admin master ter visao
    // completa (ver 014_agua_gas_supabase.sql) — pagamentos gerados quando
    // um pedido e' confirmado, enriquecidos com dados do pedido/fornecedor.
    const { data: pagamentos, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('origem', 'pedido')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const idsPedidos = (pagamentos || []).map((p: any) => p.referencia_id);
    const { data: pedidos } = idsPedidos.length
      ? await supabase.from('agua_gas_pedidos').select('id, fornecedor_nome, produto, cliente_nome').in('id', idsPedidos)
      : { data: [] as any[] };
    const pedidosPorId = new Map((pedidos || []).map((p: any) => [p.id, p]));

    const movimentacoes = (pagamentos || []).map((p: any) => ({
      id: p.id,
      valor: Number(p.valor || 0),
      status: p.status,
      createdAt: p.created_at,
      pedido: pedidosPorId.get(p.referencia_id) || null,
    }));
    return NextResponse.json({ success: true, data: movimentacoes });
  }

  if (recurso === 'pedidos') {
    const fornecedorId = searchParams.get('fornecedorId');
    const id = searchParams.get('id');
    let query = supabase.from('agua_gas_pedidos').select('*').order('created_at', { ascending: false });
    if (fornecedorId) query = query.eq('fornecedor_id', fornecedorId);
    if (id) query = query.eq('id', id);
    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Pedido unico (tela de rastreio do cliente): anexa dados do entregador
    // designado, incluindo a localizacao ao vivo pro mapa.
    if (id) {
      const pedido = (data || [])[0];
      if (!pedido) return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
      let entregador: ReturnType<typeof entregadorParaApi> | null = null;
      if (pedido.entregador_id) {
        const { data: e } = await supabase.from('agua_gas_entregadores').select('*').eq('id', pedido.entregador_id).maybeSingle();
        if (e) entregador = entregadorParaApi(e);
      }
      return NextResponse.json({ success: true, data: { ...pedidoParaApi(pedido), entregador } });
    }

    return NextResponse.json({ success: true, data: (data || []).map(pedidoParaApi) });
  }

  if (recurso === 'entregadores') {
    const fornecedorId = searchParams.get('fornecedorId');
    const id = searchParams.get('id');
    let query = supabase.from('agua_gas_entregadores').select('*').order('created_at', { ascending: false });
    if (fornecedorId) query = query.eq('fornecedor_id', fornecedorId);
    if (id) query = query.eq('id', id);
    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: (data || []).map(entregadorParaApi) });
  }

  const status = searchParams.get('status');
  const tipo = searchParams.get('tipo');
  const busca = (searchParams.get('busca') || '').toLowerCase();
  const donoId = searchParams.get('donoId');
  const fornecedorId = searchParams.get('id');

  let query = supabase.from('agua_gas_fornecedores').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  if (donoId) query = query.eq('dono_id', donoId);
  if (fornecedorId) query = query.eq('id', fornecedorId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  let items = data || [];
  if (tipo) items = items.filter((i: any) => Array.isArray(i.produtos) && i.produtos.some((p: any) => p.tipo === tipo));
  if (busca) {
    items = items.filter((i: any) =>
      i.nome?.toLowerCase().includes(busca) ||
      i.bairro?.toLowerCase().includes(busca) ||
      i.produtos?.some((p: any) => p.descricao?.toLowerCase().includes(busca))
    );
  }
  return NextResponse.json({ success: true, data: items.map(fornecedorParaApi) });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const body = await request.json();
  const supabase = createClient();

  if (recurso === 'entregadores') {
    if (!body.fornecedorId || !body.nome?.trim() || !body.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'fornecedorId, nome e telefone são obrigatórios.' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('agua_gas_entregadores')
      .insert({
        fornecedor_id: body.fornecedorId,
        nome: String(body.nome).trim(),
        telefone: String(body.telefone).trim(),
        foto_url: String(body.fotoUrl || '').trim(),
        veiculo: String(body.veiculo || '').trim(),
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: entregadorParaApi(data) });
  }

  if (recurso === 'pedidos') {
    if (!body.fornecedorId || !body.clienteNome?.trim() || !body.clienteTelefone?.trim() || !body.produto?.trim()) {
      return NextResponse.json({ success: false, error: 'fornecedorId, clienteNome, clienteTelefone e produto são obrigatórios.' }, { status: 400 });
    }

    if (body.clienteId) {
      const cota = await verificarECConsumirPlanoGeral(body.clienteId, 'agua_gas');
      if (!cota.permitido) {
        return NextResponse.json(
          { success: false, limiteAtingido: true, tier: cota.tier, error: 'Você atingiu seu limite mensal de pedidos de água/gás pro seu plano.' },
          { status: 402 }
        );
      }
    }

    const quantidade = Number(body.quantidade || 1);
    let valorTotal: number | null = null;
    const { data: fornecedor } = await supabase.from('agua_gas_fornecedores').select('produtos').eq('id', body.fornecedorId).maybeSingle();
    if (fornecedor?.produtos) {
      const produtoRef = (fornecedor.produtos as any[]).find((p) => p.descricao === body.produto);
      if (produtoRef?.preco) valorTotal = Number(produtoRef.preco) * quantidade;
    }

    const { data, error } = await supabase
      .from('agua_gas_pedidos')
      .insert({
        fornecedor_id: body.fornecedorId,
        fornecedor_nome: body.fornecedorNome || '',
        cliente_id: body.clienteId || null,
        cliente_nome: String(body.clienteNome).trim(),
        cliente_telefone: String(body.clienteTelefone).trim(),
        produto: String(body.produto).trim(),
        quantidade,
        valor_total: valorTotal,
        endereco: String(body.endereco || '').trim(),
        observacoes: String(body.observacoes || '').trim(),
        forma_pagamento: String(body.formaPagamento || '').trim(),
      })
      .select('*')
      .single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: pedidoParaApi(data) });
  }

  if (!body.nome?.trim() || !body.telefone?.trim()) {
    return NextResponse.json({ success: false, error: 'Nome e telefone são obrigatórios.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('agua_gas_fornecedores')
    .insert({
      dono_id: body.donoId || null,
      nome: String(body.nome).trim(),
      responsavel: String(body.responsavel || '').trim(),
      telefone: String(body.telefone).trim(),
      whatsapp: String(body.whatsapp || body.telefone).trim(),
      bairro: String(body.bairro || '').trim(),
      endereco: String(body.endereco || '').trim(),
      cidade: String(body.cidade || 'Valente').trim(),
      descricao: String(body.descricao || '').trim(),
      foto: String(body.foto || '').trim(),
      horario: String(body.horario || '').trim(),
      atendimento_24h: Boolean(body.atendimento24h ?? false),
      dias_funcionamento: body.diasFuncionamento ?? null,
      tem_entrega: Boolean(body.temEntrega ?? true),
      taxa_entrega: Number(body.taxaEntrega || 0),
      frete_gratis_acima: Number(body.freteGratisAcima || 0),
      produtos: Array.isArray(body.produtos) ? body.produtos : [],
      preco_agua_padrao: body.precoAguaPadrao != null ? Number(body.precoAguaPadrao) : null,
      descricao_agua_padrao: String(body.descricaoAguaPadrao || '').trim(),
      preco_gas_padrao: body.precoGasPadrao != null ? Number(body.precoGasPadrao) : null,
      descricao_gas_padrao: String(body.descricaoGasPadrao || '').trim(),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      aceita_dinheiro: Boolean(body.aceitaDinheiro ?? true),
      aceita_cartao: Boolean(body.aceitaCartao ?? false),
      aceita_pix: Boolean(body.aceitaPix ?? false),
      aceita_vale_gas: Boolean(body.aceitaValeGas ?? false),
      aceita_fiado: Boolean(body.aceitaFiado ?? false),
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: fornecedorParaApi(data) });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
  const body = await request.json();
  const supabase = createClient();

  if (recurso === 'entregadores') {
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.nome !== undefined) patch.nome = body.nome;
    if (body.telefone !== undefined) patch.telefone = body.telefone;
    if (body.fotoUrl !== undefined) patch.foto_url = body.fotoUrl;
    if (body.veiculo !== undefined) patch.veiculo = body.veiculo;
    if (body.ativo !== undefined) patch.ativo = body.ativo;
    if (body.latitude !== undefined) patch.latitude = body.latitude;
    if (body.longitude !== undefined) patch.longitude = body.longitude;

    const { data, error } = await supabase.from('agua_gas_entregadores').update(patch).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: entregadorParaApi(data) });
  }

  if (recurso === 'pedidos') {
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = body.status;
    if (body.observacoes !== undefined) patch.observacoes = body.observacoes;
    if (body.entregadorId !== undefined) patch.entregador_id = body.entregadorId;

    const { data: anterior } = await supabase.from('agua_gas_pedidos').select('*').eq('id', id).maybeSingle();
    if (!anterior) return NextResponse.json({ success: false, error: 'Registro não encontrado.' }, { status: 404 });

    const { data, error } = await supabase.from('agua_gas_pedidos').update(patch).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Movimentacao financeira: confirmar um pedido gera um registro em
    // `pagamentos`, o que da' ao admin master visao completa (ver
    // 014_agua_gas_supabase.sql). So' loga na transicao para 'confirmado',
    // nunca duplica se o pedido ja' estava confirmado.
    if (body.status === 'confirmado' && anterior.status !== 'confirmado' && anterior.cliente_id) {
      await supabase.from('pagamentos').insert({
        usuario_id: anterior.cliente_id,
        origem: 'pedido',
        referencia_id: id,
        valor: data.valor_total || 0,
        metodo: null,
        status: 'aprovado',
      });
    }

    return NextResponse.json({ success: true, data: pedidoParaApi(data) });
  }

  const patch: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) patch.status = body.status;
  if (body.destaque !== undefined) patch.destaque = body.destaque;
  if (body.nome !== undefined) patch.nome = body.nome;
  if (body.responsavel !== undefined) patch.responsavel = body.responsavel;
  if (body.telefone !== undefined) patch.telefone = body.telefone;
  if (body.whatsapp !== undefined) patch.whatsapp = body.whatsapp;
  if (body.bairro !== undefined) patch.bairro = body.bairro;
  if (body.endereco !== undefined) patch.endereco = body.endereco;
  if (body.horario !== undefined) patch.horario = body.horario;
  if (body.atendimento24h !== undefined) patch.atendimento_24h = body.atendimento24h;
  if (body.diasFuncionamento !== undefined) patch.dias_funcionamento = body.diasFuncionamento;
  if (body.temEntrega !== undefined) patch.tem_entrega = body.temEntrega;
  if (body.taxaEntrega !== undefined) patch.taxa_entrega = body.taxaEntrega;
  if (body.freteGratisAcima !== undefined) patch.frete_gratis_acima = body.freteGratisAcima;
  if (body.produtos !== undefined) patch.produtos = body.produtos;
  if (body.precoAguaPadrao !== undefined) patch.preco_agua_padrao = body.precoAguaPadrao;
  if (body.descricaoAguaPadrao !== undefined) patch.descricao_agua_padrao = body.descricaoAguaPadrao;
  if (body.precoGasPadrao !== undefined) patch.preco_gas_padrao = body.precoGasPadrao;
  if (body.descricaoGasPadrao !== undefined) patch.descricao_gas_padrao = body.descricaoGasPadrao;
  if (body.latitude !== undefined) patch.latitude = body.latitude;
  if (body.longitude !== undefined) patch.longitude = body.longitude;
  if (body.aceitaDinheiro !== undefined) patch.aceita_dinheiro = body.aceitaDinheiro;
  if (body.aceitaCartao !== undefined) patch.aceita_cartao = body.aceitaCartao;
  if (body.aceitaPix !== undefined) patch.aceita_pix = body.aceitaPix;
  if (body.aceitaValeGas !== undefined) patch.aceita_vale_gas = body.aceitaValeGas;
  if (body.aceitaFiado !== undefined) patch.aceita_fiado = body.aceitaFiado;

  const { data, error } = await supabase.from('agua_gas_fornecedores').update(patch).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: fornecedorParaApi(data) });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
  const supabase = createClient();

  const tabela = recurso === 'pedidos' ? 'agua_gas_pedidos' : recurso === 'entregadores' ? 'agua_gas_entregadores' : 'agua_gas_fornecedores';
  const { error } = await supabase.from(tabela).delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
