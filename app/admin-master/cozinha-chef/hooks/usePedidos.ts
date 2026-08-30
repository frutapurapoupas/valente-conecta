// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\hooks\usePedidos.ts
//
// Pedidos reais da Cozinha (087_cozinha_checkout_pedidos.sql), via
// /api/cozinha/pedidos -- NAO usa useDashboard (que lia de uma tabela
// `pedidos` generica que nunca existiu, ver
// docs/cozinha-chef-neide/04_APOSTILA_TECNICA_MODULO_COZINHA.md secao 7.4).

import { useCallback, useEffect, useState } from 'react';

export interface PedidoCozinha {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  itens: { titulo: string; quantidade: number; subtotal: number }[];
  total: number;
  tipo_entrega: 'retirada' | 'entrega';
  forma_pagamento: string;
  status_pagamento: string;
  status: string;
  recebido_por: string | null;
  created_at: string;
}

export function usePedidos(status: string) {
  const [pedidos, setPedidos] = useState<PedidoCozinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    try {
      const resp = await fetch(`/api/cozinha/pedidos?status=${status}`, { cache: 'no-store' }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      setPedidos(resp.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, [status]);

  const avancarStatus = useCallback(async (id: string, novoStatus: string, recebidoPor?: string) => {
    const resp = await fetch(`/api/cozinha/pedidos?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novoStatus, recebidoPor }),
    }).then((r) => r.json());
    if (!resp.success) throw new Error(resp.error);
    await fetchPedidos();
    return resp.data;
  }, [fetchPedidos]);

  const cancelar = useCallback(async (id: string) => {
    const resp = await fetch(`/api/cozinha/pedidos?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novoStatus: 'cancelado' }),
    }).then((r) => r.json());
    if (!resp.success) throw new Error(resp.error);
    await fetchPedidos();
  }, [fetchPedidos]);

  useEffect(() => {
    setLoading(true);
    fetchPedidos();
    const intervalo = setInterval(fetchPedidos, 10000);
    return () => clearInterval(intervalo);
  }, [fetchPedidos]);

  return { pedidos, loading, error, fetchPedidos, avancarStatus, cancelar };
}
