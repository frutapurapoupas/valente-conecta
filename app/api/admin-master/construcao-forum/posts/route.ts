// Caminho: C:\valente_conecta\app\api\admin-master\construcao-forum\posts\route.ts
// Moderação do admin master: lista posts com contagem de denúncias
// (maiores primeiro) e permite remover qualquer post.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const [{ data: posts, error: erroPosts }, { data: denuncias, error: erroDenuncias }] = await Promise.all([
    supabase.from('construcao_forum_posts').select('*, usuarios(nome, whatsapp)').eq('status', 'ativo').order('created_at', { ascending: false }),
    supabase.from('construcao_forum_denuncias').select('post_id'),
  ]);
  if (erroPosts) return NextResponse.json({ success: false, error: erroPosts.message }, { status: 500 });
  if (erroDenuncias) return NextResponse.json({ success: false, error: erroDenuncias.message }, { status: 500 });

  const contagemDenuncias = new Map<string, number>();
  for (const d of denuncias || []) contagemDenuncias.set(d.post_id, (contagemDenuncias.get(d.post_id) || 0) + 1);

  const resultado = (posts || [])
    .map((p: any) => ({ ...p, autor_nome: p.usuarios?.nome || 'Usuário', autor_whatsapp: p.usuarios?.whatsapp || null, denuncias: contagemDenuncias.get(p.id) || 0, usuarios: undefined }))
    .sort((a: any, b: any) => b.denuncias - a.denuncias);

  return NextResponse.json({ success: true, data: resultado });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('construcao_forum_posts').update({ status: 'removido' }).eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
