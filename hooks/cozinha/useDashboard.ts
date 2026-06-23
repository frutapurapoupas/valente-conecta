"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardStats } from '@/types/cozinha';
import { calcularStatsDashboard } from '@/utils/cozinhaUtils';

export type { DashboardStats };

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Chamadas paralelas para as APIs reais do ecossistema cozinha
      const [resPratos, resInsumos, resProducoes] = await Promise.all([
        fetch('/api/cozinha/pratos').then(res => res.ok ? res.json() : []),
        fetch('/api/cozinha/insumos').then(res => res.ok ? res.json() : []),
        fetch('/api/cozinha/producoes').then(res => res.ok ? res.json() : [])
      ]);

      // 2. Mapeamento dinâmico dos dados financeiros reais baseados na produção da Chef Neide
      const receita_mes = resPratos.reduce((acc: number, p: any) => acc + (p.preco * (p.enviadoProducao || 0)), 0);
      const custo_total = resPratos.reduce((acc: number, p: any) => acc + (((p.custoIngredientes || 0) + (p.custosFixos || 0)) * (p.enviadoProducao || 0)), 0);
      const despesa_mes = custo_total;

      const financeiro = {
        receita_mes,
        despesa_mes,
        custo_total,
        preco_total: receita_mes,
        vendas_hoje: resProducoes.filter((p: any) => p.status === 'concluido').length,
        vendas_mes: resPratos.reduce((acc: number, p: any) => acc + (p.enviadoProducao || 0), 0),
        ticket_medio: resPratos.length > 0 ? (receita_mes / resPratos.length) : 0
      };

      // 3. Processamento e unificação dos dados na função utilitária original
      const statsCalculated = calcularStatsDashboard(resPratos, resInsumos, resProducoes, financeiro);
      setStats(statsCalculated);
      
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return { 
    stats, 
    loading, 
    error, 
    onRefresh: carregarDados,
    carregarDados
  };
}
