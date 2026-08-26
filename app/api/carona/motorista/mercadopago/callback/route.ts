// Caminho: C:\valente_conecta\app\api\carona\motorista\mercadopago\callback\route.ts
//
// Volta do OAuth do Mercado Pago: troca o "code" pelo access_token da conta
// do motorista (via client_id/client_secret da nossa Aplicacao) e grava em
// carona_motoristas. Redireciona de volta pra tela de cadastro do motorista
// com sucesso/erro na querystring.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const motoristaId = request.nextUrl.searchParams.get('state');
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = envUrl || request.headers.get('origin') || '';
  const voltarPara = `${origin.replace(/\/$/, '')}/carona/motorista/cadastro`;

  if (!code || !motoristaId) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent('Autorização incompleta, tente novamente.')}`);
  }

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent('Integração com Mercado Pago não configurada.')}`);
  }

  try {
    const redirectUri = `${origin.replace(/\/$/, '')}/api/carona/motorista/mercadopago/callback`;
    const tokenResp = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent(tokenData?.message || 'Não foi possível conectar a conta.')}`);
    }

    const supabase = createClient();
    await supabase
      .from('carona_motoristas')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token || null,
        mp_user_id: String(tokenData.user_id || ''),
        mp_public_key: tokenData.public_key || null,
        mp_conectado_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', motoristaId);

    return NextResponse.redirect(`${voltarPara}?mpConectado=1`);
  } catch (error: any) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent(error.message || 'Erro ao conectar conta.')}`);
  }
}
