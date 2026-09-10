// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\mercadopago\conectar\route.ts
//
// Inicia o OAuth do Mercado Pago pro DIRETOR da unidade conectar a
// propria conta -- so' assim o pagamento online cai direto pra ela
// (split, ver 111_fila_saude_mercadopago.sql). Mesmo padrao ja usado em
// app/api/agua-gas/fornecedor/mercadopago/conectar/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade } from '@/lib/saude/nivelAcesso';

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createAdminClient();
  const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
  if (nivel !== 'administrar') return NextResponse.json({ success: false, error: 'Só o diretor pode conectar o Mercado Pago.' }, { status: 403 });

  const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ success: false, error: 'Integração com Mercado Pago não configurada no momento.' }, { status: 500 });
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = envUrl || request.headers.get('origin') || '';
  const redirectUri = `${origin.replace(/\/$/, '')}/api/saude-fila/${params.unidadeId}/mercadopago/callback`;

  const authUrl = new URL('https://auth.mercadopago.com.br/authorization');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('platform_id', 'mp');
  authUrl.searchParams.set('state', params.unidadeId);
  authUrl.searchParams.set('redirect_uri', redirectUri);

  return NextResponse.redirect(authUrl.toString());
}
