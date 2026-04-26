// components/ambulantes/CatalogoAmbulante.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  MessageCircle,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Store
} from 'lucide-react';

interface ProdutoAmbulante {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  disponivel: boolean;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
}

interface Ambulante {
  id: string;
  nome: string;
  nomeFantasia: string;
  fotoPerfil?: string;
  categoria: string;
  descricao: string;
  telefone: string;
  whatsapp: string;
  localizacao: {
    lat: number;
    lng: number;
    endereco: string;
    bairro: string;
    pontoReferencia?: string;
  };
  estaOnline: boolean;
  ultimaAtualizacao: Date;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  distancia?: number;
  produtos: ProdutoAmbulante[];
}

interface CatalogoAmbulanteProps {
  ambulanteId?: string;
  onPedidoRealizado?: (pedido: any) => void;
  onAvaliar?: (ambulanteId: string, nota: number, comentario: string) => void;
}

export function CatalogoAmbulante({ ambulanteId, onPedidoRealizado, onAvaliar }: CatalogoAmbulanteProps) {
  const [ambulante, setAmbulante] = useState<Ambulante | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [carrinho, setCarrinho] = useState<{ produto: ProdutoAmbulante; quantidade: number }[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');

  // Mock data
  useEffect(() => {
    const mockAmbulante: Ambulante = {
      id: '1',
      nome: 'Carlos Silva',
      nomeFantasia: 'Cachorro-Quente do Carlos',
      fotoPerfil: undefined,
      categoria: 'Alimentação',
      descricao: 'O melhor cachorro-quente da região, feito com ingredientes frescos e de qualidade. Também oferecemos sucos naturais e refrigerantes.',
      telefone: '(75) 98888-1111',
      whatsapp: '5575988881111',
      localizacao: {
        lat: -11.4092,
        lng: -39.4685,
        endereco: 'Praça Central, 123',
        bairro: 'Centro',
        pontoReferencia: 'Em frente à igreja matriz',
      },
      estaOnline: true,
      ultimaAtualizacao: new Date(),
      avaliacaoMedia: 4.7,
      totalAvaliacoes: 128,
      produtos: [
        {
          id: '1',
          nome: 'Cachorro-Quente Tradicional',
          descricao: 'Pão, salsicha, purê de batata, milho, ervilha, batata palha, molho especial',
          preco: 12.00,
          categoria: 'Salgados',
          fotos: [],
          disponivel: true,
          avaliacaoMedia: 4.8,
          totalAvaliacoes: 45,
        },
        {
          id: '2',
          nome: 'Cachorro-Quente Premium',
          descricao: 'Pão, salsicha premium, queijo mussarela, bacon, purê, milho, ervilha, batata palha, molho especial',
          preco: 18.00,
          categoria: 'Salgados',
          fotos: [],
          disponivel: true,
          avaliacaoMedia: 4.9,
          totalAvaliacoes: 32,
        },
        {
          id: '3',
          nome: 'X-Tudo',
          descricao: 'Pão, hambúrguer, queijo, presunto, ovo, bacon, alface, tomate, maionese',
          preco: 22.00,
          categoria: 'Salgados',
          fotos: [],
          disponivel: true,
          avaliacaoMedia: 4.6,
          totalAvaliacoes: 28,
        },
        {
          id: '4',
          nome: 'Suco de Laranja Natural',
          descricao: 'Suco de laranja feito na hora, natural e refrescante',
          preco: 7.00,
          categoria: 'Bebidas',
          fotos: [],
          disponivel: true,
        },
        {
          id: '5',
          nome: 'Refrigerante Lata',
          descricao: 'Coca-Cola, Guaraná, Fanta, Sprite',
          preco: 5.00,
          categoria: 'Bebidas',
          fotos: [],
          disponivel: true,
        },
        {
          id: '6',
          nome: 'Água Mineral',
          descricao: 'Água mineral 500ml',
          preco: 3.00,
          categoria: 'Bebidas',
          fotos: [],
          disponivel: true,
        },
      ],
    };
    setAmbulante(mockAmbulante);
    setLoading(false);
  }, [ambulanteId]);

  const adicionarAoCarrinho = (produto: ProdutoAmbulante) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.produto.id === produto.id);
      if (existente) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }
    setCarrinho(prev =>
      prev.map(item =>
        item.produto.id === produtoId ? { ...item, quantidade } : item
      )
    );
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  };

  const finalizarPedido = () => {
    const pedido = {
      id: Date.now().toString(),
      ambulanteId: ambulante?.id,
      ambulanteNome: ambulante?.nomeFantasia,
      itens: carrinho,
      total: calcularTotal(),
      data: new Date(),
      status: 'pendente',
    };
    
    const mensagemWhatsApp = `Olá! Gostaria de fazer um pedido:\n\n${carrinho.map(item => 
      `- ${item.quantidade}x ${item.produto.nome} - R$ ${(item.produto.preco * item.quantidade).toFixed(2)}`
    ).join('\n')}\n\nTotal: R$ ${calcularTotal().toFixed(2)}\n\nMeu nome: \nEndereço: `;
    
    const whatsappUrl = `https://wa.me/${ambulante?.whatsapp}?text=${encodeURIComponent(mensagemWhatsApp)}`;
    window.open(whatsappUrl, '_blank');
    
    if (onPedidoRealizado) {
      onPedidoRealizado(pedido);
    }
    
    setCarrinho([]);
    setShowCarrinho(false);
  };

  const enviarAvaliacao = () => {
    if (onAvaliar && ambulante) {
      onAvaliar(ambulante.id, notaAvaliacao, comentarioAvaliacao);
      alert('Avaliação enviada com sucesso!');
      setShowAvaliacao(false);
      setNotaAvaliacao(5);
      setComentarioAvaliacao('');
    }
  };

  const produtosFiltrados = ambulante?.produtos.filter(produto => {
    const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todos' || produto.categoria === categoriaFiltro;
    return matchSearch && matchCategoria;
  }) || [];

  const categorias = [...new Set(ambulante?.produtos.map(p => p.categoria) || [])];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  if (!ambulante) {
    return (
      <div className="text-center py-12">
        <Store size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Ambulante não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header do Ambulante */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <div className="relative h-32 bg-gradient-to-r from-orange-400 to-red-500">
          {ambulante.estaOnline && (
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Online agora
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-start gap-4 -mt-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              {ambulante.fotoPerfil ? (
                <img src={ambulante.fotoPerfil} alt={ambulante.nomeFantasia} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-bold">{ambulante.nomeFantasia}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{ambulante.avaliacaoMedia}</span>
                  <span className="text-gray-400 text-sm">({ambulante.totalAvaliacoes} avaliações)</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  {ambulante.localizacao.bairro}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2">{ambulante.descricao}</p>
            </div>
          </div>

          {/* Contato e Ações */}
          <div className="flex gap-3 mt-4">
            <a
              href={`tel:${ambulante.telefone}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Phone size={18} /> Ligar
            </a>
            <a
              href={`https://wa.me/${ambulante.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <button
              onClick={() => setShowAvaliacao(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Star size={18} /> Avaliar
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="sticky top-0 bg-gray-50 z-10 py-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="pl-4 pr-10 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="space-y-3 mb-20">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          produtosFiltrados.map(produto => (
            <div key={produto.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {produto.fotos[0] ? (
                    <img src={produto.fotos[0]} alt={produto.nome} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ShoppingBag size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                      <p className="text-sm text-gray-500 mt-1">{produto.descricao}</p>
                      {produto.avaliacaoMedia && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500">{produto.avaliacaoMedia} ({produto.totalAvaliacoes})</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                      {produto.disponivel ? (
                        <button
                          onClick={() => adicionarAoCarrinho(produto)}
                          className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                        >
                          Adicionar
                        </button>
                      ) : (
                        <span className="text-xs text-red-500">Indisponível</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão Flutuante do Carrinho */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowCarrinho(true)}
            className="flex items-center gap-3 px-6 py-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          >
            <ShoppingBag size={20} />
            <span className="font-semibold">{carrinho.reduce((sum, item) => sum + item.quantidade, 0)} itens</span>
            <span className="w-px h-6 bg-orange-400" />
            <span className="font-bold">R$ {calcularTotal().toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modal do Carrinho */}
      {showCarrinho && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag size={20} />
                Meu Pedido
              </h3>
              <button onClick={() => setShowCarrinho(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {carrinho.map(item => (
                <div key={item.produto.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.produto.nome}</p>
                    <p className="text-sm text-gray-500">R$ {item.produto.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantidade}</span>
                    <button
                      onClick={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removerDoCarrinho(item.produto.id)}
                      className="ml-2 text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {calcularTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={finalizarPedido}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Enviar Pedido via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avaliação */}
      {showAvaliacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Avaliar {ambulante.nomeFantasia}</h3>
              <button onClick={() => setShowAvaliacao(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNotaAvaliacao(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= notaAvaliacao
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-gray-600">
                  {notaAvaliacao === 5 && 'Excelente!'}
                  {notaAvaliacao === 4 && 'Muito bom!'}
                  {notaAvaliacao === 3 && 'Bom'}
                  {notaAvaliacao === 2 && 'Regular'}
                  {notaAvaliacao === 1 && 'Ruim'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comentário (opcional)</label>
                <textarea
                  value={comentarioAvaliacao}
                  onChange={(e) => setComentarioAvaliacao(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 resize-none"
                  rows={4}
                  placeholder="Conte sua experiência..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={enviarAvaliacao}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
              >
                Enviar Avaliação
              </button>
              <button
                onClick={() => setShowAvaliacao(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}