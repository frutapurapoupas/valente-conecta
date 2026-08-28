// Caminho: C:\valente_conecta\app\api\version\route.ts
//
// Devolve o build_id do deploy que está rodando AGORA no servidor — usado
// por components/VerificadorAtualizacao.tsx pra comparar com o build_id
// que o navegador do usuário carregou, e forçar reload quando forem
// diferentes (deploy novo publicado enquanto o app já estava aberto).

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev' },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
