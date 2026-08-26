"use client";

import { AlertTriangle, Bell, TrendingUp, Users } from "lucide-react";

export default function AlertsPanel() {
  const alerts = [
    { id: 1, type: "warning", message: "3 usuários com pagamento pendente", icon: AlertTriangle, cor: "text-yellow-600 bg-yellow-50" },
    { id: 2, type: "info", message: "Nova cidade detectada: Rafael Jambeiro", icon: Bell, cor: "text-blue-600 bg-blue-50" },
    { id: 3, type: "success", message: "12 novos cadastros esta semana", icon: TrendingUp, cor: "text-green-600 bg-green-50" },
    { id: 4, type: "info", message: "Indicações aumentaram 23% este mês", icon: Users, cor: "text-purple-600 bg-purple-50" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell size={18} className="text-yellow-600" />
          Alertas e Insights
        </h3>
        <span className="text-[10px] text-gray-400">Atualizado agora</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={`${alert.cor} rounded-lg p-3 flex items-start gap-3`}>
              <Icon size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{alert.message}</p>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700">
        Ver todos os alertas ?
      </button>
    </div>
  );
}

