// app/admin-master/cozinha-chef/pratos/page.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { usePratos } from '@/hooks/cozinha/usePratos';
import { PratoList } from '@/components/cozinha/PratoList';

export default function PratosPage() {
  const { pratos, loading, carregar, toggleAtivo, excluir } = usePratos();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              🍽️ Gerenciar Pratos
            </h1>
            <p className="text-sm text-gray-400">Gerencie o cardápio da cozinha</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <PratoList
          pratos={pratos}
          loading={loading}
          onToggleAtivo={toggleAtivo}
          onExcluir={excluir}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}