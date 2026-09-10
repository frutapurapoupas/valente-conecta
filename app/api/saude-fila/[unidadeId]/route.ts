// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\route.ts
//
// Estado completo da fila do dia (painel do atendente -- exige nivel
// 'administrar' ou 'atender', ver lib/saude/nivelAcesso.ts).

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { buscarFilaOrdenada } from '@/lib/saude/filaQueries';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createAdminClient();
  const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
  if (!podeAtender(nivel)) {
    return NextResponse.json({ success: false, error: 'Sem permissão pra ver a fila dessa unidade.' }, { status: 403 });
  }

  try {
    const fila = await buscarFilaOrdenada(supabase, params.unidadeId, ['aguardando', 'presente', 'em_atendimento']);
    return NextResponse.json({ success: true, data: fila, nivel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
