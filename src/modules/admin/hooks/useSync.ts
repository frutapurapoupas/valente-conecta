// ==================================================
// ADMIN MODULE - USE SYNC HOOK
// ==================================================

import { useState, useCallback } from "react";
import { AdminService } from "../services/AdminService";
import type { SyncStatus } from "../types/admin";

export function useSync() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminService.getSyncStatus();
      setStatus(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao buscar status"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminService.runSync();
      setStatus(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao executar sync"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    loading,
    error,
    getStatus,
    runSync
  };
}
