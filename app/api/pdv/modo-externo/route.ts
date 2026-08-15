// Caminho: C:\valente_conecta\app\api\pdv\modo-externo\route.ts
//
// Liga/desliga o "modo espião" (captura por foto de um PDV de terceiro
// que o comerciante já usa em paralelo) — ver migration
// 049_pdv_captura_externa.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('pdv_modo_externo').select('ativo').eq('usuario_id', usuarioId).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: { ativo: !!data?.ativo } });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('pdv_modo_externo').upsert(
      { usuario_id: body.usuarioId, ativo: !!body.ativo, ativado_em: body.ativo ? new Date().toISOString() : null },
      { onConflict: 'usuario_id' }
    );
    if (error) throw error;

    return NextResponse.json({ success: true, data: { ativo: !!body.ativo } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar' }, { status: 500 });
  }
}
