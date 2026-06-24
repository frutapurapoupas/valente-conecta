// hooks/cozinha/useCompras.ts

import { useState, useEffect, useCallback } from 'react';
import { CompraItem } from '@/types/cozinha';

export function useCompras() {
  const [items, setItems] = useState<CompraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cozinha/compras');
      const result = await response.json();

      if (result.success) {
        setItems(result.data || []);
      } else {
        setError(result.error || 'Erro ao carregar compras');
      }
    } catch (err) {
      setError('Erro ao carregar compras');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NOVA FUNÇÃO: Alternar status comprado
  const toggleComprado = useCallback(async (id: string) => {
    try {
      const alvo = items.find((item) => item.id === id);
      if (!alvo) return false;

      const response = await fetch(`/api/cozinha/compras?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comprado: !alvo.comprado })
      });

      const result = await response.json();
      if (!result.success) return false;

      await carregar();
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
      return true;
    } catch (error) {
      console.error('Erro ao alternar comprado:', error);
      return false;
    }
  }, [items, carregar]);

  // ✅ NOVA FUNÇÃO: Excluir item
  const excluir = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cozinha/compras?id=${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!result.success) return false;

      await carregar();
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return false;
    }
  }, [carregar]);

  // ✅ NOVA FUNÇÃO: Adicionar item
  const adicionar = useCallback(async (novoItem: Omit<CompraItem, 'id'>) => {
    try {
      const response = await fetch('/api/cozinha/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoItem, comprado: false })
      });
      const result = await response.json();
      if (!result.success) return null;

      await carregar();
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
      return result.data;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return null;
    }
  }, [carregar]);

  // ✅ NOVA FUNÇÃO: Atualizar item
  const atualizar = useCallback(async (id: string, dados: Partial<CompraItem>) => {
    try {
      const response = await fetch(`/api/cozinha/compras?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const result = await response.json();
      if (!result.success) return false;

      await carregar();
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return false;
    }
  }, [carregar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { 
    items, 
    loading, 
    error,
    carregar,
    toggleComprado, // ✅ EXPORTADO
    excluir,        // ✅ EXPORTADO
    adicionar,
    atualizar
  };
}