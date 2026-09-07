// Caminho: C:\valente_conecta\app\api\admin-master\bootstrap\route.ts
//
// Acesso direto e temporario pro Admin Master, enquanto o app nao tem
// autenticacao em camadas de verdade (senha/PIN) -- ver app/admin-master/entrar.
// Quem tem o link com o token certo (ADMIN_BOOTSTRAP_TOKEN) recebe os
// dados da conta admin sem precisar preencher nome/whatsapp no popup de
// cadastro. NAO e' seguranca forte (o token fica embutido no link salvo no
// atalho da tela inicial) -- e' um atalho de conveniencia pro periodo de
// testes, que deve ser desativado (apagar ADMIN_BOOTSTRAP_TOKEN da Vercel)
// antes do app ir pro publico.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const tokenEsperado = process.env.ADMIN_BOOTSTRAP_TOKEN;

  if (!tokenEsperado) {
    return NextResponse.json({ success: false, error: 'Acesso direto desativado (ADMIN_BOOTSTRAP_TOKEN não configurado).' }, { status: 503 });
  }
  if (!token || token !== tokenEsperado) {
    return NextResponse.json({ success: false, error: 'Token inválido.' }, { status: 401 });
  }

  const supabase = createClient();
  const { data: admin, error } = await supabase.from('usuarios').select('*').eq('role', 'admin').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!admin) return NextResponse.json({ success: false, error: 'Nenhuma conta admin encontrada no banco.' }, { status: 404 });

  const resposta = NextResponse.json({ success: true, user: admin });
  resposta.cookies.set('user_logged_in', 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 });
  resposta.cookies.set('user_role', admin.role, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return resposta;
}
