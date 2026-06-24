import { useHybridData } from './useHybridData';

export interface CompraRequestIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  price?: number;
  quantidade?: number;
}

export interface CompraRequest {
  id: string;
  receitaId: string;
  receitaNome: string;
  quantidadeProduzir: number;
  ingredientes: CompraRequestIngredient[];
  status: 'pendente' | 'aprovado';
  createdAt: string;
  approvedAt?: string | null;
}

export function useComprasRequests() {
  const { data, loading, error, create, update, delete: remove, reload } = useHybridData<CompraRequest>('compras-requests');

  const aprovar = async (id: string, payload?: { excludedIngredientIndexes?: number[] }) => {
    return update(id, { action: 'aprovar', ...(payload || {}) });
  };

  return {
    items: data,
    loading,
    error,
    create,
    update,
    delete: remove,
    reload,
    aprovar
  };
}
