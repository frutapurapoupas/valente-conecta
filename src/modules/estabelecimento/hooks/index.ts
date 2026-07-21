import { useState, useEffect, useCallback } from "react";
import { EstabelecimentoService } from "../services/EstabelecimentoService";
import type { Estabelecimento, EstabelecimentoFiltro, EstabelecimentoStats } from "../types/estabelecimento";

export function useEstabelecimento() {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [stats, setStats] = useState<EstabelecimentoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filtro, setFiltro] = useState<EstabelecimentoFiltro>({});

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, statsData] = await Promise.all([
        EstabelecimentoService.listar(filtro),
        EstabelecimentoService.obterStats()
      ]);
      setEstabelecimentos(data);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar"));
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  const criar = useCallback(async (data: Omit<Estabelecimento, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await EstabelecimentoService.criar(data);
      setEstabelecimentos(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao criar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aprovar = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await EstabelecimentoService.aprovar(id);
      setEstabelecimentos(prev => prev.map(e => e.id === id ? result : e));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao aprovar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejeitar = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await EstabelecimentoService.rejeitar(id);
      setEstabelecimentos(prev => prev.map(e => e.id === id ? result : e));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao rejeitar"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aplicarFiltro = useCallback((novoFiltro: Partial<EstabelecimentoFiltro>) => {
    setFiltro(prev => ({ ...prev, ...novoFiltro }));
  }, []);

  useEffect(() => { carregar(); }, [filtro]);

  return { estabelecimentos, stats, loading, error, filtro, carregar, criar, aprovar, rejeitar, aplicarFiltro };
}
