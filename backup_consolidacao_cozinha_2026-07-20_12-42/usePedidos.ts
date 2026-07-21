// app/cozinha/hooks/usePedidos.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PedidoService } from '../services/PedidoService';
import { Pedido, PedidoStatus, PedidoInput } from '../types/pedido';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new PedidoService(), []);

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listarTodos();
      setPedidos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(message);
      console.error('usePedidos - Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const buscarPorStatus = useCallback(async (status: PedidoStatus) => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listarPorStatus(status);
      setPedidos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar pedidos por status';
      setError(message);
      console.error('usePedidos - Erro ao buscar por status:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const criarPedido = useCallback(async (pedido: PedidoInput) => {
    try {
      setLoading(true);
      setError(null);
      const novo = await service.criar(pedido);
      setPedidos(prev => [novo, ...prev]);
      return novo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar pedido';
      setError(message);
      console.error('usePedidos - Erro ao criar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const atualizarStatus = useCallback(async (id: string, status: PedidoStatus) => {
    try {
      setLoading(true);
      setError(null);
      const atualizado = await service.atualizarStatus(id, status);
      setPedidos(prev => prev.map(p => p.id === id ? atualizado : p));
      return atualizado;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(message);
      console.error('usePedidos - Erro ao atualizar status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const cancelarPedido = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const cancelado = await service.cancelar(id);
      setPedidos(prev => prev.map(p => p.id === id ? cancelado : p));
      return cancelado;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cancelar pedido';
      setError(message);
      console.error('usePedidos - Erro ao cancelar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  return {
    pedidos,
    loading,
    error,
    carregarPedidos,
    buscarPorStatus,
    criarPedido,
    atualizarStatus,
    cancelarPedido
  };
}
