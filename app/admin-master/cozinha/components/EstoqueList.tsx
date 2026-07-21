// app/admin-master/cozinha/components/EstoqueList.tsx
"use client";

import { EstoqueResumo } from '../types/estoque';

interface EstoqueListProps {
  resumo: EstoqueResumo[];
  onMovimentar?: (ingredienteId: string, tipo: 'entrada' | 'saida') => void;
  loading?: boolean;
}

const statusColors = {
  ok: 'bg-green-100 text-green-700',
  baixo: 'bg-yellow-100 text-yellow-700',
  critico: 'bg-red-100 text-red-700'
};

const statusLabels = {
  ok: '✅ OK',
  baixo: '⚠️ Baixo',
  critico: '🚨 Crítico'
};

export function EstoqueList({ resumo, onMovimentar, loading = false }: EstoqueListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (resumo.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum ingrediente em estoque</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ingrediente</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Qtde Atual</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Mínimo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Valor Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {resumo.map((item) => (
            <tr key={item.ingredienteId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{item.ingredienteNome}</td>
              <td className="px-4 py-3">{item.quantidadeAtual}</td>
              <td className="px-4 py-3">{item.estoqueMinimo}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </td>
              <td className="px-4 py-3 font-medium">R$ {item.valorTotal.toFixed(2)}</td>
              <td className="px-4 py-3">
                {onMovimentar && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onMovimentar(item.ingredienteId, 'entrada')}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      + Entrada
                    </button>
                    <button
                      onClick={() => onMovimentar(item.ingredienteId, 'saida')}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      - Saída
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}