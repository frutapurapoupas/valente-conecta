// Caminho: C:\valente_conecta\app\api\cozinha\pedidos\[id]\pagamento\route.ts
//
// Cria o pagamento de verdade (API de Pagamentos do Mercado Pago) a partir
// do que o Payment Brick devolve no onSubmit (components/cozinha/PagamentoMercadoPago.tsx)
// -- substitui o antigo fluxo de preferencia/redirect (init_point) por um
// pagamento direto, sem sair do app. Segue o mesmo principio de seguranca
// do resto do checkout: o VALOR cobrado vem sempre do banco
// (cozinha_pedidos.total), nunca do client.
//
// external_reference continua "cozinha_pedido_<id>" -- o webhook em
// app/api/webhooks/mercadopago/route.ts (processWebhookCozinhaPedido) nao
// precisa de nenhuma mudanca, ja despacha por esse mesmo prefixo.

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function normalizeStatus(status: string) {
  if (status === 'approved') return 'pago';
  if (status === 'cancelled' || status === 'rejected') return 'cancelado';
  return 'pendente';
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pedidoId = params.id;
    const formData = await request.json();

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento.' }, { status: 500 });
    }

    const supabase = createClient();
    const { data: pedido, error: pedidoError } = await supabase
      .from('cozinha_pedidos')
      .select('id, total, cliente_nome, cliente_whatsapp, cliente_usuario_id, status')
      .eq('id', pedidoId)
      .maybeSingle();
    if (pedidoError || !pedido) {
      return NextResponse.json({ success: false, error: 'Pedido não encontrado.' }, { status: 404 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const isPix = formData.payment_method_id === 'pix' || formData.formData?.payment_method_id === 'pix';
    const dados = formData.formData || formData; // Brick as vezes aninha em "formData"

    const payload: Record<string, any> = {
      transaction_amount: Number(pedido.total),
      payment_method_id: dados.payment_method_id,
      external_reference: `cozinha_pedido_${pedido.id}`,
      notification_url: notificationUrl,
      description: 'Pedido Cozinha Chef Neide',
      metadata: { pedidoId: pedido.id, origem: 'cozinha' },
      payer: {
        email: dados.payer?.email || 'sem-email@valenteconecta.com.br',
        ...(isPix
          ? {
              first_name: pedido.cliente_nome?.split(' ')[0] || 'Cliente',
              identification: dados.payer?.identification,
            }
          : {}),
      },
    };
    if (!isPix) {
      payload.token = dados.token;
      payload.installments = dados.installments || 1;
      payload.issuer_id = dados.issuer_id;
    }

    const respostaMp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': randomUUID(),
      },
      body: JSON.stringify(payload),
    });
    const pagamentoMp = await respostaMp.json();
    if (!respostaMp.ok) {
      console.error('Erro ao criar pagamento Mercado Pago (cozinha):', pagamentoMp);
      return NextResponse.json({ success: false, error: pagamentoMp?.message || 'Não foi possível processar o pagamento.' }, { status: 400 });
    }

    const statusPagamento = normalizeStatus(String(pagamentoMp.status || ''));

    // Resposta sincrona ja atualiza o pedido -- o webhook que chegar depois
    // e' idempotente (mesmo mp_payment_id) e nao duplica nada.
    await supabase
      .from('cozinha_pedidos')
      .update({
        status_pagamento: statusPagamento === 'pago' ? 'pago_online' : 'aguardando_pagamento',
        status: statusPagamento === 'pago' ? 'confirmado' : pedido.status,
        confirmado_em: statusPagamento === 'pago' ? new Date().toISOString() : null,
        mp_payment_id: String(pagamentoMp.id || ''),
        mp_preference_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pedido.id);

    if (statusPagamento === 'pago' && pedido.cliente_usuario_id) {
      enviarPushParaUsuario(pedido.cliente_usuario_id, {
        titulo: 'Pedido confirmado!',
        corpo: 'Seu pagamento foi aprovado — a Cozinha Chef Neide já vai começar a preparar.',
        url: `/cozinha/pedido/${pedido.id}`,
      }).catch(() => {});
    }

    const pix = pagamentoMp.point_of_interaction?.transaction_data;
    return NextResponse.json({
      success: true,
      status: pagamentoMp.status,
      statusDetail: pagamentoMp.status_detail,
      pixQrCodeBase64: pix?.qr_code_base64 || null,
      pixCopiaECola: pix?.qr_code || null,
    });
  } catch (error: any) {
    console.error('Falha ao processar pagamento (cozinha):', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar pagamento' }, { status: 500 });
  }
}
