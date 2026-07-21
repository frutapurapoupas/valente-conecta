import { ReceitaCanonicaCompat } from '@/types/receita-canonica';

type ReceitaDb = {
  id: string;
  nome: string | null;
  descricao: string | null;
  categoria: string | null;
  porcoes: number | null;
  custo_total: number | null;
  preco_sugerido: number | null;
  tempo_preparo: number | null;
  instrucoes: string | null;
  imagem_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type InstrucaoPayload = {
  texto: string | null;
  __canonical__?: Partial<ReceitaCanonicaCompat>;
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

function toStringOrNull(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return null;
}

function parseInstrucoes(value: unknown): InstrucaoPayload {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { texto: null };
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return {
        texto: typeof parsed.texto === 'string' ? parsed.texto : null,
        __canonical__: (parsed.__canonical__ || {}) as Partial<ReceitaCanonicaCompat>,
      };
    }
  } catch {
    return { texto: value };
  }

  return { texto: value };
}

function serializeInstrucoes(texto: string | null, canonical: Partial<ReceitaCanonicaCompat>): string {
  return JSON.stringify({
    texto,
    __canonical__: canonical,
  });
}

function normalizarIngredientes(raw: any[]): ReceitaCanonicaCompat['ingredientes'] {
  return (Array.isArray(raw) ? raw : []).map((ing: any) => {
    const quantidade = toNumber(ing?.quantidade ?? ing?.quantity, 0);
    const custoUnitario = toNumber(
      ing?.custo_unitario ?? ing?.custoUnitario ?? ing?.cost,
      0
    );
    const custoTotal = toNumber(ing?.custo_total ?? ing?.custoTotal, quantidade * custoUnitario);

    return {
      ingrediente_id: String(ing?.ingrediente_id ?? ing?.ingredientId ?? ''),
      ingrediente_nome: String(ing?.ingrediente_nome ?? ing?.ingredientName ?? ''),
      quantidade,
      unidade: String(ing?.unidade ?? ing?.unit ?? 'un'),
      custo_unitario: custoUnitario,
      custo_total: custoTotal,
    };
  });
}

export function fromDbToCanonical(row: ReceitaDb): ReceitaCanonicaCompat {
  const parsed = parseInstrucoes(row.instrucoes);
  const meta = parsed.__canonical__ || {};

  const ingredientes = normalizarIngredientes(
    Array.isArray(meta.ingredientes)
      ? meta.ingredientes
      : Array.isArray(meta.ingredients)
        ? meta.ingredients
        : []
  );

  const porcoes = toNumber(meta.porcoes ?? meta.servings ?? row.porcoes, 0);
  const custoReceita = toNumber(meta.custo_receita ?? meta.custo_total ?? row.custo_total, 0);
  const precoSugerido = toNumber(meta.preco_sugerido ?? row.preco_sugerido, 0);
  const precoVenda = toNumber(meta.preco_venda ?? meta.preco ?? precoSugerido, precoSugerido);
  const custoPorUnidade = porcoes > 0 ? custoReceita / porcoes : 0;
  const lucro = precoVenda - custoReceita;
  const margemPercentual = precoVenda > 0 ? ((precoVenda - custoReceita) / precoVenda) * 100 : 0;

  return {
    id: String(row.id ?? ''),
    nome: String(row.nome ?? ''),
    descricao: String(row.descricao ?? ''),
    categoria: String(row.categoria ?? 'Geral'),
    imagem: toStringOrNull(meta.imagem ?? row.imagem_url),
    status: (meta.status === 'inativo' ? 'inativo' : 'ativo') as 'ativo' | 'inativo',
    ingredientes,
    rendimento: toNumber(meta.rendimento, porcoes),
    peso_final: meta.peso_final == null ? null : toNumber(meta.peso_final, 0),
    porcoes,
    custo_receita: custoReceita,
    custo_por_unidade: toNumber(meta.custo_por_unidade, custoPorUnidade),
    margem_percentual: toNumber(meta.margem_percentual, margemPercentual),
    lucro: toNumber(meta.lucro, lucro),
    preco_sugerido: precoSugerido,
    preco_venda: precoVenda,
    integracoes: {
      ...DEFAULT_INTEGRACOES,
      ...(meta.integracoes || {}),
    },
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    // aliases legados
    preco: precoVenda,
    custo_total: custoReceita,
    margem: toNumber(meta.margem_percentual, margemPercentual),
    ativo: meta.status !== 'inativo',
    images: toStringOrNull(meta.imagem ?? row.imagem_url) ? [String(meta.imagem ?? row.imagem_url)] : [],
    ingredients: ingredientes.map((ing) => ({
      ingredientId: ing.ingrediente_id,
      ingredientName: ing.ingrediente_nome,
      quantity: ing.quantidade,
      unit: ing.unidade,
      cost: ing.custo_total,
    })),
    servings: porcoes,
    isAvailable: meta.status !== 'inativo',
  };
}

