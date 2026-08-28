import { useState, useEffect, useCallback } from 'react';
import type { CompraItem } from '@/types/cozinha';

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\hooks\useCompras.ts
//
// Lista final unica de compra: so' itens com status 'aprovado' ou
// 'comprado' (aprovados na secao de solicitacoes pendentes, ja com a
// quantidade arredondada pra unidade minima de compra). Fornecedor e preco
// real sao editaveis aqui; marcar "comprado" com um preco real credita a
// quantidade comprada no estoque (feito no backend, ver
// app/api/cozinha/lista-compras/route.ts PUT).

export type { CompraItem };

export function useCompras() {
  const [itensBrutos, setItensBrutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/cozinha/lista-compras').then((r) => r.json());
      if (!resp.success) throw new Error(resp.error || 'Erro ao carregar lista de compras');
      const aprovadosOuComprados = (Array.isArray(resp.data) ? resp.data : []).filter(
        (i: any) => i.status === 'aprovado' || i.status === 'comprado'
      );
      setItensBrutos(aprovadosOuComprados);
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
    preco_real: item.preco_real == null ? undefined : Number(item.preco_real),
    fornecedor: item.fornecedor || '',
    receita_origem: item.origem_nome || undefined,
    comprado: Boolean(item.comprado),
    prioridade: 'media',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));

  const atualizarItem = useCallback(async (id: string, patch: Record<string, unknown>) => {
    try {
      const resp = await fetch(`/api/cozinha/lista-compras?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      await fetchCompras();
      return resp.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      return null;
    }
  }, [fetchCompras]);

  const salvarFornecedor = useCallback((id: string, fornecedor: string) => atualizarItem(id, { fornecedor }), [atualizarItem]);

  // Marcar comprado exige preco real (e' o que credita o estoque com o
  // preco pago de verdade) -- desmarcar so' reverte o status, sem mexer no
  // estoque de novo (evita duplo credito/duplo desconto).
  const marcarComprado = useCallback((id: string, precoReal: number) => atualizarItem(id, { comprado: true, preco_real: precoReal }), [atualizarItem]);
  const desmarcarComprado = useCallback((id: string) => atualizarItem(id, { comprado: false }), [atualizarItem]);

  const toggleComprado = useCallback(async (id: string, precoReal?: number) => {
    const atual = itensBrutos.find((item) => String(item.id) === id);
    if (!atual) return null;
    return atual.comprado ? desmarcarComprado(id) : marcarComprado(id, precoReal ?? (Number(atual.preco_real) || 0));
  }, [itensBrutos, marcarComprado, desmarcarComprado]);

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
    salvarFornecedor,
    marcarComprado,
    desmarcarComprado,
    toggleComprado,
    excluir,
  };
}
