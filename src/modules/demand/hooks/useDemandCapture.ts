// ==================================================
// DEMAND MODULE - HOOK USE DEMAND CAPTURE
// ==================================================
// Versão centralizada - NÃO DUPLICAR!
// ==================================================

import { useState, useEffect, useCallback } from "react";
import { DemandService } from "../services/DemandService";
import type { Demand } from "../types/demand";

export function useDemandCapture() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const captureDemand = useCallback(async (data: Partial<Demand>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await DemandService.capture(data);
      setDemands(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao capturar demanda"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listDemands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DemandService.list();
      setDemands(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao listar demandas"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDemand = useCallback(async (id: string, data: Partial<Demand>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await DemandService.update(id, data);
      setDemands(prev => prev.map(d => d.id === id ? result : d));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao atualizar demanda"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDemand = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await DemandService.delete(id);
      setDemands(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao deletar demanda"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listDemands();
  }, []);

  return {
    demands,
    loading,
    error,
    captureDemand,
    listDemands,
    updateDemand,
    deleteDemand
  };
}
