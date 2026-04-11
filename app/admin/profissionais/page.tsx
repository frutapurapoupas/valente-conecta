'use client'

import { useAdminProfissionais, FiltroProfStatus } from '@/hooks/useAdminProfissionais'
import { useState } from 'react'
import Link from 'next/link'
import {
  Briefcase, Search, Shield, ShieldOff, CheckCircle2, XCircle,
  Loader2, MapPin, Phone, Mail, Calendar, Star, TrendingUp,
  Plus, Trash2, BookOpen,
} from 'lucide-react'

const TABS: { id: FiltroProfStatus; label: string }[] = [
  { id: 'todos',      label: 'Todos'      },
  { id: 'ativos',     label: 'Ativos'     },
  { id: 'bloqueados', label: 'Bloqueados' },
  { id: 'pendentes',  label: 'Pendentes'  },
]

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProfissionaisPage() {
  const [mostrarGerenciar, setMostrarGerenciar] = useState(false)

  const {
    profissionais, loading, stats, especialidades, ESPECIALIDADES_ICON,
    filtro, setFiltro,
    filtroStatus, setFiltroStatus,
    filtroEsp, setFiltroEsp,
    acaoId,
    toggleBloquear, toggleAprovar,
    tiposEspecialidade,
    novaEspecialidade, setNovaEspecialidade,
    adicionarEspecialidade, removerEspecialidade,
  } = useAdminProfissionais()

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
          <Briefcase className="w-5 h-5 text-violet-400" />
          <div>
            <h1 className="text-2xl font-black uppercase text-white leading-none">Profissionais</h1>
            <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">Autônomos e liberais</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-center">
            <p className="text-base text-zinc-500 font-bold uppercase leading-none">Total</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-base text-emerald-400/80 font-bold uppercase leading-none">Ativos</p>
            <p className="text-2xl font-black text-emerald-300">{stats.ativos}</p>
          </div>
          {stats.pendentes > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-center">
              <p className="text-base text-amber-400/80 font-bold uppercase leading-none">Pendentes</p>
              <p className="text-2xl font-black text-amber-300">{stats.pendentes}</p>
            </div>
          )}
        </div>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4 pb-20">

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <TrendingUp className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <p className="text-4xl font-black text-white">{stats.novosMes}</p>
            <p className="text-xl text-zinc-600 font-bold uppercase mt-0.5">Este mês</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <Star className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-4xl font-black text-white">{stats.mediaAvaliacao}</p>
            <p className="text-xl text-zinc-600 font-bold uppercase mt-0.5">Média avaliação</p>
          </div>
          <div className="bg-zinc-900 border border-red-900/40 rounded-2xl p-4 text-center">
            <ShieldOff className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-4xl font-black text-white">{stats.bloqueados}</p>
            <p className="text-xl text-zinc-600 font-bold uppercase mt-0.5">Bloqueados</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            placeholder="Buscar por nome, especialidade, cidade..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xl text-white placeholder:text-zinc-600 focus:border-violet-500/50 outline-none"
          />
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFiltroStatus(t.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xl font-black uppercase transition-all ${
                filtroStatus === t.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
              }`}
            >
              {t.label}
              {t.id === 'pendentes' && stats.pendentes > 0 && (
                <span className="ml-1.5 bg-amber-500 text-black text-base font-black w-6 h-6 rounded-full inline-flex items-center justify-center">
                  {stats.pendentes}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* FILTRO ESPECIALIDADE — DROPDOWN */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={filtroEsp}
              onChange={e => setFiltroEsp(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xl text-white focus:border-violet-500/50 outline-none appearance-none cursor-pointer"
            >
              <option value="">🔍 Todas as especialidades</option>
              {tiposEspecialidade.map(tipo => (
                <option key={tipo} value={tipo}>
                  {ESPECIALIDADES_ICON[tipo] ?? '🛠️'} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">▾</span>
          </div>
          <button
            onClick={() => setMostrarGerenciar(v => !v)}
            className={`flex-shrink-0 px-4 py-3 rounded-xl text-xl font-black uppercase transition-all flex items-center gap-2 ${
              mostrarGerenciar ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Plus className="w-5 h-5" /> Gerenciar
          </button>
        </div>

        {/* GERENCIAR TIPOS */}
        {mostrarGerenciar && (
          <div className="bg-zinc-900 border border-violet-500/20 rounded-2xl p-4 space-y-3">
            <p className="text-xl font-black text-violet-300 uppercase">Tipos de Profissional</p>
            {/* Adicionar novo tipo */}
            <div className="flex gap-2">
              <input
                placeholder="Novo tipo (ex: açougueiro)"
                value={novaEspecialidade}
                onChange={e => setNovaEspecialidade(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarEspecialidade()}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xl text-white placeholder:text-zinc-600 focus:border-violet-500 outline-none"
              />
              <button
                onClick={adicionarEspecialidade}
                disabled={!novaEspecialidade.trim()}
                className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xl font-black uppercase flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </div>
            {/* Remover tipo */}
            <div className="flex gap-2 items-center border-t border-zinc-800 pt-3">
              <select
                id="remover-tipo"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xl text-white focus:border-red-500/50 outline-none appearance-none cursor-pointer"
                defaultValue=""
                onChange={e => { if (e.target.value) { removerEspecialidade(e.target.value); e.target.value = '' } }}
              >
                <option value="" disabled>Selecionar tipo para remover...</option>
                {tiposEspecialidade.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {ESPECIALIDADES_ICON[tipo] ?? '🛠️'} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
              <Trash2 className="w-5 h-5 text-zinc-600 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* CONTADOR */}
        <p className="text-xl text-zinc-600 font-bold uppercase tracking-widest">
          {profissionais.length} profissional{profissionais.length !== 1 ? 'is' : ''}
        </p>

        {/* LISTA */}
        <div className="space-y-3">
          {profissionais.length === 0 && (
            <div className="text-center py-12 text-zinc-600 text-xl">Nenhum profissional encontrado</div>
          )}
          {profissionais.map(prof => {
            const bloqueado = prof.status === 'blocked'
            const pendente  = !prof.aprovado
            const emAcao    = acaoId === prof.id
            const espIcon   = ESPECIALIDADES_ICON[prof.especialidade ?? ''] ?? '🛠️'

            return (
              <div
                key={prof.id}
                className={`bg-zinc-900 border rounded-2xl p-4 space-y-3 transition-opacity ${
                  bloqueado ? 'border-red-900/40 opacity-70' : pendente ? 'border-amber-500/20' : 'border-zinc-800'
                }`}
              >
                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl border ${
                      bloqueado ? 'bg-zinc-800 border-zinc-700' : 'bg-violet-600/15 border-violet-500/20'
                    }`}>
                      {prof.foto_url
                        ? <img src={prof.foto_url} alt={prof.nome} className="w-full h-full object-cover rounded-xl" />
                        : espIcon
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-2xl text-white leading-tight truncate">{prof.nome}</p>
                        {prof.especialidade && (
                          <span className="text-base font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 bg-violet-600/20 text-violet-300 capitalize">
                            {prof.especialidade}
                          </span>
                        )}
                        {bloqueado && (
                          <span className="text-base font-black uppercase px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 flex-shrink-0">
                            Bloqueado
                          </span>
                        )}
                        {pendente && !bloqueado && (
                          <span className="text-base font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Avaliação + serviços */}
                  <div className="flex-shrink-0 flex gap-2">
                    {prof.avaliacao != null && (
                      <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1.5">
                        <p className="text-base text-yellow-400/80 font-bold uppercase leading-none">Nota</p>
                        <p className="text-2xl font-black text-yellow-300 flex items-center gap-0.5">
                          <Star className="w-3 h-3" />{prof.avaliacao}
                        </p>
                      </div>
                    )}
                    <div className="text-center bg-zinc-800 rounded-xl px-3 py-1.5">
                      <p className="text-base text-zinc-500 font-bold uppercase leading-none">Serviços</p>
                      <p className="text-2xl font-black text-white">{prof.total_servicos ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {prof.cidade && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-xl text-zinc-400 truncate">{prof.cidade}</span>
                    </div>
                  )}
                  {prof.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-xl text-zinc-400 truncate">{prof.email}</span>
                    </div>
                  )}
                  {prof.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="text-xl text-zinc-400">{prof.telefone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                    <span className="text-xl text-zinc-500">Cadastro: {fmtData(prof.created_at)}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                  <Link
                    href={`/admin/profissionais/${prof.id}/catalogo`}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xl font-black uppercase px-3 py-2 rounded-xl transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Catálogo
                  </Link>
                  {pendente && !bloqueado && (
                    <button
                      onClick={() => toggleAprovar(prof.id, false)}
                      disabled={emAcao}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-50 text-emerald-400 text-xl font-black uppercase py-2 rounded-xl transition-all"
                    >
                      {emAcao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Aprovar
                    </button>
                  )}
                  {!pendente && prof.aprovado && !bloqueado && (
                    <button
                      onClick={() => toggleAprovar(prof.id, true)}
                      disabled={emAcao}
                      className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-500 text-xl font-bold uppercase px-3 py-2 rounded-xl transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Revogar
                    </button>
                  )}
                  <button
                    onClick={() => toggleBloquear(prof.id, bloqueado)}
                    disabled={emAcao}
                    className={`flex items-center gap-1.5 text-xl font-black uppercase px-4 py-2 rounded-xl transition-all disabled:opacity-50 ml-auto ${
                      bloqueado
                        ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
                        : 'bg-red-500/15 hover:bg-red-500/25 text-red-400'
                    }`}
                  >
                    {emAcao
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : bloqueado ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />
                    }
                    {bloqueado ? 'Desbloquear' : 'Bloquear'}
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
