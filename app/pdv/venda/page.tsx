'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Search, Plus, Minus, Trash2, CreditCard, QrCode, User, Phone, Check, AlertCircle, Barcode, Smartphone, Scan, Zap, ShoppingCart, X } from 'lucide-react'

// Interface para o produto
interface ProdutoVenda {
  id: string
  nome: string
  codigo: string
  preco: number
  quantidade: number
  foto?: string
  estoque?: number
}

// Interface para o cliente fiado
interface ClienteFiado {
  id: string
  nome: string
  telefone: string
  saldoFiado: number
  limiteCredito: number
}

export default function VendaPage() {
  // Estados principais
  const [carrinho, setCarrinho] = useState<ProdutoVenda[]>([])
  const [codigoLido, setCodigoLido] = useState('')
  const [modoLeitura, setModoLeitura] = useState<'auto' | 'manual' | 'camera'>('auto')
  const [showCheckout, setShowCheckout] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'pix' | 'cartao' | 'fiado' | 'conecta'>('dinheiro')
  const [showFiadoModal, setShowFiadoModal] = useState(false)
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '' })
  const [mensagem, setMensagem] = useState('')
  const [ultimoCodigo, setUltimoCodigo] = useState('')
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoVenda[]>([])
  const [clientesFiado, setClientesFiado] = useState<ClienteFiado[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scannerInterval = useRef<NodeJS.Timeout | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    carregarProdutos()
    carregarClientesFiado()
    
    // Focar no input ao carregar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        setMensagem('📷 Aguardando leitura do código de barras...')
      }
    }, 1000)
    
    return () => {
      if (scannerInterval.current) {
        clearInterval(scannerInterval.current)
      }
      pararCamera()
    }
  }, [])

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutosDisponiveis(JSON.parse(saved))
    } else {
      // Produtos de exemplo
      const produtosExemplo: ProdutoVenda[] = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, quantidade: 0, estoque: 50 },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, quantidade: 0, estoque: 30 },
        { id: '3', nome: 'Açúcar 1kg', codigo: '7891234567892', preco: 4.50, quantidade: 0, estoque: 100 },
        { id: '4', nome: 'Café 500g', codigo: '7891234567893', preco: 12.90, quantidade: 0, estoque: 25 },
        { id: '5', nome: 'Óleo de Soja 900ml', codigo: '7891234567894', preco: 6.90, quantidade: 0, estoque: 40 },
      ]
      setProdutosDisponiveis(produtosExemplo)
      localStorage.setItem('produtos_estoque', JSON.stringify(produtosExemplo))
    }
  }

  const carregarClientesFiado = () => {
    const saved = localStorage.getItem('clientes_fiado')
    if (saved) {
      setClientesFiado(JSON.parse(saved))
    }
  }

  // ============================================
  // LEITOR DE CÓDIGO DE BARRAS - VERSÃO OTIMIZADA
  // ============================================
  
  const processarCodigo = useCallback(async (codigo: string) => {
    if (!codigo || codigo === ultimoCodigo) return
    
    setUltimoCodigo(codigo)
    setCodigoLido(codigo)
    
    // Feedback tátil (vibração) se disponível
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
    
    // Feedback sonoro (beep)
    const audio = new Audio('/beep.mp3')
    audio.play().catch(() => {})
    
    // Buscar produto pelo código
    const produto = produtosDisponiveis.find(p => p.codigo === codigo)
    
    if (produto) {
      adicionarAoCarrinho(produto)
      setMensagem(`✅ ${produto.nome} adicionado!`)
      setCodigoLido('')
      setUltimoCodigo('')
      
      // Limpar input
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.focus()
      }
    } else {
      // Produto não encontrado - cadastro rápido
      const nomeProduto = prompt('Produto não encontrado! Digite o nome do produto:', '')
      if (nomeProduto) {
        const valor = prompt('Digite o valor de venda (R$):', '0')
        const quantidade = prompt('Digite a quantidade:', '1')
        
        const novoProduto: ProdutoVenda = {
          id: Date.now().toString(),
          nome: nomeProduto,
          codigo: codigo,
          preco: parseFloat(valor || '0'),
          quantidade: parseInt(quantidade || '1'),
          estoque: parseInt(quantidade || '1')
        }
        
        adicionarAoCarrinho(novoProduto)
        
        // Salvar no catálogo automático
        const catalogo = localStorage.getItem('catalogo_automatico')
        const novoCatalogo = catalogo ? JSON.parse(catalogo) : []
        novoCatalogo.push({ ...novoProduto, dataCadastro: new Date().toISOString() })
        localStorage.setItem('catalogo_automatico', JSON.stringify(novoCatalogo))
        
        // Adicionar ao estoque local
        setProdutosDisponiveis(prev => [...prev, novoProduto])
        localStorage.setItem('produtos_estoque', JSON.stringify([...produtosDisponiveis, novoProduto]))
        
        setMensagem(`✅ ${novoProduto.nome} adicionado ao catálogo!`)
      }
      
      setCodigoLido('')
      setUltimoCodigo('')
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.focus()
      }
    }
  }, [produtosDisponiveis, ultimoCodigo])

  // Leitura automática via input (para leitores USB/bluetooth)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const codigo = e.currentTarget.value.trim()
      if (codigo) {
        processarCodigo(codigo)
        e.currentTarget.value = ''
      }
    }
  }

  // ============================================
  // FUNÇÕES DO CARRINHO
  // ============================================
  
  const adicionarAoCarrinho = (produto: ProdutoVenda) => {
    setCarrinho(prev => {
      const existente = prev.find(item => item.id === produto.id)
      if (existente) {
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }
      return [...prev, { ...produto, quantidade: 1 }]
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
    return carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
  }

  const limparCarrinho = () => {
    if (confirm('Deseja limpar todo o carrinho?')) {
      setCarrinho([])
      setMensagem('🛒 Carrinho limpo')
    }
  }

  // ============================================
  // FUNÇÕES DO CHECKOUT
  // ============================================
  
  const finalizarVenda = () => {
    if (formaPagamento === 'fiado') {
      setShowFiadoModal(true)
    } else {
      const total = calcularTotal()
      alert(`✅ Venda finalizada!\n\nTotal: R$ ${total.toFixed(2)}\nForma de pagamento: ${formaPagamento.toUpperCase()}`)
      
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
    if (!clienteInfo.nome || !clienteInfo.telefone) {
      alert('Preencha nome e telefone do cliente')
      return
    }

    const total = calcularTotal()
    
    // Registrar venda fiada
    const vendaFiada = {
      id: Date.now().toString(),
      clienteNome: clienteInfo.nome,
      clienteTelefone: clienteInfo.telefone,
      valor: total,
      data: new Date().toISOString(),
      vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pendente',
      itens: carrinho
    }
    
    const vendasFiadas = localStorage.getItem('vendas_fiadas')
    const novasVendas = vendasFiadas ? JSON.parse(vendasFiadas) : []
    novasVendas.push(vendaFiada)
    localStorage.setItem('vendas_fiadas', JSON.stringify(novasVendas))
    
    alert(`✅ Venda no fiado registrada!\n\nCliente: ${clienteInfo.nome}\nTotal: R$ ${total.toFixed(2)}\nVencimento: ${new Date(vendaFiada.vencimento).toLocaleDateString()}`)
    
    setShowFiadoModal(false)
    setClienteInfo({ nome: '', telefone: '' })
    resetarVenda()
  }

  const resetarVenda = () => {
    setCarrinho([])
    setShowCheckout(false)
    setFormaPagamento('dinheiro')
    setMensagem('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // ============================================
  // RENDERIZAÇÃO
  // ============================================
  
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">Checkout</span>
          </div>
        </header>

        <main className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-5 shadow-md mb-5">
            <h2 className="text-xl font-bold mb-3">Resumo da Compra</h2>
            <div className="space-y-2 max-h-64 overflow-auto mb-4">
              {carrinho.map(item => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                  <span>{item.nome} x{item.quantidade}</span>
                  <span className="font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'dinheiro', label: '💵 Dinheiro', icon: '💰' },
                { id: 'pix', label: '📱 PIX', icon: '📱' },
                { id: 'cartao', label: '💳 Cartão', icon: '💳' },
                { id: 'fiado', label: '📝 Fiado', icon: '📝' },
                { id: 'conecta', label: '🪙 Conecta', icon: '🪙' }
              ].map(metodo => (
                <button
                  key={metodo.id}
                  onClick={() => setFormaPagamento(metodo.id as any)}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    formaPagamento === metodo.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">{metodo.icon}</span>
                  <p className="text-sm mt-1">{metodo.label}</p>
                </button>
              ))}
            </div>

            <button
              onClick={finalizarVenda}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg"
            >
              Confirmar Pagamento
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (showFiadoModal) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setShowFiadoModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">Venda no Fiado</span>
          </div>
        </header>

        <main className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-5 shadow-md">
            <h2 className="text-xl font-bold mb-4">Dados do Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do cliente</label>
                <input
                  type="text"
                  value={clienteInfo.nome}
                  onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl text-lg"
                  placeholder="Nome completo"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={clienteInfo.telefone}
                  onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl text-lg"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                📝 O cliente receberá uma notificação com o valor e data de vencimento
              </div>

              <button
                onClick={registrarFiado}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold text-lg"
              >
                Registrar Fiado
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/pdv" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-bold text-lg">PDV - Leitor de Códigos</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModoLeitura(modoLeitura === 'auto' ? 'manual' : 'auto')}
              className="bg-white/20 px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
            >
              {modoLeitura === 'auto' ? <Scan className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {modoLeitura === 'auto' ? 'Automático' : 'Manual'}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Área do Leitor de Código */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <div className="text-center mb-4">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-3 transition-all ${modoLeitura === 'auto' ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'}`}>
              {modoLeitura === 'auto' ? (
                <Scan className="w-12 h-12 text-blue-600" />
              ) : (
                <Barcode className="w-12 h-12 text-gray-600" />
              )}
            </div>
            <h2 className="text-xl font-bold">Leitor de Código de Barras</h2>
            <p className="text-gray-500 text-sm mt-1">{mensagem || 'Aponte a câmera para o código de barras'}</p>
          </div>

          {/* Input para leitura */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              onChange={(e) => setCodigoLido(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Código de barras (digite ou escaneie)"
              className="w-full px-4 py-4 text-center text-xl tracking-wider border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              autoFocus
              inputMode="numeric"
            />
            {codigoLido && (
              <button
                onClick={() => processarCodigo(codigoLido)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Buscar
              </button>
            )}
          </div>

          {/* Dica de uso */}
          <div className="mt-4 text-center text-xs text-gray-400">
            <p>📱 Para leitores USB/Bluetooth: conecte e escaneie normalmente</p>
            <p className="mt-1">📷 Para câmera do celular: use um leitor de QR Code externo ou digite manualmente</p>
          </div>
        </div>

        {/* Carrinho de Compras */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">Carrinho</h2>
            {carrinho.length > 0 && (
              <button onClick={limparCarrinho} className="text-red-500 text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
          
          {carrinho.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-sm">Escaneie ou digite um código para começar</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-3 border-b flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-green-600">R$ {item.preco.toFixed(2)}</p>
                      {item.estoque !== undefined && item.estoque < 10 && (
                        <p className="text-xs text-orange-500">Estoque: {item.estoque} un</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => atualizarQuantidade(item.id, -1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantidade}</span>
                      <button
                        onClick={() => atualizarQuantidade(item.id, 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removerItem(item.id)}
                        className="w-8 h-8 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg"
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>

        {/* Últimos produtos escaneados */}
        {ultimoCodigo && (
          <div className="mt-4 bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Último código lido:</p>
            <p className="text-sm font-mono text-blue-600">{ultimoCodigo}</p>
          </div>
        )}
      </main>
    </div>
  )
}