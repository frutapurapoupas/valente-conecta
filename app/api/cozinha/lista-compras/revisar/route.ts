import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Caminho: C:\valente_conecta\app\api\cozinha\lista-compras\revisar\route.ts
//
// Aprova (total ou parcialmente) ou rejeita itens de uma remessa
// "pendente". So' AQUI, no momento da aprovacao, a quantidade e'
// arredondada pra cima ate' a unidade minima vendida -- nunca antes (o
// calculo de custo da receita continua exato, fracionado). Ex: receita
// pede 25g de ovo -> unidade de compra e' "un" (nao da' pra comprar meio
// ovo) -> vira 1 un na lista final. Farinha/leite (kg, L, ml) continuam
// fracionados, porque normalmente dao pra comprar por peso/volume.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Unidades "continuas" (compradas por peso/volume, nao precisam virar
// numero inteiro) -- qualquer outra (un, unid, pacote, pote, lata, dose...)
// e' tratada como unidade discreta e arredondada pra cima.
const UNIDADES_CONTINUAS = new Set(['kg', 'g', 'l', 'ml']);

function arredondarParaUnidadeMinima(quantidade: number, unidade: string): number {
  if (quantidade <= 0) return 0;
  if (UNIDADES_CONTINUAS.has(unidade.trim().toLowerCase())) {
    return Math.round(quantidade * 100) / 100;
  }
  return Math.max(1, Math.ceil(quantidade));
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const acao = body?.acao === 'rejeitar' ? 'rejeitar' : 'aprovar';
    const itemIds: string[] = Array.isArray(body?.item_ids) ? body.item_ids.map(String) : [];

    if (itemIds.length === 0) {
      return NextResponse.json({ success: false, error: 'item_ids é obrigatório' }, { status: 400 });
    }

    if (acao === 'rejeitar') {
      const { data, error } = await supabase
        .from('lista_compras_itens')
        .update({ status: 'rejeitado', updated_at: new Date().toISOString() })
        .in('id', itemIds)
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    const { data: itens, error: erroBusca } = await supabase
      .from('lista_compras_itens')
      .select('*')
      .in('id', itemIds);
    if (erroBusca) throw erroBusca;

    const atualizados = await Promise.all(
      (itens || []).map(async (item) => {
        const quantidadeArredondada = arredondarParaUnidadeMinima(Number(item.quantidade) || 0, item.unidade || 'un');
        const { data, error } = await supabase
          .from('lista_compras_itens')
          .update({
            status: 'aprovado',
            quantidade: quantidadeArredondada,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      })
    );

    return NextResponse.json({ success: true, data: atualizados });
  } catch (error) {
    console.error('Erro ao revisar itens da lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao revisar itens' }, { status: 500 });
  }
}
