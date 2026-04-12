'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Wallet,
} from 'lucide-react'
import { useAgendaProfissionalPage } from '@/hooks/useAgendaProfissionalPage'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AgendaProfissionalPage() {
  const {
    profissional,
    agendamentos,
    loading,
    showNovo,
    setShowNovo,
    statusFiltro,
    setStatusFiltro,
    busca,
    setBusca,
    form,
    setForm,
    salvarNovoAgendamento,
    atualizarStatus,
    stats,
  } = useAgendaProfissionalPage()

  if (loading) {
    return <div className="min-h-screen bg-zinc-950" />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/profissional/meu-catalogo" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">Serviço Agendado</h1>
            <p className="text-xs text-zinc-500">Agenda profissional · {profissional.nome}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <p className="text-xs text-zinc-500 font-bold uppercase">Hoje</p>
            <p className="text-2xl font-black text-indigo-300">{stats.totalHoje}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <p className="text-xs text-zinc-500 font-bold uppercase">Pendentes</p>
            <p className="text-2xl font-black text-amber-300">{stats.pendentes}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <p className="text-xs text-zinc-500 font-bold uppercase">Receita</p>
            <p className="text-lg font-black text-emerald-300">{fmtMoeda(stats.receitaPrevista)}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex gap-2 items-center">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar cliente ou serviço"
            className="bg-transparent w-full text-sm text-white placeholder:text-zinc-600 outline-none"
          />
          <button
            onClick={() => setShowNovo(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'] as const).map(item => (
            <button
              key={item}
              onClick={() => setStatusFiltro(item)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap ${
                statusFiltro === item
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              {item === 'todos' ? 'Todos' : item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {agendamentos.length === 0 && (
            <div className="text-center py-16 text-zinc-600 font-bold">Nenhum agendamento encontrado</div>
          )}

          {agendamentos.map(item => {
            const statusCls = {
              pendente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
              confirmado: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
              concluido: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
              cancelado: 'bg-red-500/15 text-red-300 border-red-500/30',
            }[item.status]

            return (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{item.servico}</p>
                    <p className="text-sm text-zinc-400">{item.clienteNome} · {item.clienteTelefone || 'sem telefone'}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {fmtDataHora(item.inicio)}</span>
                      <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" /> até {fmtDataHora(item.fim).split(' ')[1]}</span>
                      <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> {fmtMoeda(item.valor)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full border text-xs font-bold capitalize ${statusCls}`}>
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
            )
          })}
        </div>
      </main>

      {showNovo && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-5 space-y-3">
            <h2 className="text-xl font-black">Novo Agendamento</h2>
            <input value={form.clienteNome} onChange={e => setForm(f => ({ ...f, clienteNome: e.target.value }))} placeholder="Cliente" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none" />
            <input value={form.clienteTelefone} onChange={e => setForm(f => ({ ...f, clienteTelefone: e.target.value }))} placeholder="Telefone" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none" />
            <input value={form.servico} onChange={e => setForm(f => ({ ...f, servico: e.target.value }))} placeholder="Serviço" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none" />
            <input value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="Valor" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input type="datetime-local" value={form.inicio} onChange={e => setForm(f => ({ ...f, inicio: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm outline-none" />
              <input type="datetime-local" value={form.fim} onChange={e => setForm(f => ({ ...f, fim: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-sm outline-none" />
            </div>
            <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} placeholder="Observações" rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setShowNovo(false)} className="py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button>
              <button onClick={salvarNovoAgendamento} className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
