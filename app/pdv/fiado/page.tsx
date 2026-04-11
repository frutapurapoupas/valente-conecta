'use client'

import Link from 'next/link'
import { ArrowLeft, Search, Calendar, User, Phone, AlertCircle, Zap } from 'lucide-react'
import { useFiadoPage } from '@/hooks/useFiadoPage'

export default function FiadoPage() {
  const {
    vendasFiltradas,
    filtro, setFiltro,
    searchTerm, setSearchTerm,
    showPagamentoModal, setShowPagamentoModal,
    showUpgradeAlert, setShowUpgradeAlert,
    planoPago,
    registrarPagamento,
    handleNotificarVencimento,
    totalPendente,
    totalVencido,
    countPendente,
    countVencido,
  } = useFiadoPage()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/pdv" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-bold text-lg">Gestão de Fiado</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total em Fiado</p>
            <p className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{countPendente} clientes</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Vencido</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalVencido.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{countVencido} clientes</p>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filtro === 'todos' ? 'bg-gray-900 text-white' : 'bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('pendente')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filtro === 'pendente' ? 'bg-yellow-500 text-white' : 'bg-gray-100'
              }`}
            >
              Pendente
            </button>
            <button
              onClick={() => setFiltro('vencido')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filtro === 'vencido' ? 'bg-red-500 text-white' : 'bg-gray-100'
              }`}
            >
              Vencido
            </button>
            <button
              onClick={() => setFiltro('pago')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filtro === 'pago' ? 'bg-green-500 text-white' : 'bg-gray-100'
              }`}
            >
              Pago
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do cliente..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Lista de vendas fiadas */}
        <div className="space-y-3">
          {vendasFiltradas.map(venda => (
            <div key={venda.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold">{venda.clienteNome}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500">{venda.clienteTelefone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-yellow-600">R$ {venda.valor.toFixed(2)}</p>
                  <p className={`text-xs px-2 py-0.5 rounded-full ${
                    venda.status === 'pago' ? 'bg-green-100 text-green-700' :
                    venda.status === 'vencido' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {venda.status === 'pago' ? '✓ Pago' :
                     venda.status === 'vencido' ? '⚠️ Vencido' :
                     '⏳ Pendente'}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Venda: {new Date(venda.data).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Vence: {new Date(venda.vencimento).toLocaleDateString()}</span>
                </div>
              </div>

              {venda.status === 'pendente' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleNotificarVencimento(venda)}
                    className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                      planoPago
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {planoPago ? 'Notificar' : 'Notificar 🔒'}
                  </button>
                  <button
                    onClick={() => setShowPagamentoModal(venda)}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold"
                  >
                    Registrar Pagamento
                  </button>
                </div>
              )}
            </div>
          ))}

          {vendasFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma venda encontrada</p>
            </div>
          )}
        </div>
      </main>

      {/* Alerta upgrade de plano */}
      {showUpgradeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center">
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Funcionalidade Premium</h2>
            <p className="text-gray-500 text-sm mb-4">
              O envio de notificações push e WhatsApp para o comprador — com nome da loja, valor da compra e saldo disponível — está disponível apenas nos <strong>planos pagos</strong>.
            </p>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-700 mb-5 text-left">
              <p className="font-bold mb-1">Com o plano pago você também libera:</p>
              <p>• Notificação automática de vencimento</p>
              <p>• Aviso de pagamento confirmado ao comprador</p>
              <p>• Relatórios avançados de fiado</p>
            </div>
            <button
              onClick={() => setShowUpgradeAlert(false)}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-bold mb-2"
            >
              Ver Planos
            </button>
            <button
              onClick={() => setShowUpgradeAlert(false)}
              className="w-full py-2 text-gray-400 text-sm"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPagamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Registrar Pagamento</h2>
              <p className="text-sm text-gray-500">Cliente: {showPagamentoModal.clienteNome}</p>
              <p className="text-lg font-bold text-yellow-600">R$ {showPagamentoModal.valor.toFixed(2)}</p>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => registrarPagamento(showPagamentoModal, 'dinheiro')}
                className="w-full p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50"
              >
                <span>💵 Dinheiro</span>
                <span className="text-green-600">Registrar →</span>
              </button>
              <button
                onClick={() => registrarPagamento(showPagamentoModal, 'pix')}
                className="w-full p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50"
              >
                <span>📱 PIX</span>
                <span className="text-green-600">Registrar →</span>
              </button>
              <button
                onClick={() => registrarPagamento(showPagamentoModal, 'cartao')}
                className="w-full p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50"
              >
                <span>💳 Cartão</span>
                <span className="text-green-600">Registrar →</span>
              </button>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowPagamentoModal(null)}
                className="w-full py-3 bg-gray-200 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}