'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid
} from 'recharts'
import {
  Users, Building2, ShoppingBag, Wallet, TrendingUp,
  LayoutDashboard, CreditCard, Tag, BookOpen, Settings,
  Package, UserCheck, BarChart3, Megaphone, GraduationCap, MapPin,
  ShoppingCart, Search, Award, Bell, FileText, CalendarClock,
  Clock, CheckCircle, XCircle, Truck, Store, Phone, Mail, User, Shield, Home
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FinanceiroPessoalShortcut from '@/components/admin-master/FinanceiroPessoalShortcut'

const dadosMensais = [
  { mes: 'Nov', receita: 4200, despesa: 2800 },
  { mes: 'Dez', receita: 5800, despesa: 3100 },
  { mes: 'Jan', receita: 3900, despesa: 2600 },
  { mes: 'Fev', receita: 6200, despesa: 3400 },
  { mes: 'Mar', receita: 7100, despesa: 3900 },
  { mes: 'Abr', receita: 5400, despesa: 3200 },
]

const dadosPizza = [
  { name: 'Empresas',      value: 38, cor: '#6366f1' },
  { name: 'Ambulantes',    value: 27, cor: '#10b981' },
  { name: 'Profissionais', value: 21, cor: '#f59e0b' },
  { name: 'Usuarios PF',   value: 14, cor: '#3b82f6' },
]

const ATALHOS = [
  { label: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard',                 cor: 'text-indigo-400' },
  { label: 'Usuarios',       icon: Users,           href: '/admin/usuarios',                  cor: 'text-indigo-400' },
  { label: 'Gest. Usuários', icon: Shield,         href: '/admin-master/usuarios',            cor: 'text-red-400' },
  { label: 'Config. Bônus',  icon: Award,           href: '/admin-master/bonus',               cor: 'text-amber-400' },
  { label: 'Rel. Cidades',   icon: BarChart3,       href: '/admin-master/multi-cidade/relatorios', cor: 'text-purple-400' },
  { label: 'Empresas',       icon: Building2,       href: '/admin/empresas',                  cor: 'text-blue-400' },
  { label: 'Profissionais',  icon: UserCheck,       href: '/admin/profissionais',             cor: 'text-violet-400' },
  { label: 'Financeiro',     icon: BarChart3,       href: '/admin/financeiro',                cor: 'text-emerald-400' },
  { label: 'Fin. Pessoal',   icon: Wallet,          href: '/admin-master/financeiro-pessoal', cor: 'text-emerald-300' },
  { label: 'Planos',         icon: Award,           href: '/admin/planos',                    cor: 'text-amber-400' },
  { label: 'Ofertas',        icon: Tag,             href: '/admin/ofertas',                   cor: 'text-rose-400' },
  { label: 'Anuncios',       icon: Megaphone,       href: '/admin/anuncios/carrossel',        cor: 'text-pink-400' },
  { label: 'Catalogo',       icon: Package,         href: '/admin/catalogo',                  cor: 'text-orange-400' },
  { label: 'PDV',            icon: ShoppingCart,    href: '/pdv',                             cor: 'text-cyan-400' },
  { label: 'Estoque',        icon: Package,         href: '/pdv/estoque',                     cor: 'text-teal-400' },
  { label: 'Venda',          icon: ShoppingBag,     href: '/pdv/venda',                       cor: 'text-cyan-400' },
  { label: 'Fiado',          icon: CreditCard,      href: '/pdv/fiado',                       cor: 'text-amber-400' },
  { label: 'Academia',       icon: GraduationCap,   href: '/admin/academia',                  cor: 'text-violet-400' },
  { label: 'Aluno',          icon: BookOpen,        href: '/academia',                        cor: 'text-purple-400' },
  { label: 'Explorar',       icon: MapPin,          href: '/explorar',                        cor: 'text-blue-400' },
  { label: 'Indique',        icon: Award,           href: '/indique',                         cor: 'text-amber-400' },
  { label: 'Config.',        icon: Settings,        href: '/admin/configuracoes',             cor: 'text-zinc-400' },
  { label: 'Monitor',        icon: Bell,            href: '/admin/usuarios/monitor',          cor: 'text-zinc-400' },
  { label: 'Relatorios',     icon: FileText,        href: '/admin/master/inteligencia',       cor: 'text-indigo-400' },
  { label: 'Bonus',          icon: Award,           href: '/admin/usuarios/bonus',            cor: 'text-amber-400' },
  { label: 'Busca',          icon: Search,          href: '/busca/produtos',                  cor: 'text-blue-400' },
  { label: 'Caixa',          icon: CreditCard,      href: '/admin/financeiro/controle',       cor: 'text-emerald-400' },
  { label: 'Serv. Agendado', icon: CalendarClock,   href: '/admin/agenda',                    cor: 'text-fuchsia-400' },
  { label: 'Fila Espera',    icon: Clock,          href: '/admin/agendamento/fila-espera',    cor: 'text-yellow-400' },
  { label: 'Ambulantes',     icon: Store,           href: '/ambulantes',                      cor: 'text-orange-400' },
  { label: 'Usr. Cidade',    icon: Users,           href: '/admin-master/multi-cidade/usuarios', cor: 'text-cyan-400' },
  { label: 'Transportes',    icon: Truck,           href: '/admin-master/gerenciar-transportes', cor: 'text-teal-400' },
  { label: 'Config. Imóveis', icon: Home,          href: '/admin-master/configuracoes-imoveis', cor: 'text-rose-400' },
]

function TTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-zinc-400 font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'receita' ? 'Receita' : 'Despesa'}: R$ {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function DashboardMaster() {
  const [stats, setStats] = useState({ usuarios: 0, empresas: 0, transacoes: 0, imoveis: 0, motoristas: 0, agendamentos: 0 })
  const [loading, setLoading] = useState(true)
  const [alertas, setAlertas] = useState([
    { tipo: 'warning', mensagem: '3 motoristas pendentes de aprovação', tempo: '5 min' },
    { tipo: 'info', mensagem: 'Novo plano gratuito adicionado: Serviço com Agendamento', tempo: '1 hora' },
    { tipo: 'success', mensagem: 'Volume de transações aumentou 12% este mês', tempo: '2 horas' },
  ])

  // Dashboard sem autenticação - acesso direto
  const [orders, setOrders] = useState([
    {
      id: 'order_1711234567890',
      customer: { name: 'João Silva', phone: '(77) 91234-5678' },
      items: [
        { name: 'Arroz Tipo 1 5kg', quantity: 2, price: 25.90 },
        { name: 'Feijão Carioca 1kg', quantity: 1, price: 8.90 }
      ],
      total: 60.70,
      status: 'pending',
      timestamp: new Date().toISOString(),
      store: 'Mercado Central Valente'
    },
    {
      id: 'order_1711234567891',
      customer: { name: 'Maria Santos', phone: '(77) 99876-5432' },
      items: [
        { name: 'Serviço de Barbearia', quantity: 1, price: 25.00 }
      ],
      total: 25.00,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      store: 'Barbearia Valente'
    }
  ])

  useEffect(() => {
    async function load() {
      try {
        const [u, e, t] = await Promise.all([
          (supabase as any).from('users').select('*', { count: 'exact', head: true }),
          (supabase as any).from('companies').select('*', { count: 'exact', head: true }),
          (supabase as any).from('transactions').select('amount').gte(
            'created_at',
            new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          ),
        ])
        const vol = (t.data || []).reduce((s: number, r: { amount: number }) => s + r.amount, 0)
        
        // Buscar dados de imóveis e motoristas
        const [imoveisData, motoristasData] = await Promise.all([
          (supabase as any).from('imoveis_anuncios').select('*', { count: 'exact', head: true }),
          (supabase as any).from('motoristas_transportes').select('*', { count: 'exact', head: true }),
        ])
        
        setStats({ 
          usuarios: u.count || 0, 
          empresas: e.count || 0, 
          transacoes: Math.round(vol),
          imoveis: imoveisData.count || 0,
          motoristas: motoristasData.count || 0,
          agendamentos: 0 // TODO: implementar contagem de agendamentos
        })
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleOrderResponse = (orderId: string, response: 'pickup' | 'delivery') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const treatment = response === 'pickup' 
          ? { type: 'pickup', message: 'Retirar na loja em 30 minutos', time: '30 minutos' }
          : { type: 'delivery', message: 'Entrega em até 1 hora', time: '1 hora' }
        
        return {
          ...order,
          status: 'confirmed',
          treatment,
          response_time: new Date().toISOString()
        }
      }
      return order
    }))

    // Simular envio de notificação para cliente
    console.log(`Notificação enviada para cliente do pedido ${orderId}: ${response === 'pickup' ? 'Retirar na loja' : 'Entrega'}`)
  }

  const handleOrderCancel = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'cancelled', cancelled_at: new Date().toISOString() }
      }
      return order
    }))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-zinc-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl font-black italic text-indigo-400 uppercase leading-none">Command Center</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Admin Master &middot; Valente Conecta</p>
          </div>
          <div className="flex items-center gap-3">
            <FinanceiroPessoalShortcut />
            <Link
              href="/admin-master/financeiro-pessoal"
              className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Base atual em evolucao
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 pb-24">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Usuarios',    value: loading ? '...' : stats.usuarios.toLocaleString(),          icon: Users,      cor: 'text-indigo-400', borda: 'border-indigo-500/30' },
            { label: 'Empresas',    value: loading ? '...' : stats.empresas.toLocaleString(),          icon: Building2,  cor: 'text-blue-400',   borda: 'border-blue-500/30' },
            { label: 'Volume/mes',  value: loading ? '...' : `R$${stats.transacoes.toLocaleString()}`, icon: TrendingUp, cor: 'text-emerald-400', borda: 'border-emerald-500/30' },
            { label: 'Crescimento', value: '+12%',                                                     icon: BarChart3,  cor: 'text-amber-400',  borda: 'border-amber-500/30' },
            { label: 'Imóveis',     value: loading ? '...' : stats.imoveis.toLocaleString(),         icon: Home,       cor: 'text-rose-400',   borda: 'border-rose-500/30' },
            { label: 'Motoristas',  value: loading ? '...' : stats.motoristas.toLocaleString(),      icon: Truck,      cor: 'text-teal-400',   borda: 'border-teal-500/30' },
          ].map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className={`bg-zinc-900 border ${k.borda} rounded-2xl p-4`}>
                <Icon className={`w-5 h-5 ${k.cor} mb-2`} />
                <p className={`text-2xl font-black ${k.cor}`}>{k.value}</p>
                <p className="text-zinc-500 text-xs font-bold mt-1">{k.label}</p>
              </div>
            )
          })}
        </div>

        {/* Alertas */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">ALERTAS E NOTIFICAÇÕES</h2>
          <div className="space-y-2">
            {alertas.map((alerta, idx) => (
              <div key={idx} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                alerta.tipo === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                alerta.tipo === 'info' ? 'bg-blue-500/10 border-blue-500/30' :
                'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  alerta.tipo === 'warning' ? 'bg-amber-500' :
                  alerta.tipo === 'info' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`} />
                <span className="text-sm text-zinc-300 flex-1">{alerta.mensagem}</span>
                <span className="text-xs text-zinc-500">{alerta.tempo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-base font-black uppercase text-white mb-1">Receita x Despesa</h2>
            <p className="text-zinc-500 text-xs mb-4">Ultimos 6 meses</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosMensais} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip content={<TTip />} />
                <Bar dataKey="receita" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Receita</span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Despesa</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-base font-black uppercase text-white mb-1">Distribuicao de Usuarios</h2>
            <p className="text-zinc-500 text-xs mb-4">Por tipo de conta</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {dadosPizza.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5">
                {dadosPizza.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.cor }} />
                    <span className="text-xs text-zinc-300 font-bold">{d.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:col-span-2">
            <h2 className="text-base font-black uppercase text-white mb-1">Tendencia de Volume</h2>
            <p className="text-zinc-500 text-xs mb-4">Receita mensal — ultimos 6 meses</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mes" tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }} />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pedidos do Catálogo */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">PEDIDOS DO CATÁLOGO</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-zinc-400">{orders.filter(o => o.status === 'pending').length} pendentes</span>
            </div>
          </div>
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                        order.status === 'confirmed' ? 'bg-emerald-500' :
                        'bg-red-500'
                      }`} />
                      <h3 className="font-bold text-white">Pedido #{order.id.split('_')[1]}</h3>
                      <span className="text-xs text-zinc-400">
                        {new Date(order.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        <span>{order.store}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-zinc-300">
                          {item.quantity}x {item.name} - R$ {item.price.toFixed(2)}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-zinc-800 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">Total: R$ {order.total.toFixed(2)}</span>
                        {order.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOrderResponse(order.id, 'pickup')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Store className="w-3 h-3 inline mr-1" />
                              Retirada
                            </button>
                            <button
                              onClick={() => handleOrderResponse(order.id, 'delivery')}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Truck className="w-3 h-3 inline mr-1" />
                              Entrega
                            </button>
                            <button
                              onClick={() => handleOrderCancel(order.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XCircle className="w-3 h-3 inline mr-1" />
                              Cancelar
                            </button>
                          </div>
                        ) : order.status === 'confirmed' ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs">
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirmado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 text-xs">
                            <XCircle className="w-4 h-4" />
                            <span>Cancelado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atalhos */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">ACESSO RAPIDO</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {ATALHOS.map(link => {
              const Icon = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 active:scale-95 rounded-2xl p-3 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-zinc-800 group-hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors">
                    <Icon className={`w-5 h-5 ${link.cor}`} />
                  </div>
                  <span className="text-xs font-bold text-zinc-300 leading-tight">{link.label}</span>
                </a>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

