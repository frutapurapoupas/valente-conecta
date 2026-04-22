'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, MapPin, Star, Filter, X, Package as PackageIcon, 
  ChevronLeft, ShoppingCart, Heart, Store, Minus, Plus, 
  RefreshCw, Briefcase, Wrench, Scissors, Stethoscope, 
  GraduationCap, Coffee, Truck, CheckCircle, Bell, Sparkles,
  CreditCard, Smartphone, Wallet, Home, Calendar, Clock,
  User, Building2, Bike
} from 'lucide-react'

// Interface unificada para todos os tipos de produtos/serviços
interface ProdutoUnificado {
  id: string
  nome: string
  descricao: string
  preco: number
  precoOriginal?: number
  foto?: string
  unidade: string
  categoria: string
  segmento: string
  profissionalId: string
  profissionalNome: string
  profissionalTipo: 'empresa' | 'profissional' | 'ambulante'
  profissionalCidade: string
  profissionalBairro: string
  profissionalEndereco: string
  profissionalTelefone: string
  profissionalWhatsapp: string
  profissionalStatus?: string
  avaliacao?: number
  emPromocao?: boolean
  quantidade?: number
}

// Configuração dos segmentos
const segmentos = {
  'mercado': { label: 'Mercado', icone: Store, cor: 'from-green-500 to-emerald-500' },
  'alimentos': { label: 'Alimentação', icone: Coffee, cor: 'from-orange-500 to-red-500' },
  'construcao': { label: 'Construção', icone: Wrench, cor: 'from-yellow-500 to-amber-500' },
  'beleza': { label: 'Beleza', icone: Scissors, cor: 'from-pink-500 to-rose-500' },
  'saude': { label: 'Saúde', icone: Stethoscope, cor: 'from-blue-500 to-cyan-500' },
  'educacao': { label: 'Educação', icone: GraduationCap, cor: 'from-purple-500 to-indigo-500' },
  'servicos': { label: 'Serviços', icone: Briefcase, cor: 'from-slate-500 to-gray-500' },
  'automotivo': { label: 'Automotivo', icone: Truck, cor: 'from-red-500 to-orange-500' },
  'ambulante': { label: 'Ambulante', icone: Bike, cor: 'from-yellow-500 to-amber-500' }
}

const unidadesMap: Record<string, { label: string; abreviacao: string; icone: string }> = {
  'unidade': { label: 'Unidade', abreviacao: 'un', icone: '📦' },
  'metro': { label: 'Metro', abreviacao: 'm', icone: '📏' },
  'metro_quadrado': { label: 'Metro²', abreviacao: 'm²', icone: '📐' },
  'diaria': { label: 'Diária', abreviacao: 'dia', icone: '📅' },
  'empreita': { label: 'Empreita', abreviacao: 'serv', icone: '📝' },
  'hora': { label: 'Hora', abreviacao: 'h', icone: '⏰' },
  'kg': { label: 'Kg', abreviacao: 'kg', icone: '⚖️' },
  'litro': { label: 'Litro', abreviacao: 'L', icone: '💧' },
  'servico': { label: 'Serviço', abreviacao: 'serv', icone: '🛠️' },
  'porcao': { label: 'Porção', abreviacao: 'por', icone: '🍽️' },
  'centena': { label: 'Centena', abreviacao: 'cen', icone: '🔢' }
}

