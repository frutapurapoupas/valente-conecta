// app/cozinha/hooks/useReceitas.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { receitaService } from '../services/receitaService';

export interface Receita {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem?: string;
  categoria?: string;
  ingredientes?: Array<{ nome: string; quantidade: number; unidade: string }>;
}

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await receitaService.listar();
      setReceitas(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar receitas';
      setError(message);
      console.error('useReceitas - Erro:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscar = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await receitaService.buscar(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar receita';
      setError(message);
      console.error('useReceitas - Erro ao buscar:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const criar = useCallback(async (dados: Omit<Receita, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const novaReceita = await receitaService.criar(dados);
      setReceitas(prev => [...prev, novaReceita]);
      return novaReceita;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar receita';
      setError(message);
      console.error('useReceitas - Erro ao criar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editar = useCallback(async (id: string, dados: Partial<Receita>) => {
    try {
      setLoading(true);
      setError(null);
      const receitaEditada = await receitaService.editar(id, dados);
      setReceitas(prev => prev.map(r => r.id === id ? receitaEditada : r));
      return receitaEditada;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao editar receita';
      setError(message);
      console.error('useReceitas - Erro ao editar:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluir = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await receitaService.excluir(id);
      setReceitas(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir receita';
      setError(message);
      console.error('useReceitas - Erro ao excluir:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listar();
  }, [listar]);

  return {
    receitas,
    loading,
    error,
    listar,
    buscar,
    criar,
    editar,
    excluir
  };
}
