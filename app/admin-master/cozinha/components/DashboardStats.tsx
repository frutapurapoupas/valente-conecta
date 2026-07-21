// app/admin-master/cozinha/components/DashboardStats.tsx
"use client";

interface DashboardStatsProps {
  totalReceitas: number;
  totalIngredientes: number;
  alertasEstoque: number;
  producaoHoje: number;
  faturamentoMes: number;
  loading?: boolean;
}

export function DashboardStats({
  totalReceitas,
  totalIngredientes,
  alertasEstoque,
  producaoHoje,
  faturamentoMes,
  loading = false
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Receitas', value: totalReceitas, icon: '📋', color: 'blue' },
    { label: 'Ingredientes', value: totalIngredientes, icon: '🥬', color: 'green' },
    { label: 'Alertas Estoque', value: alertasEstoque, icon: '⚠️', color: 'red' },
    { label: 'Produção Hoje', value: producaoHoje, icon: '👨‍🍳', color: 'purple' },
    { label: 'Faturamento Mês', value: `R$ ${faturamentoMes.toFixed(2)}`, icon: '💰', color: 'yellow' }
  ];

  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${colors[stat.color as keyof typeof colors]} border rounded-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-sm font-medium opacity-75">{stat.label}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}