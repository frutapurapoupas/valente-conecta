// app/admin/cozinha/dashboard/useDashboardData.ts
// Responsabilidade: Gerenciar estado e chamar os services
// NÃO contém cores, textos ou estilos de UI

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchIngredients } from '@/services/cozinha/ingredientsService';
import { fetchSales } from '@/services/cozinha/salesService';
import { fetchClients } from '@/services/cozinha/clientsService';
import { calculateDashboardMetrics, DashboardMetrics } from '@/services/cozinha/dashboardCalculator';

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar dados reais das três fontes
      const [ingredients, sales, clients] = await Promise.all([
        fetchIngredients(),
        fetchSales(),
        fetchClients()
      ]);
      
      // Calcular métricas
      const dashboardMetrics = await calculateDashboardMetrics(ingredients, sales, clients);
      setMetrics(dashboardMetrics);
      
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Não foi possível carregar os dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { metrics, isLoading, error, reload: loadData };
}
