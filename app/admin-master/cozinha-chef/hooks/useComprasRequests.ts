import { useState, useEffect, useCallback, useMemo } from 'react';

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\hooks\useComprasRequests.ts
//
// Antes lia direto de "compras_requests" via cliente Supabase -- tabela que
// nunca existiu, entao essa secao (Solicitacoes de Compra Pendentes) ficava
// sempre vazia sem erro nenhum aparecer (falha engolida pelo try/catch).
//
// Agora le' de /api/cozinha/lista-compras (status='pendente') e agrupa por
// remessa_id -- cada remessa e' um clique em "Enviar para Lista de
// Compras" de uma receita, com todos os ingredientes dela. aprovar()
// aprova (arredondando pra unidade minima de compra) os ingredientes NAO
// excluidos e rejeita os excluidos, via /api/cozinha/lista-compras/revisar.

export interface CompraRequestIngrediente {
  id: string;
  ingredientName: string;
  quantidade: number;
  unit: string;
}

export interface CompraRequest {
  id: string; // remessa_id
  receitaNome: string;
  quantidade: number; // sempre 1 (sem conceito de "producao em lote" aqui)
  status: 'pendente';
  created_at: string;
  ingredientes: CompraRequestIngrediente[];
}

export function useComprasRequests() {
  const [itensBrutos, setItensBrutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/cozinha/lista-compras').then((r) => r.json());
      if (!resp.success) throw new Error(resp.error || 'Erro ao carregar solicitações');
      setItensBrutos(Array.isArray(resp.data) ? resp.data.filter((i: any) => i.status === 'pendente') : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações');
      setItensBrutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const requests: CompraRequest[] = useMemo(() => {
    const porRemessa = new Map<string, any[]>();
    for (const item of itensBrutos) {
      const chave = item.remessa_id || item.id; // linhas antigas sem remessa_id: cada uma vira sua propria "remessa"
      if (!porRemessa.has(chave)) porRemessa.set(chave, []);
      porRemessa.get(chave)!.push(item);
    }
    return Array.from(porRemessa.entries())
      .map(([remessaId, itens]) => ({
        id: remessaId,
        receitaNome: itens[0]?.origem_nome || 'Solicitação sem nome',
        quantidade: 1,
        status: 'pendente' as const,
        created_at: itens.reduce((min, i) => (i.created_at < min ? i.created_at : min), itens[0].created_at),
        ingredientes: itens.map((i) => ({
          id: String(i.id),
          ingredientName: i.ingrediente_nome,
          quantidade: Number(i.quantidade || 0),
          unit: i.unidade,
        })),
      }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [itensBrutos]);

  const aprovar = useCallback(
    async (remessaId: string, options?: { excludedIngredientIndexes?: number[] }) => {
      const remessa = requests.find((r) => r.id === remessaId);
      if (!remessa) return { success: false, error: 'Remessa não encontrada' };

      const excluidos = new Set(options?.excludedIngredientIndexes || []);
      const aprovarIds = remessa.ingredientes.filter((_, idx) => !excluidos.has(idx)).map((i) => i.id);
      const rejeitarIds = remessa.ingredientes.filter((_, idx) => excluidos.has(idx)).map((i) => i.id);

      try {
        if (aprovarIds.length > 0) {
          const resp = await fetch('/api/cozinha/lista-compras/revisar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'aprovar', item_ids: aprovarIds }),
          }).then((r) => r.json());
          if (!resp.success) throw new Error(resp.error);
        }
        if (rejeitarIds.length > 0) {
          const resp = await fetch('/api/cozinha/lista-compras/revisar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'rejeitar', item_ids: rejeitarIds }),
          }).then((r) => r.json());
          if (!resp.success) throw new Error(resp.error);
        }
        await fetchRequests();
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erro ao aprovar solicitação' };
      }
    },
    [requests, fetchRequests]
  );

  const reload = useCallback(() => fetchRequests(), [fetchRequests]);

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
    aprovar,
    reload,
    reloadRequests: reload,
  };
}
