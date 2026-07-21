// components/cozinha/PratosUI.tsx
// ðŸŽ¨ DESIGN - UI de gerenciamento de pratos

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Utensils, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Prato {
  id: string;
  nome: string;
  descricao: string;
  dia_semana: string;
  preco: number;
  ativo: boolean;
}

interface PratosUIProps {
  pratos: Prato[];
  loading: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function PratosUI({ pratos, loading, onToggle, onDelete, onRefresh }: PratosUIProps) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando pratos...</p>
        </div>
      </div>
    );
  }

  const pratosFiltrados = pratos.filter(prato => {
    const matchStatus = filtro === 'todos' ? true : filtro === 'ativos' ? prato.ativo : !prato.ativo;
    const matchBusca = prato.nome.toLowerCase().includes(busca.toLowerCase()) || prato.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const diasSemana = ['Segunda', 'TerÃ§a', 'Quarta', 'Quinta', 'Sexta', 'SÃ¡bado'];
  const pratosPorDia = diasSemana.map(dia => ({
    dia,
    pratos: pratosFiltrados.filter(p => p.dia_semana === dia)
  }));

  const stats = {
    total: pratos.length,
    ativos: pratos.filter(p => p.ativo).length,
    inativos: pratos.filter(p => !p.ativo).length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* CabeÃ§alho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Utensils className="text-green-400" />
              Gerenciar Pratos
            </h1>
            <p className="text-sm text-gray-400">{stats.total} pratos cadastrados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin-master/cozinha-chef/pratos/novo" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition">
              <Plus size={16} /> Novo Prato
            </Link>
            <button onClick={onRefresh} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Cards de EstatÃ­sticas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-400">Total</p>
          </div>
          <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
            <p className="text-sm text-green-400">Ativos</p>
          </div>
          <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.inativos}</p>
            <p className="text-sm text-red-400">Inativos</p>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar prato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            <button onClick={() => setFiltro('todos')} className={`px-3 py-1 rounded text-sm transition ${filtro === 'todos' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'}`}>Todos ({stats.total})</button>
            <button onClick={() => setFiltro('ativos')} className={`px-3 py-1 rounded text-sm transition ${filtro === 'ativos' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'}`}>Ativos ({stats.ativos})</button>
            <button onClick={() => setFiltro('inativos')} className={`px-3 py-1 rounded text-sm transition ${filtro === 'inativos' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'}`}>Inativos ({stats.inativos})</button>
          </div>
        </div>

        {/* Lista de Pratos por Dia */}
        <div className="space-y-4">
          {pratosPorDia.map(({ dia, pratos: pratosDoDia }) => (
            pratosDoDia.length > 0 && (
              <div key={dia}>
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                  {dia}
                  <span className="text-xs text-gray-500">({pratosDoDia.length} pratos)</span>
                </h3>
                <div className="space-y-2">
                  {pratosDoDia.map((prato) => (
                    <div key={prato.id} className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 hover:border-green-500/30 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{prato.nome}</h3>
                            {prato.ativo ? (
                              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">âœ… Ativo</span>
                            ) : (
                              <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-0.5 rounded-full">âŒ Inativo</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{prato.descricao}</p>
                          <p className="text-lg font-bold text-green-400 mt-2">R$ {prato.preco.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => onToggle(prato.id)} className={`p-1.5 rounded transition ${prato.ativo ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-green-500/20 text-green-400'}`}>
                            {prato.ativo ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <Link href={`/admin-master/cozinha-chef/pratos/editar/${prato.id}`} className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition">
                            <Edit size={16} />
                          </Link>
                          <button onClick={() => onDelete(prato.id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {pratosFiltrados.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Utensils size={48} className="mx-auto opacity-30 mb-3" />
              <p>Nenhum prato encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


