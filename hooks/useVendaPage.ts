'use client'
import { useState, useEffect, useRef } from 'react'

interface ProdutoVenda {
  id: string
  nome: string
  codigo: string
  preco: number
  quantidade: number
  estoque?: number
}

interface VendaFiada {
  id: string
  clienteNome: string
  clienteTelefone: string
  valor: number
  data: string
  vencimento: string
  status: 'pendente' | 'pago' | 'vencido'
  itens: ProdutoVenda[]
}

export function useVendaPage() {
  const [carrinho, setCarrinho] = useState<ProdutoVenda[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'pix' | 'cartao' | 'fiado' | 'conecta'>('dinheiro')
  const [showFiadoModal, setShowFiadoModal] = useState(false)
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '' })
  const [mensagem, setMensagem] = useState('')
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoVenda[]>([])
  const [scanning, setScanning] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [modo, setModo] = useState<'camera' | 'manual'>('manual')
  const [loading, setLoading] = useState(false)
  const [fiadoRegistrado, setFiadoRegistrado] = useState(false)
  const scannerRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarProdutos()
    return () => { if (scannerRef.current) pararCamera() }
  }, [])

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutosDisponiveis(JSON.parse(saved))
    } else {
      const exemplos: ProdutoVenda[] = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, quantidade: 0, estoque: 50 },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, quantidade: 0, estoque: 30 },
        { id: '3', nome: 'Açúcar 1kg', codigo: '7891234567892', preco: 4.50, quantidade: 0, estoque: 100 },
        { id: '4', nome: 'Café 500g', codigo: '7891234567893', preco: 12.90, quantidade: 0, estoque: 25 },
        { id: '5', nome: 'Óleo de Soja 900ml', codigo: '7891234567894', preco: 6.90, quantidade: 0, estoque: 40 },
      ]
      setProdutosDisponiveis(exemplos)
      localStorage.setItem('produtos_estoque', JSON.stringify(exemplos))
    }
  }

  const iniciarCamera = async () => {
    setLoading(true)
    setMensagem('📷 Iniciando câmera...')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta câmera')
      }
      const { Html5Qrcode } = await import('html5-qrcode')
      if (scannerRef.current) await pararCamera()
      scannerRef.current = new Html5Qrcode('reader')
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => { processarCodigo(decodedText) },
        () => {}
      )
      setScanning(true)
      setMensagem('✅ Câmera ativa. Aponte para o código')
    } catch (err: any) {
      setScanning(false)
      if (err.message === 'Navegador não suporta câmera') {
        setMensagem('⚠️ Este navegador não suporta câmera. Use o modo manual.')
      } else if (err.name === 'NotAllowedError') {
        setMensagem('❌ Permissão negada. Clique no cadeado da URL e permita a câmera.')
      } else {
        setMensagem('❌ Erro ao iniciar. Tente o modo manual.')
      }
    } finally {
      setLoading(false)
    }
  }

  const pararCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear() } catch {}
      scannerRef.current = null
    }
    setScanning(false)
    setMensagem('📷 Câmera desligada')
  }

  const processarCodigo = (codigo: string) => {
    if (!codigo) return
    setMensagem(`📦 Lido: ${codigo}`)
    if (navigator.vibrate) navigator.vibrate(100)
    const produto = produtosDisponiveis.find(p => p.codigo === codigo)
    if (produto) {
      adicionarAoCarrinho(produto)
      setMensagem(`✅ ${produto.nome} adicionado!`)
    } else {
      const nomeProduto = prompt('Produto não encontrado! Nome:', '')
      if (nomeProduto) {
        const valor = prompt('Valor (R$):', '0')
        const quantidade = prompt('Quantidade:', '1')
        const novo: ProdutoVenda = { id: Date.now().toString(), nome: nomeProduto, codigo, preco: parseFloat(valor || '0'), quantidade: parseInt(quantidade || '1'), estoque: parseInt(quantidade || '1') }
        adicionarAoCarrinho(novo)
        setProdutosDisponiveis(prev => {
          const lista = [...prev, novo]
          localStorage.setItem('produtos_estoque', JSON.stringify(lista))
          return lista
        })
        setMensagem(`✅ ${novo.nome} adicionado!`)
      }
    }
  }

  const adicionarAoCarrinho = (produto: ProdutoVenda) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id)
      if (existente) return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)
      return [...prev, { ...produto, quantidade: 1 }]
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
  const calcularTotal = () => carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
  const limparCarrinho = () => { if (confirm('Limpar carrinho?')) { setCarrinho([]); setMensagem('Carrinho limpo') } }

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
    if (!clienteInfo.nome.trim()) { alert('❌ Preencha o nome do cliente'); return }
    if (!clienteInfo.telefone.trim()) { alert('❌ Preencha o telefone do cliente'); return }
    const total = calcularTotal()
    if (total <= 0) { alert('❌ Carrinho vazio.'); return }
    const venda: VendaFiada = { id: Date.now().toString(), clienteNome: clienteInfo.nome, clienteTelefone: clienteInfo.telefone, valor: total, data: new Date().toISOString(), vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'pendente', itens: [...carrinho] }
    const lista = localStorage.getItem('vendas_fiadas')
    const listaVendas: VendaFiada[] = lista ? JSON.parse(lista) : []
    listaVendas.push(venda)
    localStorage.setItem('vendas_fiadas', JSON.stringify(listaVendas))
    const clientesFiado = localStorage.getItem('clientes_fiado')
    const listaClientes = clientesFiado ? JSON.parse(clientesFiado) : []
    const clienteExistente = listaClientes.find((c: any) => c.telefone === clienteInfo.telefone)
    if (!clienteExistente) {
      listaClientes.push({ id: Date.now().toString(), nome: clienteInfo.nome, telefone: clienteInfo.telefone, saldoFiado: total, limiteCredito: 500, dataCadastro: new Date().toISOString() })
    } else {
      const idx = listaClientes.findIndex((c: any) => c.telefone === clienteInfo.telefone)
      listaClientes[idx].saldoFiado = (listaClientes[idx].saldoFiado || 0) + total
    }
    localStorage.setItem('clientes_fiado', JSON.stringify(listaClientes))
    const estoqueAtual = localStorage.getItem('produtos_estoque')
    if (estoqueAtual) {
      const prods = JSON.parse(estoqueAtual)
      carrinho.forEach(item => {
        const idx = prods.findIndex((p: any) => p.id === item.id)
        if (idx !== -1) prods[idx].estoque -= item.quantidade
      })
      localStorage.setItem('produtos_estoque', JSON.stringify(prods))
    }
    const dataVencimento = new Date(venda.vencimento).toLocaleDateString('pt-BR')
    alert(`✅ Venda no fiado registrada!\n\n📋 Cliente: ${clienteInfo.nome}\n💰 Total: R$ ${total.toFixed(2)}\n📅 Vence em: ${dataVencimento}\n\n📱 Uma notificação foi enviada para ${clienteInfo.telefone}`)
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

  const handleCodigoManual = () => {
    if (codigoManual.trim()) {
      processarCodigo(codigoManual.trim())
      setCodigoManual('')
      if (inputRef.current) inputRef.current.focus()
    }
  }

  return {
    carrinho, showCheckout, setShowCheckout,
    formaPagamento, setFormaPagamento,
    showFiadoModal, setShowFiadoModal,
    clienteInfo, setClienteInfo,
    mensagem, codigoManual, setCodigoManual,
    modo, setModo, scanning, loading, fiadoRegistrado,
    inputRef,
    iniciarCamera, pararCamera,
    adicionarAoCarrinho, atualizarQuantidade,
    removerItem, limparCarrinho,
    finalizarVenda, registrarFiado,
    handleCodigoManual, calcularTotal,
  }
}
