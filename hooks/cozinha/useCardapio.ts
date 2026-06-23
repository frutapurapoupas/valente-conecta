'use client';

import { useHybridData } from './useHybridData';

export interface CardapioItem {
  id: string;
  receitaId: string;
  diaSemana: number;
  periodo: string;
  precoCustomizado?: number;
  isAvailable: boolean;
  createdAt: string;
}

export function useCardapio() {
  const { data, loading, error, create, update, delete: remove, reload } = useHybridData<CardapioItem>('cardapio');

  // Filtrar por dia da semana
  const getByDia = (diaSemana: number) => {
    return data.filter(item => item.diaSemana === diaSemana && item.isAvailable);
  };

  // Filtrar por período
  const getByPeriodo = (periodo: string) => {
    return data.filter(item => item.periodo === periodo && item.isAvailable);
  };

  // Verificar se uma receita já está no cardápio de um dia
  const isInCardapio = (receitaId: string, diaSemana: number) => {
    return data.some(item => item.receitaId === receitaId && item.diaSemana === diaSemana && item.isAvailable);
  };

  // Obter receitas disponíveis para adicionar em um dia
  const getDisponiveisParaDia = (diaSemana: number, receitas: any[]) => {
    const idsNoDia = data
      .filter(item => item.diaSemana === diaSemana && item.isAvailable)
      .map(item => item.receitaId);
    return receitas.filter(r => !idsNoDia.includes(r.id));
  };

  return {
    cardapio: data,
    loading,
    error,
    create,
    update,
    delete: remove,
    reload,
    getByDia,
    getByPeriodo,
    isInCardapio,
    getDisponiveisParaDia
  };
}