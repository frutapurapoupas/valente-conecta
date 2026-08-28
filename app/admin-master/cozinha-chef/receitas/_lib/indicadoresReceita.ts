import { ReceitaCanonicaCompat } from '@/types/receita-canonica';
import { calcularProgressoPeso } from '@/utils/cozinhaUtils';

export type IngredienteDisponivel = {
  id: string;
  nome: string;
  unidade: string;
  preco_unitario: number;
  unidade_uso?: string;
  fator_conversao?: number;
  peso_gramas_unidade_uso?: number;
};

export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export type MargemStatus = 'negativa' | 'suspeita' | 'saudavel';

export type MargemBadge = {
  status: MargemStatus;
  cor: string;
  texto: string;
};

const TETO_MARGEM_SUSPEITA = 85;

export function calcularMargemBadge(margem: number): MargemBadge {
  const status: MargemStatus = margem < 0 ? 'negativa' : margem > TETO_MARGEM_SUSPEITA ? 'suspeita' : 'saudavel';
  const mapa: Record<MargemStatus, Omit<MargemBadge, 'status'>> = {
    negativa: { cor: 'bg-red-100 text-red-800 border-red-300', texto: 'Prejuizo: preco abaixo do custo' },
    suspeita: { cor: 'bg-amber-100 text-amber-800 border-amber-300', texto: 'Margem muito alta - confira se todos os custos foram incluidos' },
    saudavel: { cor: 'bg-green-100 text-green-800 border-green-300', texto: 'Margem dentro da faixa saudavel' },
  };
  return { status, ...mapa[status] };
}

export function calcularPrecoSugeridoPorMargem(custoPorUnidade: number, margemAlvoPct: number): number {
  if (margemAlvoPct >= 100) return custoPorUnidade;
  return custoPorUnidade / (1 - margemAlvoPct / 100);
}

export type CenarioPreco = {
  nome: string;
  preco: number;
  margemPct: number;
  lucroPorcao: number;
};

export function calcularCenariosPreco(params: {
  custoPorUnidade: number;
  precoSugeridoCalculado: number;
  margemAlvoPct: number;
  precoVendaAtual: number;
  margemAtualPct: number;
}): CenarioPreco[] {
  const { custoPorUnidade, precoSugeridoCalculado, margemAlvoPct, precoVendaAtual, margemAtualPct } = params;
  const base = [
    { nome: 'Preco minimo (ponto de equilibrio)', preco: custoPorUnidade, margemPct: 0 },
    { nome: `Margem-alvo (${margemAlvoPct}%)`, preco: precoSugeridoCalculado, margemPct: margemAlvoPct },
    { nome: 'Preco atual', preco: precoVendaAtual, margemPct: margemAtualPct },
  ];
  return base.map((c) => ({ ...c, lucroPorcao: c.preco - custoPorUnidade }));
}

export type ItemRanking = {
  ingredienteId: string;
  nome: string;
  custoTotal: number;
  pct: number;
};

export function calcularRankingIngredientes(receita: ReceitaCanonicaCompat): ItemRanking[] {
  const ingredientes = receita.ingredientes || [];
  const custoIngredientesTotal = ingredientes.reduce((soma, ing) => soma + toNumber(ing.custo_total, 0), 0);
  return ingredientes
    .map((ing) => ({
      ingredienteId: ing.ingrediente_id,
      nome: ing.ingrediente_nome,
      custoTotal: toNumber(ing.custo_total, 0),
      pct: custoIngredientesTotal > 0 ? (toNumber(ing.custo_total, 0) / custoIngredientesTotal) * 100 : 0,
    }))
    .sort((a, b) => b.custoTotal - a.custoTotal);
}

export type ItemCompra = {
  ingredienteId: string;
  nome: string;
  quantidadeCompra: number;
  unidadeCompra: string;
  custo: number;
};

export function calcularListaCompras(
  receita: ReceitaCanonicaCompat,
  ingredientesDisponiveis: IngredienteDisponivel[]
): { itens: ItemCompra[]; total: number } {
  // Ingredientes da receita representam UMA porcao (mesma convencao de
  // calcularFinanceiroReceita) -- a lista de compras precisa ser pra
  // "porcoes" unidades de producao, senao manda comprar so' o suficiente
  // pra 1 porcao mesmo quando o admin configurou produzir varias.
  const porcoes = Math.max(1, toNumber(receita.porcoes, 1));
  const itens = (receita.ingredientes || []).map((ing) => {
    const disponivel = ingredientesDisponiveis.find((i) => i.id === ing.ingrediente_id);
    const fator = toNumber(disponivel?.fator_conversao, 1);
    const quantidadeTotal = toNumber(ing.quantidade, 0) * porcoes;
    const quantidadeCompra = fator > 0 ? quantidadeTotal / fator : quantidadeTotal;
    return {
      ingredienteId: ing.ingrediente_id,
      nome: ing.ingrediente_nome,
      quantidadeCompra,
      unidadeCompra: disponivel?.unidade || ing.unidade,
      custo: toNumber(ing.custo_total, 0) * porcoes,
    };
  });
  const total = itens.reduce((soma, item) => soma + item.custo, 0);
  return { itens, total };
}

