import { useState, useEffect, useCallback } from "react";
import { IndicacaoService } from "../services/IndicacaoService";
import type { Indicacao, IndicacaoFiltro, IndicacaoStats } from "../types/indicacao";

export function useIndicacoes() {
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [stats, setStats] = useState<IndicacaoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filtro, setFiltro] = useState<IndicacaoFiltro>({});

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await IndicacaoService.listar(filtro);
      setIndicacoes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar"));
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  const carregarStats = useCallback(async (userId: string) => {
    try {
      const data = await IndicacaoService.obterStats(userId);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    }
  }, []);

  const criar = useCallback(async (data: Omit<Indicacao, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await IndicacaoService.criar(data);
      setIndicacoes(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao criar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await IndicacaoService.atualizarStatus(id, status);
      setIndicacoes(prev => prev.map(i => i.id === id ? result : i));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao atualizar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aplicarFiltro = useCallback((novoFiltro: Partial<IndicacaoFiltro>) => {
    setFiltro(prev => ({ ...prev, ...novoFiltro }));
  }, []);

  useEffect(() => { carregar(); }, [filtro]);

  return { indicacoes, stats, loading, error, filtro, carregar, carregarStats, criar, atualizarStatus, aplicarFiltro };
}
