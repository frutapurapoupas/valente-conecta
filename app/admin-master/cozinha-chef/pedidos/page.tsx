"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';

type PedidoStatus = 'pendente' | 'preparando' | 'entregue' | 'cancelado';

interface PedidoItem {
  produtoId: string;
  nome: string;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: string;
  clienteNome: string;
  clienteContato?: string;
  valor: number;
  status: PedidoStatus;
  paymentMethod?: { type?: string; valor?: number };
  items: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABEL: Record<PedidoStatus, string> = {
  pendente: 'Pendente',
  preparando: 'Preparando',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

const STATUS_CLASS: Record<PedidoStatus, string> = {
  pendente: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  preparando: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  entregue: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-300 border-red-500/30'
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | PedidoStatus>('todos');

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/pedidos');
      const result = await response.json();
      if (result?.success) {
        setPedidos(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos', error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (id: string, status: PedidoStatus) => {
    setSalvandoId(id);
    try {
      const response = await fetch(`/api/cozinha/pedidos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!result?.success) {
        alert('Não foi possível atualizar status do pedido');
        return;
      }
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status do pedido');
    } finally {
      setSalvandoId(null);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    if (filtro === 'todos') return pedidos;
    return pedidos.filter((p) => p.status === filtro);
  }, [pedidos, filtro]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">
              <ShoppingBag className="text-amber-400" />
              Pedidos Públicos
            </h1>
            <p className="text-sm text-gray-400">Listagem e andamento dos pedidos vindos do catálogo público</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="preparando">Preparando</option>
              <option value="entregue">Entregues</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <button
              onClick={carregarPedidos}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
            >
              <RefreshCw size={16} /> Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl text-gray-400">
            Nenhum pedido encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{pedido.clienteNome || 'Cliente'}</p>
                    <p className="text-xs text-gray-400">{new Date(pedido.createdAt).toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {pedido.clienteContato ? `Contato: ${pedido.clienteContato} • ` : ''}
                      Pagamento: {(pedido.paymentMethod?.type || 'pix').toUpperCase()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-green-400">R$ {Number(pedido.valor || 0).toFixed(2)}</p>
                    <span className={`inline-flex mt-1 px-2 py-1 text-xs border rounded-full ${STATUS_CLASS[pedido.status]}`}>
                      {STATUS_LABEL[pedido.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-700 pt-3">
                  <p className="text-xs text-gray-400 mb-2">Itens</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(pedido.items || []).map((item, idx) => (
                      <div key={`${pedido.id}-${idx}`} className="bg-gray-900/70 rounded-lg px-3 py-2 text-sm flex justify-between">
                        <span>{item.nome} x{item.quantidade}</span>
                        <span className="text-gray-300">R$ {(Number(item.preco || 0) * Number(item.quantidade || 0)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(['pendente', 'preparando', 'entregue', 'cancelado'] as PedidoStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => atualizarStatus(pedido.id, status)}
                      disabled={salvandoId === pedido.id || pedido.status === status}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition ${pedido.status === status ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'} disabled:opacity-50`}
                    >
                      {salvandoId === pedido.id ? 'Salvando...' : STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
