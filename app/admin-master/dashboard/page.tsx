'use client'
import { useEffect, useState } from 'react'
import {
  TrendingUp, AlertTriangle, Users, Building2, ShoppingBag, Wallet,
  LayoutDashboard, Store, CreditCard, Tag, BookOpen, Settings,
  Package, UserCheck, BarChart3, Megaphone, GraduationCap, MapPin,
  ShoppingCart, Search, Award, Bell, ChevronRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SECOES = [
  {
    titulo: 'GESTÃO GERAL',
    cor: 'indigo',
    items: [
      { label: 'Dashboard Admin', desc: 'Visão geral do sistema', icon: LayoutDashboard, href: '/admin/dashboard', cor: 'indigo' },
      { label: 'Usuários', desc: 'Cadastros e permissões', icon: Users, href: '/admin/usuarios', cor: 'indigo' },
      { label: 'Empresas / Lojas', desc: 'Gestão de negócios', icon: Building2, href: '/admin/empresas', cor: 'blue' },
      { label: 'Profissionais', desc: 'Catálogos e perfis', icon: UserCheck, href: '/admin/profissionais', cor: 'violet' },
    ]
  },
  {
    titulo: 'FINANCEIRO',
    cor: 'emerald',
    items: [
      { label: 'Financeiro Geral', desc: 'Receitas e despesas', icon: BarChart3, href: '/admin/financeiro', cor: 'emerald' },
      { label: 'Controle Caixa', desc: 'Fluxo financeiro', icon: CreditCard, href: '/admin/financeiro/controle', cor: 'emerald' },
      { label: 'Finanças Pessoais', desc: 'Pró-labore · Cartões · Despesas PF', icon: Wallet, href: '/admin-master/financeiro-pessoal', cor: 'emerald' },
      { label: 'Planos', desc: 'Assinaturas e cobrança', icon: Award, href: '/admin/planos', cor: 'amber' },
    ]
  },
  {
    titulo: 'MARKETING & VENDAS',
    cor: 'rose',
    items: [
      { label: 'Ofertas', desc: 'Promoções ativas', icon: Tag, href: '/admin/ofertas', cor: 'rose' },
      { label: 'Anúncios / Carrossel', desc: 'Banners e destaques', icon: Megaphone, href: '/admin/anuncios/carrossel', cor: 'pink' },
      { label: 'Catálogo', desc: 'Produtos e serviços', icon: Package, href: '/admin/catalogo', cor: 'orange' },
      { label: 'Busca de Produtos', desc: 'Pesquisa global', icon: Search, href: '/busca/produtos', cor: 'orange' },
    ]
  },
  {
    titulo: 'PDV & OPERAÇÕES',
    cor: 'cyan',
    items: [
      { label: 'PDV Principal', desc: 'Ponto de venda', icon: ShoppingCart, href: '/pdv', cor: 'cyan' },
      { label: 'Estoque', desc: 'Controle de produtos', icon: Package, href: '/pdv/estoque', cor: 'teal' },
      { label: 'Venda', desc: 'Registro de vendas', icon: ShoppingBag, href: '/pdv/venda', cor: 'cyan' },
      { label: 'Fiado', desc: 'Crédito de clientes', icon: CreditCard, href: '/pdv/fiado', cor: 'amber' },
    ]
  },
  {
    titulo: 'ACADEMIA & COMUNIDADE',
    cor: 'violet',
    items: [
      { label: 'Academia (Admin)', desc: 'Gestão de cursos', icon: GraduationCap, href: '/admin/academia', cor: 'violet' },
      { label: 'Academia (Aluno)', desc: 'Portal do aluno', icon: BookOpen, href: '/academia', cor: 'purple' },
      { label: 'Explorar', desc: 'Mapa de negócios', icon: MapPin, href: '/explorar', cor: 'blue' },
      { label: 'Indique & Ganhe', desc: 'Programa de indicação', icon: Award, href: '/indique', cor: 'amber' },
    ]
  },
  {
    titulo: 'CONFIGURAÇÕES',
    cor: 'zinc',
    items: [
      { label: 'Configurações', desc: 'Sistema e parâmetros', icon: Settings, href: '/admin/configuracoes', cor: 'zinc' },
      { label: 'Monitor', desc: 'Uso e atividade', icon: Bell, href: '/admin/usuarios/monitor', cor: 'zinc' },
      { label: 'Inteligência', desc: 'BI e análises', icon: TrendingUp, href: '/admin/master/inteligencia', cor: 'indigo' },
      { label: 'Instalador', desc: 'Setup e radar', icon: Store, href: '/admin/master/instalador', cor: 'zinc' },
    ]
  },
]

const COR: Record<string, string> = {
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  emerald:'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  teal:   'bg-teal-500/15 text-teal-400 border-teal-500/20',
  cyan:   'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  rose:   'bg-rose-500/15 text-rose-400 border-rose-500/20',
  pink:   'bg-pink-500/15 text-pink-400 border-pink-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/20',
  zinc:   'bg-zinc-700/40 text-zinc-300 border-zinc-700/40',
}

export default function DashboardMaster() {
  const [stats, setStats] = useState({ usuarios: 0, empresas: 0, transacoes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, e, t] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('companies').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('amount').gte(
            'created_at',
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          ),
        ])
        const volMes = (t.data || []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)
        setStats({ usuarios: u.count || 0, empresas: e.count || 0, transacoes: Math.round(volMes) })
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-black italic text-indigo-400 uppercase leading-none">Command Center</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Master · Valente Conecta</p>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="bg-zinc-900 border border-indigo-500/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-white">{loading ? '…' : stats.usuarios.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs font-bold mt-1">Usuários</p>
        </div>
        <div className="bg-zinc-900 border border-blue-500/20 rounded-2xl p-4 text-center">
          <p className="text-3xl font-black text-white">{loading ? '…' : stats.empresas.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs font-bold mt-1">Empresas</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{loading ? '…' : `R$${stats.transacoes.toLocaleString()}`}</p>
          <p className="text-zinc-500 text-xs font-bold mt-1">Transações/mês</p>
        </div>
      </div>

      {/* Seções */}
      {SECOES.map(secao => (
        <div key={secao.titulo} className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">{secao.titulo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {secao.items.map(item => {
              const Icon = item.icon
              const cor = COR[item.cor] ?? COR.zinc
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-4 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${cor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
