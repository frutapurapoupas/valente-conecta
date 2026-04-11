'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminMasterDashboard } from '@/hooks/useAdminMasterDashboard'
import {
  BarChart3, Users, Building2, Wallet, Zap, TrendingUp,
  AlertTriangle, Target, Download, FileSpreadsheet, CheckCircle2,
  Dumbbell, ShoppingBag, Search, Megaphone, ArrowUpRight,
  Settings, Bell, Tag, ChevronRight, Activity, Lock, RefreshCw,
  Star, Package, CreditCard, Shield, QrCode
} from 'lucide-react'
import GraficosReceita from '@/components/admin/GraficosReceita'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DADOS DO SISTEMA (mock â€” fase 1, integraÃ§Ã£o Supabase na fase 2)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// ── DADOS DE INTELIGÊNCIA COMERCIAL (leitura cross-PDV) ─────────────────────
const BI_PDV = {
  topProduto:  { nome: 'Frango Inteiro 2kg',    qtd: 312,  tendencia: 23 },
  horaPico:    { horario: '11h – 13h',           volume: 'R$ 8.400', share: 34 },
  categoria:   { nome: 'Hortifruti & Orgânicos', crescimento: 18, lojas: 8 },
  estoque:     { alertas: 7, critico: 'Arroz Tipo 1 5kg', lojas: 2 },
}



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Aba = 'geral' | 'planos' | 'usuarios' | 'sistema'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

