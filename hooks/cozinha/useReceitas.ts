// hooks/cozinha/useReceitas.ts
// 🪝 LÓGICA DE ESTADO - Lista de Receitas (PLURAL)

"use client";

import { useState, useEffect, useCallback } from 'react';
import { cozinhaService } from '@/services/cozinhaService';

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  porcoes: number;
  custo_total: number;
  preco_sugerido: number;
  ingredientes: any[];
  created_at?: string;
}

export const useReceitas = () => {
  const [items, setItems] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cozinhaService.getReceitas();
      if (result.success) {
        setItems(result.data);
      } else {
        setError('Erro ao carregar receitas');
      }
    } catch (err) {
      setError('Erro ao carregar receitas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(async (data: any) => {
    try {
      const result = await cozinhaService.createReceita(data);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao criar receita' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao criar receita' };
    }
  }, [carregar]);

  const atualizar = useCallback(async (id: string, data: any) => {
    try {
      const result = await cozinhaService.updateReceita(id, data);
      if (result.success) {
        await carregar();
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Erro ao atualizar receita' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao atualizar receita' };
    }
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    try {
      const result = await cozinhaService.deleteReceita(id);
      if (result.success) {
        await carregar();
        return { success: true };
      }
      return { success: false, error: 'Erro ao excluir receita' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Erro ao excluir receita' };
    }
  }, [carregar]);

  return {
    items,
    loading,
    error,
    carregar,
    criar,
    atualizar,
    excluir,
  };
};

export default useReceitas;