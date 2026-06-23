// app/admin-master/cozinha-chef/producao/page.tsx
// 🎨 UI PURA - Gerenciar Produção

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Factory, Plus, Edit, Trash2, Search, RefreshCw, ArrowLeft,
  Play, CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import { useProducao } from '@/hooks/cozinha/useProducao';

export default function ProducaoPage() {
  const { items, loading, carregar, atualizarStatus } = useProducao();
  const [filtro, setFiltro] = useState<string>('todos');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando produção...</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pendente: { label: '⏳ Pendente', color: 'text-yellow-400', icon: Clock },
    produzindo: { label: '🔧 Produzindo', color: 'text-blue-400', icon: Play },
    concluido: { label: '✅ Concluído', color: 'text-green-400', icon: CheckCircle },
    cancelado: { label: '❌ Cancelado', color: 'text-red-400', icon: XCircle }
  };

  const itemsFiltrados = filtro === 'todos' ? items : items.filter(item => item.status === filtro);

  const stats = {
    total: items.length,
    pendentes: items.filter(i => i.status === 'pendente').length,
    produzindo: items.filter(i => i.status === 'produzindo').length,
    concluidos: items.filter(i => i.status === 'concluido').length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Factory className="text-purple-400" /> Gerenciar Produção
            </h1>
            <p className="text-sm text-gray-400">{stats.total} produções registradas</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 text-sm transition">
              <Plus size={16} /> Nova Produção
            </button>
            <button onClick={carregar} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-400">Total</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pendentes}</p>
            <p className="text-sm text-yellow-400">Pendentes</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.produzindo}</p>
            <p className="text-sm text-blue-400">Produzindo</p>
          </div>
          <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.concluidos}</p>
            <p className="text-sm text-green-400">Concluídos</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFiltro('todos')} className={`px-3 py-1 rounded-lg text-sm transition ${filtro === 'todos' ? 'bg-gray-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>Todos</button>
          <button onClick={() => setFiltro('pendente')} className={`px-3 py-1 rounded-lg text-sm transition ${filtro === 'pendente' ? 'bg-yellow-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>Pendentes</button>
          <button onClick={() => setFiltro('produzindo')} className={`px-3 py-1 rounded-lg text-sm transition ${filtro === 'produzindo' ? 'bg-blue-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>Produzindo</button>
          <button onClick={() => setFiltro('concluido')} className={`px-3 py-1 rounded-lg text-sm transition ${filtro === 'concluido' ? 'bg-green-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600 text-gray-400'}`}>Concluídos</button>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {itemsFiltrados.map((item) => {
            const status = statusConfig[item.status] || statusConfig.pendente;
            const Icon = status.icon;
            return (
              <div key={item.id} className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${item.status === 'pendente' ? 'bg-yellow-500' : item.status === 'produzindo' ? 'bg-blue-500' : item.status === 'concluido' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h3 className="font-medium">{item.prato?.nome || 'Prato não encontrado'}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{item.quantidade_prevista} porções</span>
                        <span>•</span>
                        <span className={status.color}>{status.label}</span>
                        {item.inicio && <span>• Início: {new Date(item.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
                        {item.fim && <span>• Fim: {new Date(item.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'pendente' && (
                      <button onClick={() => atualizarStatus(item.id, 'produzindo')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-1 transition">
                        <Play size={14} /> Iniciar
                      </button>
                    )}
                    {item.status === 'produzindo' && (
                      <button onClick={() => atualizarStatus(item.id, 'concluido')} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-1 transition">
                        <CheckCircle size={14} /> Concluir
                      </button>
                    )}
                    {item.status === 'pendente' && (
                      <button onClick={() => atualizarStatus(item.id, 'cancelado')} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {itemsFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Factory size={48} className="mx-auto opacity-30 mb-3" />
            <p>Nenhuma produção encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}