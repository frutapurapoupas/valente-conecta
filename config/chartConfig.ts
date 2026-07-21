// config/chartConfig.ts

import { DashboardStats } from '@/types/cozinha';

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: { size: 11 }
      }
    }
  },
  scales: {
    y: {
      ticks: { color: 'rgba(255, 255, 255, 0.6)' },
      grid: { color: 'rgba(255, 255, 255, 0.05)' }
    },
    x: {
      ticks: { color: 'rgba(255, 255, 255, 0.6)' },
      grid: { display: false }
    }
  }
};

export const pizzaOptions = {
  ...chartOptions,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: { size: 11 },
        boxWidth: 12,
      }
    }
  }
};

// FunÃ§Ãµes com valores padrÃ£o para evitar erros
export const getPizzaData = (stats: DashboardStats) => ({
  labels: ['Ativos', 'Inativos'],
  datasets: [{
    data: [
      stats?.pratosAtivos || 0, 
      stats?.pratosInativos || 0
    ],
    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
    borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
    borderWidth: 1
  }]
});

export const getBarData = (stats: DashboardStats) => ({
  labels: ['Pendentes', 'ConcluÃ­dos'],
  datasets: [{
    label: 'ProduÃ§Ã£o',
    data: [
      stats?.producaoPendente || 0, 
      stats?.producaoConcluida || 0
    ],
    backgroundColor: ['rgba(234, 179, 8, 0.8)', 'rgba(34, 197, 94, 0.8)'],
    borderColor: ['rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
    borderWidth: 1
  }]
});

export const getLineData = (stats: DashboardStats) => ({
  labels: ['Receitas', 'Despesas', 'Lucro'],
  datasets: [{
    label: 'Financeiro (R$)',
    data: [
      stats?.receitaMes || 0, 
      stats?.despesaMes || 0, 
      stats?.lucroMes || 0
    ],
    backgroundColor: [
      'rgba(34, 197, 94, 0.2)',
      'rgba(239, 68, 68, 0.2)',
      'rgba(59, 130, 246, 0.2)'
    ],
    borderColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)'],
    borderWidth: 2,
    tension: 0.4,
    fill: true,
  }]
});