// â”€â”€â”€ CARD KPI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KpiCard({
  titulo, valor, sub, icon, cor, href,
}: {
  titulo: string; valor: string; sub?: string; icon: React.ReactNode
  cor: string; href?: string
}) {
  const inner = (
    <div className={`rounded-2xl p-4 ${cor} flex flex-col gap-2 h-full`}>
      <div className="flex items-start justify-between">
        <div className="opacity-90">{icon}</div>
        {href && <ChevronRight className="w-4 h-4 opacity-50" />}
      </div>
      <p className="text-2xl font-black leading-none">{valor}</p>
      <div>
        <p className="font-bold text-sm leading-tight opacity-95">{titulo}</p>
        {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href} className="block">{inner}</Link> : <div>{inner}</div>
}

// â”€â”€â”€ LINHA DE PLANO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PlanoRow({
  nome, count, preco, receita, destaque,
}: { nome: string; count: number; preco: string; receita: number; destaque?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${destaque ? 'bg-indigo-600/20 border border-indigo-500/40' : 'bg-zinc-800/40'}`}>
      <div>
        <p className={`font-bold text-sm ${destaque ? 'text-indigo-300' : 'text-white'}`}>{nome}</p>
        <p className="text-xs text-zinc-500">{count} assinante{count !== 1 ? 's' : ''} Â· {preco}</p>
      </div>
      {receita > 0
        ? <span className="font-black text-emerald-400 text-sm">R$ {receita.toFixed(2)}/m</span>
        : <span className="text-zinc-600 text-xs font-bold">GrÃ¡tis</span>
      }
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DashboardMasterAtualizado() {
  const [aba, setAba] = useState<Aba>('geral')
  const { data: D } = useAdminMasterDashboard()

  const ALERTAS = [
    { nivel: 'warn' as const, msg: `${D.usuarios.indicacoesPendentes} links de indicação aguardando validação`, href: '/admin/usuarios' },
    { nivel: 'warn' as const, msg: `${D.carrossel.pendentesAprovacao} anúncios no carrossel pendentes de aprovação`, href: '/admin/anuncios/carrossel' },
    { nivel: 'info' as const, msg: '8 novos cadastros sem aprovação esta semana', href: '/admin/usuarios' },
    { nivel: 'ok' as const,   msg: 'Sistema operacional — última sync há 2 min', href: '#' },
  ]

  const ABAS: { id: Aba; label: string; icon: React.ReactNode }[] = [
    { id: 'geral',   label: 'Geral',    icon: <BarChart3  className="w-5 h-5" /> },
    { id: 'planos',  label: 'Planos',   icon: <Tag        className="w-5 h-5" /> },
    { id: 'usuarios',label: 'UsuÃ¡rios', icon: <Users      className="w-5 h-5" /> },
    { id: 'sistema', label: 'Sistema',  icon: <Shield     className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER FIXO — duas linhas */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900">
        {/* Linha 1: marca + ações */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase italic text-indigo-400 leading-none">Valente Conecta</h1>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Master Admin · 10 Abr 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-zinc-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-black text-black flex items-center justify-center">
                {ALERTAS.filter(a => a.nivel === 'warn').length}
              </span>
            </div>
            <Link href="/admin/configuracoes">
              <Settings className="w-5 h-5 text-zinc-600 hover:text-zinc-300 transition-colors" />
            </Link>
            <Link href="/admin/master/instalador">
              <QrCode className="w-5 h-5 text-zinc-600 hover:text-zinc-300 transition-colors" />
            </Link>
          </div>
        </div>
        {/* Linha 2: métricas rápidas — scroll horizontal */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-2 flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <p className="text-[9px] text-emerald-500/80 font-bold uppercase leading-none">Receita / mês</p>
              <p className="text-[13px] font-black text-emerald-300 leading-tight">R$ {fmt(D.receita.mes)}</p>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full ml-1">+{D.receita.crescimento}%</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <div>
              <p className="text-[9px] text-indigo-400/80 font-bold uppercase leading-none">Usuários ativos</p>
              <p className="text-[13px] font-black text-white leading-tight">{D.usuarios.ativos.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
            <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <p className="text-[9px] text-blue-400/80 font-bold uppercase leading-none">PDV hoje</p>
              <p className="text-[13px] font-black text-white leading-tight">R$ {D.pdv.volumeHoje.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <p className="text-[9px] text-amber-400/80 font-bold uppercase leading-none">Pendentes</p>
              <p className="text-[13px] font-black text-white leading-tight">{D.usuarios.indicacoesPendentes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
            <Dumbbell className="w-3.5 h-3.5 text-violet-400" />
            <div>
              <p className="text-[9px] text-violet-400/80 font-bold uppercase leading-none">Academia</p>
              <p className="text-[13px] font-black text-white leading-tight">{D.academia.treinandoAgora} agora</p>
            </div>
          </div>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="sticky top-[105px] z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 flex">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold uppercase transition-all ${
              aba === a.id
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      <main className="p-4 max-w-3xl mx-auto space-y-5 pb-20">

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* ABA: GERAL                                                    */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {aba === 'geral' && (
          <>
            {/* Receita principal */}
            <section className="bg-gradient-to-r from-indigo-700 to-violet-800 rounded-3xl p-5 text-white">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Receita Total do MÃªs</p>
              <p className="text-5xl font-black tracking-tighter">R$ {fmt(D.receita.mes)}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-indigo-200">Hoje: <strong className="text-white">R$ {fmt(D.receita.hoje)}</strong></span>
                <span className="bg-emerald-400 text-emerald-900 text-xs font-black px-2 py-0.5 rounded-full">
                  +{D.receita.crescimento}% â†‘
                </span>
              </div>
            </section>

            {/* Grid KPIs */}
            <section>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-3">MÃ³dulos do Sistema</p>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard
                  titulo="UsuÃ¡rios Ativos"
                  valor={D.usuarios.ativos.toLocaleString()}
                  sub={`${D.usuarios.total.toLocaleString()} cadastrados Â· +${D.usuarios.novosHoje} hoje`}
                  icon={<Users className="w-6 h-6" />}
                  cor="bg-indigo-600/30 text-white border border-indigo-500/30"
                  href="/admin/usuarios"
                />
                <KpiCard
                  titulo="Empresas / Lojas"
                  valor={String(D.empresas.total)}
                  sub={`${D.empresas.premium} premium Â· R$ ${D.empresas.receitaMes}/m`}
                  icon={<Building2 className="w-6 h-6" />}
                  cor="bg-blue-600/30 text-white border border-blue-500/30"
                  href="/admin/empresas"
                />
                <KpiCard
                  titulo="Profissionais"
                  valor={String(D.profissionais.total)}
                  sub={`${D.profissionais.premium} premium Â· R$ ${D.profissionais.receitaMes}/m`}
                  icon={<Star className="w-6 h-6" />}
                  cor="bg-violet-600/30 text-white border border-violet-500/30"
                />
                <KpiCard
                  titulo="Academia"
                  valor={`${D.academia.total} alunos`}
                  sub={`${D.academia.treinandoAgora} treinando agora Â· R$ ${fmt(D.academia.receitaMes)}/m`}
                  icon={<Dumbbell className="w-6 h-6" />}
                  cor="bg-pink-600/30 text-white border border-pink-500/30"
                  href="/admin/academia"
                />
                <KpiCard
                  titulo="Busca / Desbloqueios"
                  valor={`${D.busca.mes.toLocaleString()} / mÃªs`}
                  sub={`${D.busca.hoje} hoje Â· R$ ${D.busca.receitaMes.toLocaleString()}/m`}
                  icon={<Search className="w-6 h-6" />}
                  cor="bg-amber-600/30 text-white border border-amber-500/30"
                />
                <KpiCard
                  titulo="Carrossel / LeilÃ£o"
                  valor={`R$ ${D.carrossel.lances[0]} + ${D.carrossel.lances[1]} + ${D.carrossel.lances[2]}`}
                  sub={`3 slots Â· R$ ${D.carrossel.receitaMes}/m Â· ${D.carrossel.pendentesAprovacao} pendentes`}
                  icon={<Megaphone className="w-6 h-6" />}
                  cor="bg-orange-600/30 text-white border border-orange-500/30"
                  href="/admin/anuncios/carrossel"
                />
                <KpiCard
                  titulo="PDV Colaborativo"
                  valor={`${D.pdv.pdvsAtivos} lojas`}
                  sub={`${D.pdv.transacoesHoje} transaÃ§Ãµes hoje Â· R$ ${D.pdv.volumeHoje.toLocaleString()} volume`}
                  icon={<ShoppingBag className="w-6 h-6" />}
                  cor="bg-emerald-600/30 text-white border border-emerald-500/30"
                />
                <KpiCard
                  titulo="BÃ´nus / IndicaÃ§Ãµes"
                  valor={`R$ ${D.usuarios.bonusPagosMes.toLocaleString()}/m`}
                  sub={`${D.usuarios.indicacoesValidadas} validadas Â· ${D.usuarios.taxaConversao}% conversÃ£o`}
                  icon={<Zap className="w-6 h-6" />}
                  cor="bg-yellow-600/30 text-white border border-yellow-500/30"
                />
              </div>
            </section>

            {/* Alertas rÃ¡pidos */}
            <section>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-3">Alertas</p>
              <div className="space-y-2">
                {ALERTAS.map((a, i) => (
                  <Link key={i} href={a.href}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:brightness-110 ${
                      a.nivel === 'warn' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : a.nivel === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      {a.nivel === 'warn' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                      {a.nivel === 'info' && <Bell className="w-4 h-4 flex-shrink-0" />}
                      {a.nivel === 'ok'   && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                      <p className="text-sm font-medium flex-1">{a.msg}</p>
                      <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* GrÃ¡ficos de Receita */}
            <section>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-3">GrÃ¡ficos de Receita e BÃ´nus</p>
              <GraficosReceita />
            </section>

            {/* Inteligência Comercial — dados cross-PDV */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Inteligência Comercial · PDV
                </p>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full">{D.pdv.pdvsAtivos} PDVs</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 border border-indigo-500/25 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+{BI_PDV.topProduto.tendencia}%</span>
                  </div>
                  <p className="text-white font-black text-sm leading-tight">{BI_PDV.topProduto.nome}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{BI_PDV.topProduto.qtd} un · esta semana</p>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase mt-1.5">Top produto</p>
                </div>
                <div className="bg-zinc-900 border border-amber-500/25 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{BI_PDV.horaPico.share}% volume</span>
                  </div>
                  <p className="text-white font-black text-sm leading-tight">{BI_PDV.horaPico.horario}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{BI_PDV.horaPico.volume} no período</p>
                  <p className="text-[9px] text-amber-400 font-bold uppercase mt-1.5">Hora de pico</p>
                </div>
                <div className="bg-zinc-900 border border-violet-500/25 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <span className="text-[10px] font-black text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{BI_PDV.categoria.lojas} lojas</span>
                  </div>
                  <p className="text-white font-black text-sm leading-tight">{BI_PDV.categoria.nome}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">+{BI_PDV.categoria.crescimento}% vs semana ant.</p>
                  <p className="text-[9px] text-violet-400 font-bold uppercase mt-1.5">Categoria em alta</p>
                </div>
                <div className="bg-zinc-900 border border-red-500/25 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-red-400" />
                    <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{BI_PDV.estoque.alertas} alertas</span>
                  </div>
                  <p className="text-white font-black text-sm leading-tight">{BI_PDV.estoque.critico}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{BI_PDV.estoque.lojas} PDVs em estoque crítico</p>
                  <p className="text-[9px] text-red-400 font-bold uppercase mt-1.5">Alerta de estoque</p>
                </div>
              </div>
              {/* CTA — painel completo de inteligência */}
              <Link href="/admin/master/inteligencia" className="mt-3 block">
                <div className="bg-gradient-to-r from-indigo-700 to-violet-800 hover:from-indigo-600 hover:to-violet-700 transition-all p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-200 group-hover:text-white transition-colors" />
                    <div>
                      <p className="font-black text-white text-sm">Painel de Inteligência Completo</p>
                      <p className="text-indigo-300 text-xs">Cruzamento fiscal · estoque · tickets médios · bairros</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors flex-shrink-0" />
                </div>
              </Link>
            </section>

            {/* AÃ§Ãµes rÃ¡pidas */}
            <section>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-3">AÃ§Ãµes RÃ¡pidas</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/master/planos">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-indigo-500 transition-all">
                    <Tag className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="font-bold text-sm">Editor de Planos</p>
                      <p className="text-xs text-zinc-500">Ajustar preÃ§os</p>
                    </div>
                  </div>
                </Link>
                <Link href="/admin/anuncios/carrossel">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-orange-500 transition-all">
                    <Megaphone className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="font-bold text-sm">Carrossel</p>
                      <p className="text-xs text-amber-500 font-bold">{D.carrossel.pendentesAprovacao} pendentes</p>
                    </div>
                  </div>
                </Link>
                <button className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-emerald-500 transition-all text-left">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-bold text-sm">Exportar BI</p>
                    <p className="text-xs text-zinc-500">RelatÃ³rio hoje</p>
                  </div>
                </button>
                <button className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3 hover:border-blue-500 transition-all text-left">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-bold text-sm">Sincronizar</p>
                    <p className="text-xs text-zinc-500">Dados financeiros</p>
                  </div>
                </button>
              </div>
            </section>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* ABA: PLANOS                                                   */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {aba === 'planos' && (
          <>
            {/* Header receita de planos */}
            <section className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-5">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Receita Total de Planos / MÃªs</p>
              <p className="text-4xl font-black">R$ {fmt(D.empresas.receitaMes + D.profissionais.receitaMes + D.academia.receitaMes)}</p>
              <p className="text-blue-200 text-sm mt-2">
                Empresas R${D.empresas.receitaMes} Â· Prof. R${D.profissionais.receitaMes} Â· Academia R${fmt(D.academia.receitaMes)}
              </p>
            </section>

            {/* EMPRESAS */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black uppercase italic text-blue-400 flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Empresas / Lojas
                </h3>
                <span className="text-zinc-500 text-sm font-bold">{D.empresas.total} total</span>
              </div>
              <PlanoRow nome="GrÃ¡tis"              count={D.empresas.gratis}   preco="R$ 0"    receita={0} />
              <PlanoRow nome="BÃ¡sico"              count={D.empresas.basico}   preco="R$ 29"   receita={D.empresas.basico * 29} />
              <PlanoRow nome="Premium"             count={D.empresas.premium}  preco="R$ 56"   receita={D.empresas.premium * 56} destaque />
              <PlanoRow nome="Fisco / ContÃ¡bil"    count={D.empresas.fisco}    preco="R$ 150"  receita={D.empresas.fisco * 150} />
              <div className="border-t border-zinc-800 pt-3 flex justify-between">
                <span className="text-zinc-500 font-bold text-sm">Total empresas</span>
                <span className="font-black text-emerald-400">R$ {fmt(D.empresas.receitaMes)}/m</span>
              </div>
            </section>

            {/* PROFISSIONAIS */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black uppercase italic text-violet-400 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Profissionais Liberais
                </h3>
                <span className="text-zinc-500 text-sm font-bold">{D.profissionais.total} total</span>
              </div>
              <PlanoRow nome="GrÃ¡tis"   count={D.profissionais.gratis}   preco="R$ 0"         receita={0} />
              <PlanoRow nome="BÃ¡sico"   count={D.profissionais.basico}   preco="R$ 10 (30d free)" receita={D.profissionais.basico * 10} />
              <PlanoRow nome="Premium"  count={D.profissionais.premium}  preco="R$ 25"        receita={D.profissionais.premium * 25} destaque />
              <div className="border-t border-zinc-800 pt-3 flex justify-between">
                <span className="text-zinc-500 font-bold text-sm">Total profissionais</span>
                <span className="font-black text-emerald-400">R$ {fmt(D.profissionais.receitaMes)}/m</span>
              </div>
            </section>

            {/* ACADEMIA */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black uppercase italic text-pink-400 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" /> Academia
                </h3>
                <span className="text-zinc-500 text-sm font-bold">{D.academia.total} alunos</span>
              </div>
              <PlanoRow nome="Mensal"    count={D.academia.ativosMensal}    preco="R$ 79/m"        receita={D.academia.ativosMensal * 79} destaque />
              <PlanoRow nome="Semestral" count={D.academia.ativosSemestral} preco="R$ 59/m Â· 6m"   receita={D.academia.ativosSemestral * 59} />
              <div className="border-t border-zinc-800 pt-3 flex justify-between">
                <span className="text-zinc-500 font-bold text-sm">Total academia (mensais)</span>
                <span className="font-black text-emerald-400">R$ {fmt(D.academia.receitaMes)}/m</span>
              </div>
            </section>

            {/* RECEITAS NÃƒO-RECORRENTES */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-black uppercase italic text-amber-400 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Receitas por Uso
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Desbloqueios de contato (R$1/un)', val: `R$ ${fmt(D.busca.receitaMes)}/m`, sub: `${D.busca.mes.toLocaleString()} desbloqueios` },
                  { label: 'LeilÃ£o carrossel (3 slots)', val: `R$ ${fmt(D.carrossel.receitaMes)}/m`, sub: 'Lances: R$250 Â· R$180 Â· R$95' },
                  { label: 'PDV â€” comissÃ£o 1%', val: `R$ ${fmt(D.pdv.comissaoMes)}/m`, sub: `${D.pdv.pdvsAtivos} lojas ativas` },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-white">{item.label}</p>
                      <p className="text-xs text-zinc-500">{item.sub}</p>
                    </div>
                    <span className="text-amber-400 font-black text-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </section>

            <Link href="/admin/master/planos">
              <div className="bg-indigo-600 hover:bg-indigo-500 transition-all p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-black text-white">Editor de PreÃ§os de Planos</p>
                  <p className="text-indigo-200 text-sm">Ajuste valores de cada tier</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </Link>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* ABA: USUÃRIOS                                                 */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {aba === 'usuarios' && (
          <>
            <section className="bg-gradient-to-r from-violet-700 to-indigo-800 rounded-3xl p-5">
              <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Base de UsuÃ¡rios</p>
              <p className="text-5xl font-black">{D.usuarios.total.toLocaleString()}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-violet-200">{D.usuarios.ativos.toLocaleString()} ativos</span>
                <span className="text-emerald-300 font-bold">+{D.usuarios.novosHoje} hoje</span>
              </div>
            </section>

            {/* Funil de indicaÃ§Ãµes */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-black uppercase italic text-amber-400 flex items-center gap-2">
                <Target className="w-5 h-5" /> Funil de IndicaÃ§Ãµes (Member Get Member)
              </h3>
              {[
                { label: 'Links gerados',       val: 1250, cor: 'border-indigo-500',  text: 'text-white' },
                { label: 'Cadastros pendentes', val: D.usuarios.indicacoesPendentes, cor: 'border-amber-500', text: 'text-amber-400' },
                { label: 'UsuÃ¡rios validados',  val: D.usuarios.indicacoesValidadas, cor: 'border-emerald-500', text: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={item.label} className={`border-l-4 ${item.cor} bg-zinc-800/40 p-4 rounded-r-2xl`} style={{ marginLeft: `${i * 16}px` }}>
                  <p className="text-zinc-400 text-xs font-black uppercase">{item.label}</p>
                  <p className={`text-4xl font-black ${item.text}`}>{item.val.toLocaleString()}</p>
                </div>
              ))}
              <p className="text-zinc-500 text-sm font-bold text-right">
                Taxa de eficiÃªncia: <span className="text-emerald-400">{D.usuarios.taxaConversao}%</span>
              </p>
            </section>

            {/* BÃ´nus */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-black uppercase italic text-yellow-400 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Sistema de BÃ´nus
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pago este mÃªs', val: `R$ ${D.usuarios.bonusPagosMes.toLocaleString()}`, cor: 'text-emerald-400' },
                  { label: 'Em provisÃ£o', val: `R$ ${(D.usuarios.bonusPagosMes * 0.35).toFixed(0)}`, cor: 'text-amber-400' },
                  { label: 'Links pendentes', val: String(D.usuarios.indicacoesPendentes), cor: 'text-red-400' },
                  { label: 'Taxa bÃ´nus/receita', val: '21.5%', cor: 'text-blue-400' },
                ].map(item => (
                  <div key={item.label} className="bg-zinc-800/60 rounded-xl p-3">
                    <p className="text-zinc-500 text-xs font-bold uppercase">{item.label}</p>
                    <p className={`text-2xl font-black ${item.cor}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* UsuÃ¡rios por tipo */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black uppercase italic text-zinc-400 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> ComposiÃ§Ã£o da Base
              </h3>
              {[
                { tipo: 'UsuÃ¡rios Gerais',         count: 1081, pct: 87, cor: 'bg-indigo-500' },
                { tipo: 'Lojistas / Empresas',      count: 47,   pct: 4,  cor: 'bg-blue-500' },
                { tipo: 'Profissionais Liberais',   count: 83,   pct: 7,  cor: 'bg-violet-500' },
                { tipo: 'Academia',                 count: 36,   pct: 3,  cor: 'bg-pink-500' },
              ].map(item => (
                <div key={item.tipo} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 font-medium">{item.tipo}</span>
                    <span className="text-zinc-400 font-black">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.cor} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </section>

            <Link href="/admin/usuarios">
              <div className="bg-violet-700 hover:bg-violet-600 transition-all p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-black text-white">Gerenciar UsuÃ¡rios</p>
                  <p className="text-violet-200 text-sm">Lista completa, aprovaÃ§Ãµes e bÃ´nus</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
            </Link>
          </>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* ABA: SISTEMA                                                  */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {aba === 'sistema' && (
          <>
            {/* Status dos mÃ³dulos */}
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-black uppercase italic text-zinc-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" /> Status dos MÃ³dulos
              </h3>
              {[
                { mod: 'Busca Inteligente',   status: 'ok',   det: `${D.busca.hoje} consultas hoje` },
                { mod: 'PDV Colaborativo',    status: 'ok',   det: `${D.pdv.pdvsAtivos} lojas ativas` },
                { mod: 'Carrossel / LeilÃ£o',  status: 'warn', det: `${D.carrossel.pendentesAprovacao} anÃºncios pendentes` },
                { mod: 'Sistema de BÃ´nus',    status: 'warn', det: `${D.usuarios.indicacoesPendentes} links sem validaÃ§Ã£o` },
                { mod: 'Academia',            status: 'ok',   det: `${D.academia.treinandoAgora} treinando agora` },
                { mod: 'Moeda Conecta',       status: 'ok',   det: 'Saldo R$ 12.800 em circulaÃ§Ã£o' },
                { mod: 'PDV MÃ³vel',           status: 'ok',   det: 'Scanner operacional' },
                { mod: 'AutenticaÃ§Ã£o Admin',  status: 'ok',   det: 'Senha provisÃ³ria ativa' },
              ].map(item => (
                <div key={item.mod} className="flex items-center gap-3 py-2.5 border-b border-zinc-800 last:border-none">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    item.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                    : item.status === 'warn' ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b] animate-pulse'
                    : 'bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse'
                  }`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{item.mod}</p>
                    <p className="text-xs text-zinc-500">{item.det}</p>
                  </div>
                  <span className={`text-xs font-black uppercase ${
                    item.status === 'ok' ? 'text-emerald-400'
                    : item.status === 'warn' ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>{item.status}</span>
                </div>
              ))}
            </section>

            {/* SeguranÃ§a / Senha */}
            <section className="bg-zinc-900/50 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <h3 className="font-black uppercase italic text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5" /> SeguranÃ§a do Painel
              </h3>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-amber-300 text-sm font-bold">âš ï¸ Senha provisÃ³ria ativa</p>
                <p className="text-zinc-400 text-xs mt-1">Altere a senha ao final dos testes em <code className="text-amber-200">hooks/useAdminLogin.ts</code> â†’ constante <code className="text-amber-200">ADMIN_PASSWORD</code></p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3 space-y-1">
                <p className="text-xs text-zinc-500 font-bold uppercase">Credenciais de acesso atual</p>
                <p className="text-sm text-white font-mono">E-mail: <span className="text-indigo-300">admin@valente.com</span></p>
                <p className="text-sm text-white font-mono">Senha: <span className="text-amber-300">Mestre@2026</span></p>
              </div>
            </section>

            {/* ConfiguraÃ§Ãµes de sistema */}
            <section>
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-3">ConfiguraÃ§Ãµes</p>
              <div className="space-y-2">
                {[
                  { label: 'PreÃ§o por desbloqueio de contato', val: 'R$ 1,00', href: '#' },
                  { label: 'BÃ´nus de boas-vindas (consultas grÃ¡tis)', val: '5 consultas', href: '#' },
                  { label: 'Auto-aprovaÃ§Ã£o de anÃºncios carrossel', val: 'Desativada', href: '/admin/anuncios/carrossel' },
                  { label: 'ComissÃ£o PDV', val: '1% por venda', href: '#' },
                  { label: 'MÃ­nimo de lance carrossel', val: 'R$ 35,00', href: '/admin/anuncios/carrossel' },
                ].map(item => (
                  <Link key={item.label} href={item.href}>
                    <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500 transition-all">
                      <p className="text-sm text-zinc-300">{item.label}</p>
                      <span className="text-indigo-400 font-bold text-sm ml-3 text-right">{item.val}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* RelatÃ³rio BI */}
            <button className="w-full bg-zinc-900 border-2 border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800 p-3 rounded-xl group-hover:bg-indigo-500/20 transition-all">
                  <FileSpreadsheet className="w-6 h-6 text-zinc-500 group-hover:text-emerald-400 transition-all" />
                </div>
                <div className="text-left">
                  <p className="font-black text-white">RelatÃ³rio de InteligÃªncia Comercial</p>
                  <p className="text-zinc-500 text-sm">Cruzamento de vendas, estoque e fiscal</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-all flex-shrink-0" />
            </button>
          </>
        )}

      </main>
    </div>
  )
}
