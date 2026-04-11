'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

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
  relevancia?: number
  estoque?: number
}

export function useVendaBuscaPage() {
  const [carrinho, setCarrinho] = useState<ProdutoVenda[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'pix' | 'cartao' | 'fiado' | 'conecta'>('dinheiro')
  const [showFiadoModal, setShowFiadoModal] = useState(false)
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '' })
  const [mensagem, setMensagem] = useState('')
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoVenda[]>([])
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
    if (leitorSalvo === 'true') setLeitorConectado(true)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [])

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutosDisponiveis(JSON.parse(saved))
    } else {
      const exemplos: ProdutoVenda[] = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, quantidade: 0, estoque: 50, status: 'ativo' },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, quantidade: 0, estoque: 30, status: 'ativo' },
        { id: '3', nome: 'Açúcar Cristal 1kg', codigo: '7891234567892', preco: 4.50, quantidade: 0, estoque: 100, status: 'ativo' },
        { id: '4', nome: 'Café Torrado 500g', codigo: '7891234567893', preco: 12.90, quantidade: 0, estoque: 25, status: 'ativo' },
        { id: '5', nome: 'Óleo de Soja 900ml', codigo: '7891234567894', preco: 6.90, quantidade: 0, estoque: 40, status: 'ativo' },
      ]
      setProdutosDisponiveis(exemplos)
      localStorage.setItem('produtos_estoque', JSON.stringify(exemplos))
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
      const todos = saved ? JSON.parse(saved) : []
      const resultados = todos
        .filter((p: any) => p.nome.toLowerCase().includes(termo.toLowerCase()))
        .map((p: any) => ({ ...p, relevancia: p.nome.toLowerCase().startsWith(termo.toLowerCase()) ? 100 : 50 }))
        .sort((a: any, b: any) => b.relevancia - a.relevancia)
        .slice(0, 8)
      setSugestoes(resultados)
      setMostrarSugestoes(resultados.length > 0)
    } catch {
      // ignore
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
    adicionarAoCarrinho({ id: produto.id, nome: produto.nome, codigo: produto.codigo, preco: produto.preco, quantidade: 1, estoque: produto.estoque || 0, status: 'ativo' })
    setBuscaTermo('')
    setMostrarSugestoes(false)
    setMensagem(`✅ ${produto.nome} adicionado!`)
    setTimeout(() => setMensagem(''), 2000)
    if (inputRef.current) inputRef.current.focus()
  }

  const cadastrarNovoProduto = () => {
    if (!buscaTermo.trim()) { alert('Digite o nome do produto primeiro'); return }
    const ean = prompt('Digite o código de barras (EAN) do produto (ou deixe em branco):', '')
    const novo: ProdutoVenda = { id: Date.now().toString(), nome: buscaTermo.trim(), codigo: ean || '', preco: null, quantidade: 0, estoque: 0, status: 'pendente_validacao' }
    const lista = [...produtosDisponiveis, novo]
    setProdutosDisponiveis(lista)
    localStorage.setItem('produtos_estoque', JSON.stringify(lista))
    const notificacoes = localStorage.getItem('notificacoes_admin')
    const notifLista = notificacoes ? JSON.parse(notificacoes) : []
    notifLista.push({ id: Date.now(), tipo: 'validacao_produto', produto_nome: buscaTermo.trim(), produto_codigo: ean || 'não informado', data: new Date().toISOString(), lida: false })
    localStorage.setItem('notificacoes_admin', JSON.stringify(notifLista))
    setProdutoPendente(novo)
    setPrecoTemp('')
    setQuantidadeTemp('1')
    setMensagem(`📦 Produto "${buscaTermo.trim()}" criado. Informe o preço.`)
    setBuscaTermo('')
    setMostrarSugestoes(false)
  }

  const salvarProdutoCompleto = () => {
    if (!precoTemp || parseFloat(precoTemp) <= 0) { alert('Informe um preço válido'); return }
    const quantidade = parseInt(quantidadeTemp) || 1
    const lista = produtosDisponiveis.map(p =>
      p.id === produtoPendente?.id ? { ...p, preco: parseFloat(precoTemp), estoque: 0, status: 'ativo' as const } : p
    )
    setProdutosDisponiveis(lista)
    localStorage.setItem('produtos_estoque', JSON.stringify(lista))
    adicionarAoCarrinho({ id: produtoPendente!.id, nome: produtoPendente!.nome, codigo: produtoPendente!.codigo, preco: parseFloat(precoTemp), quantidade, estoque: 0, status: 'pendente_validacao' })
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
        return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + produto.quantidade } : item)
      }
      return [...prev, produto]
    })
  }

  const atualizarQuantidade = (id: string, delta: number) => {
    setCarrinho(prev =>
      prev.map(item => {
        if (item.id === id) {
          const novaQtd = item.quantidade + delta
          if (novaQtd <= 0) return null
          return { ...item, quantidade: novaQtd }
        }
        return item
      }).filter(Boolean) as ProdutoVenda[]
    )
  }

  const removerItem = (id: string) => setCarrinho(prev => prev.filter(item => item.id !== id))
  const calcularTotal = () => carrinho.reduce((sum, item) => sum + ((item.preco || 0) * item.quantidade), 0)
  const limparCarrinho = () => { if (confirm('Limpar carrinho?')) { setCarrinho([]); setMensagem('Carrinho limpo') } }
  const abrirCheckout = () => setShowCheckout(true)

  const finalizarVenda = () => {
    if (formaPagamento === 'fiado') {
      setShowFiadoModal(true)
    } else {
      const total = calcularTotal()
      alert(`✅ Venda finalizada!\nTotal: R$ ${total.toFixed(2)}\nPagamento: ${formaPagamento.toUpperCase()}`)
      const estoqueAtual = localStorage.getItem('produtos_estoque')
      if (estoqueAtual) {
        const prods = JSON.parse(estoqueAtual)
        carrinho.forEach(item => {
          const idx = prods.findIndex((p: any) => p.id === item.id)
          if (idx !== -1) prods[idx].estoque -= item.quantidade
        })
        localStorage.setItem('produtos_estoque', JSON.stringify(prods))
      }
      resetarVenda()
    }
  }

  const registrarFiado = () => {
    if (!clienteInfo.nome.trim() || !clienteInfo.telefone.trim()) { alert('Preencha nome e telefone do cliente'); return }
    const total = calcularTotal()
    if (total <= 0) { alert('Carrinho vazio'); return }
    const venda = { id: Date.now().toString(), clienteNome: clienteInfo.nome, clienteTelefone: clienteInfo.telefone, valor: total, data: new Date().toISOString(), vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'pendente', itens: [...carrinho] }
    const vendasFiadas = localStorage.getItem('vendas_fiadas')
    const lista = vendasFiadas ? JSON.parse(vendasFiadas) : []
    lista.push(venda)
    localStorage.setItem('vendas_fiadas', JSON.stringify(lista))
    const estoqueAtual = localStorage.getItem('produtos_estoque')
    if (estoqueAtual) {
      const prods = JSON.parse(estoqueAtual)
      carrinho.forEach(item => {
        const idx = prods.findIndex((p: any) => p.id === item.id)
        if (idx !== -1) prods[idx].estoque -= item.quantidade
      })
      localStorage.setItem('produtos_estoque', JSON.stringify(prods))
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

  return {
    carrinho, showCheckout, setShowCheckout,
    formaPagamento, setFormaPagamento,
    showFiadoModal, setShowFiadoModal,
    clienteInfo, setClienteInfo,
    mensagem, buscaTermo, setBuscaTermo,
    sugestoes, mostrarSugestoes, setMostrarSugestoes,
    buscando, modoEntrada, setModoEntrada,
    leitorExterno, leitorConectado,
    produtoPendente, setProdutoPendente,
    precoTemp, setPrecoTemp,
    quantidadeTemp, setQuantidadeTemp,
    fiadoRegistrado,
    inputRef,
    selecionarProduto, cadastrarNovoProduto,
    salvarProdutoCompleto, toggleLeitorExterno,
    adicionarAoCarrinho, atualizarQuantidade,
    removerItem, limparCarrinho,
    abrirCheckout, finalizarVenda, registrarFiado,
    calcularTotal,
  }
}
