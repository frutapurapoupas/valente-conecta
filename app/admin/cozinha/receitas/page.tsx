'use client';

import { recipesDesign as design } from './design.config';
import { useEffect, useState } from 'react';

interface Receita {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: any[];
  isAvailable: boolean;
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoPreco, setEditandoPreco] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState<number>(0);

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/recipes');
      const result = await response.json();
      if (result.success) {
        setReceitas(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarPreco(id: string, novoPreco: number) {
    try {
      const response = await fetch(`/api/cozinha/recipes?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: novoPreco })
      });
      const result = await response.json();
      if (result.success) {
        // Atualizar lista local
        setReceitas(prev =>
          prev.map(r => (r.id === id ? { ...r, price: novoPreco } : r))
        );
        console.log(`✅ Preço atualizado para ${design.formatCurrency(novoPreco)}`);
      } else {
        console.error('Erro ao atualizar preço:', result.error);
        alert('Erro ao atualizar preço. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão ao atualizar preço.');
    }
  }

  async function deletarReceita(id: string, nome: string) {
    if (confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      try {
        const response = await fetch(`/api/cozinha/recipes?id=${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          setReceitas(prev => prev.filter(r => r.id !== id));
          console.log(`✅ Receita excluída: ${nome}`);
        } else {
          alert('Erro ao excluir receita.');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão ao excluir.');
      }
    }
  }

  function iniciarEdicaoPreco(receita: Receita) {
    setEditandoPreco(receita.id);
    setNovoPreco(receita.price);
  }

  function confirmarEdicaoPreco(id: string) {
    if (novoPreco > 0) {
      atualizarPreco(id, novoPreco);
    }
    setEditandoPreco(null);
  }

  function cancelarEdicaoPreco() {
    setEditandoPreco(null);
  }

  const receitasFiltradas = receitas.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={design.classes.container}>
        <div className="text-center py-12">Carregando receitas...</div>
      </div>
    );
  }

  return (
    <div className={design.classes.container}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{design.titles.main}</h1>
        <p className="text-gray-600 mt-2">{design.titles.subtitle}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder={design.titles.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={design.classes.searchInput}
        />
        <a
          href="/admin/cozinha/novo-prato"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {design.titles.buttonNew}
        </a>
      </div>

      <div className={design.classes.card}>
        {receitasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{design.titles.emptyState}</div>
        ) : (
          <div className={design.classes.tableContainer}>
            <table className={design.classes.table}>
              <thead className={design.classes.thead}>
                <tr>
                  <th className={design.classes.thNome}>Nome</th>
                  <th className={design.classes.th}>Categoria</th>
                  <th className={design.classes.th}>Preço</th>
                  <th className={design.classes.th}>Ingredientes</th>
                  <th className={design.classes.thAcoes}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receitasFiltradas.map(receita => (
                  <tr key={receita.id} className="hover:bg-gray-50">
                    <td className={design.classes.tdNome}>{receita.name}</td>
                    <td className={design.classes.td}>
                      <span className="capitalize">{receita.category}</span>
                    </td>
                    <td className={design.classes.td}>
                      {editandoPreco === receita.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={novoPreco}
                            onChange={(e) => setNovoPreco(parseFloat(e.target.value) || 0)}
                            className={design.classes.priceInput}
                            autoFocus
                          />
                          <button
                            onClick={() => confirmarEdicaoPreco(receita.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            ✅
                          </button>
                          <button
                            onClick={cancelarEdicaoPreco}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <div
                          className={design.classes.priceDisplay}
                          onClick={() => iniciarEdicaoPreco(receita)}
                          title="Clique para editar preço"
                        >
                          {design.formatCurrency(receita.price)}
                        </div>
                      )}
                    </td>
                    <td className={design.classes.td}>
                      {receita.ingredients?.length || 0} itens
                    </td>
                    <td className={design.classes.tdAcoes}>
                      <button
                        onClick={() => iniciarEdicaoPreco(receita)}
                        className="text-blue-600 hover:text-blue-800 mr-3 text-sm"
                      >
                        {design.titles.editPrice}
                      </button>
                      <button
                        onClick={() => deletarReceita(receita.id, receita.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        {design.titles.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
