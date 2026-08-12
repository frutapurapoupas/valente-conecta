// Caminho: C:\valente_conecta\app\api\lancamento-funcionalidades\route.ts
//
// Cards de funcionalidades da tela /lancamento — GET publico (lista
// ordenada), PUT admin (titulo/video_url de um card por id). Ver
// 023_lancamento_funcionalidades.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lancamento_funcionalidades')
    .select('*')
    .order('ordem', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.titulo !== undefined) patch.titulo = body.titulo;
    if (body.videoUrl !== undefined) patch.video_url = body.videoUrl;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('lancamento_funcionalidades')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar' }, { status: 500 });
  }
}