export function calcularPesoTotalGramas(
  receita: ReceitaCanonicaCompat,
  ingredientesDisponiveis: IngredienteDisponivel[]
): number {
  return (receita.ingredientes || []).reduce((soma, ing) => {
    const disponivel = ingredientesDisponiveis.find((i) => i.id === ing.ingrediente_id);
    const pesoPorUnidadeUso = toNumber(disponivel?.peso_gramas_unidade_uso, 1);
    return soma + toNumber(ing.quantidade, 0) * pesoPorUnidadeUso;
  }, 0);
}

export function corBarraProgresso(percentual: number): string {
  if (percentual >= 100) return 'bg-green-500';
  if (percentual >= 70) return 'bg-amber-500';
  return 'bg-blue-500';
}

/**
 * Consolida todos os indicadores derivados de uma receita.
 * Funcao pura: mesma entrada sempre produz a mesma saida, sem efeitos colaterais.
 */
export function calcularIndicadoresReceita(
  receita: ReceitaCanonicaCompat,
  ingredientesDisponiveis: IngredienteDisponivel[],
  margemAlvoPct: number
) {
  // Custo total SEMPRE recalculado a partir dos ingredientes atuais,
  // nunca lido do campo salvo (que so atualiza ao salvar a receita).
  // As quantidades de ingrediente ja representam UMA porcao/prato (e' assim
  // que a tela de "Novo ingrediente"/"Adicionar" pede a quantidade) -- ou
  // seja, custoReceita ja E' o custo por porcao, nao um total pra dividir
  // por "porcoes". "porcoes" e' quantos pratos identicos essa producao
  // esta fazendo (multiplicador pros totais), nao o rendimento de um unico
  // lote de ingredientes.
  const custoReceita = (receita.ingredientes || []).reduce(
    (soma, ing) => soma + toNumber(ing.custo_total, 0),
    0
  );

  const porcoes = toNumber(receita.porcoes, 0);
  const custoPorUnidade = custoReceita;

  const margem = toNumber(receita.margem_percentual, 0);
  const lucro = toNumber(receita.lucro, 0);
  const precoVendaValor = toNumber(receita.preco_venda, 0);
  const precoSugeridoValor = toNumber(receita.preco_sugerido, 0);
  const custosExtrasValor = toNumber(receita.custos_extras_unitario, 0);
  const faturamentoTotal = precoVendaValor * porcoes;
  const custoTotalProducao = custoReceita * porcoes;
  const lucroTotalProducao = lucro * porcoes;
  const lucroPorPorcao = lucro;

  const margemBadge = calcularMargemBadge(margem);
  const precoSugeridoCalculado = calcularPrecoSugeridoPorMargem(custoPorUnidade, margemAlvoPct);

  const cenarios = calcularCenariosPreco({
    custoPorUnidade,
    precoSugeridoCalculado,
    margemAlvoPct,
    precoVendaAtual: precoVendaValor,
    margemAtualPct: margem,
  });

  const rankingIngredientes = calcularRankingIngredientes(receita);
  const listaCompras = calcularListaCompras(receita, ingredientesDisponiveis);

  const pesoTotalGramas = calcularPesoTotalGramas(receita, ingredientesDisponiveis);
  const pesoMetaFinal = toNumber(receita.peso_final, 0);
  const progresso = calcularProgressoPeso(pesoTotalGramas, pesoMetaFinal);
  const corBarra = corBarraProgresso(progresso.percentual);

  return {
    custoReceita,
    custoPorUnidade,
    margem,
    lucro,
    porcoes,
    precoVendaValor,
    precoSugeridoValor,
    custosExtrasValor,
    faturamentoTotal,
    custoTotalProducao,
    lucroTotalProducao,
    lucroPorPorcao,
    margemBadge,
    precoSugeridoCalculado,
    cenarios,
    rankingIngredientes,
    listaCompras,
    pesoTotalGramas,
    pesoMetaFinal,
    progresso,
    corBarra,
  };
}