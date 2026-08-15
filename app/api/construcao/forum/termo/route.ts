// Caminho: C:\valente_conecta\app\api\construcao\forum\termo\route.ts
//
// Aceite do termo de compromisso do forum de construcao civil — precisa
// ser aceito uma vez antes do primeiro post (ver migration
// 048_forum_construcao_civil.sql).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('construcao_forum_termo_aceites').select('id').eq('usuario_id', usuarioId).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { aceito: !!data } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase
      .from('construcao_forum_termo_aceites')
      .upsert({ usuario_id: body.usuarioId }, { onConflict: 'usuario_id', ignoreDuplicates: true });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar aceite' }, { status: 500 });
  }
}
