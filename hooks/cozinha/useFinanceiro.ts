// hooks/cozinha/useFinanceiro.ts
// 🪝 LÓGICA DE ESTADO - Gerenciamento de transações

import { useState, useEffect, useCallback } from 'react';
import { financeiroService, Transacao } from '@/services/financeiroService';

export const useFinanceiro = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações
  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await financeiroService.listar();
      if (result.success) {
        setTransacoes(result.data);
      } else {
        setError('Erro ao carregar transações');
      }
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar ao montar
  useEffect(() => {
    carregar();
  }, [carregar]);

  // ✅ Criar transação com LOGS
  const criar = useCallback(async (dados: Omit<Transacao, 'id'>) => {
    console.log('🪝 useFinanceiro.criar - Dados recebidos:', dados);
    
    try {
      const result = await financeiroService.criar(dados);
      console.log('🪝 useFinanceiro.criar - Resultado:', result);
      
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Erro ao criar transação' };
    } catch (err) {
      console.error('❌ Erro no criar:', err);
      return { success: false, error: 'Erro ao criar transação' };
    }
  }, [carregar]);

  // Atualizar transação
  const atualizar = useCallback(async (id: string, dados: Partial<Transacao>) => {
    try {
      const result = await financeiroService.atualizar(id, dados);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao atualizar transação' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao atualizar transação' };
    }
  }, [carregar]);

  // Excluir transação
  const excluir = useCallback(async (id: string) => {
    try {
      const result = await financeiroService.excluir(id);
      if (result.success) {
        await carregar();
        return { success: true };
      }
      return { success: false, error: 'Erro ao excluir transação' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao excluir transação' };
    }
  }, [carregar]);

  // Buscar uma transação específica
  const buscar = useCallback(async (id: string) => {
    try {
      const result = await financeiroService.buscar(id);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Transação não encontrada' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao buscar transação' };
    }
  }, []);

  return {
    transacoes,
    loading,
    error,
    carregar,
    criar,
    atualizar,
    excluir,
    buscar,
  };
};