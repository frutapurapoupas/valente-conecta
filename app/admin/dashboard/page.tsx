"use client";

import { useDashboard } from "@/modules/admin";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) return <div className="p-6">Carregando dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  const cards = [
    { label: "Usuários", value: data?.totalUsuarios || 0, icon: "👤" },
    { label: "Benefícios", value: data?.totalBeneficios || 0, icon: "🎁" },
    { label: "Serviços Pagos", value: data?.totalServicosPagos || 0, icon: "💳" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">
          Último Sync: {data?.ultimoSync ? new Date(data.ultimoSync).toLocaleString() : "Nunca"}
        </p>
      </div>
    </div>
  );
}
