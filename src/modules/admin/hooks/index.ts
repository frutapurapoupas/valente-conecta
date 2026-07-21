// ==================================================
// ADMIN MODULE - HOOKS
// ==================================================

import { useState, useEffect, useCallback } from "react";
import { AdminService } from "../services/AdminService";
import type { Beneficio, DashboardData, ServicoPago, SyncStatus, Usuario } from "../types/admin";

// Hook para Benefícios
export function useBeneficios() {
  const [data, setData] = useState<Beneficio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminService.getBeneficios();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar benefícios"));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (item: Partial<Beneficio>) => {
    try {
      setLoading(true);
      const result = await AdminService.createBeneficio(item);
      setData(prev => [result, ...prev]);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, item: Partial<Beneficio>) => {
    try {
      setLoading(true);
      const result = await AdminService.updateBeneficio(id, item);
      setData(prev => prev.map(d => d.id === id ? result : d));
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await AdminService.deleteBeneficio(id);
      setData(prev => prev.filter(d => d.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return { data, loading, error, load, create, update, remove };
}

// Hook para Dashboard
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return { data, loading, error, load };
}

// Hook para Usuários
export function useUsuarios() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminService.getUsuarios();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar usuários"));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (item: Partial<Usuario>) => {
    try {
      setLoading(true);
      const result = await AdminService.createUsuario(item);
      setData(prev => [result, ...prev]);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, item: Partial<Usuario>) => {
    try {
      setLoading(true);
      const result = await AdminService.updateUsuario(id, item);
      setData(prev => prev.map(d => d.id === id ? result : d));
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await AdminService.deleteUsuario(id);
      setData(prev => prev.filter(d => d.id !== id));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return { data, loading, error, load, create, update, remove };
}
