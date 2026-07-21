'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCozinhaData<T = any>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cozinha-novo/${endpoint}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = useCallback(async (item: any) => {
    const response = await fetch(`/api/cozinha-novo/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const result = await response.json();
    if (result.success) {
      await loadData();
    }
    return result;
  }, [endpoint, loadData]);

  const update = useCallback(async (id: string, updates: any) => {
    const response = await fetch(`/api/cozinha-novo/${endpoint}?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const result = await response.json();
    if (result.success) {
      await loadData();
    }
    return result;
  }, [endpoint, loadData]);

  const remove = useCallback(async (id: string) => {
    const response = await fetch(`/api/cozinha-novo/${endpoint}?id=${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (result.success) {
      await loadData();
    }
    return result;
  }, [endpoint, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, create, update, delete: remove, reload: loadData };
}

