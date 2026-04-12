'use client'

import Link from 'next/link'
import { ArrowLeft, Search, Calendar, User, Phone, AlertCircle, Zap, CheckCircle2, Clock, Crown } from 'lucide-react'
import type { VendaFiada } from '@/hooks/useFiadoPage'
import { useFiadoPage } from '@/hooks/useFiadoPage'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

const STATUS_CLS: Record<VendaFiada['status'], string> = {
  pendente: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  vencido:  'bg-red-500/15 text-red-400 border-red-500/30',
  pago:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}
const STATUS_LABEL: Record<VendaFiada['status'], string> = {
  pendente: 'Pendente',
  vencido:  'Vencido',
  pago:     'Pago',
}

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
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/pdv" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">GestÃ£o de Fiado</h1>
            <p className="text-xs text-zinc-500">Controle de vendas a prazo</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase">Em Fiado</p>
            <p className="text-2xl font-black text-amber-300">{fmtMoeda(totalPendente)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{countPendente} clientes</p>
          </div>
          <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase">Vencido</p>
            <p className="text-2xl font-black text-red-300">{fmtMoeda(totalVencido)}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{countVencido} clientes</p>
          </div>
        </div>

        {/* Aviso plano grÃ¡tis */}
        {!planoPago && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-300">Plano GrÃ¡tis â€” NotificaÃ§Ãµes desativadas</p>
              <p className="text-xs text-zinc-400 mt-0.5">No plano pago, o comprador recebe push/WhatsApp com nome da loja, valor e saldo apÃ³s cada fiado.</p>
            </div>
            <Link href="/empresa/planos" className="flex-shrink-0 text-xs font-black text-amber-400 hover:text-amber-300 uppercase mt-0.5">
              Upgrade â†’
            </Link>
          </div>
        )}

        {/* Busca + Filtros */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do cliente..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-base text-white placeholder:text-zinc-600 outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['todos', 'pendente', 'vencido', 'pago'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap transition-all ${
                  filtro === f
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {vendasFiltradas.length === 0 && (
            <p className="text-center py-16 text-zinc-600 font-bold">Nenhuma venda encontrada</p>
          )}

          {vendasFiltradas.map(venda => (
            <div key={venda.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-black text-white">{venda.clienteNome}</p>
                    <p className="text-sm text-zinc-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{venda.clienteTelefone}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-xl text-amber-300">{fmtMoeda(venda.valor)}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CLS[venda.status]}`}>
                    {STATUS_LABEL[venda.status]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Venda: {fmtData(venda.data)}
                </span>
                <span className={`flex items-center gap-1 ${venda.status === 'vencido' ? 'text-red-400' : ''}`}>
                  <Clock className="w-3 h-3" /> Vence: {fmtData(venda.vencimento)}
                </span>
              </div>

              {venda.status === 'pendente' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNotificarVencimento(venda)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      planoPago
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {planoPago ? 'Notificar' : 'Notificar ðŸ”’'}
                  </button>
                  <button
                    onClick={() => setShowPagamentoModal(venda)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Registrar Pagamento
                  </button>
                </div>
              )}

              {venda.status === 'vencido' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNotificarVencimento(venda)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      planoPago
                        ? 'bg-red-500/15 border-red-500/30 text-red-300 hover:bg-red-500/25'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {planoPago ? 'Cobrar' : 'Cobrar ðŸ”’'}
                  </button>
                  <button
                    onClick={() => setShowPagamentoModal(venda)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Quitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Modal upgrade */}
      {showUpgradeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-white">Funcionalidade Premium</h2>
              <p className="text-sm text-zinc-400 mt-2">
                Envio de push/WhatsApp ao comprador com nome da loja, valor e saldo estÃ¡ disponÃ­vel apenas nos <span className="text-white font-bold">planos pagos</span>.
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-zinc-400 space-y-1">
              <p className="text-amber-300 font-bold mb-1">Com plano pago vocÃª libera:</p>
              <p>â€¢ NotificaÃ§Ã£o automÃ¡tica de vencimento</p>
              <p>â€¢ Aviso de pagamento confirmado ao comprador</p>
              <p>â€¢ RelatÃ³rios avanÃ§ados de fiado</p>
            </div>
            <Link
              href="/empresa/planos"
              onClick={() => setShowUpgradeAlert(false)}
              className="block w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-center transition-all"
            >
              Ver Planos
            </Link>
            <button
              onClick={() => setShowUpgradeAlert(false)}
              className="w-full py-2 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Agora nÃ£o
            </button>
          </div>
        </div>
      )}

      {/* Modal pagamento */}
      {showPagamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h2 className="text-xl font-black text-white">Registrar Pagamento</h2>
              <p className="text-sm text-zinc-400 mt-1">{showPagamentoModal.clienteNome}</p>
              <p className="text-3xl font-black text-emerald-300 mt-1">{fmtMoeda(showPagamentoModal.valor)}</p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { metodo: 'dinheiro', label: 'ðŸ’µ Dinheiro' },
                { metodo: 'pix',     label: 'ðŸ“± PIX' },
                { metodo: 'cartao',  label: 'ðŸ’³ CartÃ£o' },
              ].map(({ metodo, label }) => (
                <button
                  key={metodo}
                  onClick={() => registrarPagamento(showPagamentoModal, metodo)}
                  className="w-full p-3.5 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between hover:border-emerald-500/40 transition-all"
                >
                  <span className="text-white font-bold">{label}</span>
                  <span className="text-emerald-400 font-black text-sm">Confirmar â†’</span>
                </button>
              ))}
            </div>
            <div className="p-4 pt-0">
              <button
                onClick={() => setShowPagamentoModal(null)}
                className="w-full py-3 bg-zinc-800 rounded-xl text-zinc-400 font-bold"
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
