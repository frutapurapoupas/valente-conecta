'use client'

import { useAdminOfertas } from '@/hooks/useAdminOfertas'
import {
  Tag, CheckCircle2, XCircle, Clock, TrendingDown, Eye, Star,
  ToggleLeft, ToggleRight, Pin, PinOff, AlertTriangle, Archive,
  ShoppingBag, BarChart3, Loader2, X, RefreshCw, Building2,
} from 'lucide-react'

const STATUS_COR: Record<string, string> = {
  active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  paused:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  expired:  'bg-zinc-700/50 text-zinc-500 border-zinc-700',
  sold:     'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  pending:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa', paused: 'Pausada', rejected: 'Rejeitada',
  expired: 'Expirada', sold: 'Vendida', pending: 'Pendente',
}

function DescPct({ pct }: { pct: number }) {
  return (
    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
      -{pct.toFixed(0)}%
    </span>
  )
}

function CardOferta({ o, footer }: { o: ReturnType<typeof useAdminOfertas>['pendentes'][0], footer: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {/* Thumb */}
        <div className="w-14 h-14 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center border border-zinc-700 overflow-hidden">
          {o.imagemUrl
            ? <img src={o.imagemUrl} alt={o.titulo} className="w-full h-full object-cover" />
            : <Tag className="w-5 h-5 text-zinc-600" />
          }
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-black text-sm text-white leading-tight">{o.titulo}</p>
            {o.destaque && <Pin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />}
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{o.empresa} · {o.cidade}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-zinc-500 text-xs line-through">R$ {o.precoOriginal.toFixed(2)}</span>
            <span className="text-emerald-400 font-black text-sm">R$ {o.preco.toFixed(2)}</span>
            <DescPct pct={o.percentualDesconto} />
            <span className={`text-[9px] font-black uppercase border px-1.5 py-0.5 rounded-full ${STATUS_COR[o.status]}`}>
              {STATUS_LABEL[o.status]}
            </span>
          </div>
        </div>
      </div>
      {/* Footer com ações */}
      <div className="border-t border-zinc-800 px-4 py-2.5 flex items-center gap-2">
        {footer}
      </div>
    </div>
  )
}

