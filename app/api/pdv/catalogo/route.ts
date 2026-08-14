// Caminho: C:\valente_conecta\app\api\pdv\catalogo\route.ts
//
// Catalogo colaborativo de produtos do PDV (ver 038_pdv_catalogo_colaborativo.sql)
// — GET busca por EAN exato (usado pelo leitor de codigo de barras: escaneou,
// bate o EAN, se ja existir no catalogo o comerciante so' ajusta preco/
// quantidade em vez de recadastrar o produto do zero). POST cria um produto
// novo no catalogo (gera SKU automatico se nao vier EAN).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const ean = request.nextUrl.searchParams.get('ean');
  const sku = request.nextUrl.searchParams.get('sku');
  if (!ean && !sku) return NextResponse.json({ success: false, error: 'informe ean ou sku' }, { status: 400 });

  const supabase = createClient();
  let query = supabase.from('pdv_produtos_catalogo').select('*, pdv_produtos_apelidos(apelido)');
  query = ean ? query.eq('ean', ean) : query.eq('sku', sku);
  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nome = String(body.nome || '').trim();
    const segmento = String(body.segmento || '').trim();
    const ean = String(body.ean || '').trim() || null;
    const criadoPor = String(body.criadoPor || '').trim() || null;

    if (!nome) return NextResponse.json({ success: false, error: 'nome é obrigatório' }, { status: 400 });
    if (!segmento) return NextResponse.json({ success: false, error: 'segmento é obrigatório' }, { status: 400 });

    const supabase = createClient();

    // Se veio EAN, checa se ja existe no catalogo antes de criar de novo —
    // dois comerciantes escaneando o mesmo produto tem que cair no mesmo
    // registro, nunca duplicar.
    if (ean) {
      const { data: existente } = await supabase.from('pdv_produtos_catalogo').select('*').eq('ean', ean).maybeSingle();
      if (existente) return NextResponse.json({ success: true, data: existente, jaExistia: true });
    }

    let sku = String(body.sku || '').trim() || null;
    if (!sku) {
      const { data: skuGerado, error: erroSku } = await supabase.rpc('pdv_proximo_sku_v1', { p_segmento: segmento });
      if (erroSku) throw erroSku;
      sku = skuGerado;
    }

    const { data, error } = await supabase
      .from('pdv_produtos_catalogo')
      .insert({
        ean,
        sku,
        nome,
        segmento,
        categoria: body.categoria || null,
        unidade: body.unidade || 'un',
        foto_url: body.fotoUrl || null,
        foto_codigo_barras_url: body.fotoCodigoBarrasUrl || null,
        criado_por: criadoPor,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data, jaExistia: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar produto no catálogo' }, { status: 400 });
  }
}
