// Caminho: C:\valente_conecta\app\api\agua-gas\fornecedor\mercadopago\conectar\route.ts
//
// Inicia o fluxo OAuth do Mercado Pago pro fornecedor de agua/gas conectar
// a PROPRIA conta -- so' assim o pagamento online do pedido expresso pode
// cair direto pra ele (split de pagamento, ver
// 081_agua_gas_pedido_expresso.sql). Mesmo padrao ja usado em
// app/api/carona/motorista/mercadopago/conectar/route.ts. O fornecedorId
// vai no "state" pra sabermos de quem e' o callback.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const fornecedorId = request.nextUrl.searchParams.get('fornecedorId');
  if (!fornecedorId) {
    return NextResponse.json({ success: false, error: 'fornecedorId é obrigatório' }, { status: 400 });
  }

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ success: false, error: 'Integração com Mercado Pago não configurada no momento.' }, { status: 500 });
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = envUrl || request.headers.get('origin') || '';
  const redirectUri = `${origin.replace(/\/$/, '')}/api/agua-gas/fornecedor/mercadopago/callback`;

  const authUrl = new URL('https://auth.mercadopago.com.br/authorization');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('platform_id', 'mp');
  authUrl.searchParams.set('state', fornecedorId);
  authUrl.searchParams.set('redirect_uri', redirectUri);

  return NextResponse.redirect(authUrl.toString());
}
