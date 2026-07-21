// hooks/cozinha/useFinanceiro.ts
// ?? LÃ“GICA DE ESTADO - Gerenciamento de transaÃ§Ãµes

import { useState, useEffect, useCallback } from 'react';
import { financeiroService, Transacao } from '@/services/financeiroService';

export const useFinanceiro = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar transaÃ§Ãµes
  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await financeiroService.listar();
      if (result.success) {
        setTransacoes(result.data);
      } else {
        setError('Erro ao carregar transaÃ§Ãµes');
      }
    } catch (err) {
      setError('Erro ao carregar transaÃ§Ãµes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar ao montar
  useEffect(() => {
    carregar();
  }, [carregar]);

  // ? Criar transaÃ§Ã£o com LOGS
  const criar = useCallback(async (dados: Omit<Transacao, 'id'>) => {
    console.log('?? useFinanceiro.criar - Dados recebidos:', dados);
    
    try {
      const result = await financeiroService.criar(dados);
      console.log('?? useFinanceiro.criar - Resultado:', result);
      
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Erro ao criar transaÃ§Ã£o' };
    } catch (err) {
      console.error('? Erro no criar:', err);
      return { success: false, error: 'Erro ao criar transaÃ§Ã£o' };
    }
  }, [carregar]);

  // Atualizar transaÃ§Ã£o
  const atualizar = useCallback(async (id: string, dados: Partial<Transacao>) => {
    try {
      const result = await financeiroService.atualizar(id, dados);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao atualizar transaÃ§Ã£o' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao atualizar transaÃ§Ã£o' };
    }
  }, [carregar]);

  // Excluir transaÃ§Ã£o
  const excluir = useCallback(async (id: string) => {
    try {
      const result = await financeiroService.excluir(id);
      if (result.success) {
        await carregar();
        return { success: true };
      }
      return { success: false, error: 'Erro ao excluir transaÃ§Ã£o' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao excluir transaÃ§Ã£o' };
    }
  }, [carregar]);

  // Buscar uma transaÃ§Ã£o especÃ­fica
  const buscar = useCallback(async (id: string) => {
    try {
      const result = await financeiroService.buscar(id);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: 'TransaÃ§Ã£o nÃ£o encontrada' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao buscar transaÃ§Ã£o' };
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

