// Caminho: C:\valente_conecta\app\api\busca-inteligente\intencao\route.ts
//
// Só a interpretação de intenção (termos diretos/relacionados), sem
// executar a busca em si — usado por telas que já têm seu próprio jeito de
// consultar dados (ex: DiretorioComercios, que precisa manter o formato
// específico de comercios_diretorio — donoId, catálogo, reivindicação —
// que o resultado genérico da vitrine não carrega) e só querem os termos
// pra fazer o fan-out delas mesmas.

import { NextRequest, NextResponse } from 'next/server';
import { interpretarIntencaoBusca } from '@/lib/busca/interpretarIntencao';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const usuarioId = searchParams.get('usuarioId') || undefined;
  if (!q.trim()) return NextResponse.json({ success: true, data: { termosDiretos: [], termosRelacionados: [] } });

  const data = await interpretarIntencaoBusca(q, usuarioId);
  return NextResponse.json({ success: true, data });
}
