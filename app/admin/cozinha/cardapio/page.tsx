'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCardapio } from '@/hooks/useCardapio';

export default function CardapioAdminPage() {
  const { menuItems, recipes, loading, carregarDados } = useCardapio();
  const [showModal, setShowModal] = useState(false);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 Cardápio</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4 inline mr-2" /> Adicionar
        </button>
      </div>
      {/* Tabela aqui... */}
    </div>
  );
}