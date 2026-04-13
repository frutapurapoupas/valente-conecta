'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, ShoppingCart, Smartphone, Loader2, CheckCircle, User } from 'lucide-react'
import { useVendaPage } from '@/hooks/useVendaPage'

export default function VendaPage() {
  const {
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
  } = useVendaPage()

  // Tela de Checkout
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 flex items-center gap-3 z-10">
          <button onClick={() => setShowCheckout(false)} className="p-1 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg text-white">Checkout</span>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
            <h2 className="font-bold text-lg text-white mb-3">Resumo da Compra</h2>
            <div className="space-y-2 max-h-64 overflow-auto mb-4">
              {carrinho.map(item => (
                <div key={item.id} className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                  <span className="text-zinc-300">{item.nome} x{item.quantidade}</span>
                  <span className="font-medium text-white">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-zinc-400">Total</span>
                <span className="text-green-400">R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'dinheiro', label: '💰 Dinheiro' },
                { id: 'pix', label: '📱 PIX' },
                { id: 'cartao', label: '💳 Cartão' },
                { id: 'fiado', label: '📝 Fiado' },
                { id: 'conecta', label: '🪙 Conecta' },
              ].map(metodo => (
                <button
                  key={metodo.id}
                  onClick={() => setFormaPagamento(metodo.id as any)}
                  className="p-3 rounded-xl text-center transition border-2"
                >
                  {metodo.label}
                </button>
              ))}
            </div>
            <button
              onClick={finalizarVenda}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition"
            >
              Confirmar Pagamento
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Tela de Fiado
  if (showFiadoModal) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 flex items-center gap-3 z-10">
          <button onClick={() => setShowFiadoModal(false)} className="p-1 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg text-white">Venda no Fiado</span>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Dados do Cliente</h2>
              <p className="text-sm text-zinc-400">Preencha para registrar o fiado</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={clienteInfo.nome}
                  onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={clienteInfo.telefone}
                  onChange={(e) => setClienteInfo({...clienteInfo, telefone: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-300 mb-2">📝 Informações importantes:</p>
                <ul className="space-y-1 text-xs text-amber-400/80">
                  <li>✓ O cliente receberá uma notificação via WhatsApp</li>
                  <li>✓ Vencimento em 30 dias</li>
                  <li>✓ O cliente poderá pagar via PIX, dinheiro ou cartão</li>
                </ul>
              </div>
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Total da compra:</span>
                  <span className="font-bold text-green-400">R$ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={registrarFiado}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-lg transition"
              >
                Registrar Fiado
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Tela principal do PDV
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link href="/pdv" className="p-1 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg text-white">PDV — Leitor</span>
        </div>
        <button
          onClick={() => {
            if (modo === 'camera' && scanning) pararCamera()
            setModo(modo === 'camera' ? 'manual' : 'camera')
          }}
          className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-sm text-zinc-300 hover:text-white transition"
        >
          {modo === 'camera' ? '⌨️ Manual' : '📷 Câmera'}
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Área do Leitor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
              {modo === 'camera' ? <Camera className="w-10 h-10 text-blue-400" /> : <Smartphone className="w-10 h-10 text-blue-400" />}
            </div>
            <h2 className="text-lg font-bold text-white">
              {modo === 'camera' ? 'Leitor por Câmera' : 'Entrada Manual'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{mensagem || (modo === 'camera' ? 'Aponte para o código' : 'Digite o código')}</p>
          </div>

          {modo === 'camera' ? (
            <>
              {!scanning ? (
                <button
                  onClick={iniciarCamera}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  {loading ? 'Iniciando...' : 'Iniciar Câmera'}
                </button>
              ) : (
                <>
                  <div id="reader" className="w-full rounded-xl overflow-hidden mb-3" style={{ minHeight: '250px' }}></div>
                  <button onClick={pararCamera} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition">
                    Parar Câmera
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCodigoManual()}
                  placeholder="Digite o código de barras"
                  className="flex-1 px-4 py-3 bg-zinc-800 border-2 border-zinc-700 rounded-xl text-white placeholder-zinc-500 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={handleCodigoManual} className="px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition">
                  OK
                </button>
              </div>
              <div className="text-center text-xs text-zinc-500">
                <p>Códigos para teste:</p>
                <p className="font-mono">7891234567890 · Arroz R,90</p>
                <p className="font-mono">7891234567891 · Feijão R,90</p>
                <p className="font-mono">7891234567892 · Açúcar R,50</p>
              </div>
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex justify-between items-center">
            <span className="font-semibold text-white">Carrinho ({carrinho.length})</span>
            {carrinho.length > 0 && (
              <button onClick={limparCarrinho} className="text-red-400 text-sm hover:text-red-300 transition">
                Limpar
              </button>
            )}
          </div>

          {carrinho.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-xs mt-1">Escaneie ou digite um código</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-3 border-b border-zinc-800 flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{item.nome}</p>
                      <p className="text-green-400 font-bold">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition">-</button>
                      <span className="w-6 text-center font-semibold text-white">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition">+</button>
                      <button onClick={() => removerItem(item.id)} className="w-7 h-7 text-red-400 hover:text-red-300 transition">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-zinc-800 bg-zinc-800/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-white">Total</span>
                  <span className="text-2xl font-bold text-green-400">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition"
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>

        {fiadoRegistrado && (
          <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Venda no fiado registrada!</p>
              <p className="text-sm opacity-90">Notificação enviada ao cliente</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
