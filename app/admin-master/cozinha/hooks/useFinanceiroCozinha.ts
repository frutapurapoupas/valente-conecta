// app/admin-master/cozinha/hooks/useFinanceiroCozinha.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinanceiroCozinhaService } from '../services/FinanceiroCozinhaService';
import { LancamentoFinanceiroCozinha, ResumoFinanceiroCozinha } from '../types/financeiro';

export function useFinanceiroCozinha() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiroCozinha[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroCozinha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new FinanceiroCozinhaService(), []);

  const carregarDados = useCallback(async (dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      setError(null);
      const [lancs, res] = await Promise.all([
        service.listarLancamentos(undefined, dataInicio, dataFim),
        service.buscarResumo(dataInicio, dataFim)
      ]);
      setLancamentos(lancs);
      setResumo(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros';
      setError(message);
      console.error('useFinanceiroCozinha - Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const criarLancamento = useCallback(async (
    lancamento: Omit<LancamentoFinanceiroCozinha, 'id' | 'created_at'>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const novo = await service.criarLancamento(lancamento);
      await carregarDados();
      return novo;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lançamento';
      setError(message);
      console.error('useFinanceiroCozinha - Erro ao criar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, carregarDados]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return {
    lancamentos,
    resumo,
    loading,
    error,
    carregarDados,
    criarLancamento
  };
}