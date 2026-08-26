// Caminho: C:\valente_conecta\app\api\agua-gas\fornecedor\mercadopago\callback\route.ts
//
// Volta do OAuth do Mercado Pago: troca o "code" pelo access_token da
// conta do fornecedor (via client_id/client_secret da nossa Aplicacao) e
// grava em agua_gas_fornecedores. Redireciona de volta pro painel do
// fornecedor com sucesso/erro na querystring. Mesmo padrao ja usado em
// app/api/carona/motorista/mercadopago/callback/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const fornecedorId = request.nextUrl.searchParams.get('state');
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = envUrl || request.headers.get('origin') || '';
  const voltarPara = `${origin.replace(/\/$/, '')}/agua-gas/fornecedor`;

  if (!code || !fornecedorId) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent('Autorização incompleta, tente novamente.')}`);
  }

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent('Integração com Mercado Pago não configurada.')}`);
  }

  try {
    const redirectUri = `${origin.replace(/\/$/, '')}/api/agua-gas/fornecedor/mercadopago/callback`;
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
      .from('agua_gas_fornecedores')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token || null,
        mp_user_id: String(tokenData.user_id || ''),
        mp_public_key: tokenData.public_key || null,
        mp_conectado_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', fornecedorId);

    return NextResponse.redirect(`${voltarPara}?mpConectado=1`);
  } catch (error: any) {
    return NextResponse.redirect(`${voltarPara}?mpErro=${encodeURIComponent(error.message || 'Erro ao conectar conta.')}`);
  }
}
