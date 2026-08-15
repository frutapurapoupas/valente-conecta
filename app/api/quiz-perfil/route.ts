// Caminho: C:\valente_conecta\app\api\quiz-perfil\route.ts
//
// Quiz adaptativo de perfil pos-cadastro (ver migration
// 046_quiz_perfil.sql). GET diz se o usuario ja respondeu (uma linha por
// usuario_id) — usado pelo pop-up pra decidir se mostra ou nao. POST
// grava a resposta final (o pop-up monta o funil inteiro no cliente e so'
// manda o resultado consolidado no fim).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('perfil_quiz_respostas').select('*').eq('usuario_id', usuarioId).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId || !body.segmentoPrincipal) {
      return NextResponse.json({ success: false, error: 'usuarioId e segmentoPrincipal são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('perfil_quiz_respostas')
      .upsert(
        {
          usuario_id: body.usuarioId,
          segmento_principal: body.segmentoPrincipal,
          subsegmento: body.subsegmento || null,
          respostas: body.respostas || {},
        },
        { onConflict: 'usuario_id' }
      )
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar quiz' }, { status: 500 });
  }
}
