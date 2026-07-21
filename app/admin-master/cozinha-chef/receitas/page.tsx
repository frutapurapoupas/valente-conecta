'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

interface Receita {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  status: 'ativo' | 'inativo';
  created_at: string;
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarReceitas() {
      try {
        setLoading(true);
        const response = await fetch('/api/cozinha/receitas');
        if (!response.ok) {
          throw new Error('Erro ao carregar receitas');
        }
        const data = await response.json();
        // Garantir que os dados tenham valores padrão
        const receitasData = (data.data || []).map((item: any) => ({
          ...item,
          preco: item.preco ?? 0,
          status: item.status ?? 'inativo',
          categoria: item.categoria ?? 'Geral',
          descricao: item.descricao ?? ''
        }));
        setReceitas(receitasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar receitas');
        console.error('Erro ao carregar receitas:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarReceitas();
  }, []);

  const receitasFiltradas = receitas.filter((receita) =>
    receita.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receita.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <Link
          href="/admin-master/cozinha-chef/receitas/novo"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nova Receita
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receitasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
                </td>
              </tr>
            ) : (
              receitasFiltradas.map((receita) => (
                <tr key={receita.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{receita.nome || 'Sem nome'}</div>
                    <div className="text-sm text-gray-500">{receita.descricao || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {receita.categoria || 'Geral'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {(receita.preco ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${receita.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {receita.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin-master/cozinha-chef/receitas/${receita.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/admin-master/cozinha-chef/receitas/editar/${receita.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => console.log('Deletar', receita.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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


