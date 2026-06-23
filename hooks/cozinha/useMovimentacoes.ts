// hooks/cozinha/useMovimentacoes.ts
// 🔧 Hook para gerenciar movimentações de estoque

import { useState, useEffect, useCallback } from 'react';
import { cozinhaService } from '@/services/cozinhaService';
import { Movement } from '@/types/cozinha';
import { toast } from 'react-hot-toast';

export const useMovimentacoes = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarMovimentacoes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cozinhaService.getStockMovements();
      setMovements(data.success ? data.data : (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      toast.error('Erro ao carregar movimentações');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMovimentacoes();
  }, [carregarMovimentacoes]);

  return {
    movements,
    loading,
    carregarMovimentacoes
  };
};