// Caminho: C:\valente_conecta\app\api\planos\checkout\route.ts
//
// Usuario escolheu um plano (app/planos/checkout) e confirma a forma de
// pagamento. Fiado nao gera cobranca — fica pendente pro admin master
// acompanhar manualmente (mesmo padrao de usuario_cidades_adicionais, ja
// que a integracao Mercado Pago existente e' avulsa, nao um fiado real).
// Pix e cartao geram uma preferencia real no Mercado Pago (cartao aceita
// parcelamento; pix e' sempre a vista, por natureza do meio de pagamento).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId, usuarioLocalId, servicoId, servicoNome, planoId, planoNome, comFiado, valor, metodoPagamento, parcelas } = body;

    if (!usuarioId || !servicoId || !planoId || !metodoPagamento) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
    }
    if (!['pix', 'cartao', 'fiado'].includes(metodoPagamento)) {
      return NextResponse.json({ success: false, error: 'Forma de pagamento inválida' }, { status: 400 });
    }

    const supabase = createClient();
    const valorFinal = Number(valor) || 0;

    // Plano gratis (ou valor zerado): ativa direto, sem cobranca.
    if (valorFinal <= 0) {
      const { data, error } = await supabase
        .from('assinaturas_planos')
        .insert({
          usuario_id: usuarioId,
          usuario_local_id: usuarioLocalId || null,
          servico_id: servicoId,
          plano_id: planoId,
          com_fiado: !!comFiado,
          metodo_pagamento: metodoPagamento,
          parcelas: 1,
          valor: 0,
          status: 'pago',
        })
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data, precisaPagamento: false });
    }

    if (metodoPagamento === 'fiado') {
      const { data, error } = await supabase
        .from('assinaturas_planos')
        .insert({
          usuario_id: usuarioId,
          usuario_local_id: usuarioLocalId || null,
          servico_id: servicoId,
          plano_id: planoId,
          com_fiado: !!comFiado,
          metodo_pagamento: metodoPagamento,
          parcelas: 1,
          valor: valorFinal,
          status: 'fiado_pendente',
        })
        .select('*')
        .single();
      if (error) throw error;

      if (usuarioLocalId) {
        await supabase.from('mensagens_chat').insert({
          usuario_id: usuarioLocalId,
          remetente: 'usuario',
          texto: `Escolhi o plano "${planoNome}" (${servicoNome}) no fiado — valor R$ ${valorFinal.toFixed(2)}.`,
        });
      }

      return NextResponse.json({ success: true, data, precisaPagamento: false });
    }

    // pix ou cartao: cria a assinatura pendente e gera a preferencia no Mercado Pago
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Pagamento online não configurado no momento. Tente fiado ou fale com o suporte.' }, { status: 500 });
    }

    const { data: assinatura, error: insertError } = await supabase
      .from('assinaturas_planos')
      .insert({
        usuario_id: usuarioId,
        usuario_local_id: usuarioLocalId || null,
        servico_id: servicoId,
        plano_id: planoId,
        com_fiado: !!comFiado,
        metodo_pagamento: metodoPagamento,
        parcelas: metodoPagamento === 'cartao' ? Math.max(1, Math.min(12, Number(parcelas) || 1)) : 1,
        valor: valorFinal,
        status: 'pendente_pagamento',
      })
      .select('*')
      .single();
    if (insertError) throw insertError;

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = envUrl || request.headers.get('origin') || '';
    const notificationUrl = origin ? `${origin.replace(/\/$/, '')}/api/webhooks/mercadopago` : undefined;

    const preferencePayload: any = {
      external_reference: `plano_${assinatura.id}`,
      notification_url: notificationUrl,
      payer: { name: body.nomeUsuario || 'Cliente' },
      items: [
        {
          id: assinatura.id,
          title: `Plano ${planoNome} — ${servicoNome}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(valorFinal.toFixed(2)),
        },
      ],
      payment_methods:
        metodoPagamento === 'pix'
          ? { payment_method_ids: [{ id: 'pix' }] }
          : { excluded_payment_types: [{ id: 'ticket' }], installments: Math.max(1, Math.min(12, Number(parcelas) || 1)) },
      metadata: { assinaturaId: assinatura.id, origem: 'plano' },
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

    await supabase.from('assinaturas_planos').update({ mp_preference_id: mpData.id }).eq('id', assinatura.id);

    return NextResponse.json({
      success: true,
      data: { ...assinatura, mp_preference_id: mpData.id },
      precisaPagamento: true,
      checkoutUrl: mpData.init_point || mpData.sandbox_init_point || '',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar checkout' }, { status: 500 });
  }
}
