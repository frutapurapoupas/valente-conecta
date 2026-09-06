// Caminho: C:\valente_conecta\app\api\pdv\catalogo\preco-referencia\route.ts
//
// Preço de referência de um produto do catálogo colaborativo (038), a
// partir do que OUTROS lojistas já cobram por ele hoje em
// pdv_estoque_itens.preco_venda -- usado no cadastro/edição de estoque
// (app/pdv/estoque) pra sugerir uma faixa de preço quando o produto já
// existe no catálogo de outra loja. Dado real, não é chute de IA: com
// produto novo (sem histórico de preço de mais ninguém) simplesmente não
// tem o que sugerir, e a rota devolve total:0 em vez de inventar número.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const catalogoId = request.nextUrl.searchParams.get('catalogoId');
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!catalogoId) return NextResponse.json({ success: false, error: 'catalogoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  let query = supabase
    .from('pdv_estoque_itens')
    .select('preco_venda')
    .eq('catalogo_id', catalogoId)
    .eq('ativo', true)
    .gt('preco_venda', 0);
  if (usuarioId) query = query.neq('usuario_id', usuarioId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const precos = (data || []).map((r: any) => Number(r.preco_venda));
  if (precos.length === 0) {
    return NextResponse.json({ success: true, data: { total: 0 } });
  }

  const min = Math.min(...precos);
  const max = Math.max(...precos);
  const media = precos.reduce((soma, p) => soma + p, 0) / precos.length;

  return NextResponse.json({ success: true, data: { total: precos.length, min, max, media } });
}
