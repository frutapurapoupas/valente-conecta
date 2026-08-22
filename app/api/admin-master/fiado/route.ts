// Caminho: C:\valente_conecta\app\api\admin-master\fiado\route.ts
// Admin master libera/revoga o modulo Fiado por loja (dono_id).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sem isso, Next.js trata GET() sem argumentos como estatico e cacheia a
// PRIMEIRA resposta para sempre — foi a causa real de "Liberar" parecer nao
// persistir (o PUT gravava certo, o GET seguinte servia cache antigo).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('fiado_habilitacoes').select('*').order('solicitado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const supabase = createClient();
    const { data, error } = await supabase.rpc('liberar_fiado_v1', {
      p_id: id,
      p_ativo: body.ativo ?? false,
      p_observacao: body.observacao ?? null,
    });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
