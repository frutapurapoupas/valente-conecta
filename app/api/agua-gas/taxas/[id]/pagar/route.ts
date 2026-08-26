// Caminho: C:\valente_conecta\app\api\agua-gas\taxas\[id]\pagar\route.ts
//
// Cria a preferencia Mercado Pago pra pagar uma taxa de uso pendente do
// pedido expresso de Agua e Gas (ver lib/aguaGas/taxaUso.ts). Usa o token
// da PROPRIA plataforma (nao o do fornecedor) -- essa cobranca e' devida a'
// plataforma, nao ao fornecedor. Mesmo padrao ja usado em
// app/api/mototaxi/taxas/[id]/pagar/route.ts; o webhook confirma (prefixo
// "agua_gas_taxa_" em app/api/webhooks/mercadopago/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: taxa, error: erroTaxa } = await supabase
      .from('agua_gas_taxas_uso')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (erroTaxa || !taxa) {
      return NextResponse.json({ success: false, error: 'Taxa não encontrada' }, { status: 404 });
    }
    if (taxa.status === 'pago') {
      return NextResponse.json({ success: true, data: taxa, precisaPagamento: false });
    }
    if (taxa.status === 'isento' || Number(taxa.valor) <= 0) {
      return NextResponse.json({ success: false, error: 'Essa taxa não é cobrável' }, { status: 400 });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Fale com o suporte.' }, { status: 500 });
    }

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const label = taxa.papel === 'cliente' ? 'cliente' : 'fornecedor';
    const preferencePayload = {
      external_reference: `agua_gas_taxa_${taxa.id}`,
      notification_url: notificationUrl,
      items: [
        {
          id: taxa.id,
          title: `Água e Gás — taxa de uso do app (${label})`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(Number(taxa.valor).toFixed(2)),
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { taxaId: taxa.id, origem: 'agua_gas_taxa_uso' },
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

    await supabase.from('agua_gas_taxas_uso').update({ mp_preference_id: mpData.id, updated_at: new Date().toISOString() }).eq('id', taxa.id);

    return NextResponse.json({
      success: true,
      data: { ...taxa, mp_preference_id: mpData.id },
      precisaPagamento: true,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar pagamento da taxa' }, { status: 500 });
  }
}