type FormaPagamento = 'dinheiro' | 'pix' | 'cartao' | 'fiado'
type FormaEntrega = 'presencial' | 'delivery' | 'encomenda'

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<ProdutoUnificado[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoUnificado[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [cidadeSelecionada, setCidadeSelecionada] = useState('todas')
  const [segmentoSelecionado, setSegmentoSelecionado] = useState('todos')
  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [ordenacao, setOrdenacao] = useState('relevancia')
  const [modoVisualizacao, setModoVisualizacao] = useState<'produtos' | 'profissionais'>('produtos')
  const [loading, setLoading] = useState(true)
  const [carrinho, setCarrinho] = useState<{ produto: ProdutoUnificado; quantidade: number }[]>([])
  const [showCarrinho, setShowCarrinho] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro')
  const [formaEntrega, setFormaEntrega] = useState<FormaEntrega>('presencial')
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [dataEntrega, setDataEntrega] = useState('')
  const [horarioEntrega, setHorarioEntrega] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null)
  const [favoritos, setFavoritos] = useState<string[]>([])

  // Carregar produtos de todas as fontes
  useEffect(() => {
    const carregarProdutos = () => {
      const todosProdutos: ProdutoUnificado[] = []
      
      // 1. Carregar profissionais (serviços)
      const profissionalData = localStorage.getItem('profissional_dados_profissional')
      if (profissionalData) {
        const dados = JSON.parse(profissionalData)
        if (dados.itens && dados.itens.length > 0) {
          dados.itens.forEach((item: any) => {
            todosProdutos.push({
              id: `prof_${item.id}`,
              nome: item.nome,
              descricao: item.descricao || '',
              preco: item.preco,
              unidade: item.unidade || 'servico',
              categoria: 'Serviços',
              segmento: 'servicos',
              profissionalId: 'profissional',
              profissionalNome: dados.dados.nome,
              profissionalTipo: 'profissional',
              profissionalCidade: dados.dados.cidade || 'Valente',
              profissionalBairro: dados.dados.bairro || 'Centro',
              profissionalEndereco: dados.dados.endereco || '',
              profissionalTelefone: dados.dados.telefone,
              profissionalWhatsapp: dados.dados.telefone,
              avaliacao: 4.5
            })
          })
        }
      }
      
      // 2. Carregar empresas (produtos)
      const empresaData = localStorage.getItem('profissional_dados_empresa')
      if (empresaData) {
        const dados = JSON.parse(empresaData)
        if (dados.itens && dados.itens.length > 0) {
          dados.itens.forEach((item: any) => {
            todosProdutos.push({
              id: `emp_${item.id}`,
              nome: item.nome,
              descricao: item.descricao || '',
              preco: item.preco,
              unidade: item.unidade || 'unidade',
              categoria: 'Produtos',
              segmento: 'mercado',
              profissionalId: 'empresa',
              profissionalNome: dados.dados.nomeFantasia || dados.dados.nome,
              profissionalTipo: 'empresa',
              profissionalCidade: dados.dados.cidade || 'Valente',
              profissionalBairro: dados.dados.bairro || 'Centro',
              profissionalEndereco: dados.dados.endereco || '',
              profissionalTelefone: dados.dados.telefone,
              profissionalWhatsapp: dados.dados.telefone,
              avaliacao: 4.5
            })
          })
        }
      }
      
      // 3. Carregar ambulantes
      const ambulanteData = localStorage.getItem('ambulante_dados')
      if (ambulanteData) {
        const dados = JSON.parse(ambulanteData)
        if (dados.produtos && dados.produtos.length > 0) {
          dados.produtos.forEach((item: any) => {
            todosProdutos.push({
              id: `amb_${item.id}`,
              nome: item.nome,
              descricao: item.descricao || '',
              preco: item.preco,
              quantidade: item.quantidade,
              unidade: item.unidade || 'unidade',
              categoria: 'Alimentos',
              segmento: 'ambulante',
              profissionalId: 'ambulante',
              profissionalNome: dados.dados.nomeFantasia || dados.dados.nome,
              profissionalTipo: 'ambulante',
              profissionalCidade: dados.dados.cidade || 'Valente',
              profissionalBairro: dados.dados.bairro || 'Centro',
              profissionalEndereco: dados.dados.localTrabalho || '',
              profissionalTelefone: dados.dados.telefone,
              profissionalWhatsapp: dados.dados.telefone,
              profissionalStatus: dados.dados.status,
              avaliacao: 4.5
            })
          })
        }
      }
      
      // 4. Produtos mock para demonstração
      if (todosProdutos.length === 0) {
        const mockProdutos: ProdutoUnificado[] = [
          { id: '1', nome: 'Arroz 5kg', descricao: 'Arroz branco tipo 1', preco: 25.90, unidade: 'unidade', categoria: 'Alimentos', segmento: 'mercado', profissionalId: 'mock', profissionalNome: 'Mercado Central', profissionalTipo: 'empresa', profissionalCidade: 'Valente', profissionalBairro: 'Centro', profissionalEndereco: 'Rua Principal, 100', profissionalTelefone: '(75) 98888-1111', profissionalWhatsapp: '5575988881111', avaliacao: 4.8 },
          { id: '2', nome: 'Corte de Cabelo', descricao: 'Corte masculino completo', preco: 45.00, unidade: 'servico', categoria: 'Beleza', segmento: 'beleza', profissionalId: 'mock2', profissionalNome: 'Barbearia do João', profissionalTipo: 'profissional', profissionalCidade: 'Valente', profissionalBairro: 'Centro', profissionalEndereco: 'Av. Principal, 200', profissionalTelefone: '(75) 98888-2222', profissionalWhatsapp: '5575988882222', avaliacao: 4.9 },
          { id: '3', nome: 'Acarajé', descricao: 'Acarajé tradicional', preco: 12.00, unidade: 'unidade', categoria: 'Alimentos', segmento: 'ambulante', profissionalId: 'mock3', profissionalNome: 'Acarajé da Baiana', profissionalTipo: 'ambulante', profissionalCidade: 'Valente', profissionalBairro: 'Centro', profissionalEndereco: 'Feira Livre - Box 15', profissionalTelefone: '(75) 98888-3333', profissionalWhatsapp: '5575988883333', avaliacao: 4.8 }
        ]
        todosProdutos.push(...mockProdutos)
      }
      
      setProdutos(todosProdutos)
      setProdutosFiltrados(todosProdutos)
      setLoading(false)
    }
    
    carregarProdutos()
  }, [])

  // Filtrar produtos
  useEffect(() => {
    let resultados = [...produtos]
    
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase()
      resultados = resultados.filter(p => 
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo) ||
        p.profissionalNome.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo)
      )
    }
    
    if (cidadeSelecionada !== 'todas') {
      resultados = resultados.filter(p => p.profissionalCidade === cidadeSelecionada)
    }
    
    if (segmentoSelecionado !== 'todos') {
      resultados = resultados.filter(p => p.segmento === segmentoSelecionado)
    }
    
    if (precoMin) resultados = resultados.filter(p => p.preco >= parseFloat(precoMin))
    if (precoMax) resultados = resultados.filter(p => p.preco <= parseFloat(precoMax))
    
    if (ordenacao === 'preco_menor') resultados.sort((a, b) => a.preco - b.preco)
    if (ordenacao === 'preco_maior') resultados.sort((a, b) => b.preco - a.preco)
    if (ordenacao === 'avaliacao') resultados.sort((a, b) => (b.avaliacao || 0) - (a.avaliacao || 0))
    
    setProdutosFiltrados(resultados)
  }, [searchTerm, cidadeSelecionada, segmentoSelecionado, precoMin, precoMax, ordenacao, produtos])

  // Agrupar por profissional/loja
  const profissionaisAgrupados = produtosFiltrados.reduce((acc, produto) => {
    if (!acc[produto.profissionalId]) {
      acc[produto.profissionalId] = {
        id: produto.profissionalId,
        nome: produto.profissionalNome,
        tipo: produto.profissionalTipo,
        cidade: produto.profissionalCidade,
        bairro: produto.profissionalBairro,
        endereco: produto.profissionalEndereco,
        telefone: produto.profissionalTelefone,
        segmento: produto.segmento,
        produtos: [],
        avaliacao: produto.avaliacao
      }
    }
    acc[produto.profissionalId].produtos.push(produto)
    return acc
  }, {} as Record<string, any>)

  const cidades = ['todas', ...new Set(produtos.map(p => p.profissionalCidade).filter(Boolean))]

  // Carrinho
  const adicionarAoCarrinho = (produto: ProdutoUnificado) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.produto.id === produto.id)
      if (existente) {
        return prev.map(item => 
          item.produto.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prev, { produto, quantidade: 1 }]
    })
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId))
  }

  const aumentarQuantidade = (produtoId: string) => {
    setCarrinho(prev => prev.map(item => 
      item.produto.id === produtoId 
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    ))
  }

  const diminuirQuantidade = (produtoId: string) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === produtoId) {
        const novaQtd = item.quantidade - 1
        if (novaQtd <= 0) return null
        return { ...item, quantidade: novaQtd }
      }
      return item
    }).filter(Boolean) as typeof prev)
  }

  const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0)

  // Agrupar carrinho por loja
  const carrinhoPorLoja = carrinho.reduce((acc, item) => {
    const lojaId = item.produto.profissionalId
    if (!acc[lojaId]) {
      acc[lojaId] = {
        nome: item.produto.profissionalNome,
        telefone: item.produto.profissionalWhatsapp,
        itens: []
      }
    }
    acc[lojaId].itens.push(item)
    return acc
  }, {} as Record<string, any>)

  const finalizarPedido = () => {
    if (carrinho.length === 0) return
    if (!nomeCliente || !telefoneCliente) {
      alert('Preencha seu nome e telefone')
      return
    }

    setEnviando(true)

    const pedidoId = Math.random().toString(36).substring(2, 10).toUpperCase()
    const dataAtual = new Date().toLocaleString('pt-BR')

    const formasPagamentoMap = {
      dinheiro: '💵 Dinheiro',
      pix: '📱 PIX',
      cartao: '💳 Cartão',
      fiado: '📝 Fiado'
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
      horarioEntrega: horarioEntrega || 'Combinar com o vendedor',
      lojas: Object.values(carrinhoPorLoja).map((l: any) => ({ nome: l.nome, telefone: l.telefone }))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Catálogo</h1>
          <div className="flex gap-2">
            <button onClick={() => setModoVisualizacao(modoVisualizacao === 'produtos' ? 'profissionais' : 'produtos')} className="px-3 py-2 bg-zinc-800 rounded-xl text-xs font-bold">
              {modoVisualizacao === 'produtos' ? 'Ver por Lojas' : 'Ver por Produtos'}
            </button>
            <button onClick={() => window.location.reload()} className="p-2 bg-zinc-800 rounded-xl">
              <RefreshCw className="w-5 h-5 text-zinc-400" />
            </button>
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
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos, serviços ou lojas... (ex: arroz, corte, mecânico)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
          />
          <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter className={`w-5 h-5 ${showFilters ? 'text-yellow-400' : 'text-zinc-500'}`} />
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Filtros</h3>
              <button onClick={() => {
                setCidadeSelecionada('todas')
                setSegmentoSelecionado('todos')
                setPrecoMin('')
                setPrecoMax('')
                setOrdenacao('relevancia')
                setSearchTerm('')
              }} className="text-xs text-yellow-400">Limpar</button>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Segmentos</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(segmentos).map(([key, seg]) => {
                  const Icon = seg.icone
                  return (
                    <button
                      key={key}
                      onClick={() => setSegmentoSelecionado(segmentoSelecionado === key ? 'todos' : key)}
                      className={`p-2 rounded-xl text-center transition-all ${segmentoSelecionado === key ? `bg-gradient-to-r ${seg.cor} text-white` : 'bg-zinc-800 text-zinc-400'}`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-[10px] font-bold">{seg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Cidade</label>
              <div className="flex gap-2 flex-wrap">
                {cidades.map(cidade => (
                  <button key={cidade} onClick={() => setCidadeSelecionada(cidade)} className={`px-3 py-1 rounded-full text-xs font-bold ${cidadeSelecionada === cidade ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    {cidade === 'todas' ? 'Todas' : cidade}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Preço min</label><input type="number" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} placeholder="0" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Preço max</label><input type="number" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} placeholder="1000" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white" /></div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Ordenar por</label>
              <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white">
                <option value="relevancia">Relevância</option>
                <option value="preco_menor">Menor preço</option>
                <option value="preco_maior">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
              </select>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{modoVisualizacao === 'produtos' ? produtosFiltrados.length : Object.keys(profissionaisAgrupados).length} itens encontrados</p>
          
          {modoVisualizacao === 'produtos' ? (
            // Visualização por produtos
            produtosFiltrados.map(produto => {
              const SegmentIcon = segmentos[produto.segmento as keyof typeof segmentos]?.icone || Briefcase
              return (
                <div key={produto.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-all">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                      <SegmentIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{produto.nome}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs">{produto.avaliacao?.toFixed(1)}</span></div>
                        <div className="flex items-center gap-1"><Store className="w-3 h-3 text-emerald-400" /><span className="text-xs">{produto.profissionalNome}</span></div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" /><span>{produto.profissionalCidade}, {produto.profissionalBairro}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{produto.descricao}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-xl font-black text-yellow-400">R$ {produto.preco.toFixed(2)}</span>
                          <span className="text-xs text-zinc-500 ml-2">{unidadesMap[produto.unidade]?.icone} {unidadesMap[produto.unidade]?.abreviacao}</span>
                        </div>
                        <button onClick={() => adicionarAoCarrinho(produto)} className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" /> Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            // Visualização por lojas/profissionais
            Object.values(profissionaisAgrupados).map((prof: any) => {
              const SegmentIcon = segmentos[prof.segmento as keyof typeof segmentos]?.icone || Store
              const precoMinimo = Math.min(...prof.produtos.map((p: any) => p.preco))
              return (
                <div key={prof.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3 mb-3 pb-3 border-b border-zinc-800">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                      <SegmentIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{prof.nome}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" /><span>{prof.cidade}, {prof.bairro}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 ml-2" /><span>{prof.avaliacao?.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{prof.endereco}</p>
                    </div>
                    <button className="px-3 py-1 bg-green-600 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> Contatar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {prof.produtos.slice(0, 3).map((produto: ProdutoUnificado) => (
                      <div key={produto.id} className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
                        <div><p className="text-white text-sm">{produto.nome}</p><p className="text-xs text-zinc-500">{unidadesMap[produto.unidade]?.label}</p></div>
                        <div className="text-right"><p className="text-yellow-400 font-bold">R$ {produto.preco.toFixed(2)}</p><button onClick={() => adicionarAoCarrinho(produto)} className="text-xs text-blue-400 mt-1">Comprar</button></div>
                      </div>
                    ))}
                    {prof.produtos.length > 3 && <p className="text-xs text-zinc-500 text-center">+{prof.produtos.length - 3} itens</p>}
                  </div>
                </div>
              )
            })
          )}
          
          {produtosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <PackageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal do Carrinho */}
      {showCarrinho && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 w-full max-w-lg rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Carrinho ({carrinho.reduce((s, i) => s + i.quantidade, 0)} itens)</h3>
              <button onClick={() => setShowCarrinho(false)} className="p-2 hover:bg-zinc-800 rounded-xl"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-4 space-y-3">
              {carrinho.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">Seu carrinho está vazio</p>
              ) : (
                <>
                  {carrinho.map(item => (
                    <div key={item.produto.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3">
                      <div className="flex-1">
                        <p className="font-bold text-white">{item.produto.nome}</p>
                        <p className="text-yellow-400 text-sm">R$ {item.produto.preco.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500">{item.produto.profissionalNome}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => diminuirQuantidade(item.produto.id)} className="w-8 h-8 bg-zinc-700 rounded-lg"><Minus className="w-4 h-4 text-white" /></button>
                        <span className="w-8 text-center font-bold">{item.quantidade}</span>
                        <button onClick={() => aumentarQuantidade(item.produto.id)} className="w-8 h-8 bg-zinc-700 rounded-lg"><Plus className="w-4 h-4 text-white" /></button>
                        <button onClick={() => removerDoCarrinho(item.produto.id)} className="w-8 h-8 bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="text-white font-bold text-lg">Total:</span>
                      <span className="text-yellow-400 font-bold text-2xl">R$ {totalCarrinho.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setShowCarrinho(false); setShowCheckout(true) }} className="w-full py-4 bg-yellow-500 text-black rounded-xl font-bold text-lg">
                      Continuar para Checkout
                    </button>
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
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setFormaPagamento('dinheiro')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'dinheiro' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">💵</span><span className="text-xs">Dinheiro</span></button>
                  <button onClick={() => setFormaPagamento('pix')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'pix' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">📱</span><span className="text-xs">PIX</span></button>
                  <button onClick={() => setFormaPagamento('cartao')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'cartao' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">💳</span><span className="text-xs">Cartão</span></button>
                  <button onClick={() => setFormaPagamento('fiado')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 ${formaPagamento === 'fiado' ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700'}`}><span className="text-lg">📝</span><span className="text-xs">Fiado</span></button>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-xl p-4">
                <p className="text-yellow-400 font-bold text-sm mb-2">Resumo do Pedido</p>
                {carrinho.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.quantidade}x {item.produto.nome}</span>
                    <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-yellow-400 font-bold text-lg">R$ {totalCarrinho.toFixed(2)}</span>
                </div>
              </div>

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
            <div className="relative p-6 text-center">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Pedido Realizado! 🎉</h2>
                <p className="text-white/80 text-sm">Seu pedido foi enviado com sucesso</p>
              </div>
            </div>
            <div className="bg-white/10 p-5 space-y-3">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-white/80 text-xs">Código do pedido</p>
                <p className="text-white font-mono font-bold text-sm">{pedidoConfirmado.id}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-white/80 text-xs mb-2">📋 Itens do pedido</p>
                {pedidoConfirmado.itens.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-white text-sm">
                    <span>{item.quantidade}x {item.produto.nome}</span>
                    <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-white/20 mt-2 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-yellow-300 font-bold">R$ {pedidoConfirmado.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-white/80 text-xs mb-2">🚚 Entrega</p>
                <p className="text-white text-sm">{pedidoConfirmado.formaEntrega}</p>
                {pedidoConfirmado.enderecoEntrega !== 'Retirada no local' && <p className="text-white/70 text-xs mt-1">📍 {pedidoConfirmado.enderecoEntrega}</p>}
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-white/80 text-xs mb-2">💳 Pagamento</p>
                <p className="text-white text-sm">{pedidoConfirmado.formaPagamento}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
                <Bell className="w-3 h-3" />
                <span>As lojas serão notificadas</span>
              </div>
            </div>
            <div className="p-4 pt-0">
              <button onClick={() => setShowConfirmacao(false)} className="w-full py-3 bg-white/20 rounded-xl text-white font-bold">Fechar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}