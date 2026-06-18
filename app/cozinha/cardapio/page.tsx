'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, CheckCircle, Send, Loader2, ArrowLeft, Calendar, Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

type ItemCardapio = {
  id: string;
  dia: string;
  titulo: string;
  descricao: string;
  preco: number;
  precoParceiro?: number;
  imagem: string | null;
  categoria: string;
  descontoParceiro?: number;
};

type DiaSemana = 'SEGUNDA-FEIRA' | 'TERÇA-FEIRA' | 'QUARTA-FEIRA' | 'QUINTA-FEIRA' | 'SEXTA-FEIRA' | 'SÁBADO' | 'DOMINGO';

type CartItem = {
  id: string;
  titulo: string;
  preco: number;
  quantidade: number;
  imagem: string | null;
  dia: string;
};

const diasDaSemana: DiaSemana[] = [
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO',
  'DOMINGO'
];

const diasResumidos = {
  'SEGUNDA-FEIRA': 'SEG',
  'TERÇA-FEIRA': 'TER',
  'QUARTA-FEIRA': 'QUA',
  'QUINTA-FEIRA': 'QUI',
  'SEXTA-FEIRA': 'SEX',
  'SÁBADO': 'SAB',
  'DOMINGO': 'DOM'
};

const subcategoriasSobremesas = [
  { id: 'bolo', nome: '🍰 BOLOS', icone: '🍰' },
  { id: 'salgado', nome: '🥟 SALGADOS', icone: '🥟' },
  { id: 'doce', nome: '🍬 DOCES', icone: '🍬' }
];

// Imagens padrão
const imagensPadrao = {
  prato: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop',
  bolo: 'https://images.unsplash.com/photo-1578985545062-69928b1b958e?q=80&w=1200&auto=format&fit=crop',
  salgado: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop',
  doce: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1200&auto=format&fit=crop'
};

const WHATSAPP_NUMBER = "5575999999999";
const DELIVERY_FEE = 3.00;

