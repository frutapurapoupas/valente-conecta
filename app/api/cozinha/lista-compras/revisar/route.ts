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
//
// A lista final precisa ser UNICA por ingrediente -- se "Farinha de trigo"
// ja esta aprovada (aguardando compra) de uma receita e outra remessa
// tambem pede farinha, as duas juntam numa linha so' (quantidade somada),
// em vez de duplicar a linha. So' funde com linhas ainda 'aprovado' (nao
// mexe em linhas ja' 'comprado', que ja' fecharam ciclo). Processado em
// sequencia (nao em paralelo) de proposito: se a mesma leva aprovar dois
// itens iguais de receitas diferentes, o segundo precisa enxergar a linha
// que o primeiro acabou de criar/atualizar pra fundir com ela tambem.

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

// Mesmo ingrediente = mesma linha na lista final. Prefere o vinculo com o
// estoque (ingrediente_id); sem ele (linha antiga, criada antes dessa
// coluna existir), cai pro nome+unidade.
function chaveDoIngrediente(item: { ingrediente_id?: string | null; ingrediente_nome: string; unidade: string }): string {
  if (item.ingrediente_id) return `id:${item.ingrediente_id}`;
  return `nome:${item.ingrediente_nome.trim().toLowerCase()}|${item.unidade.trim().toLowerCase()}`;
}

function mesclarOrigem(origemAtual: string | null, origemNova: string): string {
  const nomes = (origemAtual || '').split(',').map((n) => n.trim()).filter(Boolean);
  if (!nomes.includes(origemNova)) nomes.push(origemNova);
  return nomes.join(', ');
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

    const { data: aprovadosExistentes, error: erroAprovados } = await supabase
      .from('lista_compras_itens')
      .select('*')
      .eq('status', 'aprovado');
    if (erroAprovados) throw erroAprovados;

    const poolPorChave = new Map<string, any>();
    for (const linha of aprovadosExistentes || []) {
      poolPorChave.set(chaveDoIngrediente(linha), linha);
    }

    const resultado: any[] = [];

    // Sequencial de proposito -- ver comentario no topo do arquivo.
    for (const item of itens || []) {
      const quantidadeArredondada = arredondarParaUnidadeMinima(Number(item.quantidade) || 0, item.unidade || 'un');
      const chave = chaveDoIngrediente(item);
      const existente = poolPorChave.get(chave);

      if (existente && existente.id !== item.id) {
        const { data: linhaMesclada, error: erroMerge } = await supabase
          .from('lista_compras_itens')
          .update({
            quantidade: Number(existente.quantidade || 0) + quantidadeArredondada,
            custo_estimado: Number(existente.custo_estimado || 0) + Number(item.custo_estimado || 0),
            origem_nome: mesclarOrigem(existente.origem_nome, item.origem_nome),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existente.id)
          .select()
          .single();
        if (erroMerge) throw erroMerge;

        const { error: erroDelete } = await supabase.from('lista_compras_itens').delete().eq('id', item.id);
        if (erroDelete) throw erroDelete;

        poolPorChave.set(chave, linhaMesclada);
        resultado.push(linhaMesclada);
      } else {
        const { data: linhaAprovada, error: erroUpdate } = await supabase
          .from('lista_compras_itens')
          .update({
            status: 'aprovado',
            quantidade: quantidadeArredondada,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
          .select()
          .single();
        if (erroUpdate) throw erroUpdate;

        poolPorChave.set(chave, linhaAprovada);
        resultado.push(linhaAprovada);
      }
    }

    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Erro ao revisar itens da lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao revisar itens' }, { status: 500 });
  }
}
