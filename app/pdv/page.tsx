'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, Search, Package, ShoppingCart, CheckCircle, QrCode, Loader2, AlertCircle } from 'lucide-react'
import { usePDVPage } from '@/hooks/usePDVPage'

export default function PDVPage() {
  const {
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
  } = usePDVPage()

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
              <p className="text-sm text-zinc-400">Digite o código de barras e o nome do produto</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Código de barras (EAN)</label>
                <input
                  type="text"
                  value={novoProdutoCodigo}
                  onChange={(e) => setNovoProdutoCodigo(e.target.value)}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="7891234567890"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do produto *</label>
                <input
                  type="text"
                  value={novoProdutoNome}
                  onChange={(e) => setNovoProdutoNome(e.target.value)}
                  className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Produto X"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novoProdutoPreco}
                    onChange={(e) => setNovoProdutoPreco(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0,00"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Qtd</label>
                  <input
                    type="number"
                    value={novoProdutoQuantidade}
                    onChange={(e) => setNovoProdutoQuantidade(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-sm text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                Este produto será validado pelo Admin Master antes de aparecer no catálogo público.
              </div>
              <button onClick={cadastrarProdutoRapido} className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold transition">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TELA CONFIRMAÇÃO
  if (tela === 'confirmacao') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="p-10 text-center bg-zinc-900 border-b border-zinc-800">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">{confirmacao.titulo}</h1>
          <p className="text-lg mt-2 text-zinc-400">{confirmacao.subtitulo}</p>
        </div>
        <div className="p-6 max-w-md mx-auto">
          <button onClick={novaVenda} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg mb-3 transition">
            Nova Venda
          </button>
          <Link href="/" className="block w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-lg text-center transition">
            Início
          </Link>
        </div>
      </div>
    )
  }

  // TELA PAGAMENTO
  if (tela === 'pagamento') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={voltarParaCheckout} className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-xl text-white">Pagamento</span>
        </header>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-5">
            <h2 className="font-bold text-lg text-white mb-3">Itens da Compra</h2>
            {carrinho.map(item => (
              <div key={item.id} className="border-b border-zinc-800 pb-2 mb-2">
                <div className="flex justify-between">
                  <span className="font-medium text-white">{item.nome}</span>
                  <span className="text-green-400 font-bold">R$ {((item.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Código: <span className="font-mono">{item.codigo || 'Não informado'}</span></span>
                  <span>Qtd: {item.quantidade}</span>
                </div>
                {item.status === 'pendente' && (
                  <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Produto pendente de validação
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-zinc-800 pt-3 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-zinc-400">Total</span>
                <span className="text-green-400">R$ {totalCompra.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {formaPagamento === 'dinheiro' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <input
                type="number"
                step="0.01"
                value={valorRecebido}
                onChange={(e) => setValorRecebido(e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-center text-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Valor recebido"
                autoFocus
              />
              {valorRecebido && parseFloat(valorRecebido) >= totalCompra && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <p className="text-green-400 font-bold text-lg">Troco: R$ {(parseFloat(valorRecebido) - totalCompra).toFixed(2)}</p>
                </div>
              )}
              <button
                onClick={finalizarVenda}
                disabled={!valorRecebido || parseFloat(valorRecebido) < totalCompra}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          )}

          {formaPagamento === 'pix' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <div className="w-40 h-40 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-32 h-32 text-zinc-400" />
              </div>
              <button onClick={finalizarVenda} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition">
                Confirmar PIX
              </button>
            </div>
          )}

          {formaPagamento === 'cartao' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <button onClick={finalizarVenda} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition">
                Confirmar Cartão
              </button>
            </div>
          )}

          {formaPagamento === 'fiado' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Nome completo"
              />
              <input
                type="tel"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="WhatsApp"
              />
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-sm text-center text-blue-300">
                📱 O cliente receberá a notificação com endereço da loja e saldo disponível
              </div>
              <button
                onClick={finalizarVenda}
                disabled={!clienteNome || !clienteTelefone}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition disabled:opacity-50"
              >
                Registrar Fiado
              </button>
            </div>
          )}

          {formaPagamento === 'conecta' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <input
                type="tel"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="WhatsApp"
              />
              <button
                onClick={finalizarVenda}
                disabled={!clienteTelefone}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition disabled:opacity-50"
              >
                Pagar com Conecta
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // TELA CHECKOUT
  if (tela === 'checkout') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setTela('venda')} className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-xl text-white">Checkout</span>
        </header>
        <div className="p-4 max-w-md mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-5">
            <h2 className="font-bold text-xl text-white mb-4">Resumo da Compra</h2>
            {carrinho.map(item => (
              <div key={item.id} className="border-b border-zinc-800 pb-3 mb-3">
                <div className="flex justify-between text-base">
                  <span className="font-medium text-white">{item.nome}</span>
                  <span className="text-green-400 font-bold">R$ {((item.preco || 0) * item.quantidade).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Código: <span className="font-mono">{item.codigo || 'N/A'}</span></span>
                  <span>Qtd: {item.quantidade}</span>
                </div>
                {item.status === 'pendente' && (
                  <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Aguardando validação
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-zinc-800 pt-4 mt-2">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-zinc-400">Total</span>
                <span className="text-green-400">R$ {totalCompra.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-white mb-4">Pagamento</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'dinheiro', label: '💰 Dinheiro' },
                { id: 'pix', label: '📱 PIX' },
                { id: 'cartao', label: '💳 Cartão' },
                { id: 'fiado', label: '📝 Fiado' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => selecionarPagamento(m.id as any)}
                  className="p-4 border-2 border-zinc-700 hover:border-zinc-500 rounded-xl text-center text-zinc-300 hover:text-white transition"
                >
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => selecionarPagamento('conecta')}
                className="col-span-2 p-4 border-2 border-zinc-700 hover:border-zinc-500 rounded-xl text-center text-zinc-300 hover:text-white transition"
              >
                🪙 Conecta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TELA PRINCIPAL (VENDA)
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="font-bold text-xl text-white">PDV Valente</span>
        </div>
        {cameraSuportada && (
          <button
            onClick={() => {
              if (modo === 'leitor') {
                pararCamera()
              } else {
                iniciarCamera()
              }
              setModo(modo === 'busca' ? 'leitor' : 'busca')
            }}
            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-full text-sm text-zinc-300 hover:text-white transition"
          >
            {modo === 'busca' ? '📷 Câmera' : '🔍 Busca'}
          </button>
        )}
      </header>

      <div className="p-4 max-w-md mx-auto">
        {mensagem && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl text-center">
            {mensagem}
          </div>
        )}

        {mostrarNotificacao && (
          <div className="fixed top-20 left-4 right-4 bg-green-600 text-white p-3 rounded-xl shadow-lg text-center z-50">
            {mensagemNotificacao}
          </div>
        )}

        {modo === 'leitor' && cameraSuportada ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className={w-12 h-12 text-blue-400 } />
              </div>
              <h2 className="text-xl font-bold text-white">Leitor de Código</h2>
              <p className="text-sm text-zinc-400">Aponte a câmera para o código de barras</p>
            </div>
            {!scanning ? (
              <button
                onClick={iniciarCamera}
                disabled={loadingCamera}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loadingCamera ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                {loadingCamera ? 'Iniciando...' : 'Iniciar Câmera'}
              </button>
            ) : (
              <>
                <div id="reader" className="w-full rounded-xl overflow-hidden mb-3" style={{ minHeight: '250px' }}></div>
                <button onClick={pararCamera} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition">
                  Parar Câmera
                </button>
              </>
            )}
            <button onClick={() => setModo('busca')} className="w-full mt-4 py-2 text-blue-400 hover:text-blue-300 transition text-sm">
              Não consegue ler? Buscar por nome →
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Buscar Produto</h2>
              <p className="text-sm text-zinc-400">Digite o nome ou código de barras</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={buscaTermo}
                onChange={(e) => setBuscaTermo(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const produto = produtos.find(p => p.codigo === buscaTermo || p.nome.toLowerCase().includes(buscaTermo.toLowerCase()))
                    if (produto) {
                      adicionarAoCarrinho({ ...produto, quantidade: 1 })
                      setBuscaTermo('')
                    } else if (buscaTermo.length >= 2) {
                      setNovoProdutoNome(buscaTermo)
                      setNovoProdutoCodigo('')
                      setNovoProdutoPreco('')
                      setNovoProdutoQuantidade('1')
                      setShowCadastroRapido(true)
                    }
                  }
                }}
                className="flex-1 p-4 bg-zinc-800 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Arroz ou 7891234567890..."
                autoFocus
              />
              <button
                onClick={() => {
                  const produto = produtos.find(p => p.codigo === buscaTermo || p.nome.toLowerCase().includes(buscaTermo.toLowerCase()))
                  if (produto) {
                    adicionarAoCarrinho({ ...produto, quantidade: 1 })
                    setBuscaTermo('')
                  } else if (buscaTermo.length >= 2) {
                    setNovoProdutoNome(buscaTermo)
                    setNovoProdutoCodigo('')
                    setNovoProdutoPreco('')
                    setNovoProdutoQuantidade('1')
                    setShowCadastroRapido(true)
                  }
                }}
                className="px-5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition"
              >
                Buscar
              </button>
            </div>

            {produtosFiltrados.length > 0 && (
              <div className="mt-3 border border-zinc-700 rounded-xl overflow-hidden max-h-64 overflow-auto bg-zinc-900">
                {produtosFiltrados.map(produto => (
                  <button
                    key={produto.id}
                    onClick={() => adicionarAoCarrinho({ ...produto, quantidade: 1 })}
                    className="w-full p-3 text-left hover:bg-zinc-800 flex items-center gap-3 border-b border-zinc-800 last:border-b-0 transition"
                  >
                    <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {produto.imagem ? (
                        <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{produto.nome}</p>
                      <p className="text-xs text-green-400">R$ {produto.preco.toFixed(2)}</p>
                      {produto.codigo && <p className="text-xs text-zinc-500 font-mono">{produto.codigo}</p>}
                    </div>
                    <span className="text-green-400 font-bold">+</span>
                  </button>
                ))}
              </div>
            )}

            {buscaTermo.length >= 2 && produtosFiltrados.length === 0 && (
              <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <p className="text-amber-300 mb-2">Produto "{buscaTermo}" não encontrado</p>
                <button
                  onClick={() => {
                    setNovoProdutoNome(buscaTermo)
                    setNovoProdutoCodigo('')
                    setNovoProdutoPreco('')
                    setNovoProdutoQuantidade('1')
                    setShowCadastroRapido(true)
                  }}
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  Cadastrar novo produto →
                </button>
              </div>
            )}
          </div>
        )}

        {/* CARRINHO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-4">
          <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
            <span className="font-semibold text-lg text-white">Carrinho ({carrinho.length})</span>
            {carrinho.length > 0 && (
              <button onClick={limparCarrinho} className="text-red-400 text-sm hover:text-red-300 transition">Limpar</button>
            )}
          </div>

          {carrinho.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-xs mt-1">Use a câmera ou digite o código</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-4 border-b border-zinc-800 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.nome}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-green-400 font-bold">R$ {(item.preco || 0).toFixed(2)}</p>
                        <p className="text-xs text-zinc-500 font-mono">{item.codigo || '---'}</p>
                      </div>
                      {item.status === 'pendente' && <p className="text-xs text-amber-400">⏳ Pendente validação</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition">-</button>
                      <span className="w-8 text-center text-white">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition">+</button>
                      <button onClick={() => removerItem(item.id)} className="w-8 h-8 text-red-400 hover:text-red-300 transition">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-zinc-800 bg-zinc-800/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl text-white">Total</span>
                  <span className="text-3xl font-bold text-green-400">R$ {totalCompra.toFixed(2)}</span>
                </div>
                <button onClick={irParaCheckout} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition">
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
