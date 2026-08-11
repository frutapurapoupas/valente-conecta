// Caminho: C:\valente_conecta\app\api\catalogo\busca\route.ts
//
// Busca inteligente rica: vitrine comparativa via RPC busca_vitrine
// (imagem, preco, distancia, selo de menor preco, indicador de alta demanda).
// Ver VALENTE_CONECTA_MODULO_MARKETPLACE_MONETIZACAO.md, secao 4.

import { NextRequest, NextResponse } from 'next/server';
import { buscarVitrine } from '@/lib/catalogo/catalogoService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await buscarVitrine({
      termo: searchParams.get('q') || undefined,
      modulo: searchParams.get('modulo') || undefined,
      categoria: searchParams.get('categoria') || undefined,
      latUsuario: searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined,
      lngUsuario: searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined,
      limite: searchParams.get('limite') ? Number(searchParams.get('limite')) : undefined,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar', data: [] }, { status: 500 });
  }
}
