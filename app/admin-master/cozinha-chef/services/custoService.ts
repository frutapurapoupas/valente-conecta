import { supabase } from '@/lib/supabase/client';
import { ReceitaCanonicaCompat, ReceitaIngredienteCanonico } from '@/types/receita-canonica';

type IngredienteLike = Partial<ReceitaIngredienteCanonico> & {
  ingredienteId?: string;
  ingrediente_id?: string;
  ingredientId?: string;
  ingredienteNome?: string;
  ingrediente_nome?: string;
  ingredientName?: string;
  quantidade?: number;
  quantity?: number;
  unidade?: string;
  unit?: string;
  custo_unitario?: number;
  custoUnitario?: number;
  cost?: number;
  custo_total?: number;
  custoTotal?: number;
};

const DEFAULT_INTEGRACOES = {
  catalogo: false,
  cardapio: false,
  producao: false,
  estoque: false,
  compras: false,
};

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizarIngredienteCanonico(ingrediente: IngredienteLike): ReceitaIngredienteCanonico {
  const quantidade = toNumber(ingrediente.quantidade ?? ingrediente.quantity, 0);
  const custoUnitario = toNumber(
    ingrediente.custo_unitario ?? ingrediente.custoUnitario ?? ingrediente.cost,
    0
  );
  const custoTotal = toNumber(
    ingrediente.custo_total ?? ingrediente.custoTotal,
    quantidade * custoUnitario
  );

  return {
    ingrediente_id: String(
      ingrediente.ingrediente_id ?? ingrediente.ingredienteId ?? ingrediente.ingredientId ?? ''
    ),
    ingrediente_nome: String(
      ingrediente.ingrediente_nome ?? ingrediente.ingredienteNome ?? ingrediente.ingredientName ?? ''
    ),
    quantidade,
    unidade: String(ingrediente.unidade ?? ingrediente.unit ?? 'un'),
    custo_unitario: custoUnitario,
    custo_total: custoTotal,
  };
}

export function calcularFinanceiroReceita(params: {
  ingredientes?: IngredienteLike[];
  porcoes?: number;
  preco_venda?: number;
  preco_sugerido?: number;
  custo_receita?: number;
  custos_extras_unitario?: number;
}) {
  const ingredientes = (params.ingredientes || []).map(normalizarIngredienteCanonico);
  const custoReceitaCalculado = ingredientes.reduce((acc, item) => acc + toNumber(item.custo_total, 0), 0);
  const custoIngredientes = toNumber(params.custo_receita, custoReceitaCalculado);
  const porcoes = toNumber(params.porcoes, 0);

  const custosExtrasUnitario = toNumber(params.custos_extras_unitario, 0);
  const custosExtrasTotal = custosExtrasUnitario * porcoes;
  const custoReceita = custoIngredientes + custosExtrasTotal;

  const precoSugerido = toNumber(params.preco_sugerido, toNumber(params.preco_venda, 0));
  const precoVenda = toNumber(params.preco_venda, precoSugerido);

  const custoPorUnidade = porcoes > 0 ? custoReceita / porcoes : 0;

  const receitaTotal = precoVenda * porcoes;
  const lucro = receitaTotal - custoReceita;
  const margemPercentual = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

  return {
    ingredientes,
    porcoes,
    custo_receita: custoReceita,
    custo_por_unidade: custoPorUnidade,
    custos_extras_unitario: custosExtrasUnitario,
    lucro,
    margem_percentual: margemPercentual,
    preco_sugerido: precoSugerido,
    preco_venda: precoVenda,
  };
}

