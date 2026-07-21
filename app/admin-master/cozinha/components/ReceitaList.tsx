// app/admin-master/cozinha/components/ReceitaList.tsx
"use client";

import { Receita } from '../types/receita';

interface ReceitaListProps {
  receitas: Receita[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (receita: Receita) => void;
  loading?: boolean;
}

export function ReceitaList({ receitas, onEdit, onDelete, onSelect, loading = false }: ReceitaListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (receitas.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhuma receita cadastrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {receitas.map((receita) => (
        <div key={receita.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{receita.nome}</h3>
              <p className="text-sm text-gray-500">{receita.categoria}</p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
            <span className="text-gray-600">Rendimento:</span>
            <span className="font-medium">{receita.rendimento} {receita.unidadeRendimento}</span>
            <span className="text-gray-600">Custo:</span>
            <span className="font-medium">R$ {receita.custoTotal.toFixed(2)}</span>
            <span className="text-gray-600">Preço:</span>
            <span className="font-medium text-green-600">R$ {receita.precoSugerido.toFixed(2)}</span>
            <span className="text-gray-600">Margem:</span>
            <span className="font-medium text-blue-600">{receita.margemLucro.toFixed(1)}%</span>
          </div>

          <div className="flex gap-2 mt-4">
            {onSelect && (
              <button
                onClick={() => onSelect(receita)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Ver Detalhes
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(receita.id)}
                className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(receita.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}