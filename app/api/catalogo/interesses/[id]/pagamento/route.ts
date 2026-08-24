// Caminho: C:\valente_conecta\app\api\catalogo\interesses\[id]\pagamento\route.ts
//
// Comprador paga o desbloqueio de contato de um item da vitrine cuja cota
// diária grátis já estourou (status_comprador='pendente_pagamento', valor
// já decidido em lib/catalogo/catalogoService.ts::criarInteresse). Mesmo
// padrão de app/api/carona/desbloqueios/route.ts: cria a preferência via
// fetch direto (sem SDK), grava mp_preference_id antes de responder; quem
// confirma o pagamento é o webhook único do app (prefixo
// "vitrine_desbloqueio_" em app/api/webhooks/mercadopago/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => ({}));
    const supabase = createClient();

    const { data: interesse, error: erroInteresse } = await supabase
      .from('interesses')
      .select('*, catalogo_itens(titulo)')
      .eq('id', params.id)
      .maybeSingle();
    if (erroInteresse) throw erroInteresse;
    if (!interesse) return NextResponse.json({ success: false, error: 'Interesse não encontrado' }, { status: 404 });

    if (interesse.status_comprador === 'liberado' || interesse.status_comprador === 'isento_assinatura') {
      return NextResponse.json({ success: true, data: interesse, precisaPagamento: false });
    }

    const valor = Number(interesse.valor_taxa_comprador || 0);
    if (valor <= 0) {
      return NextResponse.json({ success: true, data: interesse, precisaPagamento: false });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Fale com o suporte.' }, { status: 500 });
    }

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const titulo = (interesse as any).catalogo_itens?.titulo || 'produto';
    const preferencePayload = {
      external_reference: `vitrine_desbloqueio_${interesse.id}`,
      notification_url: notificationUrl,
      payer: { name: body.nomeUsuario || 'Cliente' },
      items: [
        {
          id: interesse.id,
          title: `Desbloquear contato — ${titulo}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(valor.toFixed(2)),
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { interesseId: interesse.id, origem: 'vitrine_desbloqueio' },
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

    await supabase.from('interesses').update({ mp_preference_id: mpData.id }).eq('id', interesse.id);

    return NextResponse.json({
      success: true,
      data: { ...interesse, mp_preference_id: mpData.id },
      precisaPagamento: true,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar pagamento' }, { status: 500 });
  }
}
