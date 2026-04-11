'use client'

import { useState } from 'react'
import { useAdminEmpresas, FiltroStatus } from '@/hooks/useAdminEmpresas'
import {
  Building2, Search, Shield, ShieldOff, CheckCircle2, XCircle,
  Loader2, Tag, MapPin, Phone, Mail, Calendar, BarChart3,
  TrendingUp, AlertTriangle, Users, RefreshCw,
} from 'lucide-react'

const PLANO_COR: Record<string, string> = {
  free:    'bg-zinc-700 text-zinc-300',
  basic:   'bg-indigo-600/30 text-indigo-300',
  premium: 'bg-yellow-500/20 text-yellow-300',
}
const PLANO_LABEL: Record<string, string> = {
  free: 'Grátis', basic: 'Básico', premium: 'Premium',
}

const TABS: { id: FiltroStatus; label: string }[] = [
  { id: 'todas',      label: 'Todas'      },
  { id: 'ativas',     label: 'Ativas'     },
  { id: 'bloqueadas', label: 'Bloqueadas' },
  { id: 'pendentes',  label: 'Pendentes'  },
]

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EmpresasPage() {
  const {
    empresas, loading, stats,
    filtro, setFiltro,
    filtroStatus, setFiltroStatus,
    acaoId,
    toggleBloquear, toggleAprovar,
  } = useAdminEmpresas()

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-black uppercase text-white leading-none">Empresas</h1>
            <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">Gestão de parceiros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-center">
            <p className="text-xs text-zinc-500 font-bold uppercase leading-none">Total</p>
            <p className="text-base font-black text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-xs text-emerald-400/80 font-bold uppercase leading-none">Ativas</p>
            <p className="text-base font-black text-emerald-300">{stats.ativas}</p>
          </div>
          {stats.pendentes > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xs text-amber-400/80 font-bold uppercase leading-none">Pendentes</p>
              <p className="text-base font-black text-amber-300">{stats.pendentes}</p>
            </div>
          )}
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4 pb-20">

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <TrendingUp className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <p className="text-3xl font-black text-white">{stats.novasMes}</p>
            <p className="text-sm text-zinc-600 font-bold uppercase mt-0.5">Este mês</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <Tag className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-3xl font-black text-white">{stats.comOfertas}</p>
            <p className="text-sm text-zinc-600 font-bold uppercase mt-0.5">Com ofertas</p>
          </div>
          <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-4 text-center">
            <ShieldOff className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-3xl font-black text-white">{stats.bloqueadas}</p>
            <p className="text-sm text-zinc-600 font-bold uppercase mt-0.5">Bloqueadas</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            placeholder="Buscar por nome, CNPJ, cidade ou e-mail..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-indigo-500/50 outline-none"
          />
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFiltroStatus(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-black uppercase transition-all ${
                filtroStatus === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {t.label}
              {t.id === 'pendentes' && stats.pendentes > 0 && (
                <span className="ml-1.5 bg-amber-500 text-black text-xs font-black w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {stats.pendentes}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LISTA */}
        <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">
          {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
        </p>

        <div className="space-y-3">
          {empresas.length === 0 && (
            <div className="text-center py-12 text-zinc-600 text-base">Nenhuma empresa encontrada</div>
          )}
          {empresas.map(emp => {
            const bloqueada = emp.status === 'blocked'
            const pendente  = !emp.aprovado
            const nome      = emp.nome_fantasia || emp.name || '—'
            const plano     = emp.plan ?? 'free'
            const emAcao    = acaoId === emp.id
            return (
              <div
                key={emp.id}
                className={`bg-zinc-900 border rounded-2xl p-4 space-y-3 transition-opacity ${
                  bloqueada ? 'border-red-900/40 opacity-70' : pendente ? 'border-amber-500/20' : 'border-zinc-800'
                }`}
              >
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${
                      bloqueada ? 'bg-zinc-800 border-zinc-700' : 'bg-indigo-600/15 border-indigo-500/20'
                    }`}>
                      {emp.logo_url
                        ? <img src={emp.logo_url} alt={nome} className="w-full h-full object-cover rounded-xl" />
                        : <Building2 className={`w-5 h-5 ${bloqueada ? 'text-zinc-600' : 'text-indigo-400'}`} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-base text-white leading-tight truncate">{nome}</p>
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${PLANO_COR[plano] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {PLANO_LABEL[plano] ?? plano}
                        </span>
                        {bloqueada && (
                          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 flex-shrink-0">
                            Bloqueada
                          </span>
                        )}
                        {pendente && !bloqueada && (
                          <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                            Pendente
                          </span>
                        )}
                      </div>
                      {emp.cnpj && (
                        <p className="text-sm text-zinc-500 mt-0.5">CNPJ: {emp.cnpj}</p>
                      )}
                    </div>
                  </div>
                  {/* Ofertas badge */}
                  <div className="flex-shrink-0 text-center bg-zinc-800 rounded-xl px-3 py-1.5">
                    <p className="text-xs text-zinc-500 font-bold uppercase leading-none">Ofertas</p>
                    <p className="text-base font-black text-white">{emp.totalOfertas ?? 0}</p>
                  </div>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {emp.cidade && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-sm text-zinc-400 truncate">{emp.cidade}</span>
                    </div>
                  )}
                  {emp.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-sm text-zinc-400 truncate">{emp.email}</span>
                    </div>
                  )}
                  {emp.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-sm text-zinc-400">{emp.telefone}</span>
                    </div>
                  )}
                  {emp.responsavel && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-sm text-zinc-400 truncate">{emp.responsavel}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                    <span className="text-sm text-zinc-500">Cadastro: {fmtData(emp.created_at)}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                  {pendente && !bloqueada && (
                    <button
                      onClick={() => toggleAprovar(emp.id, false)}
                      disabled={emAcao}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-50 text-emerald-400 text-sm font-black uppercase py-2.5 rounded-xl transition-all"
                    >
                      {emAcao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Aprovar
                    </button>
                  )}
                  {!pendente && emp.aprovado && !bloqueada && (
                    <button
                      onClick={() => toggleAprovar(emp.id, true)}
                      disabled={emAcao}
                      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-500 text-sm font-bold uppercase px-3 py-2.5 rounded-xl transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revogar
                    </button>
                  )}
                  <button
                    onClick={() => toggleBloquear(emp.id, bloqueada)}
                    disabled={emAcao}
                    className={`flex items-center gap-1.5 text-sm font-black uppercase px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 ml-auto ${
                      bloqueada
                        ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
                        : 'bg-red-500/15 hover:bg-red-500/25 text-red-400'
                    }`}
                  >
                    {emAcao
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : bloqueada ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />
                    }
                    {bloqueada ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}