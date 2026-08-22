// Caminho: C:\valente_conecta\app\api\plano-geral\assinar\route.ts
//
// Usuario escolhe assinar o nivel basico ou ilimitado do Plano Geral —
// cria o registro pendente e o checkout Mercado Pago (mesmo padrao ja
// usado pelas taxas da Carona Solidaria). O webhook confirma o pagamento e
// ativa o nivel por 30 dias (ver processWebhookPlanoGeral em
// app/api/webhooks/mercadopago/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, tier, nomeUsuario } = body || {};
    if (!usuarioId || !['basico', 'ilimitado'].includes(tier)) {
      return NextResponse.json({ success: false, error: 'usuarioId e tier (basico/ilimitado) são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: config } = await supabase.from('plano_geral_config').select('preco, nome').eq('tier', tier).single();
    const valor = Number(config?.preco || 0);
    if (valor <= 0) {
      return NextResponse.json({ success: false, error: 'Esse nível não está disponível no momento.' }, { status: 400 });
    }

    const { data: assinatura, error } = await supabase
      .from('plano_geral_assinaturas')
      .insert({ usuario_id: usuarioId, tier, valor })
      .select('*')
      .single();
    if (error) throw error;

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Fale com o suporte.' }, { status: 500 });
    }

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload = {
      external_reference: `plano_geral_${assinatura.id}`,
      notification_url: notificationUrl,
      payer: { name: nomeUsuario || 'Cliente' },
      items: [
        {
          id: assinatura.id,
          title: `Valente Conecta — Plano ${config?.nome || tier} (30 dias)`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(valor.toFixed(2)),
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { assinaturaId: assinatura.id, origem: 'plano_geral' },
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

    await supabase.from('plano_geral_assinaturas').update({ mp_preference_id: mpData.id }).eq('id', assinatura.id);

    return NextResponse.json({
      success: true,
      data: assinatura,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao criar assinatura' }, { status: 500 });
  }
}
