'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
}

const cores = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7'];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nome: '', tipo: 'despesa' as 'receita' | 'despesa', cor: '#10b981' });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = () => {
    const stored = localStorage.getItem('financeiro_categorias');
    if (stored) {
      setCategorias(JSON.parse(stored));
    } else {
      const categoriasPadrao: Categoria[] = [
        { id: '1', nome: 'Salário', tipo: 'receita', cor: '#10b981' },
        { id: '2', nome: 'Freelance', tipo: 'receita', cor: '#3b82f6' },
        { id: '3', nome: 'Alimentação', tipo: 'despesa', cor: '#ef4444' },
        { id: '4', nome: 'Contas', tipo: 'despesa', cor: '#f59e0b' },
        { id: '5', nome: 'Lazer', tipo: 'despesa', cor: '#8b5cf6' },
        { id: '6', nome: 'Transporte', tipo: 'despesa', cor: '#ec4899' },
        { id: '7', nome: 'Saúde', tipo: 'despesa', cor: '#06b6d4' },
        { id: '8', nome: 'Educação', tipo: 'despesa', cor: '#84cc16' }
      ];
      setCategorias(categoriasPadrao);
      localStorage.setItem('financeiro_categorias', JSON.stringify(categoriasPadrao));
    }
  };

  const salvarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('❌ O nome da categoria é obrigatório');
      return;
    }
    
    let novasCategorias;
    if (editing) {
      novasCategorias = categorias.map(c => c.id === editing.id ? { ...c, ...formData } : c);
    } else {
      const nova: Categoria = { id: Date.now().toString(), ...formData };
      novasCategorias = [...categorias, nova];
    }
    setCategorias(novasCategorias);
    localStorage.setItem('financeiro_categorias', JSON.stringify(novasCategorias));
    setShowModal(false);
    setEditing(null);
    setFormData({ nome: '', tipo: 'despesa', cor: '#10b981' });
  };

  const excluirCategoria = (id: string) => {
    if (confirm('⚠️ Tem certeza que deseja excluir esta categoria?')) {
      const novas = categorias.filter(c => c.id !== id);
      setCategorias(novas);
      localStorage.setItem('financeiro_categorias', JSON.stringify(novas));
    }
  };

  const editarCategoria = (categoria: Categoria) => {
    setEditing(categoria);
    setFormData({ nome: categoria.nome, tipo: categoria.tipo, cor: categoria.cor });
    setShowModal(true);
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === 'receita' ? '💰 Receita' : '💸 Despesa';
  };

  const getTipoBg = (tipo: string) => {
    return tipo === 'receita' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📂 Categorias Financeiras</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Organize suas receitas e despesas por categoria</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ nome: '', tipo: 'despesa', cor: '#10b981' });
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">💰 Receitas</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Categorias de entrada de dinheiro</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.filter(c => c.tipo === 'receita').length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nenhuma categoria de receita cadastrada
              </div>
            ) : (
              categorias.filter(c => c.tipo === 'receita').map(cat => (
                <div key={cat.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: cat.cor }}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat.nome}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{getTipoLabel(cat.tipo)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editarCategoria(cat)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => excluirCategoria(cat.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">💸 Despesas</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Categorias de saída de dinheiro</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.filter(c => c.tipo === 'despesa').length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nenhuma categoria de despesa cadastrada
              </div>
            ) : (
              categorias.filter(c => c.tipo === 'despesa').map(cat => (
                <div key={cat.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: cat.cor }}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{cat.nome}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{getTipoLabel(cat.tipo)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editarCategoria(cat)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => excluirCategoria(cat.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editing ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={salvarCategoria} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  🏷️ Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Salário, Alimentação, Transporte..."
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📂 Tipo
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="receita"
                      checked={formData.tipo === 'receita'}
                      onChange={() => setFormData({ ...formData, tipo: 'receita' })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">💰 Receita</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="despesa"
                      checked={formData.tipo === 'despesa'}
                      onChange={() => setFormData({ ...formData, tipo: 'despesa' })}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">💸 Despesa</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎨 Cor da Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {cores.map(cor => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormData({ ...formData, cor })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.cor === cor 
                          ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: cor }}
                      title={`Cor ${cor}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Clique em uma cor para selecionar
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}