export function normalizarReceitaCanonica(item: any): ReceitaCanonicaCompat {
  const financeiro = calcularFinanceiroReceita({
    ingredientes: Array.isArray(item?.ingredientes)
      ? item.ingredientes
      : Array.isArray(item?.ingredients)
        ? item.ingredients
        : [],
    porcoes: item?.porcoes ?? item?.servings,
    preco_venda: item?.preco_venda ?? item?.preco ?? item?.price,
    preco_sugerido: item?.preco_sugerido,
    custo_receita: item?.custo_receita ?? item?.custo_total,
    custos_extras_unitario: item?.custos_extras_unitario,
  });

  return {
    id: String(item?.id ?? ''),
    nome: String(item?.nome ?? item?.name ?? ''),
    descricao: String(item?.descricao ?? item?.description ?? ''),
    categoria: String(item?.categoria ?? item?.category ?? 'Geral'),
    imagem: (item?.imagem ?? item?.image ?? item?.images?.[0] ?? null) as string | null,
    status: (item?.status ?? (item?.isAvailable === false ? 'inativo' : 'ativo')) as 'ativo' | 'inativo',
    ingredientes: financeiro.ingredientes,
    rendimento: toNumber(item?.rendimento, financeiro.porcoes),
    peso_final: item?.peso_final != null ? toNumber(item.peso_final, 0) : null,
    custos_extras_unitario: financeiro.custos_extras_unitario,
    porcoes: financeiro.porcoes,
    custo_receita: financeiro.custo_receita,
    custo_por_unidade: financeiro.custo_por_unidade,
    margem_percentual: financeiro.margem_percentual,
    lucro: financeiro.lucro,
    preco_sugerido: financeiro.preco_sugerido,
    preco_venda: financeiro.preco_venda,
    integracoes: {
      ...DEFAULT_INTEGRACOES,
      ...(item?.integracoes || {}),
    },
    created_at: String(item?.created_at ?? item?.createdAt ?? new Date().toISOString()),
    updated_at: String(item?.updated_at ?? item?.updatedAt ?? new Date().toISOString()),
    preco: financeiro.preco_venda,
    custo_total: financeiro.custo_receita,
    margem: financeiro.margem_percentual,
    ativo: (item?.ativo ?? (item?.status ? item.status === 'ativo' : true)) as boolean,
    images: Array.isArray(item?.images)
      ? item.images
      : item?.imagem
        ? [item.imagem]
        : item?.image
          ? [item.image]
          : [],
    ingredients: Array.isArray(item?.ingredients)
      ? item.ingredients
      : Array.isArray(item?.ingredientes)
        ? item.ingredientes
        : [],
    servings: financeiro.porcoes,
    isAvailable: item?.isAvailable ?? (item?.status ? item.status === 'ativo' : true),
  };
}

export function buildReceitaPayload(canonica: ReceitaCanonicaCompat) {
  return {
    id: canonica.id,
    nome: canonica.nome,
    descricao: canonica.descricao,
    categoria: canonica.categoria,
    imagem: canonica.imagem,
    status: canonica.status,
    ingredientes: canonica.ingredientes,
    rendimento: canonica.rendimento,
    peso_final: canonica.peso_final,
    custos_extras_unitario: canonica.custos_extras_unitario,
    porcoes: canonica.porcoes,
    custo_receita: canonica.custo_receita,
    custo_por_unidade: canonica.custo_por_unidade,
    margem_percentual: canonica.margem_percentual,
    lucro: canonica.lucro,
    preco_sugerido: canonica.preco_sugerido,
    preco_venda: canonica.preco_venda,
    integracoes: canonica.integracoes,
    created_at: canonica.created_at,
    updated_at: canonica.updated_at,
    preco: canonica.preco_venda,
    custo_total: canonica.custo_receita,
    margem: canonica.margem_percentual,
    ativo: canonica.status === 'ativo',
  };
}

export const custoService = {
  async calcularCustoReceita(receitaId: string) {
    const { data: receita } = await supabase
      .from('receitas')
      .select('*')
      .eq('id', receitaId)
      .single();

    if (!receita) return null;

    const receitaCanonica = normalizarReceitaCanonica(receita);
    const recalculado = calcularFinanceiroReceita({
      ingredientes: receitaCanonica.ingredientes,
      porcoes: receitaCanonica.porcoes,
      preco_venda: receitaCanonica.preco_venda,
      preco_sugerido: receitaCanonica.preco_sugerido,
      custo_receita: receitaCanonica.custo_receita,
      custos_extras_unitario: receitaCanonica.custos_extras_unitario,
    });

    const receitaAtualizada: ReceitaCanonicaCompat = {
      ...receitaCanonica,
      ...recalculado,
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('receitas')
      .update({
        custo_total: receitaAtualizada.custo_receita,
        margem: receitaAtualizada.margem_percentual,
        preco_sugerido: receitaAtualizada.preco_sugerido,
        preco: receitaAtualizada.preco_venda,
        ingredientes: receitaAtualizada.ingredientes,
        updated_at: receitaAtualizada.updated_at,
      })
      .eq('id', receitaId);

    return {
      receitaCanonica: receitaAtualizada,
      custoTotal: receitaAtualizada.custo_receita,
      custoPorUnidade: receitaAtualizada.custo_por_unidade,
      precoVenda: receitaAtualizada.preco_venda,
      precoSugerido: receitaAtualizada.preco_sugerido,
      margem: receitaAtualizada.margem_percentual,
      lucro: receitaAtualizada.lucro,
      ingredientes: receitaAtualizada.ingredientes,
    };
  },

  async calcularCustoPrato(pratoId: string) {
    const { data: prato } = await supabase
      .from('pratos')
      .select('*, receitas(*)')
      .eq('id', pratoId)
      .single();

    if (!prato || !prato.receitas) return null;

    return await this.calcularCustoReceita(prato.receitas.id);
  },

  async getMargemMedia() {
    const { data, error } = await supabase
      .from('receitas')
      .select('margem')
      .not('margem', 'is', null);

    if (error) throw new Error(error.message);

    const margens = data.map(r => r.margem).filter(m => m !== null);
    if (margens.length === 0) return 0;

    return margens.reduce((a, b) => a + b, 0) / margens.length;
  }
};