'use client'

import Link from 'next/link'
import { ArrowLeft, CalendarClock, Search, CheckCircle2, XCircle, CircleDashed, Wallet } from 'lucide-react'
import { useAdminAgendaPage } from '@/hooks/useAdminAgendaPage'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminAgendaPage() {
  const {
    agendamentos,
    loading,
    statusFiltro,
    setStatusFiltro,
    busca,
    setBusca,
    atualizarStatus,
    stats,
  } = useAdminAgendaPage()

  if (loading) return <div className="min-h-screen bg-zinc-950" />

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">Serviço Agendado</h1>
            <p className="text-xs text-zinc-500">Visão administrativa de agendas</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><p className="text-xs text-zinc-500">Total</p><p className="text-xl font-black text-white">{stats.total}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><p className="text-xs text-zinc-500">Hoje</p><p className="text-xl font-black text-indigo-300">{stats.hojeCount}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><p className="text-xs text-zinc-500">Confirmados</p><p className="text-xl font-black text-blue-300">{stats.confirmados}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"><p className="text-xs text-zinc-500">Cancelados</p><p className="text-xl font-black text-red-300">{stats.cancelados}</p></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 col-span-2 md:col-span-1"><p className="text-xs text-zinc-500">Volume</p><p className="text-lg font-black text-emerald-300">{fmtMoeda(stats.volume)}</p></div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex gap-2 items-center">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente, profissional ou serviço" className="bg-transparent w-full text-sm text-white placeholder:text-zinc-600 outline-none" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'] as const).map(item => (
            <button
              key={item}
              onClick={() => setStatusFiltro(item)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap ${statusFiltro === item ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              {item === 'todos' ? 'Todos' : item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {agendamentos.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{item.servico}</p>
                  <p className="text-sm text-zinc-400">{item.profissionalNome} · Cliente: {item.clienteNome}</p>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {fmtData(item.inicio)}</span>
                    <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> {fmtMoeda(item.valor)}</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full border text-xs font-bold capitalize bg-zinc-800 border-zinc-700 text-zinc-300">
                  {item.status}
                </span>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap">
                {item.status !== 'confirmado' && item.status !== 'cancelado' && (
                  <button onClick={() => atualizarStatus(item.id, 'confirmado')} className="px-3 py-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-xl text-sm font-bold flex items-center gap-1.5">
                    <CircleDashed className="w-4 h-4" /> Confirmar
                  </button>
                )}
                {item.status !== 'concluido' && item.status !== 'cancelado' && (
                  <button onClick={() => atualizarStatus(item.id, 'concluido')} className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Concluir
                  </button>
                )}
                {item.status !== 'cancelado' && (
                  <button onClick={() => atualizarStatus(item.id, 'cancelado')} className="px-3 py-2 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-sm font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}

          {agendamentos.length === 0 && (
            <div className="text-center py-16 text-zinc-600 font-bold">Nenhum agendamento encontrado</div>
          )}
        </div>
      </main>
    </div>
  )
}
