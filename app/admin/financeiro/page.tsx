'use client'
import { useControleCaixa, CIDADES, CATEGORIA_LABEL, CATEGORIA_COR } from '@/hooks/useControleCaixa'
import type { TipoLancamento, CategoriaLancamento, StatusLancamento } from '@/hooks/useControleCaixa'
import ModalLancamento from './_ModalLancamento'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Plus, Download, Printer, Building2, Globe, TrendingUp, TrendingDown,
  Wallet, BadgePercent, Clock, AlertCircle, CircleDollarSign,
  Filter, MapPin, X, Loader2,
} from 'lucide-react'


const MES_LABEL = [
  '', 'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const STATUS_BADGE: Record<string, string> = {
  PAGO:      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  PENDENTE:  'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  ATRASADO:  'bg-red-500/15 text-red-300 border border-red-500/30',
  CANCELADO: 'bg-zinc-700/50 text-zinc-500 border border-zinc-700',
}
function recorrenciaBadge(r: number): { cls: string; label: string } {
  if (r === 0) return { cls: 'text-blue-400 bg-blue-500/10',  label: '\u221e' }
  if (r === 1) return { cls: 'text-zinc-400 bg-zinc-700/40',  label: '1\u00d7' }
  return            { cls: 'text-cyan-400 bg-cyan-500/10',   label: `${r}\u00d7` }
}

