'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode,
  DollarSign,
  User,
  Receipt,
  X,
  Check,
  Search,
  Store,
  History,
  FileText,
  Printer,
  Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProdutoPDV {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  categoria: string;
  estoque: number;
}

interface ItemCarrinho {
  id: string;
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
  imagem: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  saldoCredito: number;
  limiteCredito: number;
}

interface Venda {
  id: string;
  cliente: Cliente | null;
  itens: ItemCarrinho[];
  subtotal: number;
  desconto: number;
  total: number;
  pagamento: {
    metodo: 'dinheiro' | 'pix' | 'cartao' | 'credito';
    valorPago: number;
    troco: number;
  };
  data: Date;
  status: 'pendente' | 'concluida' | 'cancelada';
}

export default function PDVPage() {
  const [produtos, setProdutos] = useState<ProdutoPDV[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [showModalFiado, setShowModalFiado] = useState(false);
  const [desconto, setDesconto] = useState(0);
  const [valorPago, setValorPago] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState<'dinheiro' | 'pix' | 'cartao' | 'credito'>('dinheiro');
  const [loading, setLoading] = useState(false);
  const [vendasHoje, setVendasHoje] = useState<Venda[]>([]);

  // Carregar produtos
  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const response = await fetch('/api/pdv/produtos');
        const data = await response.json();
        if (data.success) {
          setProdutos(data.produtos);
        }
      } catch (error) {
        console.error('Erro:', error);
        // Dados mock para teste
        setProdutos([
          { id: '1', nome: 'Arroz 5kg', preco: 25.90, imagem: '', categoria: 'alimentacao', estoque: 50 },
          { id: '2', nome: 'Feijão 1kg', preco: 8.50, imagem: '', categoria: 'alimentacao', estoque: 30 },
          { id: '3', nome: 'Óleo de Soja', preco: 6.90, imagem: '', categoria: 'alimentacao', estoque: 20 },
          { id: '4', nome: 'Sabonete', preco: 2.50, imagem: '', categoria: 'higiene', estoque: 100 },
          { id: '5', nome: 'Detergente', preco: 1.99, imagem: '', categoria: 'limpeza', estoque: 40 },
          { id: '6', nome: 'Coca-Cola 2L', preco: 9.90, imagem: '', categoria: 'bebidas', estoque: 25 },
        ]);
      }
    };
    carregarProdutos();
  }, []);

  const adicionarAoCarrinho = (produto: ProdutoPDV) => {
    const itemExistente = carrinho.find(item => item.produtoId === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade + 1 > produto.estoque) {
        toast.error('Quantidade indisponível em estoque');
        return;
      }
      setCarrinho(carrinho.map(item =>
        item.produtoId === produto.id
          ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco }
          : item
      ));
    } else {
      if (produto.estoque < 1) {
        toast.error('Produto sem estoque');
        return;
      }
      setCarrinho([...carrinho, {
        id: Date.now().toString(),
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade: 1,
        subtotal: produto.preco,
        imagem: produto.imagem
      }]);
    }
    toast.success(`${produto.nome} adicionado!`);
  };

  const removerItem = (id: string) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
  };

  const atualizarQuantidade = (id: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(id);
      return;
    }
    setCarrinho(carrinho.map(item =>
      item.id === id
        ? { ...item, quantidade, subtotal: quantidade * item.preco }
        : item
    ));
  };

  const subtotal = carrinho.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - desconto;

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error('Adicione itens ao carrinho');
      return;
    }

    if (metodoPagamento === 'credito') {
      if (!clienteSelecionado) {
        setShowModalCliente(true);
        return;
      }
      if (clienteSelecionado.saldoCredito + clienteSelecionado.limiteCredito < total) {
        toast.error('Crédito insuficiente');
        return;
      }
    }

    setShowModalPagamento(false);
    setLoading(true);

    try {
      const response = await fetch('/api/pdv/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteSelecionado?.id,
          itens: carrinho,
          subtotal,
          desconto,
          total,
          metodoPagamento,
          valorPago: metodoPagamento === 'credito' ? total : valorPago
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Venda finalizada com sucesso!');
        // Imprimir comprovante
        await imprimirComprovante();
        // Limpar carrinho
        setCarrinho([]);
        setDesconto(0);
        setClienteSelecionado(null);
        setValorPago(0);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const imprimirComprovante = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante de Venda</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
          h2 { text-align: center; font-size: 16px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
          .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 10px; }
          .qr-code { text-align: center; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>VALENTE CONECTA</h2>
          <p>Valente - BA<br>${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div>
          ${carrinho.map(item => `
            <div class="item">
              <span>${item.nome}</span>
              <span>${item.quantidade}x R$ ${item.preco.toFixed(2)}</span>
            </div>
            <div class="item">
              <span></span>
              <span>R$ ${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="total">
          <div class="item"><span>SUBTOTAL:</span><span>R$ ${subtotal.toFixed(2)}</span></div>
          ${desconto > 0 ? `<div class="item"><span>DESCONTO:</span><span>-R$ ${desconto.toFixed(2)}</span></div>` : ''}
          <div class="item"><span>TOTAL:</span><span>R$ ${total.toFixed(2)}</span></div>
        </div>
        <div class="qr-code">
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#000"/>
            <text x="50" y="55" text-anchor="middle" fill="#fff" font-size="10">PIX</text>
          </svg>
          <p>Pague com PIX usando o QR Code</p>
        </div>
        <div class="footer">
          <p>Volte sempre!<br>${clienteSelecionado ? `Cliente: ${clienteSelecionado.nome}` : 'Cliente: Consumidor Final'}</p>
        </div>
      </body>
      </html>
    `);
    win.print();
    win.close();
  };

  const produtosFiltrados = produtos.filter(produto => {
    if (categoriaSelecionada !== 'todos' && produto.categoria !== categoriaSelecionada) return false;
    if (busca && !produto.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar - Produtos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header PDV */}
          <div className="bg-white shadow-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Store className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">PDV</h1>
              </div>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                {clienteSelecionado && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="text-sm font-semibold">{clienteSelecionado.nome}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowModalCliente(true)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Categorias */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoriaSelecionada('todos')}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  categoriaSelecionada === 'todos' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Todos
              </button>
              {['alimentacao', 'bebidas', 'higiene', 'limpeza'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSelecionada(cat)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    categoriaSelecionada === cat 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {produtosFiltrados.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    {produto.imagem ? (
                      <img src={produto.imagem} alt={produto.nome} className="h-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{produto.nome}</p>
                  <p className="text-lg font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Estoque: {produto.estoque}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="w-96 bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho
              <span className="text-sm text-gray-500">({carrinho.length} itens)</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrinho.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p>Carrinho vazio</p>
              </div>
            ) : (
              carrinho.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.nome}</p>
                    <p className="text-sm text-green-600">R$ {item.preco.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                        className="p-1 bg-white rounded border"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantidade}</span>
                      <button
                        onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        className="p-1 bg-white rounded border"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">R$ {item.subtotal.toFixed(2)}</p>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-red-500 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totais */}
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Desconto:</span>
              <input
                type="number"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(parseFloat(e.target.value))}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span className="text-green-600">R$ {total.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowModalPagamento(true)}
                disabled={carrinho.length === 0}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                Finalizar
              </button>
              <button
                onClick={() => setShowModalFiado(true)}
                disabled={carrinho.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                Fiado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Cliente */}
      {showModalCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Selecionar Cliente</h2>
                <button onClick={() => setShowModalCliente(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setClienteSelecionado(null);
                    setShowModalCliente(false);
                  }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">Consumidor Final</p>
                  <p className="text-sm text-gray-500">Sem identificação</p>
                </button>
                
                {/* Lista de clientes - exemplo */}
                <button
                  onClick={() => {
                    setClienteSelecionado({
                      id: '1',
                      nome: 'João Silva',
                      telefone: '(75) 99999-1111',
                      email: 'joao@email.com',
                      saldoCredito: 0,
                      limiteCredito: 500
                    });
                    setShowModalCliente(false);
                    toast.success('Cliente selecionado: João Silva');
                  }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">João Silva</p>
                  <p className="text-sm text-gray-500">Crédito: R$ 500,00</p>
                </button>
                
                <button
                  onClick={() => {
                    setClienteSelecionado({
                      id: '2',
                      nome: 'Maria Santos',
                      telefone: '(75) 99999-2222',
                      email: 'maria@email.com',
                      saldoCredito: 150,
                      limiteCredito: 1000
                    });
                    setShowModalCliente(false);
                    toast.success('Cliente selecionado: Maria Santos');
                  }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">Maria Santos</p>
                  <p className="text-sm text-gray-500">Crédito: R$ 850,00</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showModalPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Forma de Pagamento</h2>
                <button onClick={() => setShowModalPagamento(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600">R$ {total.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setMetodoPagamento('dinheiro')}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${
                    metodoPagamento === 'dinheiro' ? 'border-green-500 bg-green-50' : ''
                  }`}
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm">Dinheiro</span>
                </button>
                <button
                  onClick={() => setMetodoPagamento('pix')}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${
                    metodoPagamento === 'pix' ? 'border-green-500 bg-green-50' : ''
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-sm">PIX</span>
                </button>
                <button
                  onClick={() => setMetodoPagamento('cartao')}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${
                    metodoPagamento === 'cartao' ? 'border-green-500 bg-green-50' : ''
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Cartão</span>
                </button>
                <button
                  onClick={() => setMetodoPagamento('credito')}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-1 ${
                    metodoPagamento === 'credito' ? 'border-green-500 bg-green-50' : ''
                  }`}
                >
                  <Receipt className="w-6 h-6" />
                  <span className="text-sm">Fiado</span>
                </button>
              </div>

              {metodoPagamento === 'dinheiro' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Valor recebido</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorPago}
                    onChange={(e) => setValorPago(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    autoFocus
                  />
                  {valorPago > total && (
                    <p className="text-sm text-green-600 mt-1">
                      Troco: R$ {(valorPago - total).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {metodoPagamento === 'pix' && (
                <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                  <QrCode className="w-24 h-24 mx-auto mb-2" />
                  <p className="text-sm">Escaneie o QR Code para pagar</p>
                  <p className="text-xs text-gray-500 mt-1">Chave PIX: contato@valenteconecta.com</p>
                </div>
              )}

              {metodoPagamento === 'credito' && !clienteSelecionado && (
                <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700">
                    ?? Selecione um cliente para usar crédito
                  </p>
                  <button
                    onClick={() => {
                      setShowModalPagamento(false);
                      setShowModalCliente(true);
                    }}
                    className="mt-2 text-blue-600 text-sm underline"
                  >
                    Selecionar cliente
                  </button>
                </div>
              )}

              {metodoPagamento === 'credito' && clienteSelecionado && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="font-medium">Cliente: {clienteSelecionado.nome}</p>
                  <p className="text-sm">Crédito disponível: R$ {(clienteSelecionado.limiteCredito - clienteSelecionado.saldoCredito).toFixed(2)}</p>
                </div>
              )}

              <button
                onClick={finalizarVenda}
                disabled={loading || (metodoPagamento === 'dinheiro' && valorPago < total)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fiado */}
      {showModalFiado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Venda a Prazo (Fiado)</h2>
                <button onClick={() => setShowModalFiado(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600">R$ {total.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={(e) => {
                      if (e.target.value === 'novo') {
                        setShowModalFiado(false);
                        setShowModalCliente(true);
                      }
                    }}
                  >
                    <option value="">Selecione um cliente</option>
                    <option value="1">João Silva (Crédito: R$ 500)</option>
                    <option value="2">Maria Santos (Crédito: R$ 850)</option>
                    <option value="novo">+ Novo cliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    rows={3}
                    placeholder="Informações adicionais..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={() => {
                    setMetodoPagamento('credito');
                    setShowModalFiado(false);
                    setShowModalPagamento(true);
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Confirmar Fiado
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                O cliente será notificado sobre esta cobrança
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

