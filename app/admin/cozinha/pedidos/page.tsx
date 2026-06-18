'use client';

import { useState } from 'react';
import { RefreshCw, Eye, XCircle } from 'lucide-react';
import { usePedidos } from '@/hooks/usePedidos'; // Ajuste o caminho conforme sua estrutura de pastas
import { statusConfig } from '@/config/status'; // Ajuste o caminho conforme sua estrutura de pastas

export default function FilaPedidos() {
  const { orders, loading, filter, setFilter, carregarPedidos, atualizarStatus } = usePedidos();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const formatarDataCompleta = (dataString: string) => new Date(dataString).toLocaleString('pt-BR');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const ordersFiltrados = filter === 'all' ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Fila de Pedidos</h1>
          </div>
          <button onClick={carregarPedidos} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw size={18} /> Atualizar
          </button>
        </div>

        {/* Adicione aqui a seção de Filtros e Listagem de Pedidos usando ordersFiltrados */}
        {/* Como o componente agora apenas renderiza, ele ficou muito menor! */}
      </div>
    </div>
  );
}