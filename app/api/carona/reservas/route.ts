// Caminho: C:\valente_conecta\app\api\carona\reservas\route.ts
//
// Passageiro reserva e paga a(s) vaga(s) de uma viagem cujo motorista tem
// conta Mercado Pago conectada (ver 080_carona_split_pagamento.sql) -- o
// valor cai direto na conta do motorista, com a taxa da plataforma
// descontada automaticamente (marketplace_fee). Passageiro paga o preco da
// vaga + a taxa dele (5%, ou 0 se tiver plano); o motorista recebe o preco
// da vaga menos a taxa dele (5%, ou 0 se tiver plano) -- os 5%+5% somados
// viram o marketplace_fee. Pagando, o contato do motorista ja libera
// (substitui o desbloqueio avulso).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calcularTaxaSplit } from '@/lib/carona/taxaSplit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  const viagemId = request.nextUrl.searchParams.get('viagemId');
  if (!usuarioId || !viagemId) return NextResponse.json({ success: false, error: 'usuarioId e viagemId são obrigatórios' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('carona_reservas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('viagem_id', viagemId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, viagemId, vagas, nomeUsuario } = body;
    if (!usuarioId || !viagemId) {
      return NextResponse.json({ success: false, error: 'usuarioId e viagemId são obrigatórios' }, { status: 400 });
    }
    const qtdVagas = Math.max(1, Number(vagas) || 1);

    const supabase = createClient();
    const { data: viagem } = await supabase
      .from('carona_viagens')
      .select('id, preco_sugerido_vaga, vagas_disponiveis, cidade_origem, cidade_destino, motorista_id, motorista:carona_motoristas(id, usuario_id, mp_access_token, nome)')
      .eq('id', viagemId)
      .maybeSingle();

    if (!viagem) return NextResponse.json({ success: false, error: 'Viagem não encontrada' }, { status: 404 });
    const motorista: any = Array.isArray(viagem.motorista) ? viagem.motorista[0] : viagem.motorista;
    if (!motorista?.mp_access_token) {
      return NextResponse.json({ success: false, error: 'Esse motorista ainda não conectou a conta Mercado Pago — desbloqueie o contato e combine o pagamento direto com ele.' }, { status: 400 });
    }
    if (!viagem.preco_sugerido_vaga) {
      return NextResponse.json({ success: false, error: 'Essa viagem não tem valor de vaga definido' }, { status: 400 });
    }
    if (Number(viagem.vagas_disponiveis) < qtdVagas) {
      return NextResponse.json({ success: false, error: 'Não há vagas suficientes disponíveis' }, { status: 400 });
    }

    const valorVagas = Number((Number(viagem.preco_sugerido_vaga) * qtdVagas).toFixed(2));
    const { taxaCliente, taxaMotorista, marketplaceFee } = await calcularTaxaSplit(valorVagas, usuarioId, motorista.usuario_id);
    const valorTotalCobrado = Number((valorVagas + taxaCliente).toFixed(2));

    const { data: reserva, error: erroReserva } = await supabase
      .from('carona_reservas')
      .insert({
        viagem_id: viagemId,
        usuario_id: usuarioId,
        vagas: qtdVagas,
        valor_total: valorTotalCobrado,
        taxa_cliente: taxaCliente,
        taxa_motorista: taxaMotorista,
        status: 'pendente',
      })
      .select('*')
      .single();
    if (erroReserva) throw erroReserva;

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload = {
      external_reference: `carona_reserva_${reserva.id}`,
      notification_url: notificationUrl,
      marketplace_fee: marketplaceFee,
      payer: { name: nomeUsuario || 'Passageiro' },
      items: [
        {
          id: reserva.id,
          title: `Carona Solidária — ${qtdVagas} vaga(s) (${viagem.cidade_origem} → ${viagem.cidade_destino})`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: valorTotalCobrado,
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { reservaId: reserva.id, origem: 'carona_reserva' },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      // Access token do PROPRIO motorista -- e' a conta dele que recebe o
      // pagamento, com o marketplace_fee descontado automaticamente pro
      // Valente Conecta.
      headers: { Authorization: `Bearer ${motorista.mp_access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencePayload),
    });
    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return NextResponse.json({ success: false, error: mpData?.message || 'Erro ao criar checkout no Mercado Pago' }, { status: 500 });
    }

    await supabase.from('carona_reservas').update({ mp_preference_id: mpData.id }).eq('id', reserva.id);

    return NextResponse.json({
      success: true,
      data: { ...reserva, mp_preference_id: mpData.id },
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao reservar vaga' }, { status: 500 });
  }
}