export default function CozinhaCardapio() {
  // Pegar o perfil da URL
  const [perfil, setPerfil] = useState<'geral' | 'parceiro' | 'assinante'>('geral');
  
  const [abaAtiva, setAbaAtiva] = useState<'pratos' | 'sobremesas'>('pratos');
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>('SEGUNDA-FEIRA');
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('bolo');
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  // Estado para controle dos dias ativos
  const [diasAtivos, setDiasAtivos] = useState<Record<DiaSemana, boolean>>({
    'SEGUNDA-FEIRA': true,
    'TERÇA-FEIRA': true,
    'QUARTA-FEIRA': true,
    'QUINTA-FEIRA': true,
    'SEXTA-FEIRA': true,
    'SÁBADO': true,
    'DOMINGO': true
  });
  
  const [clienteInfo, setClienteInfo] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    complemento: '',
    pagamento: 'dinheiro'
  });

  // Carregar dias ativos do localStorage
  useEffect(() => {
    const diasSalvos = localStorage.getItem('cozinha_cardapio_dias_ativos');
    if (diasSalvos) {
      setDiasAtivos(JSON.parse(diasSalvos));
    }
  }, []);

  // Salvar dias ativos no localStorage
  useEffect(() => {
    localStorage.setItem('cozinha_cardapio_dias_ativos', JSON.stringify(diasAtivos));
  }, [diasAtivos]);

  // Pegar perfil da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const perfilParam = params.get('perfil');
    if (perfilParam === 'parceiro') setPerfil('parceiro');
    else if (perfilParam === 'assinante') setPerfil('assinante');
    else setPerfil('geral');
  }, []);

  useEffect(() => {
    carregarCardapio();
  }, [abaAtiva, diaSelecionado, subcategoriaSelecionada, perfil]);

  useEffect(() => {
    const savedCart = localStorage.getItem(`carrinho_cozinha_${perfil}`);
    if (savedCart) {
      setCarrinho(JSON.parse(savedCart));
    }
  }, [perfil]);

  useEffect(() => {
    localStorage.setItem(`carrinho_cozinha_${perfil}`, JSON.stringify(carrinho));
  }, [carrinho, perfil]);

  const toggleDiaAtivo = (dia: DiaSemana) => {
    setDiasAtivos(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
    toast.success(`${dia} ${!diasAtivos[dia] ? 'ativado' : 'desativado'}!`, { duration: 1500 });
  };

  const carregarCardapio = async () => {
    setLoading(true);
    try {
      const tipo = abaAtiva === 'pratos' ? 'pratos' : 'sobremesas';
      let url = `/api/cozinha/cardapio?tipo=${tipo}`;
      
      if (abaAtiva === 'pratos') {
        url += `&dia=${diaSelecionado}`;
      } else {
        url += `&subcategoria=${subcategoriaSelecionada}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Aplicar desconto para parceiro
        let items = data.data;
        if (perfil === 'parceiro') {
          items = items.map((item: any) => ({
            ...item,
            precoOriginal: item.preco,
            preco: item.precoParceiro || item.preco * (1 - (item.descontoParceiro || 0) / 100),
            descontoAplicado: item.descontoParceiro || 0
          }));
        }
        setItens(items);
      } else {
        const mockItems: ItemCardapio[] = [
          {
            id: '1',
            dia: diaSelecionado,
            titulo: 'FRANGO COM QUIABO',
            descricao: 'Frango com quiabo, vinagrete, arroz e feijão.',
            preco: 12,
            precoParceiro: 10.80,
            imagem: null,
            categoria: abaAtiva === 'pratos' ? 'prato' : 'sobremesa',
            descontoParceiro: 10
          },
          {
            id: '2',
            dia: diaSelecionado,
            titulo: abaAtiva === 'pratos' ? 'BIFE ACEBOLADO' : 'PUDIM DE LEITE',
            descricao: abaAtiva === 'pratos' 
              ? 'Bife acebolado com arroz, feijão e farofa.'
              : 'Pudim de leite condensado tradicional',
            preco: 14,
            precoParceiro: 12.60,
            imagem: null,
            categoria: abaAtiva === 'pratos' ? 'prato' : 'sobremesa',
            descontoParceiro: 10
          }
        ];
        setItens(mockItems);
      }
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (item: ItemCardapio, quantidade: number = 1) => {
    const precoFinal = perfil === 'parceiro' ? (item.precoParceiro || item.preco) : item.preco;
    setCarrinho(prev => {
      const existente = prev.find(i => i.id === item.id);
      if (existente) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...prev, {
        id: item.id,
        titulo: item.titulo,
        preco: precoFinal,
        quantidade: quantidade,
        imagem: item.imagem,
        dia: item.dia
      }];
    });
    toast.success(`${item.titulo} adicionado ao carrinho!`, { duration: 1500, icon: '🛒' });
  };

  const removerDoCarrinho = (id: string) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
    toast.success('Item removido do carrinho', { duration: 1000 });
  };

  const atualizarQuantidade = (id: string, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.id === id) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };

  const getSubtotal = () => carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  const getTotal = () => getSubtotal() + DELIVERY_FEE;
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

  const enviarPedidoFluido = async () => {
    if (carrinho.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    if (!clienteInfo.nome || !clienteInfo.telefone || !clienteInfo.endereco) {
      toast.error('Preencha seus dados para continuar', { icon: '📝', duration: 3000 });
      return;
    }

    setEnviando(true);
    const loadingToast = toast.loading('Enviando seu pedido...');

    try {
      const orderResponse = await fetch('/api/cozinha/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: clienteInfo.nome,
          customerPhone: clienteInfo.telefone,
          deliveryAddress: `${clienteInfo.endereco} ${clienteInfo.complemento}`,
          paymentMethod: clienteInfo.pagamento,
          total: getTotal(),
          items: carrinho.map(item => ({
            recipeId: item.id,
            quantity: item.quantidade,
            price: item.preco,
            name: item.titulo
          }))
        })
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        await fetch('/api/cozinha/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: orderData.data.id,
            customerName: clienteInfo.nome,
            customerPhone: clienteInfo.telefone,
            total: getTotal(),
            perfil
          })
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Pedido Confirmado!', {
            body: `Seu pedido de R$ ${getTotal().toFixed(2)} foi enviado para a cozinha.`,
            icon: '/logo.png'
          });
        }

        toast.dismiss(loadingToast);
        toast.success('Pedido enviado com sucesso! 🎉', { duration: 4000, icon: '✅' });
        
        setCarrinho([]);
        setShowCheckout(false);
        setPedidoEnviado(true);
        setClienteInfo({ nome: '', telefone: '', endereco: '', complemento: '', pagamento: 'dinheiro' });
        setTimeout(() => setPedidoEnviado(false), 3000);
      } else {
        throw new Error('Erro ao salvar pedido');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.dismiss(loadingToast);
      toast.error('Não foi possível enviar o pedido. Tente novamente.', { duration: 5000, icon: '❌' });
    } finally {
      setEnviando(false);
    }
  };

  const getImagem = (item: ItemCardapio | CartItem) => {
    if (item.imagem) return item.imagem;
    if (abaAtiva === 'pratos') return imagensPadrao.prato;
    return imagensPadrao[subcategoriaSelecionada as keyof typeof imagensPadrao] || imagensPadrao.bolo;
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'denied' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Verificar se o cardápio do dia selecionado está ativo
  const cardapioAtivo = diasAtivos[diaSelecionado];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f1f1f', color: '#fff', borderRadius: '12px' } }} />
      
      <div className="min-h-screen bg-black text-white pb-32">
        <div className="sticky top-0 z-50 bg-black border-b border-yellow-500 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <a href="/cozinha" className="text-yellow-400 hover:text-yellow-300 transition">
                <ArrowLeft size={24} />
              </a>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-yellow-400 tracking-wide">COZINHA CHEF NEIDE</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${perfil === 'parceiro' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {perfil === 'parceiro' ? '🤝 Parceiro Revendedor' : '👤 Cliente Geral'}
                  </span>
                  {perfil === 'parceiro' && <span className="text-xs text-green-400">💸 Desconto especial aplicado!</span>}
                </div>
              </div>
            </div>
            <button onClick={() => setShowCart(true)} className="relative bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 transition">
              <ShoppingCart size={24} className="text-yellow-400" />
              {totalItens > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItens}</span>}
            </button>
          </div>

          {/* BOTÕES DE DIAS DA SEMANA - NOVO */}
          <div className="mt-4 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">Controle de dias do cardápio:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {diasDaSemana.map((dia) => (
                <button
                  key={dia}
                  onClick={() => toggleDiaAtivo(dia)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${diasAtivos[dia] 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    }
                    ${diaSelecionado === dia ? 'ring-2 ring-offset-2 ring-yellow-500 ring-offset-black' : ''}
                  `}
                  title={`${dia} - ${diasAtivos[dia] ? 'Cardápio visível' : 'Cardápio oculto'}`}
                >
                  {diasResumidos[dia]}
                  {diasAtivos[dia] ? (
                    <Eye size={10} className="inline ml-1" />
                  ) : (
                    <EyeOff size={10} className="inline ml-1" />
                  )}
                </button>
              ))}
            </div>
            {!cardapioAtivo && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-xs text-red-400 text-center">
                  ⚠️ Cardápio desativado para {diaSelecionado}. Clique no botão verde para ativar.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Abas e resto do cardápio */}
        <div className="flex px-4 gap-2 mt-4">
          <button onClick={() => setAbaAtiva('pratos')} className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${abaAtiva === 'pratos' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' : 'bg-zinc-800 text-gray-400'}`}>🍽️ PRATOS</button>
          <button onClick={() => setAbaAtiva('sobremesas')} className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${abaAtiva === 'sobremesas' ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg' : 'bg-zinc-800 text-gray-400'}`}>🍰 SOBREMESAS</button>
        </div>

        {abaAtiva === 'pratos' && (
          <div className="px-4 mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max">
              {diasDaSemana.map((dia) => (
                <button 
                  key={dia} 
                  onClick={() => setDiaSelecionado(dia)} 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${diaSelecionado === dia ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-gray-400'} ${!diasAtivos[dia] && diaSelecionado !== dia ? 'opacity-50' : ''}`}
                >
                  {dia}
                  {!diasAtivos[dia] && <span className="ml-1 text-xs">🔴</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'sobremesas' && (
          <div className="px-4 mt-4">
            <div className="flex gap-2">
              {subcategoriasSobremesas.map((sub) => (
                <button key={sub.id} onClick={() => setSubcategoriaSelecionada(sub.id)} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${subcategoriaSelecionada === sub.id ? 'bg-pink-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>{sub.icone} {sub.nome}</button>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo do cardápio com verificação de ativação */}
        <div className="px-4 py-5 space-y-6">
          {!cardapioAtivo ? (
            <div className="text-center py-20">
              <div className="bg-red-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <EyeOff size={48} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Cardápio Indisponível</h3>
              <p className="text-gray-400 mb-4">
                O cardápio para {diaSelecionado} está desativado no momento.
              </p>
              <button
                onClick={() => toggleDiaAtivo(diaSelecionado)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition"
              >
                Ativar cardápio para {diaSelecionado}
              </button>
            </div>
          ) : itens.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">🍽️</p>
              <p className="text-gray-400 mt-2">Nenhum item disponível para {diaSelecionado}</p>
            </div>
          ) : (
            itens.map((item) => {
              const itemNoCarrinho = carrinho.find(i => i.id === item.id);
              const qtd = itemNoCarrinho?.quantidade || 0;
              const precoExibido = perfil === 'parceiro' ? (item.precoParceiro || item.preco) : item.preco;

              return (
                <div key={item.id} className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                  <div className="relative">
                    <img src={getImagem(item)} alt={item.titulo} className="w-full h-56 object-cover" />
                    {abaAtiva === 'pratos' && <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">{item.dia}</div>}
                    {perfil === 'parceiro' && item.descontoParceiro && item.descontoParceiro > 0 && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">-{item.descontoParceiro}% OFF</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-2xl font-extrabold text-red-500">{item.titulo}</h2>
                    <p className="text-gray-300 mt-3 leading-relaxed">{item.descricao}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <span className="text-yellow-400 text-3xl font-extrabold">R$ {precoExibido.toFixed(2)}</span>
                        {perfil === 'parceiro' && item.preco !== precoExibido && (
                          <p className="text-xs text-gray-500 line-through">R$ {item.preco.toFixed(2)}</p>
                        )}
                      </div>
                      {qtd > 0 ? (
                        <div className="flex items-center gap-3 bg-zinc-800 rounded-full px-3 py-2">
                          <button onClick={() => { if (qtd === 1) removerDoCarrinho(item.id); else atualizarQuantidade(item.id, -1); }} className="bg-red-500 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center transition"><Minus size={16} /></button>
                          <span className="text-lg font-bold w-6 text-center">{qtd}</span>
                          <button onClick={() => adicionarAoCarrinho(item, 1)} className="bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center transition"><Plus size={16} /></button>
                        </div>
                      ) : (
                        <button onClick={() => adicionarAoCarrinho(item, 1)} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full flex items-center gap-2 font-bold transition"><ShoppingCart size={18} /> Adicionar</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidecart, Checkout e Modal de Sucesso - iguais ao original */}
        {showCart && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-900 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={24} className="text-yellow-400" /> Meu Carrinho ({totalItens} itens)</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {carrinho.length === 0 ? (
                  <div className="text-center py-20"><ShoppingCart size={64} className="mx-auto text-gray-600 mb-4" /><p className="text-gray-400">Seu carrinho está vazio</p></div>
                ) : (
                  <div className="space-y-4">
                    {carrinho.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-zinc-800 rounded-xl p-3">
                        <img src={getImagem(item as any)} alt={item.titulo} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-bold">{item.titulo}</h3>
                          <p className="text-yellow-400">R$ {item.preco.toFixed(2)}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => atualizarQuantidade(item.id, -1)} className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center"><Minus size={12} /></button>
                            <span>{item.quantidade}</span>
                            <button onClick={() => atualizarQuantidade(item.id, 1)} className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center"><Plus size={12} /></button>
                            <button onClick={() => removerDoCarrinho(item.id)} className="ml-auto text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {carrinho.length > 0 && (
                <div className="border-t border-zinc-800 p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between"><span>Subtotal:</span><span>R$ {getSubtotal().toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Taxa de entrega:</span><span>R$ {DELIVERY_FEE.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t border-zinc-800 pt-2"><span>Total:</span><span className="text-yellow-400">R$ {getTotal().toFixed(2)}</span></div>
                  </div>
                  <button onClick={() => { setShowCart(false); setShowCheckout(true); }} className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold transition">CONTINUAR PEDIDO</button>
                </div>
              )}
            </div>
          </div>
        )}

        {showCheckout && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Finalizar Pedido</h2>
                <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div><label className="block text-sm text-gray-400 mb-1">Seu nome *</label><input type="text" value={clienteInfo.nome} onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Digite seu nome" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">WhatsApp *</label><input type="tel" value={clienteInfo.telefone} onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="(75) 99999-9999" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Endereço de entrega *</label><input type="text" value={clienteInfo.endereco} onChange={(e) => setClienteInfo({...clienteInfo, endereco: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Rua, número, bairro" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Complemento</label><input type="text" value={clienteInfo.complemento} onChange={(e) => setClienteInfo({...clienteInfo, complemento: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Apto, casa, referência" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Forma de pagamento</label><select value={clienteInfo.pagamento} onChange={(e) => setClienteInfo({...clienteInfo, pagamento: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"><option value="dinheiro">Dinheiro (sem troco)</option><option value="dinheiro_troco">Dinheiro (com troco)</option><option value="pix">PIX</option></select></div>
                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between mb-2"><span>Subtotal:</span><span>R$ {getSubtotal().toFixed(2)}</span></div>
                  <div className="flex justify-between mb-2"><span>Entrega:</span><span>R$ {DELIVERY_FEE.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xl font-bold"><span>TOTAL:</span><span className="text-yellow-400">R$ {getTotal().toFixed(2)}</span></div>
                </div>
                <button onClick={enviarPedidoFluido} disabled={enviando} className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{enviando ? <><Loader2 size={20} className="animate-spin" /> Enviando...</> : <><Send size={20} /> CONFIRMAR PEDIDO</>}</button>
              </div>
            </div>
          </div>
        )}

        {pedidoEnviado && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-green-500 rounded-2xl p-8 text-center max-w-sm mx-4"><CheckCircle size={64} className="mx-auto mb-4 text-white" /><h3 className="text-xl font-bold text-white mb-2">Pedido Enviado!</h3><p className="text-white/90">Seu pedido foi enviado para a cozinha. Você receberá a confirmação em breve.</p></div>
          </div>
        )}
      </div>
    </>
  );
}