// components/cozinha/PratoList.tsx

"use client";

import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Prato } from '@/types/cozinha';

interface PratoListProps {
  pratos: Prato[];
  loading: boolean;
  onToggleAtivo: (id: string) => void;
  onExcluir: (id: string) => void;
  onRefresh: () => void;
}

export function PratoList({ pratos, loading, onToggleAtivo, onExcluir, onRefresh }: PratoListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold">🍽️ Lista de Pratos</h2>
          <p className="text-sm text-gray-400">{pratos.length} pratos cadastrados</p>
        </div>
        <Link
          href="/admin-master/cozinha-chef/pratos/novo"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} /> Novo Prato
        </Link>
      </div>

      <div className="divide-y divide-gray-700">
        {pratos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Nenhum prato cadastrado</p>
            <p className="text-sm mt-1">Clique em "Novo Prato" para começar</p>
          </div>
        ) : (
          pratos.map((prato) => (
            <div key={prato.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-800/30 transition">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                <img
                  src={prato.imagem_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop`}
                  alt={prato.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop';
                  }}
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{prato.nome}</h3>
                  {prato.destaque && (
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{prato.categoria}</p>
                <div className="flex flex-wrap gap-3 text-xs mt-1">
                  <span className="text-blue-400">R$ {prato.preco.toFixed(2)}</span>
                  <span className="text-orange-400">Margem: {prato.margem?.toFixed(1) || '0'}%</span>
                  <span className="text-gray-500">{prato.tempo_preparo}min</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  prato.ativo 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {prato.ativo ? '✅ Ativo' : '⛔ Inativo'}
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => onToggleAtivo(prato.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  title={prato.ativo ? 'Desativar' : 'Ativar'}
                >
                  {prato.ativo ? <Eye size={16} className="text-gray-400" /> : <EyeOff size={16} className="text-gray-500" />}
                </button>
                <Link
                  href={`/admin-master/cozinha-chef/pratos/editar/${prato.id}`}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <Pencil size={16} className="text-blue-400" />
                </Link>
                <button
                  onClick={() => onExcluir(prato.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}