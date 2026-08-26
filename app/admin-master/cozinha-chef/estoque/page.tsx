'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ItemEstoque {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  quantidade_minima: number;
  unidade_uso?: string;
  fator_conversao?: number;
  peso_gramas_unidade_uso?: number;
}

type ModoModal = 'novo' | 'editar' | null;

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function EstoquePage() {
  const [items, setItems] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [modo, setModo] = useState<ModoModal>(null);
  const [itemEditando, setItemEditando] = useState<ItemEstoque | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  // Campos do formulario
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [unidadeCompra, setUnidadeCompra] = useState('kg');
  const [quantidadeCampo, setQuantidadeCampo] = useState(0);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [estoqueMinimo, setEstoqueMinimo] = useState(0);
  const [unidadeUso, setUnidadeUso] = useState('g');
  const [pesoEmbalagemValor, setPesoEmbalagemValor] = useState(1);
  const [pesoEmbalagemUnidade, setPesoEmbalagemUnidade] = useState<'g' | 'kg'>('kg');
  const [pesoGramasUnidadeUso, setPesoGramasUnidadeUso] = useState(1);

  async function carregarEstoque() {
    try {
      setLoading(true);
      const response = await fetch('/api/cozinha/estoque');
      if (!response.ok) {
        throw new Error('Erro ao carregar estoque');
      }
      const data = await response.json();
      const itemsData = (data.data || []).map((item: any) => ({
        ...item,
        quantidade: item.quantidade ?? 0,
        preco_unitario: item.preco_unitario ?? 0,
        quantidade_minima: item.quantidade_minima ?? 0,
        unidade: item.unidade ?? 'un',
        categoria: item.categoria ?? 'Geral',
        unidade_uso: item.unidade_uso ?? item.unidade ?? 'un',
        fator_conversao: item.fator_conversao ?? 1,
        peso_gramas_unidade_uso: item.peso_gramas_unidade_uso ?? 1,
      }));
      setItems(itemsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEstoque();
  }, []);

  const itemsFiltrados = items.filter((item) =>
    item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fatorConversaoCalculado =
    pesoEmbalagemUnidade === 'kg' ? pesoEmbalagemValor * 1000 : pesoEmbalagemValor;

  const handleUnidadeUsoChange = (valor: string) => {
    setUnidadeUso(valor);
    if (valor.trim().toLowerCase() === 'un') {
      setPesoGramasUnidadeUso(50);
    } else {
      setPesoGramasUnidadeUso(1);
    }
  };

  const resetForm = () => {
    setNome('');
    setCategoria('Geral');
    setUnidadeCompra('kg');
    setQuantidadeCampo(0);
    setPrecoUnitario(0);
    setEstoqueMinimo(0);
    setUnidadeUso('g');
    setPesoEmbalagemValor(1);
    setPesoEmbalagemUnidade('kg');
    setPesoGramasUnidadeUso(1);
  };

  const abrirNovo = () => {
    resetForm();
    setItemEditando(null);
    setModo('novo');
  };

  const abrirEditar = (item: ItemEstoque) => {
    setNome(item.nome);
    setCategoria(item.categoria || 'Geral');
    setUnidadeCompra(item.unidade || 'kg');
    setQuantidadeCampo(0); // quantidade digitada aqui e' somada a atual (nova compra)
    setPrecoUnitario(item.preco_unitario || 0);
    setEstoqueMinimo(item.quantidade_minima || 0);
    setUnidadeUso(item.unidade_uso || item.unidade || 'g');

    const fator = item.fator_conversao || 1;
    if (fator >= 1000 && fator % 1000 === 0) {
      setPesoEmbalagemValor(fator / 1000);
      setPesoEmbalagemUnidade('kg');
    } else {
      setPesoEmbalagemValor(fator);
      setPesoEmbalagemUnidade('g');
    }
    setPesoGramasUnidadeUso(item.peso_gramas_unidade_uso || 1);

    setItemEditando(item);
    setModo('editar');
  };

  const fecharModal = () => {
    setModo(null);
    setItemEditando(null);
    resetForm();
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error('Informe o nome do ingrediente.');
      return;
    }
    setSalvando(true);
    try {
      const payload: Record<string, unknown> = {
        nome: nome.trim(),
        categoria: categoria.trim() || 'Geral',
        unidade: unidadeCompra.trim() || 'un',
        preco_unitario: toNumber(precoUnitario, 0),
        quantidade_minima: toNumber(estoqueMinimo, 0),
        unidade_uso: unidadeUso.trim() || 'un',
        fator_conversao: fatorConversaoCalculado > 0 ? fatorConversaoCalculado : 1,
        peso_gramas_unidade_uso: toNumber(pesoGramasUnidadeUso, 1),
      };

      if (modo === 'novo') {
        payload.quantidade = toNumber(quantidadeCampo, 0);
        const response = await fetch('/api/cozinha/estoque', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Erro ao criar item');
        toast.success('Ingrediente cadastrado no estoque.');
      } else if (modo === 'editar' && itemEditando) {
        payload.quantidade = toNumber(itemEditando.quantidade, 0) + toNumber(quantidadeCampo, 0);
        const response = await fetch(`/api/cozinha/estoque?id=${encodeURIComponent(itemEditando.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Erro ao atualizar item');
        toast.success('Ingrediente atualizado.');
      }

      fecharModal();
      await carregarEstoque();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar item');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (item: ItemEstoque) => {
    if (!window.confirm(`Excluir "${item.nome}" do estoque? Essa acao nao pode ser desfeita.`)) return;
    setExcluindoId(item.id);
    try {
      const response = await fetch(`/api/cozinha/estoque?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erro ao excluir item');
      toast.success('Item excluido.');
      await carregarEstoque();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir item');
    } finally {
      setExcluindoId(null);
    }
  };

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
        <h1 className="text-2xl font-bold">Estoque</h1>
        <button
          onClick={abrirNovo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Novo Item
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar itens..."
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Conversao</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Preco</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item no estoque'}
                </td>
              </tr>
            ) : (
              itemsFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.nome || 'Sem nome'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.categoria || 'Geral'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantidade ?? 0} {item.unidade || 'un'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 {item.unidade} = {item.fator_conversao ?? 1} {item.unidade_uso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {(item.preco_unitario ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                      ${(item.quantidade ?? 0) > (item.quantidade_minima ?? 0) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {(item.quantidade ?? 0) > (item.quantidade_minima ?? 0) ? 'OK' : 'Baixo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(item)} className="text-green-600 hover:text-green-900">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleExcluir(item)}
                        disabled={excluindoId === item.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-40"
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

      {modo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {modo === 'novo' ? 'Novo ingrediente no estoque' : `Editar / Reabastecer: ${itemEditando?.nome}`}
              </h3>
              <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm">
              Nome
              <input
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Farinha de trigo"
              />
            </label>

            <label className="block text-sm">
              Categoria
              <input
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Unidade de compra
                <input
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={unidadeCompra}
                  onChange={(e) => setUnidadeCompra(e.target.value)}
                  placeholder="kg, L, un"
                />
              </label>
              <label className="block text-sm">
                Unidade usada na receita
                <input
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={unidadeUso}
                  onChange={(e) => handleUnidadeUsoChange(e.target.value)}
                  placeholder="g, ml, un"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Peso da embalagem (1 {unidadeCompra || 'compra'})
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={pesoEmbalagemValor}
                  onChange={(e) => setPesoEmbalagemValor(toNumber(e.target.value, 1))}
                />
              </label>
              <label className="block text-sm">
                Unidade do peso informado
                <select
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={pesoEmbalagemUnidade}
                  onChange={(e) => setPesoEmbalagemUnidade(e.target.value as 'g' | 'kg')}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Equivale a: 1 {unidadeCompra || 'compra'} = {fatorConversaoCalculado} {unidadeUso || 'uso'}
            </p>

            {unidadeUso.trim().toLowerCase() === 'un' && (
              <label className="block text-sm">
                Peso (g) de 1 unidade (ex: 1 ovo ≈ 50g)
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={pesoGramasUnidadeUso}
                  onChange={(e) => setPesoGramasUnidadeUso(toNumber(e.target.value, 1))}
                />
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                {modo === 'novo' ? 'Quantidade inicial' : `Quantidade a adicionar (atual: ${itemEditando?.quantidade ?? 0} ${itemEditando?.unidade})`}
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={quantidadeCampo}
                  onChange={(e) => setQuantidadeCampo(toNumber(e.target.value, 0))}
                />
              </label>
              <label className="block text-sm">
                Preco por {unidadeCompra || 'unidade de compra'}
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(toNumber(e.target.value, 0))}
                />
              </label>
            </div>

            <label className="block text-sm">
              Quantidade minima
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(toNumber(e.target.value, 0))}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={fecharModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSalvar()}
                disabled={salvando}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : modo === 'novo' ? 'Cadastrar' : 'Salvar alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}