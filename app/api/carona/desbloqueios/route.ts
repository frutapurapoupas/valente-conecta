// Caminho: C:\valente_conecta\app\api\carona\desbloqueios\route.ts
//
// Caronista paga a taxa de desbloqueio (admin master) pra ver o contato do
// motorista NUMA viagem especifica. GET verifica se o usuario ja
// desbloqueou aquela viagem (pra tela nao pedir pagamento de novo). POST
// cria o registro pendente + preferencia Mercado Pago; o webhook confirma
// (prefixo "carona_desbloqueio_" em app/api/webhooks/mercadopago/route.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  const viagemId = request.nextUrl.searchParams.get('viagemId');
  if (!usuarioId || !viagemId) return NextResponse.json({ success: false, error: 'usuarioId e viagemId são obrigatórios' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('carona_desbloqueios')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('viagem_id', viagemId)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // So' busca e devolve o telefone do motorista se o desbloqueio dessa
  // viagem especifica ja foi pago — nunca antes disso.
  if (data?.status === 'pago') {
    const { data: viagem } = await supabase.from('carona_viagens').select('motorista_id').eq('id', viagemId).maybeSingle();
    if (viagem?.motorista_id) {
      const { data: motorista } = await supabase.from('carona_motoristas').select('telefone').eq('id', viagem.motorista_id).maybeSingle();
      return NextResponse.json({ success: true, data: { ...data, telefone_motorista: motorista?.telefone || null } });
    }
  }

  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.viagemId) {
      return NextResponse.json({ success: false, error: 'usuarioId e viagemId são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: existente } = await supabase
      .from('carona_desbloqueios')
      .select('*')
      .eq('usuario_id', body.usuarioId)
      .eq('viagem_id', body.viagemId)
      .maybeSingle();
    if (existente?.status === 'pago') {
      return NextResponse.json({ success: true, data: existente, precisaPagamento: false });
    }

    const { data: configData } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'carona_config').maybeSingle();
    const config = configData?.valor ? JSON.parse(configData.valor) : { taxaPassageiro: 5 };
    const taxa = Number(config.taxaPassageiro || 0);

    const { data: viagem } = await supabase.from('carona_viagens').select('cidade_origem, cidade_destino').eq('id', body.viagemId).single();

    let desbloqueio = existente;
    if (!desbloqueio) {
      const { data, error } = await supabase
        .from('carona_desbloqueios')
        .insert({ viagem_id: body.viagemId, usuario_id: body.usuarioId, valor: taxa, status: taxa > 0 ? 'pendente' : 'pago' })
        .select('*')
        .single();
      if (error) throw error;
      desbloqueio = data;
    }

    if (taxa <= 0) {
      return NextResponse.json({ success: true, data: desbloqueio, precisaPagamento: false });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Fale com o suporte.' }, { status: 500 });
    }

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload = {
      external_reference: `carona_desbloqueio_${desbloqueio.id}`,
      notification_url: notificationUrl,
      payer: { name: body.nomeUsuario || 'Cliente' },
      items: [
        {
          id: desbloqueio.id,
          title: `Carona Solidária — desbloquear contato (${viagem?.cidade_origem || ''} → ${viagem?.cidade_destino || ''})`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(taxa.toFixed(2)),
        },
      ],
      payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
      metadata: { desbloqueioId: desbloqueio.id, origem: 'carona_desbloqueio' },
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

    await supabase.from('carona_desbloqueios').update({ mp_preference_id: mpData.id }).eq('id', desbloqueio.id);

    return NextResponse.json({
      success: true,
      data: { ...desbloqueio, mp_preference_id: mpData.id },
      precisaPagamento: true,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao solicitar desbloqueio' }, { status: 500 });
  }
}
