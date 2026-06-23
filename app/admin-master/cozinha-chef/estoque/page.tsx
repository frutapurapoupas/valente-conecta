// 🎨 UI PURA - Gerenciar Estoque com Design Separado

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Edit, Trash2, Search, RefreshCw, ArrowLeft, AlertCircle, CheckCircle, X, TrendingUp } from 'lucide-react';
import { useEstoque } from '@/hooks/cozinha/useEstoque';
import { estoqueDesign as design } from './design.config';

export default function EstoquePage() {
  const { items, loading, excluir, carregar, atualizar, criar } = useEstoque();
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    quantidade_recipientes: 0,
    tamanho_recipiente: 0,
    unidade_recipiente: 'g',
    preco_recipiente: 0,
    preco_unitario: 0,
    peso_unitario: 0,
    quantidade_minima: 0
  });

  const [categorias, setCategorias] = useState(['Carnes', 'Legumes', 'Frutas', 'Grãos', 'Laticínios', 'Óleos', 'Doces', 'Ovos', 'Outros']);

  const adicionarCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      setCategorias([...categorias, novaCategoria.trim()]);
      setFormData(prev => ({ ...prev, categoria: novaCategoria.trim() }));
      setNovaCategoria('');
      setMostrarNovaCategoria(false);
    }
  };
  const unidades = ['kg', 'g', 'L', 'ml', 'un'];

  const abrirModal = (item?: any) => {
    if (item) {
      setEditando(item);
      // Extrair tamanho e unidade do recipiente se existir
      let tamanhoRecipiente = 0;
      let unidadeRecipiente = 'g';
      if (item.recipiente) {
        const match = item.recipiente.match(/(\d+(?:\.\d+)?)(g|ml|un|L|kg)?/i);
        if (match) {
          tamanhoRecipiente = parseFloat(match[1]);
          unidadeRecipiente = match[2]?.toLowerCase() || 'g';
        }
      }

      setFormData({
        nome: item.nome || '',
        categoria: item.categoria || '',
        quantidade_recipientes: item.quantidade || 0,
        tamanho_recipiente: tamanhoRecipiente,
        unidade_recipiente: unidadeRecipiente,
        preco_recipiente: item.preco_recipiente || item.preco_unitario || 0,
        preco_unitario: item.preco_unitario || 0,
        peso_unitario: item.peso_unitario || (item.nome?.toLowerCase().includes('ovo') ? 50 : 0),
        quantidade_minima: item.quantidade_minima || 0
      });
    } else {
      setEditando(null);
      setFormData({
        nome: '',
        categoria: '',
        quantidade_recipientes: 0,
        tamanho_recipiente: 0,
        unidade_recipiente: 'g',
        preco_recipiente: 0,
        preco_unitario: 0,
        peso_unitario: 0,
        quantidade_minima: 0
      });
    }
    setModalAberto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converter dados para o formato esperado pela API
    const dataToSubmit = {
      nome: formData.nome,
      categoria: formData.categoria,
      quantidade: formData.quantidade_recipientes,
      unidade: 'un',
      quantidade_minima: formData.quantidade_minima,
      preco_unitario: formData.preco_unitario,
      preco_recipiente: formData.preco_recipiente,
      peso_unitario: formData.peso_unitario,
      recipiente: `${formData.tamanho_recipiente}${formData.unidade_recipiente}`
    };

    if (editando) {
      await atualizar(editando.id, dataToSubmit);
    } else {
      const result = await criar(dataToSubmit);
      if (result.success) {
        setModalAberto(false);
        setEditando(null);
        setFormData({
          nome: '',
          categoria: '',
          quantidade_recipientes: 0,
          tamanho_recipiente: 0,
          unidade_recipiente: 'g',
          preco_recipiente: 0,
          preco_unitario: 0,
          peso_unitario: 0,
          quantidade_minima: 0
        });
      } else {
        alert('Erro ao criar item: ' + (result.error || 'Erro desconhecido'));
      }
      return;
    }
    setModalAberto(false);
    setEditando(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'quantidade_recipientes' || name === 'quantidade_minima' || name === 'preco_recipiente' || name === 'preco_unitario' || name === 'peso_unitario' || name === 'tamanho_recipiente'
          ? parseFloat(value) || 0
          : value
      };

      // Calcular preço unitário automaticamente quando preço do recipiente ou tamanho mudar
      if (name === 'preco_recipiente' || name === 'tamanho_recipiente' || name === 'unidade_recipiente') {
        const precoRecipiente = newData.preco_recipiente;
        const tamanho = newData.tamanho_recipiente;
        const unidadeRecipiente = newData.unidade_recipiente;
        
        if (precoRecipiente > 0 && tamanho > 0) {
          let precoUnitario = 0;
          
          // Converter para unidade mínima (g, ml, un)
          if (unidadeRecipiente === 'kg') {
            precoUnitario = precoRecipiente / (tamanho * 1000); // por grama
          } else if (unidadeRecipiente === 'l') {
            precoUnitario = precoRecipiente / (tamanho * 1000); // por ml
          } else {
            // g, ml, un - já está na unidade mínima
            precoUnitario = precoRecipiente / tamanho;
          }
          
          newData.preco_unitario = precoUnitario;
        }
      }

      // Definir peso unitário automático para ovos
      if (name === 'nome' && value.toLowerCase().includes('ovo')) {
        newData.peso_unitario = 50;
      }

      return newData;
    });
  };

  if (loading) {
    return (
      <div className={`${design.classes.loadingContainer} ${design.colors.bg}`}>
        <div className="text-center">
          <div className={design.classes.loadingSpinner}></div>
          <p className={design.classes.loadingText}>{design.titles.carregando}</p>
        </div>
      </div>
    );
  }

  const itemsFiltrados = items.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase()) ||
    item.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={`${design.classes.container} ${design.colors.bg} ${design.colors.text}`}>
      <div className={design.classes.maxWidth}>
        {/* Header */}
        <div className={design.classes.header}>
          <div>
            <Link href="/admin-master/cozinha-chef" className={design.classes.btnVoltar}>
              <ArrowLeft size={16} /> {design.titles.voltar}
            </Link>
            <h1 className={design.classes.title}>
              <Package className={design.classes.titleIcon} /> {design.titles.main}
            </h1>
            <p className={design.classes.subtitle}>{items.length} {design.titles.itensCadastrados}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin-master/cozinha-chef/estoque/movimentacao" className={design.classes.btnPrimary}>
              <TrendingUp size={16} /> Movimentação
            </Link>
            <button onClick={() => abrirModal()} className={design.classes.btnPrimary}>
              <Plus size={16} /> {design.titles.newItem}
            </button>
            <button onClick={carregar} className={design.classes.btnSecondary}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className={design.classes.searchContainer}>
          <div className="flex-1 relative">
            <Search size={16} className={design.classes.searchIcon} />
            <input
              type="text"
              placeholder={design.titles.search}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={design.classes.searchInput}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className={design.classes.tableContainer}>
          <div className="overflow-x-auto">
            <table className={design.classes.table}>
              <thead className={design.classes.thead}>
                <tr>
                  <th className={design.classes.th}>Item</th>
                  <th className={design.classes.th}>Categoria</th>
                  <th className={design.classes.th}>Quantidade</th>
                  <th className={design.classes.th}>Unidade</th>
                  <th className={design.classes.th}>Mínimo</th>
                  <th className={design.classes.th}>Preço</th>
                  <th className={design.classes.th}>Tamanho Recipiente</th>
                  <th className={design.classes.th}>Status</th>
                  <th className={design.classes.th}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {itemsFiltrados.map((item) => {
                  const baixo = item.quantidade < item.quantidade_minima;
                  return (
                    <tr key={item.id} className={`transition ${design.colors.hover}`}>
                      <td className={design.classes.tdName}>{item.nome}</td>
                      <td className={design.classes.tdText}>{item.categoria}</td>
                      <td className={design.classes.tdQuantity}>{item.quantidade}</td>
                      <td className={design.classes.tdText}>{item.unidade}</td>
                      <td className={design.classes.tdText}>{item.quantidade_minima} {item.unidade}</td>
                      <td className={design.classes.tdText}>R$ {item.preco_unitario?.toFixed(2) || '0,00'}</td>
                      <td className={design.classes.tdText}>
                        {item.peso_unitario ? `${item.peso_unitario}g` : item.recipiente || '-'}
                      </td>
                      <td className={design.classes.td}>
                        {baixo ? (
                          <span className={design.classes.statusLow}>
                            <AlertCircle size={12} /> Baixo
                          </span>
                        ) : (
                          <span className={design.classes.statusOk}>
                            <CheckCircle size={12} /> OK
                          </span>
                        )}
                      </td>
                      <td className={design.classes.td}>
                        <div className={design.classes.actionsContainer}>
                          <button onClick={() => abrirModal(item)} className={design.classes.actionEdit} title="Editar">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => excluir(item.id)} className={design.classes.actionDelete} title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {itemsFiltrados.length === 0 && (
          <div className={design.classes.emptyState}>
            <Package size={48} className={design.classes.emptyIcon} />
            <p>{design.titles.nenhumItem}</p>
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editando ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button onClick={() => { setModalAberto(false); setEditando(null); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 📦 INFORMAÇÕES DO RECIPIENTE - PARTE SUPERIOR */}
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">📦 Informações do Recipiente</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Tamanho do Recipiente *</label>
                    <input
                      type="number"
                      name="tamanho_recipiente"
                      value={formData.tamanho_recipiente}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Ex: 85"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Tipo de Unidade *</label>
                    <select
                      name="unidade_recipiente"
                      value={formData.unidade_recipiente}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="g">Gramas (g)</option>
                      <option value="kg">Quilogramas (kg)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="L">Litros (L)</option>
                      <option value="un">Unidades (un)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-300 mb-1">Preço do Recipiente (R$) *</label>
                  <input
                    type="number"
                    name="preco_recipiente"
                    value={formData.preco_recipiente}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ex: 3.50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-300 mb-1">Quantidade de Recipientes em Estoque *</label>
                  <input
                    type="number"
                    name="quantidade_recipientes"
                    value={formData.quantidade_recipientes}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ex: 5 pacotes"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mt-4 bg-gray-600/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Preço Unitário Calculado:</span>
                    <span className="text-lg font-bold text-green-400">R$ {formData.preco_unitario.toFixed(4)}/{formData.unidade_recipiente === 'kg' || formData.unidade_recipiente === 'L' ? 'g/ml' : formData.unidade_recipiente}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cálculo: R$ {formData.preco_recipiente.toFixed(2)} ÷ {formData.tamanho_recipiente}{formData.unidade_recipiente} = R$ {formData.preco_unitario.toFixed(4)}/{formData.unidade_recipiente === 'kg' || formData.unidade_recipiente === 'L' ? 'g/ml' : formData.unidade_recipiente}
                  </div>
                </div>
              </div>

              {/* 📋 INFORMAÇÕES DO ITEM */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome do Item *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Categoria *</label>
                <div className="flex gap-2">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition"
                    title="Adicionar nova categoria"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {mostrarNovaCategoria && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      placeholder="Nova categoria"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={adicionarCategoria}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Quantidade Mínima de Recipientes *</label>
                <input
                  type="number"
                  name="quantidade_minima"
                  value={formData.quantidade_minima}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 2 pacotes"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Mínimo de recipientes em estoque</p>
              </div>

              {formData.nome.toLowerCase().includes('ovo') && (
                <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-600">
                  <p className="text-sm text-yellow-300">
                    🥚 Peso unitário definido automaticamente: 50g por ovo (para cálculos em receitas)
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setModalAberto(false); setEditando(null); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  {editando ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}