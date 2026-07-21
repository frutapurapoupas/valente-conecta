'use client';

import Link from 'next/link';
import { RefreshCw, Utensils } from 'lucide-react';
import { usePratos } from '../hooks/usePratos';

export default function PratosPage() {
  const { pratos, loading, error, fetchPratos } = usePratos();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Erro ao carregar pratos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Utensils size={24} /> Pratos e Produtos
          </h1>
          <p className="text-sm text-gray-600">Lista de pratos cadastrados na cozinha.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPratos}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={16} /> Atualizar
            </span>
          </button>
          <Link
            href="/admin-master/cozinha-chef/receitas"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Ir para Receitas
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Preço</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pratos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum prato cadastrado.
                </td>
              </tr>
            ) : (
              pratos.map((prato) => (
                <tr key={prato.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{prato.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prato.categoria || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">R$ {(prato.preco || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        prato.status === 'ativo'
                          ? 'rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700'
                          : 'rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700'
                      }
                    >
                      {prato.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
