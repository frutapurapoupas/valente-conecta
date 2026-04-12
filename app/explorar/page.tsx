'use client'

import { Search, MapPin, ChevronDown, Lock, Unlock, X, AlertCircle, Loader2, Star, Clock, Navigation } from 'lucide-react'
import type { Profissional } from '@/hooks/useExplorarPage'
import { useExplorarPage } from '@/hooks/useExplorarPage'
import { useDesbloquearCidade } from '@/hooks/useDesbloquearCidade'

const STATUS_LABEL: Record<Profissional['status'], string> = {
  aberto:   'Aberto',
  fechado:  'Fechado',
  ocupado:  'Ocupado',
}
const STATUS_CLS: Record<Profissional['status'], string> = {
  aberto:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  fechado:  'bg-red-500/20 text-red-400 border-red-500/30',
  ocupado:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function ExplorarPage() {
  const { activeFilter, setActiveFilter, categorias, busca, setBusca, lista, destaques } = useExplorarPage()
  const {
    cidadeAtiva,
    cidades,
    modalAberto,
    cidadeSelecionada,
    saldoConectas,
    custo,
    desbloqueando,
    erro,
    abrirSeletor,
    fecharModal,
    selecionarCidade,
    confirmarDesbloqueio,
    diasRestantes,
  } = useDesbloquearCidade()

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4 space-y-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Você está em</p>
            <button onClick={abrirSeletor} className="flex items-center gap-1.5 group">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-xl font-black text-white">{cidadeAtiva.nome}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 mt-0.5 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
          <div className="text-xs text-zinc-500 font-bold">
            Saldo: <span className="text-yellow-400 font-black">{saldoConectas} ✦</span>
          </div>
        </div>

        {/* Busca */}
        <div className="max-w-3xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar serviços, lojas ou bairros..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-indigo-500/50 outline-none"
          />
        </div>

        {/* Filtros de categoria */}
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap transition-all ${
                activeFilter === cat.toLowerCase()
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-6">

        {/* Destaques (aparece apenas no filtro "Todos") */}
        {activeFilter === 'todos' && !busca && destaques.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">⚡ Em destaque</h2>
            <div className="grid grid-cols-1 gap-3">
              {destaques.map(p => (
                <ProfCard key={p.id} p={p} destaque />
              ))}
            </div>
          </section>
        )}

        {/* Lista principal */}
        <section className="space-y-3">
          {activeFilter !== 'todos' || busca ? (
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
              {lista.length} resultado{lista.length !== 1 ? 's' : ''}
            </h2>
          ) : (
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Todos os serviços</h2>
          )}

          {lista.length === 0 && (
            <div className="text-center py-16 text-zinc-600 font-bold">Nenhum resultado encontrado</div>
          )}

          <div className="space-y-2">
            {lista.map(p => <ProfCard key={p.id} p={p} />)}
          </div>
        </section>
      </main>

      {/* ═══ MODAL: SELETOR DE CIDADE ═══════════════════════════════════ */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-lg">Escolher cidade</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Saldo: <span className="text-yellow-400 font-black">{saldoConectas} ✦</span>
                </p>
              </div>
              <button onClick={fecharModal} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-2">
              {cidades.map(c => {
                const dias = diasRestantes(c.validadeAte)
                const isAtiva = c.id === cidadeAtiva.id
                const isSelecionada = cidadeSelecionada?.id === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => selecionarCidade(c)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      isAtiva
                        ? 'border-yellow-400/40 bg-yellow-400/5'
                        : isSelecionada
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-zinc-800 bg-zinc-800/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${isAtiva ? 'text-yellow-400' : c.desbloqueada ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      <div>
                        <p className={`font-bold text-sm ${isAtiva ? 'text-yellow-400' : 'text-white'}`}>
                          {c.nome}
                          {isAtiva && <span className="ml-2 text-[10px] font-black text-yellow-500/80 uppercase">atual</span>}
                        </p>
                        {c.desbloqueada && dias != null && !isAtiva && (
                          <p className="text-[10px] text-emerald-400/70">Desbloqueada · {dias}d restantes</p>
                        )}
                        {!c.desbloqueada && (
                          <p className="text-[10px] text-zinc-600">{custo} ✦ por 30 dias</p>
                        )}
                      </div>
                    </div>
                    {c.desbloqueada
                      ? <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      : <Lock className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    }
                  </button>
                )
              })}
            </div>

            {cidadeSelecionada && !cidadeSelecionada.desbloqueada && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-indigo-300">
                  Desbloquear <span className="text-white">{cidadeSelecionada.nome}</span> por 30 dias?
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Custo:</span>
                  <span className="font-black text-yellow-400 text-base">{custo} ✦</span>
                  <span className="text-zinc-600 ml-1">→ restará {saldoConectas - custo} ✦</span>
                </div>
                {erro && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {erro}
                  </div>
                )}
                <button
                  onClick={confirmarDesbloqueio}
                  disabled={desbloqueando || saldoConectas < custo}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 transition-all"
                >
                  {desbloqueando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Desbloqueando...</>
                    : <><Unlock className="w-4 h-4" /> Confirmar desbloqueio</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Card de profissional/serviço ─────────────────────────────── */
function ProfCard({ p, destaque = false }: { p: Profissional; destaque?: boolean }) {
  return (
    <div className={`bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 ${destaque ? 'border-indigo-500/30' : 'border-zinc-800'}`}>
      {/* Avatar */}
      <div className={`w-14 h-14 rounded-2xl ${p.cor} border border-white/5 flex items-center justify-center flex-shrink-0 text-2xl`}>
        {p.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-white text-base truncate">{p.nome}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CLS[p.status]}`}>
            {STATUS_LABEL[p.status]}
          </span>
        </div>
        <p className="text-sm text-zinc-400 truncate">{p.categoria} · {p.subcategoria}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-bold">{p.nota.toFixed(1)}</span>
            <span>({p.totalAvaliacoes})</span>
          </span>
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {p.distancia}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {p.bairro}
          </span>
        </div>
        <p className="text-xs text-indigo-300 font-bold mt-1">{p.preco}</p>
      </div>
    </div>
  )
}
