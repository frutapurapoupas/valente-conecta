'use client'

import React from 'react'
import Link from 'next/link'
import { Users, Building2, Database, Tag, Wallet, Settings, LogOut, LayoutDashboard } from 'lucide-react'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const menu = [
    { name: 'Dashboard', icon: <LayoutDashboard />, path: '/admin/master' },
    { name: 'Usuários', icon: <Users />, path: '/admin/usuarios' },
    { name: 'Empresas', icon: <Building2 />, path: '/admin/empresas' },
    { name: 'Catálogo', icon: <Database />, path: '/admin/catalogo' },
    { name: 'Ofertas', icon: <Tag />, path: '/admin/ofertas' },
    { name: 'Financeiro', icon: <Wallet />, path: '/admin/financeiro' },
    { name: 'Configurações', icon: <Settings />, path: '/admin/config' },
  ]

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* MENU LATERAL GG */}
      <aside className="w-80 border-r-2 border-zinc-900 p-8 flex flex-col">
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase italic text-indigo-500">Valente<br/>Conecta</h2>
        </div>
        <nav className="flex-1 space-y-4">
          {menu.map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-900 transition-all group">
              <span className="text-zinc-500 group-hover:text-indigo-500">{item.icon}</span>
              <span className="font-black uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>
        <button className="flex items-center gap-4 p-4 mt-auto text-red-500 font-black uppercase tracking-widest hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut /> Sair
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}