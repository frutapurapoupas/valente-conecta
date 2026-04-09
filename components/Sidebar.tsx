'use client'

import React from 'react'
import { LayoutDashboard, Users, Building2, Box, Tag, Landmark, ChevronRight } from 'lucide-react'

export default function SidebarMaster() {
  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={48} />, active: true },
    { label: 'Usuários', icon: <Users size={48} />, active: false },
    { label: 'Empresas', icon: <Building2 size={48} />, active: false },
    { label: 'Catálogo', icon: <Box size={48} />, active: false },
    { label: 'Ofertas', icon: <Tag size={48} />, active: false },
    { label: 'Financeiro', icon: <Landmark size={48} />, active: false },
  ]

  return (
    <aside className="w-[500px] min-h-screen border-r-8 border-zinc-900 bg-black flex flex-col p-12">
      
      {/* BRANDING - DOBRADO */}
      <div className="mb-32">
        <h2 className="text-6xl font-black uppercase italic text-indigo-500 leading-none tracking-tighter">
          Valente<br/>Conecta
        </h2>
        <div className="h-2 w-24 bg-indigo-500 mt-4"></div>
      </div>

      {/* NAVEGAÇÃO - LETRAS DOBRADAS */}
      <nav className="flex-1 space-y-10">
        {menuItems.map((item) => (
          <button 
            key={item.label} 
            className={`w-full flex items-center justify-between p-10 rounded-[40px] transition-all group ${
              item.active 
              ? 'bg-indigo-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] scale-105' 
              : 'hover:bg-zinc-900 text-zinc-600 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-10">
              {/* ÍCONES TAMBÉM CRESCERAM P/ ACOMPANHAR */}
              <div className={`${item.active ? 'text-white' : 'text-zinc-700 group-hover:text-indigo-500'} transition-colors`}>
                {item.icon}
              </div>
              
              {/* O TEXTO DOBRADO: text-5xl font-black */}
              <span className="text-5xl font-black uppercase italic tracking-tighter transition-all">
                {item.label}
              </span>
            </div>

            {item.active && <ChevronRight size={40} strokeWidth={3} />}
          </button>
        ))}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="mt-20 pt-10 border-t-4 border-zinc-900">
        <p className="text-xl font-black text-zinc-700 uppercase tracking-[0.5em] italic">
          Master Control v2.0
        </p>
      </div>
    </aside>
  )
}