// Caminho: C:\valente_conecta\app\api\pdv\plano-fisco\route.ts
//
// Expoe pro cliente se o lojista tem o plano Fisco/Contabilidade ativo --
// usado em /pdv/notas-fiscais pra mostrar o banner de status (ver
// lib/pdv/planoFisco.ts).

import { NextRequest, NextResponse } from 'next/server';
import { obterPlanoFisco } from '@/lib/pdv/planoFisco';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const data = await obterPlanoFisco(usuarioId);
  return NextResponse.json({ success: true, data });
}
