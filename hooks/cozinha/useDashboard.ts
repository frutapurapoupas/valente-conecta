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
      // APIs válidas do módulo cozinha
      const [recipesResp, estoqueResp, producaoResp, comprasResp, cardapioResp] = await Promise.all([
        fetch('/api/cozinha/recipes').then(res => res.ok ? res.json() : { success: false, data: [] }),
        fetch('/api/cozinha/estoque').then(res => res.ok ? res.json() : { success: false, data: [] }),
        fetch('/api/cozinha/producao').then(res => res.ok ? res.json() : { success: false, data: [] }),
        fetch('/api/cozinha/compras').then(res => res.ok ? res.json() : { success: false, data: [] }),
        fetch('/api/cozinha/cardapio').then(res => res.ok ? res.json() : { success: false, data: [] }),
      ]);

      const resPratos = recipesResp.success ? (recipesResp.data || []) : [];
      const resInsumos = estoqueResp.success ? (estoqueResp.data || []) : [];
      const resProducoes = producaoResp.success ? (producaoResp.data || []) : [];
      const resCompras = comprasResp.success ? (comprasResp.data || []) : [];
      const resCardapio = cardapioResp.success ? (cardapioResp.data || []) : [];

      // Receita estimada a partir do cardápio ativo
      const receita_mes = resCardapio
        .filter((item: any) => item.isAvailable)
        .reduce((acc: number, item: any) => {
          const receita = resPratos.find((r: any) => r.id === item.receitaId);
          const valor = Number(item.precoCustomizado ?? receita?.price ?? 0);
          return acc + valor;
        }, 0);

      // Despesa real de compras já ajustadas
      const despesa_mes = resCompras
        .filter((c: any) => c.comprado)
        .reduce((acc: number, c: any) => acc + Number(c.preco_real || c.preco_estimado || 0) * Number(c.quantidade || 0), 0);

      const custo_total = despesa_mes;

      const financeiro = {
        receita_mes,
        despesa_mes,
        custo_total,
        preco_total: receita_mes,
        vendas_hoje: resProducoes.filter((p: any) => p.status === 'concluido').length,
        vendas_mes: resCardapio.filter((item: any) => item.isAvailable).length,
        ticket_medio: resCardapio.length > 0 ? (receita_mes / resCardapio.length) : 0
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

    const onRealtimeUpdate = () => carregarDados();
    const onFocus = () => carregarDados();
    const interval = setInterval(() => carregarDados(), 20000);

    window.addEventListener('cozinha_data_updated', onRealtimeUpdate as EventListener);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cozinha_data_updated', onRealtimeUpdate as EventListener);
      window.removeEventListener('focus', onFocus);
    };
  }, [carregarDados]);

  return { 
    stats, 
    loading, 
    error, 
    onRefresh: carregarDados,
    carregarDados
  };
}