export default function OfertasAdminPage() {
  const {
    aba, setAba,
    pendentes, ativas, encerradas, stats,
    filtroEmpresa, setFiltroEmpresa,
    modalRejeitar, motivoInput, setMotivoInput,
    processando,
    aprovar, abrirRejeitar, confirmarRejeicao, fecharModalRejeitar,
    togglePausar, toggleDestaque, expirar,
    diasRestantes,
  } = useAdminOfertas()

  const ABAS = [
    { id: 'pendentes',   label: 'Pendentes',    icon: <Clock className="w-4 h-4" />,       badge: pendentes.length },
    { id: 'ativas',      label: 'Ativas',        icon: <CheckCircle2 className="w-4 h-4" />,badge: ativas.filter(o => o.status === 'active').length },
    { id: 'encerradas',  label: 'Encerradas',    icon: <Archive className="w-4 h-4" />,     badge: 0 },
    { id: 'stats',       label: 'Stats',         icon: <BarChart3 className="w-4 h-4" />,   badge: 0 },
  ] as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-400" />
          <div>
            <h1 className="text-base font-black uppercase italic text-orange-400 leading-none">Gerenciar Ofertas</h1>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Admin Master</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.pendentes > 0 && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-1.5 text-center">
              <p className="text-[9px] text-yellow-400/80 font-bold uppercase leading-none">Pendentes</p>
              <p className="text-sm font-black text-yellow-400">{stats.pendentes}</p>
            </div>
          )}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-[9px] text-emerald-400/80 font-bold uppercase leading-none">Ativas</p>
            <p className="text-sm font-black text-emerald-300">{stats.ativas}</p>
          </div>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="sticky top-[57px] z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 flex">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold uppercase transition-all relative ${
              aba === a.id ? 'text-orange-400 border-b-2 border-orange-400' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {a.icon}{a.label}
            {a.badge > 0 && (
              <span className="absolute top-1.5 right-3 w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center">
                {a.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-3 pb-20">

        {/* ══ ABA: PENDENTES ═════════════════════════════════════════════ */}
        {aba === 'pendentes' && (
          <>
            {pendentes.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="font-black text-white">Nenhuma oferta pendente</p>
                <p className="text-xs text-zinc-500 mt-1">Tudo em dia!</p>
              </div>
            )}
            {pendentes.map(o => (
              <CardOferta key={o.id} o={o} footer={
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500">{o.categoria} · válida até {new Date(o.validadeAte).toLocaleDateString('pt-BR')}</p>
                    {o.descricao && <p className="text-[10px] text-zinc-600 truncate italic mt-0.5">"{o.descricao}"</p>}
                  </div>
                  <button
                    onClick={() => aprovar(o.id)}
                    disabled={processando === o.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    {processando === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => abrirRejeitar(o.id)}
                    disabled={processando === o.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </>
              } />
            ))}
          </>
        )}

        {/* ══ ABA: ATIVAS ════════════════════════════════════════════════ */}
        {aba === 'ativas' && (
          <>
            {stats.vencendoHoje > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-300">
                  {stats.vencendoHoje} oferta{stats.vencendoHoje > 1 ? 's' : ''} vencem em menos de 2 dias
                </p>
              </div>
            )}
            {ativas.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <Tag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="font-black text-white">Nenhuma oferta ativa</p>
              </div>
            )}
            {ativas.map(o => {
              const dias = diasRestantes(o.validadeAte)
              return (
                <CardOferta key={o.id} o={o} footer={
                  <>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-zinc-600" />
                        <span className="text-[10px] text-zinc-500">{o.visualizacoes} visualizações</span>
                        <span className={`text-[10px] font-bold ${dias < 3 ? 'text-amber-400' : 'text-zinc-600'}`}>
                          {dias < 0 ? 'Expirada' : `${dias}d restantes`}
                        </span>
                      </div>
                    </div>
                    {/* Pin */}
                    <button
                      onClick={() => toggleDestaque(o.id)}
                      title={o.destaque ? 'Remover destaque' : 'Colocar em destaque (máx. 3)'}
                      className={`p-2 rounded-xl border text-xs transition-all flex-shrink-0 ${
                        o.destaque
                          ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      {o.destaque ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                    </button>
                    {/* Pausar/Ativar */}
                    <button
                      onClick={() => togglePausar(o.id)}
                      disabled={processando === o.id}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-50 flex-shrink-0 ${
                        o.status === 'active'
                          ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                      }`}
                    >
                      {processando === o.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : o.status === 'active'
                          ? <ToggleRight className="w-3.5 h-3.5" />
                          : <ToggleLeft className="w-3.5 h-3.5" />
                      }
                      {o.status === 'active' ? 'Pausar' : 'Ativar'}
                    </button>
                    {/* Expirar */}
                    <button
                      onClick={() => expirar(o.id)}
                      disabled={processando === o.id}
                      className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
                      title="Encerrar agora"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                } />
              )
            })}
          </>
        )}

        {/* ══ ABA: ENCERRADAS ════════════════════════════════════════════ */}
        {aba === 'encerradas' && (
          <>
            {/* Filtro empresa */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                placeholder="Filtrar por empresa..."
                value={filtroEmpresa}
                onChange={e => setFiltroEmpresa(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-orange-400/50 outline-none"
              />
            </div>

            {encerradas.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
                <Archive className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="font-black text-white">Nenhum registro</p>
              </div>
            )}
            {encerradas.map(o => (
              <CardOferta key={o.id} o={o} footer={
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500">
                      {o.status === 'rejected' ? '⛔ Rejeitada' : o.status === 'sold' ? '✅ Vendida' : '⏱ Expirada'} ·{' '}
                      {new Date(o.validadeAte).toLocaleDateString('pt-BR')}
                    </p>
                    {o.motivoRejeicao && (
                      <p className="text-[10px] text-red-400/80 italic truncate mt-0.5">"{o.motivoRejeicao}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600 flex-shrink-0">
                    <Eye className="w-3 h-3" /> {o.visualizacoes}
                  </div>
                </>
              } />
            ))}
          </>
        )}

        {/* ══ ABA: STATS ═════════════════════════════════════════════════ */}
        {aba === 'stats' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Pendentes agora</p>
                <p className="text-3xl font-black text-yellow-400">{stats.pendentes}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-emerald-400/80 font-bold uppercase mb-1">Ativas</p>
                <p className="text-3xl font-black text-emerald-300">{stats.ativas}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-indigo-400/80 font-bold uppercase mb-1">Aprovadas (7 dias)</p>
                <p className="text-3xl font-black text-indigo-300">{stats.aprovadas7d}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Taxa de aprovação</p>
                <p className="text-3xl font-black text-white">{stats.taxaAprovacao}%</p>
              </div>
            </div>

            {stats.vencendoHoje > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-amber-300">{stats.vencendoHoje} oferta{stats.vencendoHoje !== 1 ? 's' : ''} vencendo em ≤ 2 dias</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Considere pausar ou contatar as empresas</p>
                </div>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Destaques</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold mb-0.5">Empresa mais ativa</p>
                  <p className="text-sm font-black text-white leading-tight">{stats.empresaMaisAtiva}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold mb-0.5">Total visualizações</p>
                  <p className="text-sm font-black text-white">{stats.totalVisualizacoes}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold mb-0.5">Encerradas</p>
                  <p className="text-sm font-black text-white">{stats.encerradas}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold mb-0.5">Ofertas pinadas</p>
                  <p className="text-sm font-black text-yellow-400">{ativas.filter(o => o.destaque).length} / 3</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ═══ MODAL: REJEITAR ═══════════════════════════════════════════════ */}
      {modalRejeitar.aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" /> Rejeitar oferta
              </h3>
              <button onClick={fecharModalRejeitar} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1.5 block">
                Motivo da rejeição <span className="text-zinc-700">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={motivoInput}
                onChange={e => setMotivoInput(e.target.value)}
                placeholder="Ex: Foto ausente, preço incorreto, descrição insuficiente..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-red-500/50 outline-none resize-none"
              />
              <p className="text-[10px] text-zinc-600 mt-1">O motivo será enviado ao lojista para que ele corrija e reenvie.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fecharModalRejeitar} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 text-sm font-black uppercase transition-all hover:bg-zinc-700">
                Cancelar
              </button>
              <button
                onClick={confirmarRejeicao}
                disabled={processando !== null}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-black uppercase transition-all flex items-center justify-center gap-2"
              >
                {processando !== null
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejeitando...</>
                  : <><XCircle className="w-4 h-4" /> Confirmar</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
