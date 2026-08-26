// Caminho: C:\valente_conecta\app\api\carona\motorista\mercadopago\conectar\route.ts
//
// Inicia o fluxo OAuth do Mercado Pago pro motorista conectar a PROPRIA
// conta -- so' assim o pagamento da vaga pode cair direto pra ele (split de
// pagamento de verdade, ver 080_carona_split_pagamento.sql). O motoristaId
// vai no "state" pra sabermos de quem e' o callback quando o Mercado Pago
// redirecionar de volta.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const motoristaId = request.nextUrl.searchParams.get('motoristaId');
  if (!motoristaId) {
    return NextResponse.json({ success: false, error: 'motoristaId é obrigatório' }, { status: 400 });
  }

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ success: false, error: 'Integração com Mercado Pago não configurada no momento.' }, { status: 500 });
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = envUrl || request.headers.get('origin') || '';
  const redirectUri = `${origin.replace(/\/$/, '')}/api/carona/motorista/mercadopago/callback`;

  const authUrl = new URL('https://auth.mercadopago.com.br/authorization');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('platform_id', 'mp');
  authUrl.searchParams.set('state', motoristaId);
  authUrl.searchParams.set('redirect_uri', redirectUri);

  return NextResponse.redirect(authUrl.toString());
}
