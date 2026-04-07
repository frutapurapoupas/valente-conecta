'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, ShoppingCart, User, CheckCircle, Package, Search, Barcode, Bluetooth, WifiOff, Loader2 } from 'lucide-react'

interface ProdutoVenda {
  id: string
  nome: string
  codigo: string
  preco: number | null
  quantidade: number
  foto?: string
  estoque?: number
  status?: 'ativo' | 'pendente_validacao'
}

interface ProdutoSugestao {
  id: string
  nome: string
  codigo: string
  preco: number | null
  foto?: string
  relevancia: number
}

export default function VendaBuscaPage() {
  // Estados principais
  const [carrinho, setCarrinho] = useState<ProdutoVenda[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'pix' | 'cartao' | 'fiado' | 'conecta'>('dinheiro')
  const [showFiadoModal, setShowFiadoModal] = useState(false)
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '' })
  const [mensagem, setMensagem] = useState('')
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoVenda[]>([])
  
  // Estados da busca
  const [buscaTermo, setBuscaTermo] = useState('')
  const [sugestoes, setSugestoes] = useState<ProdutoSugestao[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [modoEntrada, setModoEntrada] = useState<'nome' | 'codigo'>('nome')
  const [leitorExterno, setLeitorExterno] = useState(false)
  const [leitorConectado, setLeitorConectado] = useState(false)
  const [produtoPendente, setProdutoPendente] = useState<ProdutoSugestao | null>(null)
  const [precoTemp, setPrecoTemp] = useState('')
  const [quantidadeTemp, setQuantidadeTemp] = useState('1')
  const [fiadoRegistrado, setFiadoRegistrado] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    carregarProdutos()
    const leitorSalvo = localStorage.getItem('leitor_externo_conectado')
    if (leitorSalvo === 'true') {
      setLeitorConectado(true)
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutosDisponiveis(JSON.parse(saved))
    } else {
      const produtosExemplo: ProdutoVenda[] = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, quantidade: 0, estoque: 50, status: 'ativo' },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, quantidade: 0, estoque: 30, status: 'ativo' },
        { id: '3', nome: 'Açúcar Cristal 1kg', codigo: '7891234567892', preco: 4.50, quantidade: 0, estoque: 100, status: 'ativo' },
        { id: '4', nome: 'Café Torrado 500g', codigo: '7891234567893', preco: 12.90, quantidade: 0, estoque: 25, status: 'ativo' },
        { id: '5', nome: 'Óleo de Soja 900ml', codigo: '7891234567894', preco: 6.90, quantidade: 0, estoque: 40, status: 'ativo' },
      ]
      setProdutosDisponiveis(produtosExemplo)
      localStorage.setItem('produtos_estoque', JSON.stringify(produtosExemplo))
    }
  }

  const buscarSugestoes = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setSugestoes([])
      setMostrarSugestoes(false)
      return
    }
    setBuscando(true)
    try {
      const saved = localStorage.getItem('produtos_estoque')
      const todosProdutos = saved ? JSON.parse(saved) : []
      const resultados = todosProdutos
        .filter((p: any) => p.nome.toLowerCase().includes(termo.toLowerCase()))
        .map((p: any) => ({
          ...p,
          relevancia: p.nome.toLowerCase().startsWith(termo.toLowerCase()) ? 100 : 50
        }))
        .sort((a: any, b: any) => b.relevancia - a.relevancia)
        .slice(0, 8)
      setSugestoes(resultados)
      setMostrarSugestoes(resultados.length > 0)
    } catch (error) {
      console.error(error)
    } finally {
      setBuscando(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => buscarSugestoes(buscaTermo), 300)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [buscaTermo, buscarSugestoes])

  const selecionarProduto = (produto: ProdutoSugestao) => {
    if (!produto.preco || produto.preco === 0) {
      setProdutoPendente(produto)
      setPrecoTemp('')
      setQuantidadeTemp('1')
      setMensagem(`⚠️ Produto "${produto.nome}" não tem preço definido.`)
      setMostrarSugestoes(false)
      setBuscaTermo('')
      return
    }
    adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      codigo: produto.codigo,
      preco: produto.preco,
      quantidade: 1,
      estoque: produto.estoque || 0,
      status: 'ativo'
    })
    setBuscaTermo('')
    setMostrarSugestoes(false)
    setMensagem(`✅ ${produto.nome} adicionado!`)
    setTimeout(() => setMensagem(''), 2000)
    if (inputRef.current) inputRef.current.focus()
  }

  const cadastrarNovoProduto = () => {
    if (!buscaTermo.trim()) {
      alert('Digite o nome do produto primeiro')
      return
    }
    const ean = prompt('Digite o código de barras (EAN) do produto (ou deixe em branco):', '')
    const novoProduto: ProdutoVenda = {
      id: Date.now().toString(),
      nome: buscaTermo.trim(),
      codigo: ean || '',
      preco: null,
      quantidade: 0,
      estoque: 0,
      status: 'pendente_validacao'
    }
    const produtosAtualizados = [...produtosDisponiveis, novoProduto]
    setProdutosDisponiveis(produtosAtualizados)
    localStorage.setItem('produtos_estoque', JSON.stringify(produtosAtualizados))
    
    const notificacoes = localStorage.getItem('notificacoes_admin')
    const listaNotificacoes = notificacoes ? JSON.parse(notificacoes) : []
    listaNotificacoes.push({
      id: Date.now(),
      tipo: 'validacao_produto',
      produto_nome: buscaTermo.trim(),
      produto_codigo: ean || 'não informado',
      data: new Date().toISOString(),
      lida: false
    })
    localStorage.setItem('notificacoes_admin', JSON.stringify(listaNotificacoes))
    
    setProdutoPendente(novoProduto)
    setPrecoTemp('')
    setQuantidadeTemp('1')
    setMensagem(`📦 Produto "${buscaTermo.trim()}" criado. Informe o preço.`)
    setBuscaTermo('')
    setMostrarSugestoes(false)
  }

  const salvarProdutoCompleto = () => {
    if (!precoTemp || parseFloat(precoTemp) <= 0) {
      alert('Informe um preço válido')
      return
    }
    const quantidade = parseInt(quantidadeTemp) || 1
    const produtosAtualizados = produtosDisponiveis.map(p => 
      p.id === produtoPendente?.id 
        ? { ...p, preco: parseFloat(precoTemp), estoque: 0, status: 'ativo' as const }
        : p
    )
    setProdutosDisponiveis(produtosAtualizados)
    localStorage.setItem('produtos_estoque', JSON.stringify(produtosAtualizados))
    adicionarAoCarrinho({
      id: produtoPendente!.id,
      nome: produtoPendente!.nome,
      codigo: produtoPendente!.codigo,
      preco: parseFloat(precoTemp),
      quantidade: quantidade,
      estoque: 0,
      status: 'pendente_validacao'
    })
    setProdutoPendente(null)
    setMensagem(`✅ ${produtoPendente!.nome} adicionado!`)
    setTimeout(() => setMensagem(''), 2000)
  }

  const toggleLeitorExterno = () => {
    if (!leitorExterno) {
      setLeitorExterno(true)
      setMensagem('🔍 Modo leitor externo ativado...')
      setTimeout(() => {
        setLeitorConectado(true)
        localStorage.setItem('leitor_externo_conectado', 'true')
        setMensagem('✅ Leitor externo conectado!')
      }, 1500)
    } else {
      setLeitorExterno(false)
      setLeitorConectado(false)
      localStorage.setItem('leitor_externo_conectado', 'false')
      setMensagem('📱 Modo manual ativado')
    }
  }

  const adicionarAoCarrinho = (produto: ProdutoVenda) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id)
      if (existente) {
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + produto.quantidade }
            : item
        )
      }
      return [...prev, produto]
    })
  }

  const atualizarQuantidade = (id: string, delta: number) => {
    setCarrinho(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const novaQuantidade = item.quantidade + delta
          if (novaQuantidade <= 0) return null
          return { ...item, quantidade: novaQuantidade }
        }
        return item
      }).filter(Boolean) as ProdutoVenda[]
    })
  }

  const removerItem = (id: string) => {
    setCarrinho(prev => prev.filter(item => item.id !== id))
  }

  const calcularTotal = () => {
    return carrinho.reduce((sum, item) => sum + ((item.preco || 0) * item.quantidade), 0)
  }

  const limparCarrinho = () => {
    if (confirm('Limpar carrinho?')) {
      setCarrinho([])
      setMensagem('Carrinho limpo')
    }
  }

  // Função que abre o checkout - o fiado será tratado no checkout
  const abrirCheckout = () => {
    setShowCheckout(true)
  }

  const finalizarVenda = () => {
    // Verifica se é fiado
    if (formaPagamento === 'fiado') {
      setShowFiadoModal(true)
    } else {
      const total = calcularTotal()
      alert(`✅ Venda finalizada!\nTotal: R$ ${total.toFixed(2)}\nPagamento: ${formaPagamento.toUpperCase()}`)
      
      // Atualizar estoque
      const estoqueAtual = localStorage.getItem('produtos_estoque')
      if (estoqueAtual) {
        const produtos = JSON.parse(estoqueAtual)
        carrinho.forEach(item => {
          const produtoIndex = produtos.findIndex((p: any) => p.id === item.id)
          if (produtoIndex !== -1) {
            produtos[produtoIndex].estoque -= item.quantidade
          }
        })
        localStorage.setItem('produtos_estoque', JSON.stringify(produtos))
      }
      
      resetarVenda()
    }
  }

  const registrarFiado = () => {
    if (!clienteInfo.nome.trim() || !clienteInfo.telefone.trim()) {
      alert('Preencha nome e telefone do cliente')
      return
    }
    
    const total = calcularTotal()
    if (total <= 0) {
      alert('Carrinho vazio')
      return
    }
    
    const vendaFiada = {
      id: Date.now().toString(),
      clienteNome: clienteInfo.nome,
      clienteTelefone: clienteInfo.telefone,
      valor: total,
      data: new Date().toISOString(),
      vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pendente',
      itens: [...carrinho]
    }
    
    const vendasFiadas = localStorage.getItem('vendas_fiadas')
    const listaVendas = vendasFiadas ? JSON.parse(vendasFiadas) : []
    listaVendas.push(vendaFiada)
    localStorage.setItem('vendas_fiadas', JSON.stringify(listaVendas))
    
    // Atualizar estoque
    const estoqueAtual = localStorage.getItem('produtos_estoque')
    if (estoqueAtual) {
      const produtos = JSON.parse(estoqueAtual)
      carrinho.forEach(item => {
        const produtoIndex = produtos.findIndex((p: any) => p.id === item.id)
        if (produtoIndex !== -1) {
          produtos[produtoIndex].estoque -= item.quantidade
        }
      })
      localStorage.setItem('produtos_estoque', JSON.stringify(produtos))
    }
    
    alert(`✅ Venda no fiado registrada!\nCliente: ${clienteInfo.nome}\nTotal: R$ ${total.toFixed(2)}\nVence em 30 dias`)
    
    setFiadoRegistrado(true)
    setShowFiadoModal(false)
    setClienteInfo({ nome: '', telefone: '' })
    resetarVenda()
    setTimeout(() => setFiadoRegistrado(false), 3000)
  }

  const resetarVenda = () => {
    setCarrinho([])
    setShowCheckout(false)
    setFormaPagamento('dinheiro')
    setMensagem('')
    if (inputRef.current) inputRef.current.focus()
  }

  // TELA DE CHECKOUT
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-green-600 text-white p-4 sticky top-0 flex items-center gap-3">
          <button onClick={() => setShowCheckout(false)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">Checkout</span>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="font-bold text-lg mb-3">Resumo da Compra</h2>
            {carrinho.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b pb-2 mb-2">
                <span>{item.nome} x{item.quantidade}</span>
                <span>R$ {((item.preco || 0) * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-3">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => setFormaPagamento('dinheiro')}
                className={`p-3 rounded-xl text-center transition border-2 ${
                  formaPagamento === 'dinheiro' ? 'border-green-500 bg-green-50 font-bold' : 'border-gray-200'
                }`}
              >
                💰 Dinheiro
              </button>
              <button
                onClick={() => setFormaPagamento('pix')}
                className={`p-3 rounded-xl text-center transition border-2 ${
                  formaPagamento === 'pix' ? 'border-green-500 bg-green-50 font-bold' : 'border-gray-200'
                }`}
              >
                📱 PIX
              </button>
              <button
                onClick={() => setFormaPagamento('cartao')}
                className={`p-3 rounded-xl text-center transition border-2 ${
                  formaPagamento === 'cartao' ? 'border-green-500 bg-green-50 font-bold' : 'border-gray-200'
                }`}
              >
                💳 Cartão
              </button>
              <button
                onClick={() => setFormaPagamento('fiado')}
                className={`p-3 rounded-xl text-center transition border-2 ${
                  formaPagamento === 'fiado' ? 'border-green-500 bg-green-50 font-bold' : 'border-gray-200'
                }`}
              >
                📝 Fiado
              </button>
              <button
                onClick={() => setFormaPagamento('conecta')}
                className={`p-3 rounded-xl text-center transition border-2 col-span-2 ${
                  formaPagamento === 'conecta' ? 'border-green-500 bg-green-50 font-bold' : 'border-gray-200'
                }`}
              >
                🪙 Moeda Conecta
              </button>
            </div>
            
            <button
              onClick={finalizarVenda}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg"
            >
              Confirmar Pagamento
            </button>
          </div>
        </main>
      </div>
    )
  }

  // TELA DE FIADO (abre quando escolhe fiado no checkout)
  if (showFiadoModal) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-yellow-500 text-white p-4 sticky top-0 flex items-center gap-3">
          <button onClick={() => setShowFiadoModal(false)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">Venda no Fiado</span>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">Dados do Cliente</h2>
              <p className="text-sm text-gray-500">Preencha para registrar o fiado</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={clienteInfo.nome}
                onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-lg"
                placeholder="Nome completo"
                autoFocus
              />
              <input
                type="tel"
                value={clienteInfo.telefone}
                onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                className="w-full px-4 py-3 border rounded-xl text-lg"
                placeholder="(00) 00000-0000"
              />
              <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                <p>📝 O cliente receberá uma notificação com o valor e data de vencimento</p>
                <p className="text-xs mt-1">Total da compra: <strong>R$ {calcularTotal().toFixed(2)}</strong></p>
              </div>
              <button
                onClick={registrarFiado}
                className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold text-lg"
              >
                Registrar Fiado
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // MODAL DE PREÇO
  if (produtoPendente) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-orange-500 text-white p-4 sticky top-0 flex items-center gap-3">
          <button onClick={() => setProdutoPendente(null)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg">Completar Cadastro</span>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">{produtoPendente.nome}</h2>
              <p className="text-sm text-gray-500">Informe o preço para continuar</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preço de venda (R$)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={precoTemp}
                  onChange={(e) => setPrecoTemp(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl text-lg"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input
                  type="number"
                  value={quantidadeTemp}
                  onChange={(e) => setQuantidadeTemp(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl text-lg"
                  placeholder="1"
                  min="1"
                />
              </div>
              <button
                onClick={salvarProdutoCompleto}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // TELA PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 sticky top-0 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Link href="/pdv" className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">PDV - Venda Rápida</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleLeitorExterno}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              leitorConectado ? 'bg-green-500' : leitorExterno ? 'bg-yellow-500' : 'bg-white/20'
            }`}
          >
            {leitorConectado ? <Bluetooth className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {leitorExterno ? (leitorConectado ? 'Leitor Ativo' : 'Conectando...') : 'Ativar Leitor'}
          </button>
          <Link href="/pdv/leitor" className="bg-white/20 px-3 py-1.5 rounded-full text-sm">
            📷 Câmera
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {mensagem && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            mensagem.includes('✅') ? 'bg-green-100 text-green-800' :
            mensagem.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {mensagem}
          </div>
        )}

        {leitorExterno && leitorConectado && (
          <div className="mb-4 p-3 bg-green-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-800">Leitor externo conectado</span>
            </div>
            <span className="text-xs text-green-600">Escaneie o código</span>
          </div>
        )}

        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <div className="text-center mb-3">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold">Buscar pelo nome</h2>
            <p className="text-xs text-gray-500 mt-1">Digite o nome popular do produto</p>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={buscaTermo}
              onChange={(e) => setBuscaTermo(e.target.value)}
              placeholder="Ex: Arroz, Feijão, Café..."
              className="w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {buscando && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
          </div>

          {mostrarSugestoes && sugestoes.length > 0 && (
            <div className="mt-2 border rounded-xl overflow-hidden max-h-80 overflow-auto">
              {sugestoes.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => selecionarProduto(produto)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{produto.nome}</p>
                    {produto.preco ? (
                      <span className="text-green-600 font-semibold text-xs">R$ {produto.preco.toFixed(2)}</span>
                    ) : (
                      <span className="text-yellow-600 text-xs">Preço não definido</span>
                    )}
                  </div>
                  <span className="text-blue-500 text-sm">+</span>
                </button>
              ))}
            </div>
          )}

          {buscaTermo.length >= 2 && sugestoes.length === 0 && !buscando && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-2">Produto "{buscaTermo}" não encontrado</p>
              <div className="flex gap-2">
                <button
                  onClick={cadastrarNovoProduto}
                  className="flex-1 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Cadastrar Novo
                </button>
                <button
                  onClick={() => setModoEntrada(modoEntrada === 'nome' ? 'codigo' : 'nome')}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Barcode className="w-4 h-4" /> Usar Código
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
            <span className="font-semibold">Carrinho ({carrinho.length})</span>
            {carrinho.length > 0 && (
              <button onClick={limparCarrinho} className="text-red-500 text-sm">Limpar</button>
            )}
          </div>
          
          {carrinho.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-xs mt-1">Busque produtos acima para adicionar</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-3 border-b flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nome}</p>
                      <p className="text-green-600 font-bold">R$ {(item.preco || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-7 h-7 bg-gray-100 rounded-full">-</button>
                      <span className="w-6 text-center font-semibold">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-7 h-7 bg-gray-100 rounded-full">+</button>
                      <button onClick={() => removerItem(item.id)} className="w-7 h-7 text-red-500">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={abrirCheckout}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg"
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>

        {fiadoRegistrado && (
          <div className="fixed bottom-4 left-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Venda no fiado registrada!</p>
              <p className="text-sm">Notificação enviada ao cliente</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}