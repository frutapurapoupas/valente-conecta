// Caminho: C:\valente_conecta\app\api\pdv\catalogo\buscar-similar\route.ts
//
// Sugere produtos parecidos ja cadastrados no catalogo colaborativo antes
// do comerciante criar um item sem EAN do zero — RPC pdv_buscar_produto_similar_v1
// (pg_trgm), ver 038_pdv_catalogo_colaborativo.sql. Devolve so' sugestoes;
// quem decide se e' o mesmo produto e' sempre o comerciante.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const nome = request.nextUrl.searchParams.get('nome');
  const segmento = request.nextUrl.searchParams.get('segmento');
  if (!nome || !segmento) return NextResponse.json({ success: false, error: 'nome e segmento são obrigatórios' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.rpc('pdv_buscar_produto_similar_v2', {
    p_nome: nome,
    p_segmento: segmento,
    p_limite: 5,
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}
