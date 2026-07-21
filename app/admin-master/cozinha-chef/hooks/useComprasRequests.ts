import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface CompraRequest {
  id: string;
  solicitante?: string;
  receitaNome?: string;
  produto?: string;
  quantidade?: number;
  justificativa?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'comprado';
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  approvedAt?: string;
  ingredientes?: any[];
}

export function useComprasRequests() {
  const [requests, setRequests] = useState<CompraRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compras_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      const normalized = (data || []).map((req: any) => ({
        ...req,
        id: String(req.id),
        ingredientes: Array.isArray(req.ingredientes) ? req.ingredientes : [],
        receitaNome: req.receitaNome || req.receita_nome || req.produto || 'Solicitação sem nome',
        createdAt: req.createdAt || req.created_at || new Date().toISOString(),
        quantidadeProduzir: Number(req.quantidadeProduzir ?? req.quantidade_produzir ?? req.quantidade ?? 0),
      }));
      setRequests(normalized);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar solicitações';
      setError(errorMsg);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: string, updates: Partial<CompraRequest>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compras_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchRequests();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar solicitação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  const aprovar = useCallback(
    async (id: string, options?: { excludedIngredientIndexes?: number[] }) => {
      const updated = await updateRequest(id, {
        status: 'aprovado',
        approvedAt: new Date().toISOString(),
      });

      if (!updated) {
        return { success: false, error: 'Erro ao aprovar solicitação' };
      }

      return { success: true, data: updated };
    },
    [updateRequest]
  );

  const reload = useCallback(() => {
    return fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    items: requests,
    requests,
    loading,
    loadingRequests: loading,
    error,
    fetchRequests,
    updateRequest,
    aprovar,
    reload,
    reloadRequests: reload,
  };
}

