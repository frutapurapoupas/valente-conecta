// components/financeiro-pessoal/GraficosFinanceiros.tsx
// 🎨 Gráficos financeiros (Chart.js)

"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface GraficosFinanceirosProps {
  porCategoria: Record<string, number>;
  porMes: Record<string, { receitas: number; despesas: number }>;
  totais: { receitas: number; despesas: number; saldo: number };
}

export default function GraficosFinanceiros({ porCategoria, porMes, totais }: GraficosFinanceirosProps) {
  // Cores para os gráficos
  const cores = [
    'rgba(34, 197, 94, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(14, 165, 233, 0.8)',
    'rgba(249, 115, 22, 0.8)',
  ];

  // Dados para gráfico de pizza (categorias)
  const categoriasLabels = Object.keys(porCategoria);
  const categoriasData = Object.values(porCategoria);
  const categoriasCores = categoriasLabels.map((_, i) => cores[i % cores.length]);

  const pieData = {
    labels: categoriasLabels.length > 0 ? categoriasLabels : ['Sem dados'],
    datasets: [
      {
        data: categoriasData.length > 0 ? categoriasData : [1],
        backgroundColor: categoriasCores.length > 0 ? categoriasCores : ['rgba(100, 100, 100, 0.8)'],
        borderColor: ['rgba(255, 255, 255, 0.2)'],
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de barras (mensal)
  const mesesLabels = Object.keys(porMes);
  const receitasData = mesesLabels.map(m => porMes[m].receitas);
  const despesasData = mesesLabels.map(m => porMes[m].despesas);

  const barData = {
    labels: mesesLabels.length > 0 ? mesesLabels : ['Sem dados'],
    datasets: [
      {
        label: 'Receitas',
        data: receitasData.length > 0 ? receitasData : [0],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Despesas',
        data: despesasData.length > 0 ? despesasData : [0],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dados para gráfico de linha (evolução)
  const lineData = {
    labels: mesesLabels.length > 0 ? mesesLabels : ['Sem dados'],
    datasets: [
      {
        label: 'Saldo Acumulado',
        data: mesesLabels.length > 0 
          ? mesesLabels.map((_, i) => {
              let acumulado = 0;
              for (let j = 0; j <= i; j++) {
                acumulado += (porMes[mesesLabels[j]].receitas - porMes[mesesLabels[j]].despesas);
              }
              return acumulado;
            })
          : [0],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 11 },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { display: false },
      },
    },
  };

  const pieOptions = {
    ...options,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 10 },
          boxWidth: 12,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Gráfico de Distribuição por Categoria */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">📊 Distribuição por Categoria</h3>
        <div className="h-64 flex items-center justify-center">
          {categoriasLabels.length > 0 ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <p className="text-gray-400 text-sm">Sem dados para exibir</p>
          )}
        </div>
      </div>

      {/* Gráfico de Evolução Mensal (Linha) */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">📈 Evolução do Saldo</h3>
        <div className="h-64 flex items-center justify-center">
          {mesesLabels.length > 0 ? (
            <Line data={lineData} options={options} />
          ) : (
            <p className="text-gray-400 text-sm">Sem dados para exibir</p>
          )}
        </div>
      </div>

      {/* Gráfico de Receitas vs Despesas (Barras) */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-400 mb-3">📊 Receitas vs Despesas por Mês</h3>
        <div className="h-64 flex items-center justify-center">
          {mesesLabels.length > 0 ? (
            <Bar data={barData} options={options} />
          ) : (
            <p className="text-gray-400 text-sm">Sem dados para exibir</p>
          )}
        </div>
      </div>
    </div>
  );
}