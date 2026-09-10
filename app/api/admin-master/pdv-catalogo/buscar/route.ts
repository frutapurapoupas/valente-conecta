// Caminho: C:\valente_conecta\app\api\admin-master\pdv-catalogo\buscar\route.ts
//
// Busca de conferencia no catalogo colaborativo do PDV (038_pdv_catalogo_
// colaborativo.sql) -- so' pra visualizar o que ja foi importado (Open
// Food Facts, Bluesoft Cosmos, cadastro manual) com foto e EAN. Nao
// existia nenhuma tela de consulta antes, so' fluxos de cadastro/estoque.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const termo = (searchParams.get('q') || '').trim();
  const limite = Math.min(Number(searchParams.get('limite')) || 30, 60);

  const supabase = createClient();
  let query = supabase
    .from('pdv_produtos_catalogo')
    .select('id, ean, sku, nome, segmento, categoria, foto_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(limite);

  if (termo) {
    const ehSoDigitos = /^\d+$/.test(termo);
    query = ehSoDigitos
      ? query.or(`ean.eq.${termo},sku.ilike.%${termo}%`)
      : query.or(`nome.ilike.%${termo}%,sku.ilike.%${termo}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [], total: count });
}
