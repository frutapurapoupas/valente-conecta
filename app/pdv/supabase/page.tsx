'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Search, Package, ShoppingCart, CheckCircle, Loader2, AlertCircle, Check, Bluetooth, Wifi, QrCode } from 'lucide-react'
import { usePDVSupabase } from '@/hooks/usePDVSupabase'
import { DirectCameraScanner } from '@/components/ui/DirectCameraScanner'

export default function PDVSupabasePage() {
  const {
    carrinho,
    buscaTermo,
    produtosEncontrados,
    loading,
    error,
    vendasDoDia,
    showCadastroRapido,
    produtoPendente,
    total,
    setBuscaTermo,
    processarCodigo,
    adicionarAoCarrinho,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    cadastrarProdutoRapido,
    finalizarVenda,
    setShowCadastroRapido,
    formatarPreco,
    formatarData
  } = usePDVSupabase()

  const [showScanner, setShowScanner] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showExternalScanner, setShowExternalScanner] = useState(false)
  const [showRemoteScanner, setShowRemoteScanner] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [novoProdutoNome, setNovoProdutoNome] = useState('')
  const [novoProdutoPreco, setNovoProdutoPreco] = useState('')
  const [vendaConfirmada, setVendaConfirmada] = useState(false)
  const [confirmacaoMessage, setConfirmacaoMessage] = useState('')

  // TELA DE BOAS-VINDAS
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3">
          <Link href="/" className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-xl">PDV Colaborativo</h1>
            <p className="text-zinc-400 text-sm">Vendas: {vendasDoDia.length} hoje</p>
          </div>
          <div className="w-6 h-6" />
        </header>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Bem-vindo ao PDV</h2>
            <p className="text-zinc-400 text-lg">
              Escaneie produtos para iniciar as vendas
            </p>
          </div>

          {/* Botão Principal */}
          <button
            onClick={() => {
              setShowWelcome(false)
              setShowScanner(true)
            }}
            className="w-full max-w-sm bg-yellow-500 text-black py-6 rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-2xl hover:bg-yellow-400"
          >
            <Camera className="w-6 h-6 inline mr-2" />
            Iniciar PDV
          </button>

          {/* Opções de Scanner Externo */}
          <div className="mt-6 space-y-3">
            <p className="text-zinc-500 text-sm text-center">Ou use scanner externo:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowExternalScanner(true)}
                className="bg-zinc-800 text-zinc-300 py-3 rounded-xl font-medium hover:bg-zinc-700 transition-all"
              >
                <Bluetooth className="w-4 h-4 inline mr-2" />
                Bluetooth
              </button>
              <button
                onClick={() => setShowExternalScanner(true)}
                className="bg-zinc-800 text-zinc-300 py-3 rounded-xl font-medium hover:bg-zinc-700 transition-all"
              >
                <Wifi className="w-4 h-4 inline mr-2" />
                WiFi
              </button>
              <button
                onClick={() => setShowRemoteScanner(true)}
                className="col-span-2 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-400 transition-all"
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                Scanner Remoto (Celular)
              </button>
            </div>
          </div>

          {/* Informações */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm mb-2">
              Total do dia: {formatarPreco(vendasDoDia.reduce((acc, v) => acc + v.total, 0))}
            </p>
            <p className="text-zinc-600 text-xs">
              Câmera necessária para escaneamento automático
            </p>
          </div>
        </div>
      </div>
    )
  }

  // TELA CADASTRO RÁPIDO
  if (showCadastroRapido) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setShowCadastroRapido(false)} className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-xl text-white">Cadastro Rápido</span>
        </header>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-10 h-10 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Produto não encontrado</h2>
              <p className="text-zinc-400 text-sm mt-1">
                {produtoPendente?.ean ? `Código: ${produtoPendente.ean}` : 'Cadastre manualmente'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={novoProdutoNome}
                  onChange={(e) => setNovoProdutoNome(e.target.value)}
                  placeholder="Digite o nome"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Preço (R$)</label>
                <input
                  type="number"
                  value={novoProdutoPreco}
                  onChange={(e) => setNovoProdutoPreco(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCadastroRapido(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (novoProdutoNome && novoProdutoPreco) {
                      cadastrarProdutoRapido(
                        novoProdutoNome,
                        produtoPendente?.ean || null,
                        parseFloat(novoProdutoPreco)
                      )
                      setNovoProdutoNome('')
                      setNovoProdutoPreco('')
                    }
                  }}
                  disabled={loading || !novoProdutoNome || !novoProdutoPreco}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-xl font-medium disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cadastrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TELA CHECKOUT
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setShowCheckout(false)} className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-xl text-white">Finalizar Venda</span>
        </header>

        <div className="p-4 max-w-md mx-auto space-y-4">
          {/* Resumo da Venda */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Resumo da Venda</h3>
            <div className="space-y-2 mb-4">
              {carrinho.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-300">{item.quantidade}x {item.nome}</span>
                  <span className="text-white font-medium">{formatarPreco(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-700 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-yellow-500">{formatarPreco(total)}</span>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Dados do Cliente (Opcional)</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="tel"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                placeholder="Telefone"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Dinheiro', 'Pix', 'Cartão', 'Fiado'].map((pagamento) => (
                <button
                  key={pagamento}
                  onClick={() => setFormaPagamento(pagamento)}
                  className={`p-3 rounded-xl font-medium transition-all ${
                    formaPagamento === pagamento
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {pagamento}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem de feedback */}
          {confirmacaoMessage && (
            <div className={`p-3 rounded-xl text-center ${
              vendaConfirmada 
                ? 'bg-emerald-500/20 border border-emerald-500' 
                : 'bg-red-500/20 border border-red-500'
            }`}>
              <p className={`text-sm ${
                vendaConfirmada ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {confirmacaoMessage}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCheckout(false)
                setConfirmacaoMessage('')
              }}
              className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium"
            >
              Voltar
            </button>
            <button
              onClick={async () => {
                if (formaPagamento && !loading) {
                  setVendaConfirmada(false)
                  setConfirmacaoMessage('')
                  
                  const sucesso = await finalizarVenda(formaPagamento, clienteNome, clienteTelefone)
                  
                  if (sucesso) {
                    setVendaConfirmada(true)
                    setConfirmacaoMessage('Venda confirmada com sucesso!')
                    
                    // Fechar checkout após 2 segundos
                    setTimeout(() => {
                      setShowCheckout(false)
                      setFormaPagamento('')
                      setClienteNome('')
                      setClienteTelefone('')
                      setVendaConfirmada(false)
                      setConfirmacaoMessage('')
                    }, 2000)
                  } else {
                    setConfirmacaoMessage('Erro ao confirmar venda. Tente novamente.')
                  }
                }
              }}
              disabled={loading || !formaPagamento}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                vendaConfirmada 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-yellow-500 text-black disabled:opacity-50'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : vendaConfirmada ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Confirmado!</span>
                </div>
              ) : (
                'Confirmar Venda'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // TELA PRINCIPAL PDV
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="p-2 text-zinc-400 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl">PDV Colaborativo</h1>
          <p className="text-zinc-400 text-sm">Vendas: {vendasDoDia.length} hoje</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Total do Dia</p>
          <p className="text-lg font-bold text-yellow-500">
            {formatarPreco(vendasDoDia.reduce((acc, v) => acc + v.total, 0))}
          </p>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Busca e Scanner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={buscaTermo}
                onChange={(e) => setBuscaTermo(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="p-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Resultados da Busca */}
          {produtosEncontrados.length > 0 && (
            <div className="mt-3 space-y-2">
              {produtosEncontrados.map((produto) => (
                <button
                  key={produto.id}
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-left hover:bg-zinc-700 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{produto.nome}</p>
                      {produto.ean && <p className="text-xs text-zinc-400">{produto.ean}</p>}
                    </div>
                    <p className="font-bold text-yellow-500">{formatarPreco(produto.preco || 0)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-3 flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Carrinho */}
        {carrinho.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrinho ({carrinho.length})
              </h3>
              <button
                onClick={limparCarrinho}
                className="text-zinc-400 hover:text-red-400 text-sm"
              >
                Limpar
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {carrinho.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.nome}</p>
                    <p className="text-xs text-zinc-400">{formatarPreco(item.preco || 0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                      className="w-6 h-6 bg-zinc-700 rounded text-zinc-300 hover:bg-zinc-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantidade}</span>
                    <button
                      onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                      className="w-6 h-6 bg-zinc-700 rounded text-zinc-300 hover:bg-zinc-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="w-6 h-6 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-700 pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-yellow-500">{formatarPreco(total)}</span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 bg-yellow-500 text-black rounded-xl font-medium hover:bg-yellow-400 transition"
              >
                Finalizar Venda
              </button>
            </div>
          </div>
        )}

        {/* Vendas do Dia */}
        {vendasDoDia.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-3">Vendas do Dia</h3>
            <div className="space-y-2">
              {vendasDoDia.slice(0, 5).map((venda) => (
                <div key={venda.id} className="flex justify-between items-center p-2 bg-zinc-800 rounded-lg">
                  <div>
                    <p className="text-sm text-white">{venda.itens.length} itens</p>
                    <p className="text-xs text-zinc-400">{formatarData(venda.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-500">{formatarPreco(venda.total)}</p>
                    <p className="text-xs text-zinc-400">{venda.forma_pagamento}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direct Camera Scanner Modal */}
      {showScanner && (
        <DirectCameraScanner
          onScanSuccess={(codigo: string) => {
            processarCodigo(codigo)
            setShowScanner(false)
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
