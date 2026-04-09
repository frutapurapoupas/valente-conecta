'use client'

import React from 'react'
import Link from 'next/link'
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { 
  LayoutDashboard, Users, Building2, ShoppingBag, 
  Tag, DollarSign, LogOut, MapPin, TrendingUp 
} from 'lucide-react'

// DADOS FICTÍCIOS PARA A APRESENTAÇÃO
const dataAcessos = [
  { name: '10h', v: 400 }, { name: '12h', v: 1100 }, { name: '14h', v: 800 },
  { name: '16h', v: 1500 }, { name: '18h', v: 2100 }
]

const dataSetores = [
  { name: 'Alimentação', value: 45 },
  { name: 'Serviços', value: 30 },
  { name: 'Saúde', value: 25 },
]
const COLORS = ['#6366F1', '#10B981', '#F59E0B']

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-indigo-500">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-zinc-900">
          <h2 className="text-xl font-black text-indigo-500 italic uppercase tracking-tighter">Valente</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Admin Master</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', active: true },
            { label: 'Usuários', icon: Users, href: '/admin/usuarios' },
            { label: 'Empresas', icon: Building2, href: '/admin/empresas' },
            { label: 'Catálogo', icon: ShoppingBag, href: '/admin/catalogo' },
            { label: 'Ofertas', icon: Tag, href: '/admin/ofertas' },
            { label: 'Financeiro', icon: DollarSign, href: '/admin/financeiro' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.active ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
              <item.icon size={20} />
              <span className="font-bold text-xs uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button className="flex items-center gap-3 text-red-500 font-bold p-3 w-full hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={20} /> <span className="text-xs uppercase">Sair</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto bg-black">
        <header className="mb-10">
          <h1 className="text-5xl font-black uppercase tracking-tight text-white">Painel Master</h1>
          <div className="flex items-center gap-2 text-indigo-400 font-bold mt-2">
            <MapPin size={18} className="text-red-600" />
            <span className="text-sm tracking-widest uppercase">Valente, Bahia</span>
          </div>
        </header>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* ACESSOS HOJE */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-white font-black uppercase text-sm tracking-widest mb-6 border-l-4 border-indigo-500 pl-3">Acessos em Tempo Real</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataAcessos}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SETORES */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-white font-black uppercase text-sm tracking-widest mb-6 border-l-4 border-emerald-500 pl-3">Distribuição de Lojas</h3>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataSetores} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {dataSetores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 pr-8">
                {dataSetores.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-bold uppercase text-zinc-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ATALHOS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/usuarios" className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-indigo-500 transition-all flex items-center justify-between group">
            <div>
              <Users size={32} className="text-indigo-500 mb-2" />
              <h3 className="text-white font-black uppercase text-xl">Usuários</h3>
            </div>
            <span className="text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-all">GERENCIAR →</span>
          </Link>

          <Link href="/admin/empresas" className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-emerald-500 transition-all flex items-center justify-between group">
            <div>
              <Building2 size={32} className="text-emerald-500 mb-2" />
              <h3 className="text-white font-black uppercase text-xl">Empresas</h3>
            </div>
            <span className="text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-all">GERENCIAR →</span>
          </Link>
        </div>
      </main>
    </div>
  )
}