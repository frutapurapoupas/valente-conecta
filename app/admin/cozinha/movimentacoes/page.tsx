'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';

export default function MovimentacoesPage() {
  const { movements, loading, carregar } = useMovimentacoes();
  const [typeFilter, setTypeFilter] = useState('todos');

  if (loading) return <div className="p-8 text-center">Carregando movimentações...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
        <button onClick={carregar} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>
      {/* Tabela de listagem aqui usando os dados de 'movements' */}
    </div>
  );
}