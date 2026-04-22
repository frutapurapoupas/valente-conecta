'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, MapPin, Star, Filter, X, Package, 
  ChevronLeft, ShoppingCart, Heart, Store, 
  Phone, MessageCircle, CheckCircle, CreditCard, 
  Truck, Home, Calendar, Clock, Bell, Sparkles,
  Plus, Eye, EyeOff, UserPlus
} from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  quantidade: number
  unidade: string
  foto?: string
}

interface FormaPagamento {
  id: string
  nome: string
  icone: string
  aceita: boolean
  condicoes: string
}

interface Ambulante {
  id: string
  nome: string
  nomeFantasia: string
  cpf: string
  telefone: string
  localTrabalho: string
  referenciaLocal: string
  cidade: string
  bairro: string
  descricao: string
  status: 'trabalhando' | 'folgando' | 'ferias'
  produtos: Produto[]
  formasPagamento: FormaPagamento[]
  avaliacao: number
}

type FormaPagamentoCliente = 'dinheiro' | 'pix' | 'cartao'
type FormaEntrega = 'presencial' | 'delivery' | 'encomenda'

export default function AmbulantesPage() {
  const [ambulantes, setAmbulantes] = useState<Ambulante[]>([])
  const [filtrados, setFiltrados] = useState<Ambulante[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [showFilters, setShowFilters] = useState(false)
  const [carrinho, setCarrinho] = useState<{ ambulante: Ambulante; produto: Produto; quantidade: number }[]>([])
  const [showCarrinho, setShowCarrinho] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoCliente>('dinheiro')
  const [formaEntrega, setFormaEntrega] = useState<FormaEntrega>('presencial')
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [dataEntrega, setDataEntrega] = useState('')
  const [horarioEntrega, setHorarioEntrega] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null)

  // Carregar ambulantes do localStorage e API
  useEffect(() => {
    const carregarAmbulantes = () => {
      const todos: Ambulante[] = []
      
      // Carregar do localStorage
      const saved = localStorage.getItem('ambulante_dados')
      if (saved) {
        const dados = JSON.parse(saved)
        todos.push({
          id: 'cadastrado',
          nome: dados.dados.nome,
          nomeFantasia: dados.dados.nomeFantasia || '',
          cpf: dados.dados.cpf,
          telefone: dados.dados.telefone,
          localTrabalho: dados.dados.localTrabalho,
          referenciaLocal: dados.dados.referenciaLocal,
          cidade: dados.dados.cidade || 'Valente',
          bairro: dados.dados.bairro || 'Centro',
          descricao: dados.dados.descricao,
          status: dados.dados.status,
          produtos: dados.produtos,
          formasPagamento: dados.formasPagamento,
          avaliacao: 4.8
        })
      }
      
      // Mock data
      const mockAmbulantes: Ambulante[] = [
        { 
          id: '1', nome: 'Maria da Silva', nomeFantasia: 'Acarajé da Baiana', cpf: '123.456.789-00', telefone: '5575988880010',
          localTrabalho: 'Feira Livre - Box 15', referenciaLocal: 'Em frente à igreja matriz', cidade: 'Valente', bairro: 'Centro',
          descricao: 'Acarajé tradicional com vatapá, camarão e caruru', status: 'trabalhando',
          produtos: [{ id: 'p1', nome: 'Acarajé', descricao: 'Tradicional', preco: 12, quantidade: 50, unidade: 'unidade' }],
          formasPagamento: [{ id: 'dinheiro', nome: 'Dinheiro', icone: '💵', aceita: true, condicoes: 'À vista' }],
          avaliacao: 4.8
        },
        { 
          id: '2', nome: 'João Santos', nomeFantasia: 'Tapioca do João', cpf: '987.654.321-00', telefone: '5575988880011',
          localTrabalho: 'Praça Central', referenciaLocal: 'Em frente à sorveteria', cidade: 'Valente', bairro: 'Centro',
          descricao: 'Tapioca artesanal com diversos sabores', status: 'trabalhando',
          produtos: [{ id: 'p2', nome: 'Tapioca', descricao: 'Com recheio', preco: 8, quantidade: 30, unidade: 'unidade' }],
          formasPagamento: [{ id: 'pix', nome: 'PIX', icone: '📱', aceita: true, condicoes: 'À vista' }],
          avaliacao: 4.7
        }
      ]
      
      todos.push(...mockAmbulantes)
      setAmbulantes(todos)
      setFiltrados(todos)
    }
    
    carregarAmbulantes()
  }, [])

  // Filtrar
  useEffect(() => {
    let resultados = [...ambulantes]
    
    if (searchTerm) {
      const termo = searchTerm.toLowerCase()
      resultados = resultados.filter(a => 
        a.nome.toLowerCase().includes(termo) ||
        a.nomeFantasia.toLowerCase().includes(termo) ||
        a.localTrabalho.toLowerCase().includes(termo) ||
        a.bairro.toLowerCase().includes(termo) ||
        a.produtos.some(p => p.nome.toLowerCase().includes(termo))
      )
    }
    
    if (statusFiltro !== 'todos') {
      resultados = resultados.filter(a => a.status === statusFiltro)
    }
    
    setFiltrados(resultados)
  }, [searchTerm, statusFiltro, ambulantes])

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'trabalhando': return { label: '🟢 Trabalhando', cor: 'text-emerald-400', bg: 'bg-emerald-500/20' }
      case 'folgando': return { label: '🟡 Folgando', cor: 'text-yellow-400', bg: 'bg-yellow-500/20' }
      case 'ferias': return { label: '🔴 Férias', cor: 'text-red-400', bg: 'bg-red-500/20' }
      default: return { label: '⚪ Indisponível', cor: 'text-zinc-400', bg: 'bg-zinc-500/20' }
    }
  }

  const adicionarAoCarrinho = (ambulante: Ambulante, produto: Produto) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.produto.id === produto.id && item.ambulante.id === ambulante.id)
      if (existente) {
        return prev.map(item => 
          item.produto.id === produto.id && item.ambulante.id === ambulante.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prev, { ambulante, produto, quantidade: 1 }]
    })
  }

  const removerDoCarrinho = (produtoId: string, ambulanteId: string) => {
    setCarrinho(prev => prev.filter(item => !(item.produto.id === produtoId && item.ambulante.id === ambulanteId)))
  }

  const aumentarQuantidade = (produtoId: string, ambulanteId: string) => {
    setCarrinho(prev => prev.map(item => 
      item.produto.id === produtoId && item.ambulante.id === ambulanteId
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    ))
  }

  const diminuirQuantidade = (produtoId: string, ambulanteId: string) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === produtoId && item.ambulante.id === ambulanteId) {
        const novaQtd = item.quantidade - 1
        if (novaQtd <= 0) return null
        return { ...item, quantidade: novaQtd }
      }
      return item
    }).filter(Boolean) as typeof prev)
  }

  const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0)

  const finalizarPedido = () => {
    if (carrinho.length === 0) return
    if (!nomeCliente || !telefoneCliente) {
      alert('Preencha seu nome e telefone')
      return
    }
    if (formaEntrega === 'delivery' && !enderecoEntrega) {
      alert('Informe o endereço para entrega')
      return
    }

    setEnviando(true)

    const pedidoId = Math.random().toString(36).substring(2, 10).toUpperCase()
    const dataAtual = new Date().toLocaleString('pt-BR')

    const formasPagamentoMap = {
      dinheiro: '💵 Dinheiro',
      pix: '📱 PIX',
      cartao: '💳 Cartão'
    }

    const formasEntregaMap = {
      presencial: '🏪 Retirada presencial',
      delivery: '🚚 Delivery',
      encomenda: '📦 Encomenda'
    }

    setPedidoConfirmado({
      id: pedidoId,
      data: dataAtual,
      cliente: nomeCliente,
      telefone: telefoneCliente,
      itens: carrinho,
      total: totalCarrinho,
      formaPagamento: formasPagamentoMap[formaPagamento],
      formaEntrega: formasEntregaMap[formaEntrega],
      enderecoEntrega: enderecoEntrega || 'Retirada no local',
      dataEntrega: dataEntrega || 'Combinar com o vendedor',
      horarioEntrega: horarioEntrega || 'Combinar com o vendedor'
    })

    setEnviando(false)
    setShowCheckout(false)
    setShowCarrinho(false)
    setShowConfirmacao(true)
    setCarrinho([])
    
    setTimeout(() => {
      setShowConfirmacao(false)
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Ambulantes</h1>
          <div className="flex gap-2">
            <Link href="/ambulantes/cadastro" className="p-2 bg-yellow-500 text-black rounded-xl text-sm font-bold flex items-center gap-1">
              <UserPlus className="w-4 h-4" /> Cadastrar
            </Link>
            <button onClick={() => setShowCarrinho(true)} className="relative p-2 bg-zinc-800 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-yellow-400" />
              {carrinho.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {carrinho.reduce((s, i) => s + i.quantidade, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Busca e Filtros */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ambulante, produto ou bairro..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
          />
          <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter className={`w-5 h-5 ${showFilters ? 'text-yellow-400' : 'text-zinc-500'}`} />
          </button>
        </div>

        {/* Filtros de Status */}
        {showFilters && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500 font-bold uppercase">Status</label>
              <button onClick={() => setStatusFiltro('todos')} className="text-xs text-yellow-400">Limpar</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatusFiltro('todos')} className={`px-3 py-1 rounded-full text-xs font-bold ${statusFiltro === 'todos' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>Todos</button>
              <button onClick={() => setStatusFiltro('trabalhando')} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusFiltro === 'trabalhando' ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>🟢 Trabalhando</button>
              <button onClick={() => setStatusFiltro('folgando')} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusFiltro === 'folgando' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>🟡 Folgando</button>
              <button onClick={() => setStatusFiltro('ferias')} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusFiltro === 'ferias' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>🔴 Férias</button>
            </div>
          </div>
        )}

        {/* Lista de Ambulantes */}
        <div className="space-y-3">
          {filtrados.map(ambulante => {
            const statusInfo = getStatusInfo(ambulante.status)
            return (
              <div key={ambulante.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg">{ambulante.nomeFantasia || ambulante.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.cor}`}>{statusInfo.label}</span>
                      <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">{ambulante.avaliacao}</span></div>
                    </div>
                  </div>
                  <button className="p-1.5 bg-zinc-800 rounded-lg"><Heart className="w-4 h-4 text-zinc-500" /></button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-zinc-400 flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{ambulante.localTrabalho}</span></p>
                  {ambulante.referenciaLocal && <p className="text-xs text-zinc-500 ml-6">📍 {ambulante.referenciaLocal}</p>}
                  <p className="text-zinc-400 flex items-center gap-2"><Store className="w-4 h-4" /><span>{ambulante.bairro}, {ambulante.cidade}</span></p>
                </div>
                
                <p className="text-sm text-zinc-400 mt-2">{ambulante.descricao}</p>
                
                {/* Produtos */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-zinc-500 font-bold uppercase">Produtos</p>
                  {ambulante.produtos.map(produto => (
                    <div key={produto.id} className="bg-zinc-800/50 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-white">{produto.nome}</p>
                        <p className="text-xs text-zinc-400">{produto.descricao}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-400 font-bold">R$ {produto.preco.toFixed(2)}</span>
                          <span className="text-xs text-zinc-500">Estoque: {produto.quantidade}</span>
                        </div>
                      </div>
                      <button onClick={() => adicionarAoCarrinho(ambulante, produto)} className="px-3 py-1.5 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:bg-yellow-400 transition">
                        Comprar
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Formas de Pagamento */}
                {ambulante.formasPagamento && ambulante.formasPagamento.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">💳 Aceita: {ambulante.formasPagamento.map(f => `${f.icone} ${f.nome}`).join(', ')}</p>
                  </div>
                )}
              </div>
            )
          })}
          
          {filtrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Nenhum ambulante encontrado</p>
              <Link href="/ambulantes/cadastro" className="inline-block mt-4 px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm">
                Sou Ambulante → Cadastrar
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Modal do Carrinho */}
      {showCarrinho && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 w-full max-w-lg rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Seu Pedido</h3>
              <button onClick={() => setShowCarrinho(false)} className="p-2 hover:bg-zinc-800 rounded-xl"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-4 space-y-3">
              {carrinho.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">Nenhum item no pedido</p>
              ) : (
                <>
                  {carrinho.map(item => (
                    <div key={`${item.ambulante.id}_${item.produto.id}`} className="bg-zinc-800 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{item.produto.nome}</p>
                          <p className="text-xs text-zinc-400">{item.ambulante.nomeFantasia || item.ambulante.nome}</p>
                          <p className="text-yellow-400 text-sm">R$ {item.produto.preco.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => diminuirQuantidade(item.produto.id, item.ambulante.id)} className="w-8 h-8 bg-zinc-700 rounded-lg">-</button>
                          <span className="w-8 text-center font-bold">{item.quantidade}</span>
                          <button onClick={() => aumentarQuantidade(item.produto.id, item.ambulante.id)} className="w-8 h-8 bg-zinc-700 rounded-lg">+</button>
                          <button onClick={() => removerDoCarrinho(item.produto.id, item.ambulante.id)} className="w-8 h-8 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="text-white font-bold">Total:</span>
                      <span className="text-yellow-400 font-bold text-xl">R$ {totalCarrinho.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setShowCarrinho(false); setShowCheckout(true) }} className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold text-lg">Continuar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Finalizar Pedido</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-zinc-800 rounded-xl"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-white text-sm font-bold mb-2">Seu nome *</label><input type="text" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-2">WhatsApp *</label><input type="tel" value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>

              <div><label className="block text-white text-sm font-bold mb-3">Forma de Entrega</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setFormaEntrega('presencial')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaEntrega === 'presencial' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><Home className="w-5 h-5" /><span className="text-xs">Presencial</span></button>
                  <button onClick={() => setFormaEntrega('delivery')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaEntrega === 'delivery' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><Truck className="w-5 h-5" /><span className="text-xs">Delivery</span></button>
                  <button onClick={() => setFormaEntrega('encomenda')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaEntrega === 'encomenda' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><Calendar className="w-5 h-5" /><span className="text-xs">Encomenda</span></button>
                </div>
              </div>

              {formaEntrega === 'delivery' && (<div><label className="block text-white text-sm font-bold mb-2">Endereço para entrega</label><input type="text" value={enderecoEntrega} onChange={e => setEnderecoEntrega(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>)}

              {formaEntrega === 'encomenda' && (<div className="grid grid-cols-2 gap-3"><div><label className="block text-white text-sm font-bold mb-2">Data</label><input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div><div><label className="block text-white text-sm font-bold mb-2">Horário</label><input type="time" value={horarioEntrega} onChange={e => setHorarioEntrega(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div></div>)}

              <div><label className="block text-white text-sm font-bold mb-3">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setFormaPagamento('dinheiro')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'dinheiro' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">💵</span><span className="text-xs">Dinheiro</span></button>
                  <button onClick={() => setFormaPagamento('pix')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'pix' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">📱</span><span className="text-xs">PIX</span></button>
                  <button onClick={() => setFormaPagamento('cartao')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'cartao' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">💳</span><span className="text-xs">Cartão</span></button>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-xl p-4"><p className="text-yellow-400 font-bold text-sm mb-2">Resumo</p>{carrinho.map((item, idx) => (<div key={idx} className="flex justify-between text-sm"><span>{item.quantidade}x {item.produto.nome}</span><span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span></div>))}<div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between"><span className="font-bold">Total</span><span className="text-yellow-400 font-bold">R$ {totalCarrinho.toFixed(2)}</span></div></div>

              <button onClick={finalizarPedido} disabled={enviando} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {enviando ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <CheckCircle className="w-5 h-5" />}
                {enviando ? 'Processando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmacao && pedidoConfirmado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="relative p-6 text-center"><div className="absolute inset-0 bg-white/10 animate-pulse"></div><div className="relative z-10"><div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><CheckCircle className="w-12 h-12 text-emerald-600" /></div><h2 className="text-2xl font-black text-white mb-2">Pedido Realizado! 🎉</h2><p className="text-white/80 text-sm">Seu pedido foi enviado com sucesso</p></div></div>
            <div className="bg-white/10 p-5 space-y-3">
              <div className="bg-white/20 rounded-xl p-3 text-center"><p className="text-white/80 text-xs">Código do pedido</p><p className="text-white font-mono font-bold text-sm">{pedidoConfirmado.id}</p></div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-white/80 text-xs mb-2">📋 Itens do pedido</p>{pedidoConfirmado.itens.map((item: any, idx: number) => (<div key={idx} className="flex justify-between text-white text-sm"><span>{item.quantidade}x {item.produto.nome}</span><span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span></div>))}<div className="border-t border-white/20 mt-2 pt-2 flex justify-between"><span className="text-white font-bold">Total</span><span className="text-yellow-300 font-bold">R$ {pedidoConfirmado.total.toFixed(2)}</span></div></div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-white/80 text-xs mb-2">🚚 Entrega</p><p className="text-white text-sm">{pedidoConfirmado.formaEntrega}</p>{pedidoConfirmado.enderecoEntrega !== 'Retirada no local' && <p className="text-white/70 text-xs mt-1">📍 {pedidoConfirmado.enderecoEntrega}</p>}</div>
              <div className="bg-white/20 rounded-xl p-3"><p className="text-white/80 text-xs mb-2">💳 Pagamento</p><p className="text-white text-sm">{pedidoConfirmado.formaPagamento}</p></div>
              <div className="flex items-center justify-center gap-2 text-white/70 text-xs"><Bell className="w-3 h-3" /><span>O ambulante será notificado</span></div>
            </div>
            <div className="p-4 pt-0"><button onClick={() => setShowConfirmacao(false)} className="w-full py-3 bg-white/20 rounded-xl text-white font-bold">Fechar</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}