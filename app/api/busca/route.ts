// Caminho: C:\valente_conecta\app\api\busca\route.ts
//
// Busca inteligente da primeira pagina — agora espelha /api/catalogo/busca
// (RPC busca_vitrine sobre catalogo_itens real, com distancia/demanda/selo
// de menor preco). Substitui a implementacao anterior, que filtrava por
// substring em arquivos JSON estaticos (data/catalogo.json e data/lojas.json
// nem existiam mais) e caia num fallback de resultado "de internet" falso.
// Mantido como alias por compatibilidade com quem ja chama /api/busca?q=.

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
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar', data: [] }, { status: 500 });
  }
}
