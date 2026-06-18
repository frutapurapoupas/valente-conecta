'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart, 
  Heart, 
  Star, 
  Tag,
  ChevronDown,
  X,
  Eye,
  Lock,
  Phone,
  MapPin,
  Store
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoOriginal?: number;
  imagem: string;
  categoria: string;
  subcategoria?: string;
  avaliacao: number;
  vendas: number;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorEndereco: string;
  fornecedorTelefone: string;
  fornecedorAvaliacao: number;
  destaque: boolean;
  desconto: number;
  estoque: number;
  createdAt: string;
}

interface Categoria {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  cor: string;
}

const categorias: Categoria[] = [
  { id: 'todos', nome: 'Todos', slug: 'todos', icone: '📦', cor: 'bg-gray-500' },
  { id: 'alimentacao', nome: 'Alimentação', slug: 'alimentacao', icone: '🍕', cor: 'bg-orange-500' },
  { id: 'bebidas', nome: 'Bebidas', slug: 'bebidas', icone: '🥤', cor: 'bg-blue-500' },
  { id: 'higiene', nome: 'Higiene', slug: 'higiene', icone: '🧴', cor: 'bg-green-500' },
  { id: 'limpeza', nome: 'Limpeza', slug: 'limpeza', icone: '🧹', cor: 'bg-cyan-500' },
  { id: 'eletronicos', nome: 'Eletrônicos', slug: 'eletronicos', icone: '📱', cor: 'bg-purple-500' },
  { id: 'moda', nome: 'Moda', slug: 'moda', icone: '👕', cor: 'bg-pink-500' },
  { id: 'veiculos', nome: 'Veículos', slug: 'veiculos', icone: '🚗', cor: 'bg-red-500' },
  { id: 'imoveis', nome: 'Imóveis', slug: 'imoveis', icone: '🏠', cor: 'bg-amber-500' },
  { id: 'servicos', nome: 'Serviços', slug: 'servicos', icone: '🔧', cor: 'bg-indigo-500' }
];

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState(searchParams?.get('categoria') || 'todos');
  const [buscaTermo, setBuscaTermo] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [exibirFiltros, setExibirFiltros] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');
  const [faixaPreco, setFaixaPreco] = useState<[number, number]>([0, 1000]);
  const [apenasDestaques, setApenasDestaques] = useState(false);
  const [apenasComDesconto, setApenasComDesconto] = useState(false);
  const [modalDesbloqueio, setModalDesbloqueio] = useState<{ produto: Produto; show: boolean } | null>(null);
  const [dadosDesbloqueados, setDadosDesbloqueados] = useState<Record<string, boolean>>({});
  const [precoDesbloqueio, setPrecoDesbloqueio] = useState(0.50);

  // Carregar produtos
  useEffect(() => {
    const carregarProdutos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoriaAtiva !== 'todos') params.append('categoria', categoriaAtiva);
        if (buscaTermo) params.append('busca', buscaTermo);
        params.append('orderBy', ordenacao);
        params.append('minPrice', faixaPreco[0].toString());
        params.append('maxPrice', faixaPreco[1].toString());
        if (apenasDestaques) params.append('destaque', 'true');
        if (apenasComDesconto) params.append('desconto', 'true');

        const response = await fetch(`/api/catalogo/produtos?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setProdutos(data.produtos);
        } else {
          setProdutos([]);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };

    carregarProdutos();
  }, [categoriaAtiva, buscaTermo, ordenacao, faixaPreco, apenasDestaques, apenasComDesconto]);

  // Carregar configuração de desbloqueio
  useEffect(() => {
    const carregarConfig = async () => {
      try {
        const response = await fetch('/api/config/desbloqueio');
        const data = await response.json();
        if (data.success && data.preco) {
          setPrecoDesbloqueio(data.preco);
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };
    carregarConfig();
  }, []);

  const getDisplayInfo = (produto: Produto) => {
    const desbloqueado = dadosDesbloqueados[produto.id];
    return {
      fornecedorNome: desbloqueado ? produto.fornecedorNome : '*** BLOQUEADO ***',
      fornecedorEndereco: desbloqueado ? produto.fornecedorEndereco : '*** Desbloqueie para ver ***',
      fornecedorTelefone: desbloqueado ? produto.fornecedorTelefone : '*** Desbloqueie para ver ***'
    };
  };

  const handleDesbloquear = async (produto: Produto) => {
    setModalDesbloqueio({ produto, show: true });
  };

  const confirmarDesbloqueio = async () => {
    if (!modalDesbloqueio?.produto) return;

    try {
      const response = await fetch('/api/pagamento/desbloqueio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: modalDesbloqueio.produto.id,
          valor: precoDesbloqueio,
          tipo: 'desbloqueio_contato'
        })
      });

      const data = await response.json();

      if (data.success) {
        setDadosDesbloqueados(prev => ({
          ...prev,
          [modalDesbloqueio.produto.id]: true
        }));
        toast.success(`Contato desbloqueado por R$ ${precoDesbloqueio.toFixed(2)}!`);
        setModalDesbloqueio(null);
      } else {
        toast.error('Erro no pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const renderStars = (avaliacao: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= avaliacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({avaliacao})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ← Voltar
              </button>
              <h1 className="text-xl font-bold text-gray-800">Catálogo</h1>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={buscaTermo}
                  onChange={(e) => setBuscaTermo(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisualizacao('grid')}
                className={`p-2 rounded-lg ${visualizacao === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={`p-2 rounded-lg ${visualizacao === 'lista' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setExibirFiltros(!exibirFiltros)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Filtros</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${exibirFiltros ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {exibirFiltros && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-4">
              {/* Ordenação */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-gray-500 mb-1">Ordenar por</label>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="preco_asc">Menor preço</option>
                  <option value="preco_desc">Maior preço</option>
                  <option value="avaliacao">Melhor avaliação</option>
                  <option value="vendas">Mais vendidos</option>
                </select>
              </div>
              
              {/* Faixa de preço */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-500 mb-1">Faixa de preço</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={faixaPreco[0]}
                    onChange={(e) => setFaixaPreco([Number(e.target.value), faixaPreco[1]])}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={faixaPreco[1]}
                    onChange={(e) => setFaixaPreco([faixaPreco[0], Number(e.target.value)])}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={apenasDestaques}
                    onChange={(e) => setApenasDestaques(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Apenas Destaques
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={apenasComDesconto}
                    onChange={(e) => setApenasComDesconto(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Com Desconto
                </label>
              </div>

              {/* Limpar filtros */}
              <button
                onClick={() => {
                  setOrdenacao('relevancia');
                  setFaixaPreco([0, 1000]);
                  setApenasDestaques(false);
                  setApenasComDesconto(false);
                  setBuscaTermo('');
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categorias */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-3">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all
                  ${categoriaAtiva === cat.slug 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <span>{cat.icone}</span>
                <span>{cat.nome}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Nenhum produto encontrado</h3>
            <p className="text-gray-400 mt-2">Tente ajustar os filtros ou buscar por outro termo</p>
          </div>
        ) : visualizacao === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => {
              const displayInfo = getDisplayInfo(produto);
              const desbloqueado = dadosDesbloqueados[produto.id];
              
              return (
                <div key={produto.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* Imagem */}
                  <div className="relative h-48 bg-gray-100">
                    {produto.imagem ? (
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-12 h-12" />
                      </div>
                    )}
                    {produto.desconto > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{produto.desconto}%
                      </span>
                    )}
                    {produto.destaque && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{produto.nome}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{produto.descricao}</p>
                    
                    {/* Preço */}
                    <div className="mt-2">
                      {produto.precoOriginal && produto.precoOriginal > produto.preco ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">{formatCurrency(produto.preco)}</span>
                          <span className="text-xs text-gray-400 line-through">{formatCurrency(produto.precoOriginal)}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-green-600">{formatCurrency(produto.preco)}</span>
                      )}
                    </div>

                    {/* Avaliação */}
                    <div className="mt-2">
                      {renderStars(produto.avaliacao)}
                    </div>

                    {/* Fornecedor (bloqueado) */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Store className="w-3 h-3" />
                        <span className={desbloqueado ? '' : 'blur-sm select-none'}>
                          {displayInfo.fornecedorNome}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className={desbloqueado ? '' : 'blur-sm select-none'}>
                          {displayInfo.fornecedorEndereco}
                        </span>
                      </div>
                      
                      {!desbloqueado && (
                        <button
                          onClick={() => handleDesbloquear(produto)}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
                        >
                          <Lock className="w-4 h-4" />
                          Desbloquear Contato - R$ {precoDesbloqueio.toFixed(2)}
                        </button>
                      )}
                      
                      {desbloqueado && (
                        <div className="mt-3 space-y-1">
                          <button className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                            <Phone className="w-4 h-4" />
                            {displayInfo.fornecedorTelefone}
                          </button>
                          <Link
                            href={`/catalogo/produto/${produto.id}`}
                            className="w-full flex items-center justify-center gap-2 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalhes
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {produtos.map((produto) => {
              const displayInfo = getDisplayInfo(produto);
              const desbloqueado = dadosDesbloqueados[produto.id];
              
              return (
                <div key={produto.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Imagem */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {produto.imagem ? (
                        <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{produto.descricao}</p>
                          <div className="mt-1 flex items-center gap-3">
                            {renderStars(produto.avaliacao)}
                            <span className="text-xs text-gray-400">{produto.vendas} vendas</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {produto.precoOriginal && produto.precoOriginal > produto.preco ? (
                            <>
                              <span className="text-xl font-bold text-green-600">{formatCurrency(produto.preco)}</span>
                              <span className="text-xs text-gray-400 line-through block">{formatCurrency(produto.precoOriginal)}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-green-600">{formatCurrency(produto.preco)}</span>
                          )}
                        </div>
                      </div>

                      {/* Fornecedor */}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Store className="w-4 h-4" />
                          <span className={desbloqueado ? '' : 'blur-sm select-none'}>
                            {displayInfo.fornecedorNome}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className={desbloqueado ? '' : 'blur-sm select-none'}>
                            {displayInfo.fornecedorEndereco}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="mt-3 flex gap-3">
                        {!desbloqueado && (
                          <button
                            onClick={() => handleDesbloquear(produto)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
                          >
                            <Lock className="w-4 h-4" />
                            Desbloquear - R$ {precoDesbloqueio.toFixed(2)}
                          </button>
                        )}
                        {desbloqueado && (
                          <>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                              <Phone className="w-4 h-4" />
                              {displayInfo.fornecedorTelefone}
                            </button>
                            <Link
                              href={`/catalogo/produto/${produto.id}`}
                              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                              Detalhes
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Desbloqueio */}
      {modalDesbloqueio?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">🔓 Desbloquear Contato</h2>
                <button onClick={() => setModalDesbloqueio(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {modalDesbloqueio.produto.imagem ? (
                    <img src={modalDesbloqueio.produto.imagem} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{modalDesbloqueio.produto.nome}</h3>
                  <p className="text-sm text-gray-500">{modalDesbloqueio.produto.descricao}</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(modalDesbloqueio.produto.preco)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ao desbloquear, você terá acesso a:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Nome completo do fornecedor
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Endereço completo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Telefone para contato
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    WhatsApp direto
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Valor do desbloqueio:</span>
                  <span className="text-2xl font-bold text-green-600">R$ {precoDesbloqueio.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Pagamento único, acesso permanente</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalDesbloqueio(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarDesbloqueio}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Pagar R$ {precoDesbloqueio.toFixed(2)}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Pagamento seguro via PIX ou Cartão de Crédito
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}