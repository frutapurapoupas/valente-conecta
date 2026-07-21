import { useState, useEffect, useCallback } from "react";
import { RecargaService } from "../services/RecargaService";
import type { Recarga, RecargaFiltro, RecargaStats } from "../types/recarga";

export function useRecarga(userId?: string) {
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [stats, setStats] = useState<RecargaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filtro, setFiltro] = useState<RecargaFiltro>({});

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (userId) {
        data = await RecargaService.listarPorUsuario(userId);
      } else {
        data = await RecargaService.listar(filtro);
      }
      setRecargas(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar recargas"));
    } finally {
      setLoading(false);
    }
  }, [filtro, userId]);

  const carregarStats = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await RecargaService.obterStats(userId);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    }
  }, [userId]);

  const criar = useCallback(async (data: Omit<Recarga, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await RecargaService.criar(data);
      setRecargas(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao criar recarga"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmar = useCallback(async (id: string, transacao_id?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await RecargaService.confirmar(id, transacao_id);
      setRecargas(prev => prev.map(r => r.id === id ? result : r));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao confirmar recarga"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelar = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await RecargaService.cancelar(id);
      setRecargas(prev => prev.map(r => r.id === id ? result : r));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao cancelar recarga"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aplicarFiltro = useCallback((novoFiltro: Partial<RecargaFiltro>) => {
    setFiltro(prev => ({ ...prev, ...novoFiltro }));
  }, []);

  useEffect(() => { carregar(); }, [filtro, userId]);
  useEffect(() => { if (userId) carregarStats(); }, [userId]);

  return { recargas, stats, loading, error, filtro, carregar, criar, confirmar, cancelar, aplicarFiltro };
}
