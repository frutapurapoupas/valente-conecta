// hooks/cozinha/useProducao.ts
// 🪝 LÓGICA DE ESTADO - Gerenciamento de produção

import { useState, useEffect, useCallback } from 'react';
import { cozinhaService, ProducaoItem } from '@/services/cozinhaService';

export const useProducao = () => {
  const [items, setItems] = useState<ProducaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cozinhaService.getProducao();
      if (result.success) {
        setItems(result.data);
      } else {
        setError('Erro ao carregar produção');
      }
    } catch (err) {
      setError('Erro ao carregar produção');
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
      const result = await cozinhaService.createProducao(data);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao criar produção' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao criar produção' };
    }
  }, [carregar]);

  const atualizarStatus = useCallback(async (id: string, status: string, quantidade?: number) => {
    try {
      const result = await cozinhaService.updateProducaoStatus(id, status, quantidade);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao atualizar status' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao atualizar status' };
    }
  }, [carregar]);

  return {
    items,
    loading,
    error,
    carregar,
    criar,
    atualizarStatus,
  };
};