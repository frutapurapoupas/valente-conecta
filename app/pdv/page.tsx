'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Search, Package, ShoppingCart, CreditCard, Users, Barcode, CheckCircle, DollarSign, QrCode, Zap, Plus, Minus, Trash2, AlertCircle } from 'lucide-react'
import { notificarCompraFiado, notificarCompraConfirmada } from '@/services/notificacoes'

interface Produto {
  id: string
  nome: string
  codigo: string | null
  preco: number | null
  quantidade: number
  status?: 'ativo' | 'pendente'
}

interface LojaInfo {
  nome: string
  endereco: string
  cidade: string
  telefone: string
}

export default function PDVPage() {
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
  
  // Estado para cadastro rápido
  const [showCadastroRapido, setShowCadastroRapido] = useState(false)
  const [novoProdutoNome, setNovoProdutoNome] = useState('')
  const [novoProdutoCodigo, setNovoProdutoCodigo] = useState('')
  const [novoProdutoPreco, setNovoProdutoPreco] = useState('')
  const [novoProdutoQuantidade, setNovoProdutoQuantidade] = useState('1')

  // Dados da loja
  const [lojaInfo, setLojaInfo] = useState<LojaInfo>({
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA',
    telefone: '(00) 00000-0000'
  })

  useEffect(() => {
    carregarProdutos()
    carregarLojaInfo()
  }, [])

  const carregarProdutos = () => {
    const saved = localStorage.getItem('produtos_estoque')
    if (saved) {
      setProdutos(JSON.parse(saved))
    } else {
      const exemplos = [
        { id: '1', nome: 'Arroz Integral 1kg', codigo: '7891234567890', preco: 8.90, estoque: 50, status: 'ativo' },
        { id: '2', nome: 'Feijão Preto 1kg', codigo: '7891234567891', preco: 7.90, estoque: 30, status: 'ativo' },
        { id: '3', nome: 'Açúcar 1kg', codigo: '7891234567892', preco: 4.50, estoque: 100, status: 'ativo' },
        { id: '4', nome: 'Café 500g', codigo: '7891234567893', preco: 12.90, estoque: 25, status: 'ativo' },
        { id: '5', nome: 'Óleo 900ml', codigo: '7891234567894', preco: 6.90, estoque: 40, status: 'ativo' },
      ]
      setProdutos(exemplos)
      localStorage.setItem('produtos_estoque', JSON.stringify(exemplos))
    }
  }

  const carregarLojaInfo = () => {
    const saved = localStorage.getItem('loja_info')
    if (saved) {
      setLojaInfo(JSON.parse(saved))
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

  const produtosFiltrados = buscaTermo.length >= 2 ? produtos.filter(p => p.nome.toLowerCase().includes(buscaTermo.toLowerCase())) : []

  const processarCodigo = () => {
    if (!codigoLeitor) return
    const produto = produtos.find(p => p.codigo === codigoLeitor)
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
    setMensagem(`✅ ${novoProdutoNome} cadastrado e adicionado! Aguardando validação.`)
    setTimeout(() => setMensagem(''), 3000)
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
      }).filter(Boolean) as Produto[]
    })
  }

  const removerItem = (id: string) => setCarrinho(prev => prev.filter(item => item.id !== id))
  const calcularTotal = () => carrinho.reduce((sum, item) => sum + ((item.preco || 0) * item.quantidade), 0)
  const limparCarrinho = () => { if (confirm('Limpar carrinho?')) setCarrinho([]) }
  const totalCompra = calcularTotal()

  const irParaCheckout = () => {
    if (carrinho.length === 0) { alert('Adicione produtos ao carrinho'); return }
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
      
      // Calcular saldo restante do cliente (exemplo: limite de R$500)
      const saldoRestante = 500 - totalCompra
      
      // Enviar notificação com dados completos da loja
      notificarCompraFiado(
        clienteNome,
        clienteTelefone,
        totalCompra,
        new Date(vendaFiada.vencimento),
        lojaInfo,
        saldoRestante
      )
      
      setMensagemNotificacao(`✅ Notificação enviada para ${clienteTelefone}`)
      setMostrarNotificacao(true)
      
      setConfirmacao({
        titulo: 'Venda no Fiado Registrada!',
        subtitulo: `${clienteNome}\nR$ ${totalCompra.toFixed(2)}`,
        cor: 'bg-yellow-500'
      })
    } else if (formaPagamento === 'dinheiro') {
      const recebido = parseFloat(valorRecebido)
      const troco = recebido - totalCompra
      
      if (clienteTelefone) {
        notificarCompraConfirmada(clienteTelefone, totalCompra, 'dinheiro', lojaInfo)
        setMensagemNotificacao(`✅ Notificação enviada`)
        setMostrarNotificacao(true)
      }
      
      setConfirmacao({
        titulo: 'Venda Finalizada!',
        subtitulo: `Total: R$ ${totalCompra.toFixed(2)}\nTroco: R$ ${troco.toFixed(2)}`,
        cor: 'bg-green-500'
      })
    } else {
      if (clienteTelefone) {
        notificarCompraConfirmada(clienteTelefone, totalCompra, formaPagamento, lojaInfo)
        setMensagemNotificacao(`✅ Notificação enviada`)
        setMostrarNotificacao(true)
      }
      
      setConfirmacao({
        titulo: 'Venda Finalizada!',
        subtitulo: `R$ ${totalCompra.toFixed(2)} - ${formaPagamento.toUpperCase()}`,
        cor: 'bg-green-500'
      })
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

  // TELA CADASTRO RÁPIDO
  if (showCadastroRapido) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-orange-500 text-white p-4 flex items-center gap-3">
          <button onClick={() => setShowCadastroRapido(false)} className="p-2"><ArrowLeft className="w-6 h-6" /></button>
          <span className="font-bold text-xl">Cadastro Rápido</span>
        </div>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold">Produto não encontrado</h2>
              <p className="text-sm text-gray-500">Complete o cadastro</p>
            </div>
            <div className="space-y-4">
              <input type="text" value={novoProdutoCodigo} className="w-full p-4 border rounded-xl bg-gray-50" readOnly placeholder="Código" />
              <input type="text" value={novoProdutoNome} onChange={(e) => setNovoProdutoNome(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="Nome do produto *" autoFocus />
              <div className="flex gap-3">
                <input type="number" step="0.01" value={novoProdutoPreco} onChange={(e) => setNovoProdutoPreco(e.target.value)} className="flex-1 p-4 border rounded-xl" placeholder="Preço R$ *" />
                <input type="number" value={novoProdutoQuantidade} onChange={(e) => setNovoProdutoQuantidade(e.target.value)} className="w-24 p-4 border rounded-xl" placeholder="Qtd" />
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl text-sm text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Este produto será validado pelo Admin Master
              </div>
              <button onClick={cadastrarProdutoRapido} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold">Adicionar ao Carrinho</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TELA CONFIRMAÇÃO
  if (tela === 'confirmacao') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className={`${confirmacao.cor} text-white p-10 text-center`}>
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">{confirmacao.titulo}</h1>
          <p className="text-lg mt-2">{confirmacao.subtitulo}</p>
        </div>
        <div className="p-6 max-w-md mx-auto">
          <button onClick={novaVenda} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg mb-3">Nova Venda</button>
          <Link href="/" className="block w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg text-center">Início</Link>
        </div>
      </div>
    )
  }

  // TELA PAGAMENTO
  if (tela === 'pagamento') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-green-600 text-white p-4 flex items-center gap-3">
          <button onClick={voltarParaCheckout} className="p-2"><ArrowLeft className="w-6 h-6" /></button>
          <span className="font-bold text-xl">Pagamento</span>
        </div>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-5">
            <h2 className="font-bold text-lg mb-3">Itens da Compra</h2>
            {carrinho.map(item => (
              <div key={item.id} className="border-b pb-2 mb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.nome}</span>
                  <span className="text-green-600 font-bold">R$ {((item.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Código: <span className="font-mono">{item.codigo || 'Não informado'}</span></span>
                  <span>Qtd: {item.quantidade}</span>
                </div>
                {item.status === 'pendente' && (
                  <div className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Produto pendente de validação
                  </div>
                )}
              </div>
            ))}
            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">R$ {totalCompra.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {formaPagamento === 'dinheiro' && (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <input type="number" step="0.01" value={valorRecebido} onChange={(e) => setValorRecebido(e.target.value)} className="w-full p-4 border rounded-xl text-center text-xl" placeholder="Valor recebido" autoFocus />
              {valorRecebido && parseFloat(valorRecebido) >= totalCompra && (
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-green-600 font-bold text-lg">Troco: R$ {(parseFloat(valorRecebido) - totalCompra).toFixed(2)}</p>
                </div>
              )}
              <button onClick={finalizarVenda} disabled={!valorRecebido || parseFloat(valorRecebido) < totalCompra} className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold">Confirmar</button>
            </div>
          )}

          {formaPagamento === 'pix' && (
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode className="w-32 h-32 text-gray-600" /></div>
              <button onClick={finalizarVenda} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold">Confirmar PIX</button>
            </div>
          )}

          {formaPagamento === 'cartao' && (
            <div className="bg-white rounded-2xl p-6 text-center">
              <button onClick={finalizarVenda} className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold">Confirmar Cartão</button>
            </div>
          )}

          {formaPagamento === 'fiado' && (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="Nome completo" />
              <input type="tel" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="WhatsApp" />
              <div className="bg-blue-50 p-3 rounded-xl text-sm text-center">📱 O cliente receberá a notificação com endereço da loja e saldo disponível</div>
              <button onClick={finalizarVenda} disabled={!clienteNome || !clienteTelefone} className="w-full py-4 bg-yellow-500 text-white rounded-xl font-bold">Registrar Fiado</button>
            </div>
          )}

          {formaPagamento === 'conecta' && (
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <input type="tel" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="WhatsApp" />
              <button onClick={finalizarVenda} disabled={!clienteTelefone} className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold">Pagar com Conecta</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // TELA CHECKOUT
  if (tela === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-green-600 text-white p-4 flex items-center gap-3">
          <button onClick={() => setTela('venda')} className="p-2"><ArrowLeft className="w-6 h-6" /></button>
          <span className="font-bold text-xl">Checkout</span>
        </div>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 mb-5">
            <h2 className="font-bold text-xl mb-4">Resumo da Compra</h2>
            {carrinho.map(item => (
              <div key={item.id} className="border-b pb-3 mb-3">
                <div className="flex justify-between text-base">
                  <span className="font-medium">{item.nome}</span>
                  <span className="text-green-600 font-bold">R$ {((item.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Código: <span className="font-mono">{item.codigo || 'N/A'}</span></span>
                  <span>Qtd: {item.quantidade}</span>
                </div>
                {item.status === 'pendente' && (
                  <div className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Aguardando validação
                  </div>
                )}
              </div>
            ))}
            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">R$ {totalCompra.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Pagamento</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => selecionarPagamento('dinheiro')} className="p-4 border-2 rounded-xl text-center">💰 Dinheiro</button>
              <button onClick={() => selecionarPagamento('pix')} className="p-4 border-2 rounded-xl text-center">📱 PIX</button>
              <button onClick={() => selecionarPagamento('cartao')} className="p-4 border-2 rounded-xl text-center">💳 Cartão</button>
              <button onClick={() => selecionarPagamento('fiado')} className="p-4 border-2 rounded-xl text-center">📝 Fiado</button>
              <button onClick={() => selecionarPagamento('conecta')} className="col-span-2 p-4 border-2 rounded-xl text-center">🪙 Conecta</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TELA PRINCIPAL (VENDA)
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2"><ArrowLeft className="w-6 h-6" /></Link>
          <span className="font-bold text-xl">PDV Valente</span>
        </div>
        <button onClick={() => setModo(modo === 'busca' ? 'leitor' : 'busca')} className="bg-white/20 px-4 py-2 rounded-full text-sm">
          {modo === 'busca' ? '📷 Leitor' : '🔍 Busca'}
        </button>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {mensagem && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-xl text-center">{mensagem}</div>}

        {mostrarNotificacao && (
          <div className="fixed top-20 left-4 right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg text-center animate-bounce z-50">
            {mensagemNotificacao}
          </div>
        )}

        {modo === 'leitor' ? (
          <div className="bg-white rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Leitor de Código</h2>
              <p className="text-sm text-gray-500">Digite o código de barras</p>
            </div>
            <div className="flex gap-2">
              <input type="text" value={codigoLeitor} onChange={(e) => setCodigoLeitor(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && processarCodigo()} className="flex-1 p-4 border rounded-xl text-lg font-mono" placeholder="7891234567890" autoFocus />
              <button onClick={processarCodigo} className="px-5 bg-blue-500 text-white rounded-xl">OK</button>
            </div>
            <button onClick={() => setModo('busca')} className="w-full mt-4 py-2 text-blue-500">Buscar por nome →</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-bold">Buscar Produto</h2>
              <p className="text-sm text-gray-500">Digite o nome do produto</p>
            </div>
            <input type="text" value={buscaTermo} onChange={(e) => setBuscaTermo(e.target.value)} className="w-full p-4 border-2 rounded-xl text-base" placeholder="Ex: Arroz, Feijão..." autoFocus />
            
            {produtosFiltrados.length > 0 && (
              <div className="mt-3 border rounded-xl overflow-hidden">
                {produtosFiltrados.map(produto => (
                  <button key={produto.id} onClick={() => adicionarAoCarrinho({ ...produto, quantidade: 1 })} className="w-full p-4 text-left hover:bg-gray-50 flex justify-between border-b">
                    <span>{produto.nome}</span>
                    <span className="text-green-600 font-bold">R$ {produto.preco.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}

            {buscaTermo.length >= 2 && produtosFiltrados.length === 0 && (
              <div className="mt-3 p-4 bg-yellow-50 rounded-xl text-center">
                <p className="text-yellow-800 mb-2">Produto "{buscaTermo}" não encontrado</p>
                <button onClick={() => { setNovoProdutoNome(buscaTermo); setNovoProdutoCodigo(''); setShowCadastroRapido(true) }} className="text-blue-500">Cadastrar novo →</button>
              </div>
            )}
          </div>
        )}

        {/* CARRINHO */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
          <div className="bg-gray-50 p-4 border-b flex justify-between">
            <span className="font-semibold text-lg">Carrinho ({carrinho.length})</span>
            {carrinho.length > 0 && <button onClick={limparCarrinho} className="text-red-500 text-sm">Limpar</button>}
          </div>
          
          {carrinho.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-4 border-b flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.nome}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-green-600 font-bold">R$ {(item.preco || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.codigo || '---'}</p>
                      </div>
                      {item.status === 'pendente' && <p className="text-xs text-yellow-500">⏳ Pendente validação</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-8 h-8 bg-gray-100 rounded-full">-</button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-8 h-8 bg-gray-100 rounded-full">+</button>
                      <button onClick={() => removerItem(item.id)} className="w-8 h-8 text-red-500">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl">Total</span>
                  <span className="text-3xl font-bold text-green-600">R$ {totalCompra.toFixed(2)}</span>
                </div>
                <button onClick={irParaCheckout} className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg">Finalizar Compra</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}