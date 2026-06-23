'use client';

import React, { useState, useEffect } from 'react';
import { Ingredient } from '@/types/estoque';
import { formatarMoeda } from '@/utils/cozinhaUtils';

const fetchInsumos = async (): Promise<Ingredient[]> => {
  const response = await fetch('/api/cozinha/insumos');

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || response.statusText || 'Erro ao carregar insumos');
  }

  const data = json?.data ?? json;
  if (!Array.isArray(data)) {
    throw new Error('Resposta de insumos inválida');
  }

  return data;
};

export default function EstoquePage() {
  const [insumos, setInsumos] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsumos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInsumos();
        setInsumos(data);
      } catch (err) {
        console.error('Erro ao carregar insumos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar insumos.');
      } finally {
        setLoading(false);
      }
    };

    getInsumos();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Carregando insumos...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Controle de Estoque de Insumos</h1>

      {insumos.length === 0 ? (
        <p className="text-gray-600">Nenhum insumo encontrado.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Atual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque Mínimo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Atual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.map((insumo) => (
                <tr
                  key={insumo.id}
                  className={insumo.stock < insumo.minStock ? 'bg-red-100' : 'hover:bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insumo.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {insumo.stock} {insumo.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {insumo.minStock} {insumo.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarMoeda(insumo.currentPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
