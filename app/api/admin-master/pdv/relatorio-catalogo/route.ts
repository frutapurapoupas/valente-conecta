// Caminho: C:\valente_conecta\app\api\admin-master\pdv\relatorio-catalogo\route.ts
//
// Relatorio do catalogo colaborativo do PDV (ver migration
// 038_pdv_catalogo_colaborativo.sql) pro admin master: quantos produtos
// existem, quantos tem EAN oficial x SKU gerado, distribuicao por
// segmento, e principalmente quais produtos ja foram REUTILIZADOS por
// mais de um comerciante — essa e' a metrica que prova que o catalogo
// compartilhado esta funcionando (o objetivo original do modulo).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const busca = request.nextUrl.searchParams.get('busca')?.trim() || '';
    const supabase = createClient();

    const [{ data: catalogo, error: erroCatalogo }, { data: estoque, error: erroEstoque }] = await Promise.all([
      supabase.from('pdv_produtos_catalogo').select('*').order('created_at', { ascending: false }),
      supabase.from('pdv_estoque_itens').select('usuario_id, catalogo_id'),
    ]);
    if (erroCatalogo) throw erroCatalogo;
    if (erroEstoque) throw erroEstoque;

    const comerciantesPorProduto = new Map<string, Set<string>>();
    for (const item of estoque || []) {
      if (!comerciantesPorProduto.has(item.catalogo_id)) comerciantesPorProduto.set(item.catalogo_id, new Set());
      comerciantesPorProduto.get(item.catalogo_id)!.add(item.usuario_id);
    }

    const produtosBase = (catalogo || []).map((p) => ({
      ...p,
      comerciantes: comerciantesPorProduto.get(p.id)?.size || 0,
    }));

    const porSegmentoMapa = new Map<string, number>();
    for (const p of produtosBase) porSegmentoMapa.set(p.segmento, (porSegmentoMapa.get(p.segmento) || 0) + 1);

    const totais = {
      totalProdutos: produtosBase.length,
      totalComEan: produtosBase.filter((p) => p.ean).length,
      totalSemEan: produtosBase.filter((p) => !p.ean).length,
      comerciantesAtivos: new Set((estoque || []).map((e) => e.usuario_id)).size,
      totalItensEstoque: (estoque || []).length,
    };

    const maisReutilizados = [...produtosBase]
      .filter((p) => p.comerciantes > 1)
      .sort((a, b) => b.comerciantes - a.comerciantes)
      .slice(0, 10);

    const termo = busca.toLowerCase();
    const produtos = termo
      ? produtosBase.filter(
          (p) => p.nome.toLowerCase().includes(termo) || p.sku.toLowerCase().includes(termo) || (p.ean || '').includes(termo)
        )
      : produtosBase;

    return NextResponse.json({
      success: true,
      data: {
        totais,
        porSegmento: [...porSegmentoMapa.entries()].map(([segmento, quantidade]) => ({ segmento, quantidade })),
        maisReutilizados,
        produtos: produtos.slice(0, 200),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao gerar relatório' }, { status: 500 });
  }
}
