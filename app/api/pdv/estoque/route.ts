// Caminho: C:\valente_conecta\app\api\pdv\estoque\route.ts
//
// Estoque de CADA comerciante (pdv_estoque_itens), sempre referenciando um
// produto do catalogo colaborativo (pdv_produtos_catalogo) — nome, EAN,
// SKU e foto sao do catalogo; quantidade e preco sao do comerciante. Ver
// 038_pdv_catalogo_colaborativo.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_estoque_itens')
    .select('*, produto:pdv_produtos_catalogo(id, nome, ean, sku, segmento, categoria, unidade, foto_url)')
    .eq('usuario_id', usuarioId)
    .order('updated_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const catalogoId = String(body.catalogoId || '').trim();
    if (!usuarioId || !catalogoId) return NextResponse.json({ success: false, error: 'usuarioId e catalogoId são obrigatórios' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_estoque_itens')
      .upsert(
        {
          usuario_id: usuarioId,
          catalogo_id: catalogoId,
          quantidade: Number(body.quantidade || 0),
          preco_custo: body.precoCusto !== undefined && body.precoCusto !== null ? Number(body.precoCusto) : null,
          preco_venda: Number(body.precoVenda || 0),
          estoque_minimo: Number(body.estoqueMinimo || 0),
          validade: body.validade || null,
          variante: String(body.variante || '').trim(),
          ativo: body.ativo !== undefined ? !!body.ativo : true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,catalogo_id,variante' }
      )
      .select('*, produto:pdv_produtos_catalogo(id, nome, ean, sku, segmento, categoria, unidade, foto_url)')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar item de estoque' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.quantidade !== undefined) patch.quantidade = Number(body.quantidade);
    if (body.precoCusto !== undefined) patch.preco_custo = body.precoCusto === null ? null : Number(body.precoCusto);
    if (body.precoVenda !== undefined) patch.preco_venda = Number(body.precoVenda);
    if (body.estoqueMinimo !== undefined) patch.estoque_minimo = Number(body.estoqueMinimo);
    if (body.validade !== undefined) patch.validade = body.validade || null;
    if (body.ativo !== undefined) patch.ativo = !!body.ativo;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('pdv_estoque_itens')
      .update(patch)
      .eq('id', id)
      .select('*, produto:pdv_produtos_catalogo(id, nome, ean, sku, segmento, categoria, unidade, foto_url)')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar item de estoque' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { error } = await supabase.from('pdv_estoque_itens').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
