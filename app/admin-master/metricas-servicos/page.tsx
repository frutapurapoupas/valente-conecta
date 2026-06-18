"use client";

import { CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface Solicitacao {
  id: number;
  servico: string;
  data: string;
  status: string;
  usuario: string;
}

export default function MetricasServicosPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [metricas, setMetricas] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("solicitacoes_servicos");
    if (stored) {
      setSolicitacoes(JSON.parse(stored));
    }

    const storedMetricas = localStorage.getItem("metricas_servicos_indisponiveis");
    if (storedMetricas) {
      setMetricas(JSON.parse(storedMetricas));
    }
  }, []);

  const marcarResolvido = (id: number) => {
    const novasMetricas = metricas.map(m =>
      m.id === id ? { ...m, resolvido: true, resolvidoEm: new Date().toLocaleString() } : m
    );
    setMetricas(novasMetricas);
    localStorage.setItem("metricas_servicos_indisponiveis", JSON.stringify(novasMetricas));
  };

  const pendentes = metricas.filter(m => !m.resolvido).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Métricas de Serviços</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <p className="text-xs text-gray-500">Solicitações de Serviços</p>
          <p className="text-2xl font-bold text-gray-800">{solicitacoes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Resolvidos</p>
          <p className="text-2xl font-bold text-green-600">{metricas.length - pendentes}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800">Solicitações de Serviços Indisponíveis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-medium">Serviço</th>
                <th className="p-3 text-left text-xs font-medium">Data</th>
                <th className="p-3 text-left text-xs font-medium">Status</th>
                <th className="p-3 text-left text-xs font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{m.servico}</td>
                  <td className="p-3">{new Date(m.data).toLocaleString()}</td>
                  <td className="p-3">
                    {m.resolvido ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Resolvido</span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1"><Clock size={14} /> Pendente</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!m.resolvido && (
                      <button
                        onClick={() => marcarResolvido(m.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Marcar resolvido
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}