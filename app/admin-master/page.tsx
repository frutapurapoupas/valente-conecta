// app/admin-master/cozinha-chef/page.tsx - VERSÃO FINAL

"use client";

import { useDashboard } from '@/hooks/cozinha/useDashboard';
import { DashboardUI } from '@/components/cozinha/DashboardUI';
import { 
  getPizzaData, 
  getBarData, 
  getLineData,
  chartOptions,
  pizzaOptions 
} from '@/config/chartConfig';

export default function CozinhaChefPage() {
  const { stats, loading, error, onRefresh } = useDashboard();

  const pizzaData = stats ? getPizzaData(stats) : { labels: [], datasets: [] };
  const barData = stats ? getBarData(stats) : { labels: [], datasets: [] };
  const lineData = stats ? getLineData(stats) : { labels: [], datasets: [] };

  return (
    <DashboardUI
      stats={stats}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      pizzaData={pizzaData}
      barData={barData}
      lineData={lineData}
      chartOptions={chartOptions}
      pizzaOptions={pizzaOptions}
    />
  );
}