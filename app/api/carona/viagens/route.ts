// Caminho: C:\valente_conecta\app\api\carona\viagens\route.ts
//
// GET lista viagens PUBLICADAS (taxa do motorista ja paga) — a
// disponibilidade e' visivel pra todo mundo, sem custo, so' a vitrine.
// POST anuncia uma viagem nova: fica 'aguardando_pagamento' e ja volta com
// o link de checkout da taxa (Mercado Pago, mesmo padrao de
// app/api/planos/checkout/route.ts) — so' aparece na vitrine depois que o
// webhook confirmar o pagamento (ver app/api/webhooks/mercadopago/route.ts,
// prefixo "carona_listagem_").

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function taxaMotoristaAtual(supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'carona_config').maybeSingle();
  const config = data?.valor ? JSON.parse(data.valor) : { taxaMotorista: 10 };
  return Number(config.taxaMotorista || 0);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cidadeOrigem = searchParams.get('cidadeOrigem');
  const cidadeDestino = searchParams.get('cidadeDestino');
  const motoristaId = searchParams.get('motoristaId');
  const id = searchParams.get('id');

  const supabase = createClient();

  // Busca uma viagem especifica por id, independente do status — usada pelo
  // passageiro pra acompanhar o proprio pedido aceito, mesmo antes da
  // viagem aparecer na vitrine publica (taxa do motorista ainda nao paga).
  if (id) {
    const { data, error } = await supabase
      .from('carona_viagens')
      .select('*, motorista:carona_motoristas(id, nome, foto_url, veiculo_foto_url, veiculo, placa)')
      .eq('id', id)
      .maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  }
  // NUNCA inclui telefone aqui — a listagem publica e' de graca, o contato
  // so' pode ser lido depois que o desbloqueio daquela viagem foi pago (ver
  // GET /api/carona/desbloqueios). Se telefone entrasse nessa resposta,
  // qualquer um leria o numero sem pagar, o que quebra o modelo de negocio
  // inteiro dessa funcionalidade.
  let query = supabase
    .from('carona_viagens')
    .select('*, motorista:carona_motoristas(id, nome, foto_url, veiculo_foto_url, veiculo, placa)')
    .order('data_viagem', { ascending: true });

  if (motoristaId) {
    query = query.eq('motorista_id', motoristaId);
  } else {
    query = query.eq('status', 'publicada').gte('data_viagem', new Date().toISOString().slice(0, 10));
  }
  if (cidadeOrigem) query = query.ilike('cidade_origem', `%${cidadeOrigem}%`);
  if (cidadeDestino) query = query.ilike('cidade_destino', `%${cidadeDestino}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const obrigatorios = ['motoristaId', 'cidadeOrigem', 'cidadeDestino', 'dataViagem', 'vagasDisponiveis'];
    for (const campo of obrigatorios) {
      if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }
    if (!body.precoSugeridoVaga || Number(body.precoSugeridoVaga) <= 0) {
      return NextResponse.json({ success: false, error: 'Informe o valor da passagem por vaga.' }, { status: 400 });
    }

    const supabase = createClient();
    const taxa = await taxaMotoristaAtual(supabase);

    const { data: viagem, error } = await supabase
      .from('carona_viagens')
      .insert({
        motorista_id: body.motoristaId,
        cidade_origem: body.cidadeOrigem,
        cidade_destino: body.cidadeDestino,
        data_viagem: body.dataViagem,
        horario_saida: body.horarioSaida || null,
        vagas_disponiveis: Number(body.vagasDisponiveis),
        preco_sugerido_vaga: body.precoSugeridoVaga ? Number(body.precoSugeridoVaga) : null,
        observacoes: body.observacoes || null,
        status: taxa > 0 ? 'aguardando_pagamento' : 'publicada',
        taxa_valor: taxa,
      })
      .select('*')
      .single();
    if (error) throw error;

    // Aceite de um pedido de passageiro (carona_solicitacoes, ver
    // 060_carona_solicitacoes.sql) — marca como atendida e liga a' viagem
    // criada, independente de pagamento ja' ter sido confirmado ou nao: o
    // "aceite" e' o motorista se comprometer a fazer a viagem.
    if (body.solicitacaoId) {
      await supabase
        .from('carona_solicitacoes')
        .update({ status: 'atendida', viagem_id: viagem.id, atendida_em: new Date().toISOString() })
        .eq('id', body.solicitacaoId);
    }

    // Taxa zerada (admin desligou): publica direto, sem cobranca.
    if (taxa <= 0) {
      return NextResponse.json({ success: true, data: viagem, precisaPagamento: false });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Fale com o suporte.' }, { status: 500 });
    }

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload = {
      external_reference: `carona_listagem_${viagem.id}`,
      notification_url: notificationUrl,
      payer: { name: body.nomeMotorista || 'Motorista' },
      items: [
        {
          id: viagem.id,
          title: `Carona Solidária — exibir viagem ${body.cidadeOrigem} → ${body.cidadeDestino}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(taxa.toFixed(2)),
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { viagemId: viagem.id, origem: 'carona_listagem' },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencePayload),
    });
    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return NextResponse.json({ success: false, error: mpData?.message || 'Erro ao criar checkout no Mercado Pago' }, { status: 500 });
    }

    await supabase.from('carona_viagens').update({ mp_preference_id: mpData.id }).eq('id', viagem.id);

    return NextResponse.json({
      success: true,
      data: { ...viagem, mp_preference_id: mpData.id },
      precisaPagamento: true,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao anunciar viagem' }, { status: 500 });
  }
}
