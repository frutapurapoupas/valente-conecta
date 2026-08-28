import { useState, useEffect, useCallback } from 'react';

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\hooks\useCompras.ts
//
// Antes lia direto da tabela "compras" via cliente Supabase -- tabela que
// nunca recebia nada (nada gravava nela), entao a Lista de Compras ficava
// sempre vazia mesmo depois de mandar itens pela tela de receita. O botao
// "Enviar para Lista de Compras" grava em lista_compras_itens (ver
// app/api/cozinha/lista-compras/route.ts) -- esse hook agora le' dali, pra
// os itens enviados realmente aparecerem aqui.

export interface CompraItem {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  preco_estimado: number;
  preco_real?: number;
  origem?: string;
  comprado: boolean;
  prioridade: string;
  created_at: string;
  updated_at: string;
}

export function useCompras() {
  const [itensBrutos, setItensBrutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/cozinha/lista-compras').then((r) => r.json());
      if (!resp.success) throw new Error(resp.error || 'Erro ao carregar lista de compras');
      setItensBrutos(Array.isArray(resp.data) ? resp.data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lista de compras');
      setItensBrutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregar = fetchCompras;

  const items: CompraItem[] = itensBrutos.map((item: any) => ({
    id: String(item.id),
    nome: item.ingrediente_nome || 'Item sem nome',
    unidade: item.unidade || 'un',
    quantidade: Number(item.quantidade || 0),
    preco_estimado: Number(item.custo_estimado || 0),
    origem: item.origem_nome || undefined,
    comprado: Boolean(item.comprado),
    prioridade: 'media',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  const toggleComprado = useCallback(async (id: string) => {
    const atual = itensBrutos.find((item) => String(item.id) === id);
    if (!atual) return null;
    try {
      const resp = await fetch(`/api/cozinha/lista-compras?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprado: !atual.comprado }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      await fetchCompras();
      return resp.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      return null;
    }
  }, [itensBrutos, fetchCompras]);

  const excluir = useCallback(async (id: string) => {
    try {
      const resp = await fetch(`/api/cozinha/lista-compras?id=${id}`, { method: 'DELETE' }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      await fetchCompras();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item');
      return false;
    }
  }, [fetchCompras]);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  return {
    items,
    loading,
    error,
    fetchCompras,
    carregar,
    toggleComprado,
    excluir,
  };
}