export function fromPayloadToCanonical(
  payload: any,
  current?: ReceitaCanonicaCompat
): ReceitaCanonicaCompat {
  const now = new Date().toISOString();

  const ingredientes = normalizarIngredientes(
    Array.isArray(payload?.ingredientes)
      ? payload.ingredientes
      : Array.isArray(payload?.ingredients)
        ? payload.ingredients
        : current?.ingredientes || []
  );

  const porcoes = toNumber(payload?.porcoes ?? payload?.servings ?? current?.porcoes, current?.porcoes ?? 0);
  const custoCalculado = ingredientes.reduce((sum, ing) => sum + toNumber(ing.custo_total, 0), 0);
  const custoReceita = toNumber(
    payload?.custo_receita ?? payload?.custo_total ?? current?.custo_receita,
    custoCalculado
  );

  const precoSugerido = toNumber(
    payload?.preco_sugerido ?? payload?.preco_venda ?? payload?.preco ?? current?.preco_sugerido,
    current?.preco_sugerido ?? 0
  );
  const precoVenda = toNumber(
    payload?.preco_venda ?? payload?.preco ?? payload?.preco_sugerido ?? current?.preco_venda,
    precoSugerido
  );

  const custoPorUnidade = porcoes > 0 ? custoReceita / porcoes : 0;
  const lucro = precoVenda - custoReceita;
  const margemPercentual = precoVenda > 0 ? ((precoVenda - custoReceita) / precoVenda) * 100 : 0;

  return {
    id: String(payload?.id ?? current?.id ?? ''),
    nome: String(payload?.nome ?? payload?.name ?? current?.nome ?? ''),
    descricao: String(payload?.descricao ?? payload?.description ?? current?.descricao ?? ''),
    categoria: String(payload?.categoria ?? payload?.category ?? current?.categoria ?? 'Geral'),
    imagem: toStringOrNull(payload?.imagem ?? payload?.image ?? payload?.imagem_url ?? current?.imagem),
    status: (payload?.status ?? (payload?.ativo === false ? 'inativo' : current?.status ?? 'ativo')) as 'ativo' | 'inativo',
    ingredientes,
    rendimento: toNumber(payload?.rendimento ?? current?.rendimento, porcoes),
    peso_final: payload?.peso_final == null
      ? current?.peso_final ?? null
      : toNumber(payload?.peso_final, 0),
    porcoes,
    custo_receita: custoReceita,
    custo_por_unidade: toNumber(payload?.custo_por_unidade, custoPorUnidade),
    margem_percentual: toNumber(payload?.margem_percentual ?? payload?.margem, margemPercentual),
    lucro: toNumber(payload?.lucro, lucro),
    preco_sugerido: precoSugerido,
    preco_venda: precoVenda,
    integracoes: {
      ...DEFAULT_INTEGRACOES,
      ...(current?.integracoes || {}),
      ...(payload?.integracoes || {}),
    },
    created_at: String(current?.created_at ?? payload?.created_at ?? now),
    updated_at: now,
    preco: precoVenda,
    custo_total: custoReceita,
    margem: toNumber(payload?.margem_percentual ?? payload?.margem, margemPercentual),
    ativo: (payload?.status ?? current?.status ?? 'ativo') !== 'inativo',
    images: toStringOrNull(payload?.imagem ?? payload?.image ?? payload?.imagem_url ?? current?.imagem)
      ? [String(payload?.imagem ?? payload?.image ?? payload?.imagem_url ?? current?.imagem)]
      : current?.images || [],
    ingredients: ingredientes.map((ing) => ({
      ingredientId: ing.ingrediente_id,
      ingredientName: ing.ingrediente_nome,
      quantity: ing.quantidade,
      unit: ing.unidade,
      cost: ing.custo_total,
    })),
    servings: porcoes,
    isAvailable: (payload?.status ?? current?.status ?? 'ativo') !== 'inativo',
  };
}

export function toDbPayload(
  canonical: ReceitaCanonicaCompat,
  previousInstrucoes?: string | null,
  previousTempoPreparo?: number | null
) {
  const parsed = parseInstrucoes(previousInstrucoes);

  const canonicalMeta: Partial<ReceitaCanonicaCompat> = {
    imagem: canonical.imagem,
    status: canonical.status,
    ingredientes: canonical.ingredientes,
    rendimento: canonical.rendimento,
    peso_final: canonical.peso_final,
    porcoes: canonical.porcoes,
    custo_receita: canonical.custo_receita,
    custo_por_unidade: canonical.custo_por_unidade,
    margem_percentual: canonical.margem_percentual,
    lucro: canonical.lucro,
    preco_sugerido: canonical.preco_sugerido,
    preco_venda: canonical.preco_venda,
    integracoes: canonical.integracoes,
  };

  return {
    nome: canonical.nome,
    descricao: canonical.descricao,
    categoria: canonical.categoria,
    porcoes: canonical.porcoes,
    custo_total: canonical.custo_receita,
    preco_sugerido: canonical.preco_sugerido,
    imagem_url: canonical.imagem,
    tempo_preparo: previousTempoPreparo ?? null,
    instrucoes: serializeInstrucoes(parsed.texto, canonicalMeta),
    updated_at: canonical.updated_at,
  };
}
