// 🪝 LÓGICA DE ESTADO - Gerenciamento de estoque

import { useState, useEffect, useCallback } from 'react';

export interface EstoqueItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  quantidade_minima: number;
  preco_unitario: number;
  peso_unitario?: number;
  recipiente?: string;
  created_at?: string;
  updated_at?: string;
}

export function useEstoque() {
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cozinha/estoque');
      const result = await response.json();
      if (result.success) {
        setItems(result.data || []);
      } else {
        setError('Erro ao carregar estoque');
      }
    } catch (err) {
      setError('Erro ao carregar estoque');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(async (data: any) => {
    try {
      const response = await fetch('/api/cozinha/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao criar item' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao criar item' };
    }
  }, [carregar]);

  const atualizar = useCallback(async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/cozinha/estoque?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao atualizar item' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao atualizar item' };
    }
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cozinha/estoque?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        await carregar();
        return { success: true };
      }
      return { success: false, error: 'Erro ao excluir item' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao excluir item' };
    }
  }, [carregar]);

  return {
    items,
    loading,
    error,
    carregar,
    criar,
    atualizar,
    excluir
  };
}