// Caminho: C:\valente_conecta\app\api\construcao\forum\posts\route.ts
//
// Posts do forum de construcao civil (ver migration
// 048_forum_construcao_civil.sql). POST exige que o termo ja tenha sido
// aceito (checagem server-side, nao so' no cliente). DELETE so' remove se
// quem pediu for o autor (ou o admin master, ver rota separada).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limite = Number(request.nextUrl.searchParams.get('limite')) || 50;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('construcao_forum_posts')
    .select('*, usuarios(nome)')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .limit(limite);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const posts = (data || []).map((p: any) => ({ ...p, autor_nome: p.usuarios?.nome || 'Usuário', usuarios: undefined }));
  return NextResponse.json({ success: true, data: posts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.texto?.trim()) {
      return NextResponse.json({ success: false, error: 'usuarioId e texto são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: termo } = await supabase
      .from('construcao_forum_termo_aceites')
      .select('id')
      .eq('usuario_id', body.usuarioId)
      .maybeSingle();
    if (!termo) return NextResponse.json({ success: false, error: 'Aceite o termo de compromisso antes de publicar.' }, { status: 403 });

    const { data: post, error } = await supabase
      .from('construcao_forum_posts')
      .insert({ usuario_id: body.usuarioId, texto: body.texto.trim(), midia: Array.isArray(body.midia) ? body.midia : [] })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao publicar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!id || !usuarioId) return NextResponse.json({ success: false, error: 'id e usuarioId são obrigatórios' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase
    .from('construcao_forum_posts')
    .update({ status: 'removido' })
    .eq('id', id)
    .eq('usuario_id', usuarioId);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
