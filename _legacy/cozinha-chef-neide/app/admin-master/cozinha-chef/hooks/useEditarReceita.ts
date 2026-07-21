import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { cozinhaService } from "@/services/cozinhaService";
import { ReceitaCanonicaCompat } from "@/types/receita-canonica";
import {
  buildReceitaPayload,
  calcularFinanceiroReceita,
  normalizarReceitaCanonica,
} from "../services/custoService";

import type {
  Ingredient,
} from "@/lib/cozinha/types";

type ApiResult<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

const DEFAULT_INTEGRACOES = {
  catalogo: false,
  cardapio: false,
  producao: false,
  estoque: false,
  compras: false,
};

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function extractData<T>(payload: any): T {
  if (payload && typeof payload === "object" && "success" in payload) {
    return ((payload as ApiResult<T>).data as T) ?? (null as T);
  }
  return (payload ?? null) as T;
}

function normalizeReceita(item: any): ReceitaCanonicaCompat {
  return normalizarReceitaCanonica(item);
}

function toLegacyRecipe(canonica: ReceitaCanonicaCompat) {
  return {
    id: canonica.id,
    name: canonica.nome,
    description: canonica.descricao,
    price: canonica.preco_venda,
    category: canonica.categoria as any,
    ingredients: (canonica.ingredientes || []).map((ing) => ({
      ingredientId: ing.ingrediente_id,
      ingredientName: ing.ingrediente_nome,
      quantity: ing.quantidade,
      unit: ing.unidade,
      cost: ing.custo_total,
    })),
    images: canonica.images || (canonica.imagem ? [canonica.imagem] : []),
    preparationTime: asNumber(canonica.peso_final, 0),
    servings: asNumber(canonica.porcoes, 0),
    isAvailable: canonica.status === 'ativo',
    featured: false,
    tags: [],
    createdAt: canonica.created_at,
    updatedAt: canonica.updated_at,
  };
}

function toApiPayload(canonica: ReceitaCanonicaCompat) {
  const financeiro = calcularFinanceiroReceita({
    ingredientes: canonica.ingredientes,
    porcoes: canonica.porcoes,
    preco_venda: canonica.preco_venda,
    preco_sugerido: canonica.preco_sugerido,
    custo_receita: canonica.custo_receita,
  });

  return buildReceitaPayload({
    ...canonica,
    ...financeiro,
    updated_at: new Date().toISOString(),
  });
}

export const useEditarReceita = (receitaId: string) => {
  const router = useRouter();

  const [receita, setReceita] = useState<ReceitaCanonicaCompat | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [ingredientesDisponiveis, setIngredientesDisponiveis] =
    useState<Ingredient[]>([]);

  const [error, setError] = useState<string | null>(null);

  const draftKey = useMemo(
    () => `recipe_draft_${receitaId}`,
    [receitaId]
  );

  const carregarReceita = useCallback(async () => {
    if (!receitaId) return;

    try {
      const draft = localStorage.getItem(draftKey);

      if (draft) {
        setReceita(normalizeReceita(JSON.parse(draft)));
        setLoading(false);
        toast.success("Rascunho carregado.");
        return;
      }

      setLoading(true);

      const data = await cozinhaService.getReceita(receitaId);
      const payload = extractData<any>(data);

      if (payload) {
        setReceita(normalizeReceita(payload));
      } else {
        setError("Receita não encontrada.");
        setReceita(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar receita.");
      setReceita(null);
    } finally {
      setLoading(false);
    }
  }, [receitaId, draftKey]);

  useEffect(() => {
    async function carregarIngredientes() {
      try {
        const estoque =
          await cozinhaService.getEstoque();

        const estoqueData = extractData<any[]>(estoque);

        setIngredientesDisponiveis(
          (Array.isArray(estoqueData) ? estoqueData : []).map((item) => ({
            id: String(item?.id ?? ''),
            name: String(item?.nome ?? item?.produto ?? ''),
            category: 'alimento',
            unit: String(item?.unidade ?? 'un'),
            currentPrice: asNumber(item?.preco_unitario, 0),
            stock: asNumber(item?.quantidade, 0),
            minStock: asNumber(item?.estoque_minimo ?? item?.quantidade_minima, 0),
            createdAt: String(item?.created_at ?? new Date().toISOString()),
            updatedAt: String(item?.updated_at ?? new Date().toISOString()),
          })) as Ingredient[]
        );
      } catch (err) {
        console.error(err);
        toast.error(
          "Erro ao carregar ingredientes."
        );
      }
    }

    carregarIngredientes();
  }, []);

  useEffect(() => {
    if (!loading && receita) {
      localStorage.setItem(
        draftKey,
        JSON.stringify(receita)
      );
    }
  }, [receita, loading, draftKey]);

  const salvarReceita = useCallback(
    async (dados: Partial<ReceitaCanonicaCompat>) => {
      if (!receitaId) return false;

      setSaving(true);

      try {
        const atual = receita || normalizeReceita({ id: receitaId });
        const payload = toApiPayload(normalizeReceita({ ...atual, ...dados, id: receitaId }));

        const atualizada =
          await cozinhaService.updateReceita(
            receitaId,
            payload
          );

        const atualizadaData = extractData<any>(atualizada);

        setReceita(normalizeReceita(atualizadaData || payload));

        localStorage.removeItem(draftKey);

        toast.success("Receita salva com sucesso!");

        router.push(
          "/admin-master/cozinha-chef/receitas"
        );

        return true;
      } catch (err) {
        console.error(err);

        toast.error("Erro ao salvar receita.");

        return false;
      } finally {
        setSaving(false);
      }
    },
    [receitaId, draftKey, router]
  );

  useEffect(() => {
    carregarReceita();
  }, [carregarReceita]);

  return {
    receita,

    recipe: receita ? toLegacyRecipe(receita) : null,

    setReceita,

    loading,

    saving,

    ingredientesDisponiveis,

    error,

    carregarReceita,

    salvarReceita,
  };
};

