'use client'

import Link from 'next/link'
import { ArrowLeft, Camera, Plus, Minus, Trash2, CreditCard, Scan, ShoppingCart, Smartphone, AlertCircle, Loader2, CheckCircle, Phone, User } from 'lucide-react'
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
            <div className="space-y-2 max-h-64 overflow-auto mb-4">
              {carrinho.map(item => (
                <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                  <span>{item.nome} x{item.quantidade}</span>
                  <span className="font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold mb-3">Forma de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'dinheiro', label: '💰 Dinheiro', color: 'green' },
                { id: 'pix', label: '📱 PIX', color: 'blue' },
                { id: 'cartao', label: '💳 Cartão', color: 'purple' },
                { id: 'fiado', label: '📝 Fiado', color: 'yellow' },
                { id: 'conecta', label: '🪙 Conecta', color: 'indigo' }
              ].map(metodo => (
                <button
                  key={metodo.id}
                  onClick={() => setFormaPagamento(metodo.id as any)}
                  className={`p-3 rounded-xl text-center transition border-2 ${
                    formaPagamento === metodo.id
                      ? `border-${metodo.color}-500 bg-${metodo.color}-50`
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-xl">{metodo.label}</span>
                </button>
              ))}
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

  // Tela de Fiado
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
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">Dados do Cliente</h2>
              <p className="text-sm text-gray-500">Preencha as informações para registrar o fiado</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo</label>
                <input
                  type="text"
                  value={clienteInfo.nome}
                  onChange={(e) => setClienteInfo({...clienteInfo, nome: e.target.value})}
                  className="w-full px-4 py-3 border rounded-xl text-lg"
                  placeholder="Digite o nome do cliente"
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

              <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-2">📝 Informações importantes:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ O cliente receberá uma notificação via WhatsApp</li>
                  <li>✓ Vencimento em 30 dias</li>
                  <li>✓ O cliente poderá pagar via PIX, dinheiro ou cartão</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span>Total da compra:</span>
                  <span className="font-bold text-green-600">R$ {calcularTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={registrarFiado}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-lg"
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 sticky top-0 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/pdv" className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">PDV - Leitor</span>
        </div>
        <button
          onClick={() => {
            if (modo === 'camera' && scanning) pararCamera()
            setModo(modo === 'camera' ? 'manual' : 'camera')
          }}
          className="bg-white/20 px-3 py-1.5 rounded-full text-sm"
        >
          {modo === 'camera' ? '⌨️ Manual' : '📷 Câmera'}
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {/* Área do Leitor */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              {modo === 'camera' ? <Camera className="w-10 h-10 text-blue-600" /> : <Smartphone className="w-10 h-10 text-blue-600" />}
            </div>
            <h2 className="text-lg font-bold">
              {modo === 'camera' ? 'Leitor por Câmera' : 'Entrada Manual'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{mensagem || (modo === 'camera' ? 'Aponte para o código' : 'Digite o código')}</p>
          </div>

          {modo === 'camera' ? (
            <>
              {!scanning ? (
                <button
                  onClick={iniciarCamera}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  {loading ? 'Iniciando...' : 'Iniciar Câmera'}
                </button>
              ) : (
                <>
                  <div id="reader" className="w-full rounded-xl overflow-hidden mb-3" style={{ minHeight: '250px' }}></div>
                  <button onClick={pararCamera} className="w-full py-2 bg-red-500 text-white rounded-xl font-semibold">
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
                  className="flex-1 px-4 py-3 border-2 rounded-xl text-lg font-mono"
                  autoFocus
                />
                <button onClick={handleCodigoManual} className="px-5 bg-blue-500 text-white rounded-xl font-semibold">
                  OK
                </button>
              </div>
              <div className="text-center text-xs text-gray-400">
                <p>Códigos para teste:</p>
                <p className="font-mono">7891234567890 - Arroz R$8,90</p>
                <p className="font-mono">7891234567891 - Feijão R$7,90</p>
                <p className="font-mono">7891234567892 - Açúcar R$4,50</p>
              </div>
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
            <span className="font-semibold">Carrinho ({carrinho.length})</span>
            {carrinho.length > 0 && (
              <button onClick={limparCarrinho} className="text-red-500 text-sm">
                Limpar
              </button>
            )}
          </div>
          
          {carrinho.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-xs mt-1">Escaneie ou digite um código</p>
            </div>
          ) : (
            <>
              <div className="max-h-64 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="p-3 border-b flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.nome}</p>
                      <p className="text-green-600 font-bold">R$ {item.preco.toFixed(2)}</p>
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
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-lg"
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mensagem de sucesso do fiado */}
        {fiadoRegistrado && (
          <div className="fixed bottom-4 left-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
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