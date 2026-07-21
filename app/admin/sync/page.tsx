"use client";

import { useSync } from "@/modules/admin";
import { useState, useEffect } from "react";

export default function SyncPage() {
  const { status, loading, error, getStatus, runSync } = useSync();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    getStatus();
  }, []);

  const handleRunSync = async () => {
    setIsRunning(true);
    try {
      await runSync();
      await getStatus();
    } finally {
      setIsRunning(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Erro ao carregar status</p>
          <p className="text-red-400 text-sm">{error.message}</p>
          <button
            onClick={getStatus}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const isIdle = status?.status === "idle" || !status;
  const isRunning_ = status?.status === "running";
  const isCompleted = status?.status === "completed";
  const isError = status?.status === "error";

  const statusColors = {
    idle: "bg-gray-100 text-gray-700",
    running: "bg-blue-100 text-blue-700 animate-pulse",
    completed: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700"
  };

  const statusLabels = {
    idle: "⚠️ Aguardando",
    running: "🔄 Sincronizando...",
    completed: "✅ Concluído",
    error: "❌ Erro"
  };

  const currentStatus = status?.status || "idle";
  const statusColor = statusColors[currentStatus as keyof typeof statusColors] || statusColors.idle;
  const statusLabel = statusLabels[currentStatus as keyof typeof statusLabels] || statusLabels.idle;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sincronização</h1>
          <p className="text-gray-600 text-sm">Gerencie a sincronização de dados</p>
        </div>
        <button
          onClick={handleRunSync}
          disabled={isRunning || isRunning_}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${(isRunning || isRunning_) 
              ? "bg-gray-300 cursor-not-allowed text-gray-500" 
              : "bg-blue-600 hover:bg-blue-700 text-white"}
          `}
        >
          {isRunning || isRunning_ ? "Sincronizando..." : "Executar Sync"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
            {statusLabel}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Última Sincronização</h3>
          <p className="text-lg font-medium">
            {status?.lastSync 
              ? new Date(status.lastSync).toLocaleString("pt-BR")
              : "Nunca sincronizado"}
          </p>
        </div>
      </div>

      {isCompleted && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">
            ✅ Sincronização concluída com sucesso!
          </p>
        </div>
      )}

      {isError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            ❌ Erro durante a sincronização. Tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}
