// Caminho: C:\valente_conecta\app\api\busca-inteligente\route.ts
//
// Ponto único de busca do app inteiro (home, páginas de módulo, diretório
// de comércios, saúde, imóveis) — orquestra lib/busca/buscarTudo.ts, que
// junta a interpretação de intenção (IA) com as fontes de dados que já
// existiam separadas.

import { NextRequest, NextResponse } from 'next/server';
import { buscarInteligente } from '@/lib/busca/buscarTudo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const modulo = searchParams.get('modulo') || undefined;
    const categoria = searchParams.get('categoria') || undefined;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const usuarioId = searchParams.get('usuarioId') || undefined;

    const resultado = await buscarInteligente(q, {
      modulo,
      categoria,
      latUsuario: lat ? Number(lat) : undefined,
      lngUsuario: lng ? Number(lng) : undefined,
      usuarioId,
    });

    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar' }, { status: 500 });
  }
}
