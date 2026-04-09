'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, Users, Building2, ShoppingBag, 
  Tag, DollarSign, LogOut, Settings 
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Usuários', icon: Users, href: '/admin/usuarios' },
    { label: 'Empresas', icon: Building2, href: '/admin/empresas' },
    { label: 'Catálogo', icon: ShoppingBag, href: '/admin/catalogo' },
    { label: 'Ofertas', icon: Tag, href: '/admin/ofertas' },
    { label: 'Financeiro', icon: DollarSign, href: '/admin/financeiro' },
    { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
  ]

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-indigo-500">
      
      {/* SIDEBAR COM LOGO E TEXTO LEGÍVEL */}
      <aside className="w-80 bg-zinc-950 border-r-2 border-zinc-900 flex flex-col shrink-0">
        
        {/* LOCAL DA LOGOMARCA */}
        <div className="p-10 flex flex-col items-center border-b-2 border-zinc-900">
          <div className="relative w-32 h-32 mb-4">
            <Image 
              src="/logo.png" 
              alt="Valente Conecta Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">
            Valente <span className="text-indigo-500">Conecta</span>
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2">
            Painel Administrativo
          </p>
        </div>
        
        {/* MENU DE NAVEGAÇÃO (TEXTOS DOBRADOS) */}
        <nav className="flex-1 p-6 space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <div className="flex items-center gap-5 p-4 rounded-2xl transition-all hover:bg-white hover:text-black group-active:scale-95">
                <item.icon size={28} strokeWidth={2.5} />
                <span className="text-xl font-black uppercase tracking-tight">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="p-6 border-t-2 border-zinc-900">
          <button className="flex items-center gap-5 text-red-500 hover:bg-red-500/10 p-5 w-full rounded-2xl transition-all">
            <LogOut size={28} strokeWidth={2.5} />
            <span className="text-xl font-black uppercase tracking-tight italic">Sair</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DO CONTEÚDO (AS PÁGINAS QUE FIZEMOS ANTES) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}