export default function ControleCaixaPage() {
  const {
    visao, setVisao, mesFiltro, setMesFiltro, anoFiltro, setAnoFiltro,
    filtroTipo, setFiltroTipo, filtroCategoria, setFiltroCategoria,
    filtroCidade, setFiltroCidade, filtroStatus, setFiltroStatus,
    filtroRecorrencia, setFiltroRecorrencia, mostrarModal, setMostrarModal,
    extratoComSaldo, kpis, breakdownCategorias, chartData,
    adicionarLancamento, removerLancamento, exportarCSV, fmt, loading,
  } = useControleCaixa()

  const totalReceitas = extratoComSaldo.filter(l => l.tipo === 'RECEITA').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = extratoComSaldo.filter(l => l.tipo === 'DESPESA').reduce((s, l) => s + l.valor, 0)
  const saldoFinal    = extratoComSaldo.length > 0 ? extratoComSaldo[extratoComSaldo.length - 1].saldoAcumulado : 0
  const selectCls = 'bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-2xl font-bold text-zinc-300 outline-none focus:border-violet-500 transition cursor-pointer'

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Carregando caixa...</p>
      </div>
    </div>
  )

  return (
    <>
      {mostrarModal && (
        <ModalLancamento visaoAtual={visao} onSalvar={adicionarLancamento} onFechar={() => setMostrarModal(false)} />
      )}
      <style>{`@media print { @page { size: A4 portrait; margin: 14mm 12mm; } * { visibility: hidden !important; } #print-only { display: block !important; visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; } #print-only * { visibility: visible !important; } .no-print { display: none !important; } } html { scroll-padding-top: 120px; }`}</style>

      <div className="min-h-screen bg-zinc-950 text-white font-sans">

        {/* STICKY HEADER */}
        <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <CircleDollarSign className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h1 className="font-black text-[28px] uppercase tracking-wide text-white leading-none">Controle de Caixa</h1>
                <p className="text-[20px] text-zinc-600 font-bold uppercase tracking-widest">{MES_LABEL[mesFiltro]} {anoFiltro}</p>
              </div>
            </div>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1">
              <button
                onClick={() => { setVisao('DREX'); setFiltroCidade('Todas') }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-2xl font-black uppercase transition-all ${visao === 'DREX' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Building2 className="w-3.5 h-3.5" /> DREX
              </button>
              <button
                onClick={() => setVisao('SISTEMA')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-2xl font-black uppercase transition-all ${visao === 'SISTEMA' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Sistema
              </button>
            </div>
            <div className="flex items-center gap-2">
              {visao === 'SISTEMA' && (
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <select value={filtroCidade} onChange={e => setFiltroCidade(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-zinc-300 outline-none cursor-pointer">
                  {CIDADES.map(c => (
                    <option key={c} value={c}>{c === 'Todas' ? 'Todas as cidades' : c}</option>
                  ))}
                </select>
              </div>
              )}
              <select value={mesFiltro} onChange={e => setMesFiltro(Number(e.target.value))} className={selectCls}>
                {MES_LABEL.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select value={anoFiltro} onChange={e => setAnoFiltro(Number(e.target.value))} className={selectCls}>
                {[2024,2025,2026,2027].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <button
                onClick={() => setMostrarModal(true)}
                className="no-print flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition px-4 py-2 rounded-xl text-2xl font-black uppercase text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-5 space-y-5 pb-40">

          {/* KPI STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[20px] font-black uppercase text-zinc-500">{visao === 'DREX' ? 'Receitas' : 'Volume Entrada'}</span>
              </div>
              <p className="text-[40px] font-black text-emerald-400">R$ {fmt(kpis.totalReceitas)}</p>
              <p className="text-[20px] text-zinc-600 mt-0.5">confirmadas R$ {fmt(kpis.receitasPagas)}</p>
            </div>
            <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-[20px] font-black uppercase text-zinc-500">{visao === 'DREX' ? 'Despesas' : 'Volume Saida'}</span>
              </div>
              <p className="text-[40px] font-black text-red-400">R$ {fmt(kpis.totalDespesas)}</p>
              <p className="text-[20px] text-zinc-600 mt-0.5">pagas R$ {fmt(kpis.despesasPagas)}</p>
            </div>
            <div className={`bg-zinc-900 border rounded-2xl p-4 ${kpis.saldoLiquido >= 0 ? 'border-violet-500/20' : 'border-red-500/40'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-violet-400" />
                <span className="text-[20px] font-black uppercase text-zinc-500">Saldo Liquido</span>
              </div>
              <p className={`text-[40px] font-black ${kpis.saldoLiquido >= 0 ? 'text-violet-300' : 'text-red-400'}`}>R$ {fmt(kpis.saldoLiquido)}</p>
              <p className="text-[20px] text-zinc-600 mt-0.5">extrato R$ {fmt(Math.abs(saldoFinal))}</p>
            </div>
            <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BadgePercent className="w-4 h-4 text-amber-400" />
                <span className="text-[20px] font-black uppercase text-zinc-500">Margem / Pendente</span>
              </div>
              <p className="text-[40px] font-black text-amber-400">{kpis.margem.toFixed(1)}%</p>
              {kpis.totalPendente > 0 && (
                <p className="text-[20px] text-amber-500/70 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> pendente R$ {fmt(kpis.totalPendente)}
                </p>
              )}
              {kpis.totalAtrasado > 0 && (
                <p className="text-[20px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> atrasado R$ {fmt(kpis.totalAtrasado)}
                </p>
              )}
            </div>
          </div>

          {/* CHART + CATEGORY BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-black uppercase text-zinc-500 tracking-wider">Evolucao 6 Meses</p>
                <div className="flex items-center gap-4 text-[20px] font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block" /> Receitas</span>
                  <span className="flex items-center gap-1.5 text-red-400"><span className="w-3 h-2 rounded-sm bg-red-500/70 inline-block" /> Despesas</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barGap={2} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill:'#52525b', fontSize:20, fontWeight:700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#52525b', fontSize:20 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => 'R$'+(v/1000).toFixed(0)+'k'} width={48} />
                  <Tooltip
                    contentStyle={{ background:'#18181b', border:'1px solid #3f3f46', borderRadius:12, fontSize:24 }}
                    formatter={((v: number) => `R$ ${v.toLocaleString('pt-BR',{minimumFractionDigits:2})}`) as any}
                    labelStyle={{ color:'#a1a1aa', fontWeight:700, marginBottom:4 }}
                  />
                  <Bar dataKey="receitas" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="despesas" fill="#ef4444" opacity={0.75} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-y-auto" style={{ maxHeight: 272 }}>
              <p className="text-2xl font-black uppercase text-zinc-500 tracking-wider mb-3">Por Categoria</p>
              <div className="space-y-2">
                {breakdownCategorias.map(({ cat, receita, despesa, total }) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[20px] font-black px-1.5 py-0.5 rounded-full ${CATEGORIA_COR[cat]}`}>{CATEGORIA_LABEL[cat]}</span>
                      <span className="text-[20px] font-black text-zinc-400">R$ {fmt(total)}</span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800">
                      {receita > 0 && <div className="bg-emerald-500" style={{ width: `${(receita/total)*100}%` }} />}
                      {despesa > 0 && <div className="bg-red-500/70" style={{ width: `${(despesa/total)*100}%` }} />}
                    </div>
                  </div>
                ))}
                {breakdownCategorias.length === 0 && (
                  <p className="text-2xl text-zinc-700 text-center py-6">Nenhum dado para o periodo</p>
                )}
              </div>
            </div>
          </div>

          {/* RECEITA POR CIDADE */}
          {kpis.porCidade.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-2xl font-black uppercase text-zinc-500 tracking-wider mb-3">Receita por Cidade</p>
              <div className="flex flex-wrap gap-3">
                {kpis.porCidade.map(c => (
                  <div key={c.cidade} className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2">
                    <span className="text-2xl font-bold text-zinc-300">{c.cidade}</span>
                    <span className="text-2xl font-black text-emerald-400">+R$ {fmt(c.receitas)}</span>
                    {c.despesas > 0 && <span className="text-2xl text-red-400">-R$ {fmt(c.despesas)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSINATURAS POR PLANO */}
          {kpis.porPlano.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-2xl font-black uppercase text-zinc-500 tracking-wider mb-3">Assinaturas por Plano</p>
              <div className="flex flex-wrap gap-3">
                {kpis.porPlano.map(p => {
                  const cor = p.plano === 'Ouro'  ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                            : p.plano === 'Prata' ? 'text-zinc-300 bg-zinc-700/40 border-zinc-600/30'
                            : 'text-amber-700 bg-amber-900/20 border-amber-800/30'
                  return (
                    <div key={p.plano} className={`border rounded-xl px-4 py-2.5 text-center ${cor}`}>
                      <p className="text-[20px] font-black uppercase">{p.plano}</p>
                      <p className="text-[32px] font-black">R$ {fmt(p.valor)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* FILTROS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 no-print">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-[20px] font-black uppercase tracking-wider text-zinc-600">Filtros</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoLancamento | 'TODOS')} className={selectCls}>
                <option value="TODOS">Tipo: Todos</option>
                <option value="RECEITA">Receitas</option>
                <option value="DESPESA">Despesas</option>
              </select>
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value as CategoriaLancamento | 'TODOS')} className={selectCls}>
                <option value="TODOS">Categoria: Todas</option>
                <optgroup label="Receitas">
                  {(['ASSINATURA','DESBLOQUEIO','PUBLICIDADE','TAXA_PLATAFORMA','BONUS_INDICACAO','COMPENSACAO'] as CategoriaLancamento[]).map(c => (
                    <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
                  ))}
                </optgroup>
                <optgroup label="Despesas">
                  {(['SERVIDOR','EQUIPE','MARKETING','JURIDICO','OPERACIONAL','IMPOSTO','EVENTUAL'] as CategoriaLancamento[]).map(c => (
                    <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
                  ))}
                </optgroup>
              </select>
              <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusLancamento | 'TODOS')} className={selectCls}>
                <option value="TODOS">Status: Todos</option>
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADO">Atrasado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
              <select value={filtroRecorrencia} onChange={e => setFiltroRecorrencia(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))} className={selectCls}>
                <option value="TODOS">Recorrência: Todas</option>
                <option value="0">Contínua (∞)</option>
                <option value="1">Única (1×)</option>
                <option value="12">12× (Anual)</option>
              </select>
              <button
                onClick={() => { setFiltroTipo('TODOS'); setFiltroCategoria('TODOS'); setFiltroCidade('Todas'); setFiltroStatus('TODOS'); setFiltroRecorrencia('TODOS') }}
                className="text-[20px] font-black uppercase text-zinc-600 hover:text-zinc-400 transition px-2"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* EXTRATO BANCARIO */}
          <div id="extrato-print" className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* Cabeçalho do extrato */}
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3 bg-zinc-950/60">
              <div>
                <p className="font-black text-[28px] text-white">
                  Extrato {visao === 'DREX' ? 'DREX' : 'Sistema'} — {MES_LABEL[mesFiltro]} {anoFiltro}
                  {filtroCidade !== 'Todas' && <span className="text-cyan-400"> · {filtroCidade}</span>}
                </p>
                <p className="text-[18px] text-zinc-500 mt-0.5">
                  {extratoComSaldo.length} lançamentos · Emitido em {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2 no-print">
                <button onClick={exportarCSV}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 text-xl font-bold rounded-xl transition">
                  <Download className="w-3.5 h-3.5" /> Excel / CSV
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-300 text-xl font-bold rounded-xl transition">
                  <Printer className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>

            {/* Cabeçalho colunas */}
            <div className="grid grid-cols-[90px_1fr_auto_auto_auto_120px_110px_36px] gap-x-3 px-4 py-2 bg-zinc-950/80 border-b border-zinc-800">
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider">Data</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider">Descrição</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider">Categoria</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider">Recorr.</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider">Status</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider text-right">Valor</span>
              <span className="text-[16px] font-black uppercase text-zinc-600 tracking-wider text-right">Saldo</span>
              <span></span>
            </div>

            {/* Linhas do extrato */}
            <div className="divide-y divide-zinc-800/50">
              {extratoComSaldo.length === 0 && (
                <div className="py-16 text-center text-zinc-700 font-black uppercase text-[24px] tracking-widest">
                  Nenhum lançamento para este período
                </div>
              )}
              {extratoComSaldo.map((l, i) => (
                <div key={l.id}
                  className={`group grid grid-cols-[90px_1fr_auto_auto_auto_120px_110px_36px] gap-x-3 items-center px-4 py-3 transition hover:bg-zinc-800/40
                    ${l.status === 'CANCELADO' ? 'opacity-35 line-through' : ''}
                    ${l.status === 'ATRASADO' ? 'bg-red-950/20 border-l-2 border-red-500/40' : ''}
                    ${i % 2 !== 0 ? 'bg-zinc-950/30' : ''}`}
                >
                  {/* Data */}
                  <div className="flex flex-col">
                    <span className="font-mono text-[20px] font-bold text-zinc-300">
                      {new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })}
                    </span>
                    <span className="font-mono text-[16px] text-zinc-600">
                      {new Date(l.data + 'T12:00:00').getFullYear()}
                    </span>
                  </div>

                  {/* Descrição */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {l.tipo === 'RECEITA'
                        ? <span className="text-[16px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">C</span>
                        : <span className="text-[16px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-mono">D</span>}
                      <span className="text-[22px] font-bold text-zinc-100 leading-snug">{l.descricao}</span>
                    </div>
                    {(l.numeroDocumento || l.plano || l.cidade || l.observacao) && (
                      <div className="flex flex-wrap gap-2 mt-1 ml-8">
                        {l.numeroDocumento && <span className="text-[16px] text-zinc-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">Doc {l.numeroDocumento}</span>}
                        {l.plano     && <span className="text-[16px] text-zinc-500">Plano {l.plano}</span>}
                        {l.cidade    && <span className="text-[16px] text-zinc-500">· {l.cidade}</span>}
                        {l.observacao && <span className="text-[16px] text-zinc-600 italic">· {l.observacao}</span>}
                      </div>
                    )}
                  </div>

                  {/* Categoria */}
                  <span className={`text-[17px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${CATEGORIA_COR[l.categoria]}`}>
                    {CATEGORIA_LABEL[l.categoria]}
                  </span>

                  {/* Recorrência */}
                  <span className={`text-[17px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${recorrenciaBadge(l.recorrencia).cls}`}>
                    {recorrenciaBadge(l.recorrencia).label}
                  </span>

                  {/* Status */}
                  <span className={`text-[16px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_BADGE[l.status]}`}>
                    {l.status}
                  </span>

                  {/* Valor */}
                  <span className={`text-[22px] font-black font-mono text-right tabular-nums whitespace-nowrap ${l.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {l.tipo === 'RECEITA' ? '+' : '−'} {fmt(l.valor)}
                  </span>

                  {/* Saldo acumulado */}
                  <span className={`text-[20px] font-mono font-bold text-right tabular-nums whitespace-nowrap ${l.saldoAcumulado >= 0 ? 'text-zinc-300' : 'text-red-400'}`}>
                    {l.saldoAcumulado >= 0 ? '' : '−'} {fmt(Math.abs(l.saldoAcumulado))}
                  </span>
                  {/* Ação: remover */}
                  <button
                    onClick={() => removerLancamento(l.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-500/20 text-zinc-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 no-print"
                    title="Remover lançamento"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Rodapé totais */}
            {extratoComSaldo.length > 0 && (<>
              <div className="grid grid-cols-[90px_1fr_auto_auto_auto_120px_110px_36px] gap-x-3 items-center px-4 py-3 border-t-2 border-zinc-700 bg-zinc-950">
                <span className="text-[18px] font-black text-zinc-500 uppercase col-span-5">
                  {extratoComSaldo.length} lançamentos
                </span>
                <span className="text-[22px] font-black font-mono text-right text-emerald-400 tabular-nums">
                  + {fmt(totalReceitas)}
                </span>
                <span className={`text-[22px] font-black font-mono text-right tabular-nums ${saldoFinal >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                  {saldoFinal >= 0 ? '' : '−'} {fmt(Math.abs(saldoFinal))}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-zinc-800 border-t border-zinc-800">
                <div className="bg-zinc-950 px-5 py-3 text-center">
                  <p className="text-[16px] text-zinc-600 font-black uppercase tracking-wider">Total Receitas</p>
                  <p className="text-[24px] font-black text-emerald-400 font-mono tabular-nums">R$ {fmt(totalReceitas)}</p>
                </div>
                <div className="bg-zinc-950 px-5 py-3 text-center">
                  <p className="text-[16px] text-zinc-600 font-black uppercase tracking-wider">Total Despesas</p>
                  <p className="text-[24px] font-black text-red-400 font-mono tabular-nums">R$ {fmt(totalDespesas)}</p>
                </div>
                <div className="bg-zinc-950 px-5 py-3 text-center">
                  <p className="text-[16px] text-zinc-600 font-black uppercase tracking-wider">Saldo Final</p>
                  <p className={`text-[24px] font-black font-mono tabular-nums ${saldoFinal >= 0 ? 'text-violet-400' : 'text-red-400'}`}>
                    R$ {fmt(saldoFinal)}
                  </p>
                </div>
              </div>
            </>)}
          </div>

          {/* ══ IMPRESSÃO: extrato bancário ══════════════════════════════ */}
          <div id="print-only" style={{display:'none'}}>
            <div style={{fontFamily:'Arial, Helvetica, sans-serif', color:'#000', background:'#fff', fontSize:'9pt', lineHeight:'1.3'}}>

              {/* ── TOPO: identidade bancária ── */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'3px solid #111', paddingBottom:'10px', marginBottom:'14px'}}>
                <div>
                  <div style={{fontSize:'16pt', fontWeight:'900', textTransform:'uppercase', letterSpacing:'1.5px', color:'#111'}}>Valente Conecta</div>
                  <div style={{fontSize:'9pt', fontWeight:'700', color:'#555', marginTop:'3px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Gestão Financeira — Controle de Caixa</div>
                  <div style={{marginTop:'8px', display:'flex', gap:'24px'}}>
                    <div><span style={{fontSize:'7.5pt', fontWeight:'700', textTransform:'uppercase', color:'#888'}}>Visão: </span><span style={{fontSize:'9pt', fontWeight:'900'}}>{visao === 'DREX' ? 'DREX (Empresa)' : 'Sistema (Rede)'}</span></div>
                    <div><span style={{fontSize:'7.5pt', fontWeight:'700', textTransform:'uppercase', color:'#888'}}>Período: </span><span style={{fontSize:'9pt', fontWeight:'900'}}>{MES_LABEL[mesFiltro]}/{anoFiltro}</span></div>
                    {filtroCidade !== 'Todas' && <div><span style={{fontSize:'7.5pt', fontWeight:'700', textTransform:'uppercase', color:'#888'}}>Cidade: </span><span style={{fontSize:'9pt', fontWeight:'900'}}>{filtroCidade}</span></div>}
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'8.5pt', fontWeight:'700', color:'#333'}}>EXTRATO DE CONTA</div>
                  <div style={{fontSize:'7.5pt', color:'#888', marginTop:'4px'}}>Emissão: {new Date().toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'} as Intl.DateTimeFormatOptions)}</div>
                  <div style={{fontSize:'7.5pt', color:'#888', marginTop:'2px'}}>{extratoComSaldo.length} lançamento{extratoComSaldo.length !== 1 ? 's' : ''}</div>
                  <div style={{fontSize:'7.5pt', color:'#888', marginTop:'2px'}}>Saldo anterior: <strong>R$ {fmt(extratoComSaldo.length > 0 ? extratoComSaldo[0].saldoAcumulado + (extratoComSaldo[0].tipo === 'RECEITA' ? -extratoComSaldo[0].valor : extratoComSaldo[0].valor) : 0)}</strong></div>
                </div>
              </div>

              {/* ── TABELA EXTRATO ── */}
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:'8.5pt'}}>
                <thead>
                  <tr style={{backgroundColor:'#1c1c1c', color:'#fff'}}>
                    <th style={{padding:'5px 6px', textAlign:'left', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', whiteSpace:'nowrap', width:'64px'}}>Data</th>
                    <th style={{padding:'5px 6px', textAlign:'left', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt'}}>Histórico / Descrição</th>
                    <th style={{padding:'5px 6px', textAlign:'left', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', whiteSpace:'nowrap', width:'82px'}}>Doc</th>
                    <th style={{padding:'5px 6px', textAlign:'left', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', whiteSpace:'nowrap', width:'100px'}}>Categoria</th>
                    <th style={{padding:'5px 6px', textAlign:'center', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', width:'52px'}}>Status</th>
                    <th style={{padding:'5px 6px', textAlign:'center', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', width:'22px'}}>D/C</th>
                    <th style={{padding:'5px 6px', textAlign:'right', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', whiteSpace:'nowrap', width:'90px'}}>Valor (R$)</th>
                    <th style={{padding:'5px 6px', textAlign:'right', fontWeight:'900', textTransform:'uppercase', fontSize:'7.5pt', whiteSpace:'nowrap', width:'90px'}}>Saldo (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* linha saldo anterior */}
                  <tr style={{backgroundColor:'#f3f4f6', borderBottom:'1px solid #d1d5db'}}>
                    <td style={{padding:'4px 6px', fontFamily:'monospace', fontSize:'8pt', color:'#6b7280'}}>—</td>
                    <td style={{padding:'4px 6px'}}><span style={{fontWeight:'800', textTransform:'uppercase', fontSize:'8pt', letterSpacing:'0.3px', color:'#374151'}}>Saldo Anterior</span></td>
                    <td colSpan={5} style={{padding:'4px 6px'}}></td>
                    <td style={{padding:'4px 6px', textAlign:'right', fontFamily:'monospace', fontWeight:'700', fontSize:'8.5pt'}}>
                      {(() => { const s = extratoComSaldo.length > 0 ? extratoComSaldo[0].saldoAcumulado + (extratoComSaldo[0].tipo === 'RECEITA' ? -extratoComSaldo[0].valor : extratoComSaldo[0].valor) : 0; return <span style={{color: s >= 0 ? '#111' : '#dc2626'}}>{s < 0 ? '- ' : ''}{fmt(Math.abs(s))}</span> })()}
                    </td>
                  </tr>
                  {extratoComSaldo.map((l, i) => (
                    <tr key={l.id} style={{
                      backgroundColor: l.status === 'ATRASADO' ? '#fff7ed' : i % 2 === 0 ? '#fff' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      textDecoration: l.status === 'CANCELADO' ? 'line-through' : 'none',
                      color: l.status === 'CANCELADO' ? '#9ca3af' : '#111',
                      pageBreakInside: 'avoid',
                    }}>
                      <td style={{padding:'4px 6px', fontFamily:'monospace', whiteSpace:'nowrap', fontSize:'8pt'}}>
                        {new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'2-digit'})}
                      </td>
                      <td style={{padding:'4px 6px'}}>
                        <div style={{fontWeight:'700', fontSize:'8.5pt'}}>{l.descricao}</div>
                        {(l.numeroDocumento || l.plano || l.cidade || l.observacao) && (
                          <div style={{fontSize:'7pt', color:'#6b7280', marginTop:'1px'}}>
                            {[l.numeroDocumento && `Doc ${l.numeroDocumento}`, l.plano && `Plano ${l.plano}`, l.cidade, l.observacao].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td style={{padding:'4px 6px', fontFamily:'monospace', fontSize:'7.5pt', color:'#6b7280', whiteSpace:'nowrap'}}>{l.id}</td>
                      <td style={{padding:'4px 6px', fontSize:'7.5pt', whiteSpace:'nowrap'}}>{CATEGORIA_LABEL[l.categoria]}</td>
                      <td style={{padding:'4px 6px', textAlign:'center', fontSize:'7.5pt', fontWeight:'700',
                        color: l.status === 'PAGO' ? '#15803d' : l.status === 'ATRASADO' ? '#c2410c' : l.status === 'CANCELADO' ? '#9ca3af' : '#b45309'
                      }}>{l.status}</td>
                      <td style={{padding:'4px 6px', textAlign:'center', fontWeight:'900', fontSize:'10pt', fontFamily:'monospace',
                        color: l.tipo === 'RECEITA' ? '#15803d' : '#dc2626'
                      }}>{l.tipo === 'RECEITA' ? 'C' : 'D'}</td>
                      <td style={{padding:'4px 6px', textAlign:'right', fontWeight:'700', fontFamily:'monospace', fontSize:'8.5pt',
                        color: l.tipo === 'RECEITA' ? '#15803d' : '#dc2626'
                      }}>{l.tipo === 'RECEITA' ? '+' : '-'} {fmt(l.valor)}</td>
                      <td style={{padding:'4px 6px', textAlign:'right', fontFamily:'monospace', fontWeight:'700', fontSize:'8.5pt',
                        color: l.saldoAcumulado >= 0 ? '#111' : '#dc2626'
                      }}>{l.saldoAcumulado < 0 ? '- ' : ''}{fmt(Math.abs(l.saldoAcumulado))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{borderTop:'2px solid #111', backgroundColor:'#1c1c1c', color:'#fff', pageBreakInside:'avoid'}}>
                    <td colSpan={4} style={{padding:'6px 6px', fontWeight:'900', textTransform:'uppercase', fontSize:'8.5pt', letterSpacing:'0.5px'}}>
                      Totais do Período — {extratoComSaldo.length} lançamento{extratoComSaldo.length !== 1 ? 's' : ''}
                    </td>
                    <td></td>
                    <td style={{padding:'6px 6px', textAlign:'center', fontWeight:'900', fontSize:'10pt'}}>=</td>
                    <td style={{padding:'6px 6px', textAlign:'right', fontWeight:'900', color:'#86efac', fontSize:'9pt', fontFamily:'monospace'}}>
                      {fmt(totalReceitas - totalDespesas) }
                    </td>
                    <td style={{padding:'6px 6px', textAlign:'right', fontWeight:'900', fontSize:'9pt', fontFamily:'monospace',
                      color: saldoFinal >= 0 ? '#93c5fd' : '#fca5a5'
                    }}>
                      {saldoFinal < 0 ? '- ' : ''}{fmt(Math.abs(saldoFinal))}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* ── RESUMO ── */}
              <div style={{display:'flex', gap:'10px', marginTop:'16px', pageBreakInside:'avoid'}}>
                <div style={{flex:1, border:'1px solid #86efac', borderTop:'4px solid #15803d', padding:'10px 12px'}}>
                  <div style={{fontSize:'7.5pt', fontWeight:'900', textTransform:'uppercase', color:'#166534', letterSpacing:'0.5px', marginBottom:'4px'}}>Total Créditos</div>
                  <div style={{fontSize:'12pt', fontWeight:'900', color:'#15803d', fontFamily:'monospace'}}>{fmt(totalReceitas)}</div>
                  <div style={{fontSize:'7pt', color:'#6b7280', marginTop:'3px'}}>{extratoComSaldo.filter(l => l.tipo === 'RECEITA').length} lançamentos</div>
                </div>
                <div style={{flex:1, border:'1px solid #fca5a5', borderTop:'4px solid #dc2626', padding:'10px 12px'}}>
                  <div style={{fontSize:'7.5pt', fontWeight:'900', textTransform:'uppercase', color:'#991b1b', letterSpacing:'0.5px', marginBottom:'4px'}}>Total Débitos</div>
                  <div style={{fontSize:'12pt', fontWeight:'900', color:'#dc2626', fontFamily:'monospace'}}>{fmt(totalDespesas)}</div>
                  <div style={{fontSize:'7pt', color:'#6b7280', marginTop:'3px'}}>{extratoComSaldo.filter(l => l.tipo === 'DESPESA').length} lançamentos</div>
                </div>
                <div style={{flex:1, border:`1px solid ${saldoFinal >= 0 ? '#93c5fd' : '#fca5a5'}`, borderTop:`4px solid ${saldoFinal >= 0 ? '#1d4ed8' : '#dc2626'}`, padding:'10px 12px'}}>
                  <div style={{fontSize:'7.5pt', fontWeight:'900', textTransform:'uppercase', color: saldoFinal >= 0 ? '#1e40af' : '#991b1b', letterSpacing:'0.5px', marginBottom:'4px'}}>Saldo Final</div>
                  <div style={{fontSize:'12pt', fontWeight:'900', color: saldoFinal >= 0 ? '#1d4ed8' : '#dc2626', fontFamily:'monospace'}}>{saldoFinal < 0 ? '- ' : ''}{fmt(Math.abs(saldoFinal))}</div>
                  <div style={{fontSize:'7pt', color:'#6b7280', marginTop:'3px'}}>{saldoFinal >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</div>
                </div>
              </div>

              {/* ── AUTENTICAÇÃO ── */}
              <div style={{marginTop:'20px', borderTop:'1px dashed #ccc', paddingTop:'10px', pageBreakInside:'avoid'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                  <div style={{fontSize:'7pt', color:'#9ca3af', lineHeight:'1.6'}}>
                    <div style={{fontWeight:'700', color:'#6b7280', textTransform:'uppercase', fontSize:'7.5pt', marginBottom:'3px'}}>Autenticação</div>
                    <div>Documento gerado eletronicamente pelo sistema Valente Conecta.</div>
                    <div>Emitido em: {new Date().toLocaleString('pt-BR')} — Extrato {visao} · {MES_LABEL[mesFiltro]}/{anoFiltro}</div>
                  </div>
                  <div style={{textAlign:'right', fontSize:'7.5pt', color:'#9ca3af'}}>
                    <div style={{borderTop:'1px solid #9ca3af', paddingTop:'6px', minWidth:'160px', textAlign:'center'}}>
                      Responsável
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </main>
      </div>
    </>
  )
}
