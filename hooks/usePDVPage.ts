'use client'
import { useState, useEffect, useRef } from 'react'
import { notificarCompraFiado, notificarCompraConfirmada } from '@/services/notificacoes'

interface Produto {
  id: string
  nome: string
  codigo: string | null
  preco: number | null
  quantidade: number
  imagem?: string
  status?: 'ativo' | 'pendente'
}

interface LojaInfo {
  nome: string
  endereco: string
  cidade: string
  telefone: string
}

export function usePDVPage() {
  const [carrinho, setCarrinho] = useState<Produto[]>([])
  const [tela, setTela] = useState<'venda' | 'checkout' | 'pagamento' | 'confirmacao'>('venda')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [valorRecebido, setValorRecebido] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [buscaTermo, setBuscaTermo] = useState('')
  const [produtos, setProdutos] = useState<any[]>([])
  const [modo, setModo] = useState<'busca' | 'leitor'>('leitor')
  const [codigoLeitor, setCodigoLeitor] = useState('')
  const [confirmacao, setConfirmacao] = useState({ titulo: '', subtitulo: '', cor: '' })
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false)
  const [mensagemNotificacao, setMensagemNotificacao] = useState('')
  const [scanning, setScanning] = useState(false)
  const [loadingCamera, setLoadingCamera] = useState(false)
  const [cameraSuportada, setCameraSuportada] = useState(true)
  const scannerRef = useRef<any>(null)
  const [showCadastroRapido, setShowCadastroRapido] = useState(false)
  const [novoProdutoNome, setNovoProdutoNome] = useState('')
  const [novoProdutoCodigo, setNovoProdutoCodigo] = useState('')
  const [novoProdutoPreco, setNovoProdutoPreco] = useState('')
  const [novoProdutoQuantidade, setNovoProdutoQuantidade] = useState('1')
  const [lojaInfo, setLojaInfo] = useState<LojaInfo>({
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA',
    telefone: '(00) 00000-0000'
  })

  useEffect(() => {
    carregarProdutos()
    carregarLojaInfo()
    verificarCamera()
    return () => {
      if (scannerRef.current) pararCamera()
    }
  }, [])

  const verificarCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSuportada(false)
      setMensagem('⚠️ Seu navegador não suporta câmera. Use busca manual.')
      setModo('busca')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setCameraSuportada(true)
    } catch {
      setCameraSuportada(false)
      setMensagem('⚠️ Permissão da câmera negada. Use busca manual.')
      setModo('busca')
    }
  }

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutos(JSON.parse(saved))
    } else {
      const exemplos = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, estoque: 50, status: 'ativo', imagem: 'https://placehold.co/100x100/blue/white?text=Arroz' },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, estoque: 30, status: 'ativo', imagem: 'https://placehold.co/100x100/green/white?text=Feijão' },
        { id: '3', nome: 'Açúcar 1kg', codigo: '7891234567892', preco: 4.50, estoque: 100, status: 'ativo', imagem: 'https://placehold.co/100x100/yellow/white?text=Açúcar' },
        { id: '4', nome: 'Café 500g', codigo: '7891234567893', preco: 12.90, estoque: 25, status: 'ativo', imagem: 'https://placehold.co/100x100/brown/white?text=Café' },
        { id: '5', nome: 'Óleo 900ml', codigo: '7891234567894', preco: 6.90, estoque: 40, status: 'ativo', imagem: 'https://placehold.co/100x100/orange/white?text=Óleo' },
      ]
      setProdutos(exemplos)
      localStorage.setItem('produtos_estoque', JSON.stringify(exemplos))
    }
  }

  const carregarLojaInfo = () => {
    const saved = localStorage.getItem('loja_info')
    if (saved) setLojaInfo(JSON.parse(saved))
  }

  const iniciarCamera = async () => {
    if (!cameraSuportada) {
      setMensagem('⚠️ Câmera não suportada. Use busca manual.')
      setModo('busca')
      return
    }
    setLoadingCamera(true)
    setMensagem('📷 Solicitando permissão da câmera...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      const { Html5Qrcode } = await import('html5-qrcode')
      if (scannerRef.current) await pararCamera()
      const readerElement = document.getElementById('reader')
      if (!readerElement) throw new Error('Elemento reader não encontrado')
      scannerRef.current = new Html5Qrcode('reader')
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText: string) => { processarCodigoCamera(decodedText) },
        (errorMessage: string) => {
          if (!errorMessage.includes('No MultiFormat') && !errorMessage.includes('NotFoundException')) {
            console.log('Erro de leitura:', errorMessage)
          }
        }
      )
      setScanning(true)
      setMensagem('✅ Câmera ativa. Aponte para o código de barras')
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setMensagem('❌ Permissão negada. Ative a câmera nas configurações do navegador.')
      } else if (err.name === 'NotFoundError') {
        setMensagem('❌ Nenhuma câmera encontrada no dispositivo.')
      } else {
        setMensagem('❌ Erro ao iniciar câmera. Use busca manual.')
      }
      setCameraSuportada(false)
      setModo('busca')
    } finally {
      setLoadingCamera(false)
    }
  }

  const pararCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // ignore
      }
      scannerRef.current = null
    }
    setScanning(false)
    setMensagem('')
  }

  const processarCodigoCamera = (codigo: string) => {
    if (!codigo) return
    if (navigator.vibrate) navigator.vibrate(100)
    const produto = produtos.find((p: any) => p.codigo === codigo)
    if (produto) {
      adicionarAoCarrinho({ ...produto, quantidade: 1 })
      setMensagem(`✅ ${produto.nome} adicionado!`)
      setTimeout(() => setMensagem(''), 2000)
    } else {
      setNovoProdutoCodigo(codigo)
      setNovoProdutoNome('')
      setNovoProdutoPreco('')
      setNovoProdutoQuantidade('1')
      setShowCadastroRapido(true)
      pararCamera()
    }
  }

  const adicionarAoCarrinho = (produto: any) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id)
      if (existente) {
        return prev.map(item => item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item)
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
    setMensagem(`✅ ${produto.nome} adicionado!`)
    setTimeout(() => setMensagem(''), 2000)
    setBuscaTermo('')
    setCodigoLeitor('')
  }

  const produtosFiltrados = buscaTermo.length >= 2
    ? produtos.filter((p: any) => p.nome.toLowerCase().includes(buscaTermo.toLowerCase()))
    : []

  const processarCodigo = () => {
    if (!codigoLeitor) return
    const produto = produtos.find((p: any) => p.codigo === codigoLeitor)
    if (produto) {
      adicionarAoCarrinho({ ...produto, quantidade: 1 })
      setCodigoLeitor('')
    } else {
      setNovoProdutoCodigo(codigoLeitor)
      setNovoProdutoNome('')
      setNovoProdutoPreco('')
      setNovoProdutoQuantidade('1')
      setShowCadastroRapido(true)
    }
  }

  const cadastrarProdutoRapido = () => {
    if (!novoProdutoNome || !novoProdutoPreco) {
      alert('Preencha nome e preço do produto')
      return
    }
    const novoProduto = {
      id: Date.now().toString(),
      nome: novoProdutoNome,
      codigo: novoProdutoCodigo || null,
      preco: parseFloat(novoProdutoPreco),
      estoque: parseInt(novoProdutoQuantidade) || 0,
      imagem: 'https://placehold.co/100x100/gray/white?text=Novo',
      status: 'pendente'
    }
    const novosProdutos = [...produtos, novoProduto]
    setProdutos(novosProdutos)
    localStorage.setItem('produtos_estoque', JSON.stringify(novosProdutos))
    const notificacoes = localStorage.getItem('notificacoes_admin')
    const lista = notificacoes ? JSON.parse(notificacoes) : []
    lista.push({
      id: Date.now(),
      tipo: 'NOVO_PRODUTO_PENDENTE',
      produto: novoProdutoNome,
      codigo: novoProdutoCodigo,
      preco: novoProdutoPreco,
      data: new Date().toISOString()
    })
    localStorage.setItem('notificacoes_admin', JSON.stringify(lista))
    adicionarAoCarrinho({ ...novoProduto, quantidade: parseInt(novoProdutoQuantidade) })
    setShowCadastroRapido(false)
    setMensagem(`✅ ${novoProdutoNome} cadastrado e adicionado!`)
    setTimeout(() => setMensagem(''), 3000)
  }

  const atualizarQuantidade = (id: string, delta: number) => {
    setCarrinho(prev =>
      prev.map(item => {
        if (item.id === id) {
          const novaQuantidade = item.quantidade + delta
          if (novaQuantidade <= 0) return null
          return { ...item, quantidade: novaQuantidade }
        }
        return item
      }).filter(Boolean) as Produto[]
    )
  }

  const removerItem = (id: string) => setCarrinho(prev => prev.filter(item => item.id !== id))
  const calcularTotal = () => carrinho.reduce((sum, item) => sum + ((item.preco || 0) * item.quantidade), 0)
  const limparCarrinho = () => { if (confirm('Limpar carrinho?')) setCarrinho([]) }
  const totalCompra = calcularTotal()

  const irParaCheckout = () => {
    if (carrinho.length === 0) { alert('Adicione produtos ao carrinho'); return }
    pararCamera()
    setTela('checkout')
  }

  const selecionarPagamento = (forma: string) => {
    setFormaPagamento(forma)
    setTela('pagamento')
  }

  const voltarParaCheckout = () => setTela('checkout')

  const finalizarVenda = () => {
    const estoqueAtual = localStorage.getItem('produtos_estoque')
    if (estoqueAtual) {
      const estoque = JSON.parse(estoqueAtual)
      carrinho.forEach(item => {
        const idx = estoque.findIndex((p: any) => p.id === item.id)
        if (idx !== -1 && estoque[idx].estoque) {
          estoque[idx].estoque -= item.quantidade
        }
      })
      localStorage.setItem('produtos_estoque', JSON.stringify(estoque))
    }

    if (formaPagamento === 'fiado') {
      const vendaFiada = {
        id: Date.now().toString(),
        clienteNome,
        clienteTelefone,
        valor: totalCompra,
        data: new Date().toISOString(),
        vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente',
        itens: [...carrinho]
      }
      const vendasFiadas = localStorage.getItem('vendas_fiadas')
      const lista = vendasFiadas ? JSON.parse(vendasFiadas) : []
      lista.push(vendaFiada)
      localStorage.setItem('vendas_fiadas', JSON.stringify(lista))
      const saldoRestante = 500 - totalCompra
      notificarCompraFiado(clienteNome, clienteTelefone, totalCompra, new Date(vendaFiada.vencimento), lojaInfo, saldoRestante)
      setMensagemNotificacao(`✅ Notificação enviada para ${clienteTelefone}`)
      setMostrarNotificacao(true)
      setConfirmacao({ titulo: 'Venda no Fiado Registrada!', subtitulo: `${clienteNome}\nR$ ${totalCompra.toFixed(2)}`, cor: 'bg-yellow-500' })
    } else if (formaPagamento === 'dinheiro') {
      const recebido = parseFloat(valorRecebido)
      const troco = recebido - totalCompra
      if (clienteTelefone) {
        notificarCompraConfirmada(clienteTelefone, totalCompra, 'dinheiro', lojaInfo)
        setMensagemNotificacao(`✅ Notificação enviada`)
        setMostrarNotificacao(true)
      }
      setConfirmacao({ titulo: 'Venda Finalizada!', subtitulo: `Total: R$ ${totalCompra.toFixed(2)}\nTroco: R$ ${troco.toFixed(2)}`, cor: 'bg-green-500' })
    } else {
      if (clienteTelefone) {
        notificarCompraConfirmada(clienteTelefone, totalCompra, formaPagamento, lojaInfo)
        setMensagemNotificacao(`✅ Notificação enviada`)
        setMostrarNotificacao(true)
      }
      setConfirmacao({ titulo: 'Venda Finalizada!', subtitulo: `R$ ${totalCompra.toFixed(2)} - ${formaPagamento.toUpperCase()}`, cor: 'bg-green-500' })
    }
    setCarrinho([])
    setTela('confirmacao')
    setTimeout(() => setMostrarNotificacao(false), 3000)
  }

  const novaVenda = () => {
    setTela('venda')
    setFormaPagamento('')
    setValorRecebido('')
    setClienteNome('')
    setClienteTelefone('')
    setCodigoLeitor('')
    setBuscaTermo('')
    setMostrarNotificacao(false)
  }

  return {
    carrinho, tela, formaPagamento, setFormaPagamento,
    valorRecebido, setValorRecebido,
    clienteNome, setClienteNome,
    clienteTelefone, setClienteTelefone,
    mensagem, buscaTermo, setBuscaTermo,
    produtos, modo, setModo,
    codigoLeitor, setCodigoLeitor,
    confirmacao, mostrarNotificacao, mensagemNotificacao,
    scanning, loadingCamera, cameraSuportada,
    showCadastroRapido, setShowCadastroRapido,
    novoProdutoNome, setNovoProdutoNome,
    novoProdutoCodigo, setNovoProdutoCodigo,
    novoProdutoPreco, setNovoProdutoPreco,
    novoProdutoQuantidade, setNovoProdutoQuantidade,
    lojaInfo, produtosFiltrados, totalCompra,
    iniciarCamera, pararCamera,
    adicionarAoCarrinho, removerItem,
    atualizarQuantidade, limparCarrinho,
    irParaCheckout, selecionarPagamento,
    voltarParaCheckout, finalizarVenda,
    novaVenda, processarCodigo,
    cadastrarProdutoRapido,
    setTela,
  }
}
