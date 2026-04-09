'use client'

import React from 'react'
import { 
  LayoutDashboard, Users, Building2, 
  Box, Tag, Landmark, ArrowRight 
} from 'lucide-react'

export default function DashboardMasterGigante() {
  const menuPrincipal = [
    { label: 'Dashboard', icon: <LayoutDashboard size={80} />, color: 'text-indigo-500' },
    { label: 'Usuários', icon: <Users size={80} />, color: 'text-emerald-500' },
    { label: 'Empresas', icon: <Building2 size={80} />, color: 'text-amber-500' },
    { label: 'Catálogo', icon: <Box size={80} />, color: 'text-blue-500' },
    { label: 'Ofertas', icon: <Tag size={80} />, color: 'text-rose-500' },
    { label: 'Financeiro', icon: <Landmark size={80} />, color: 'text-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-20">
      
      {/* IDENTIFICAÇÃO DO NÍVEL DE ACESSO */}
      <header className="mb-32 border-b-8 border-zinc-900 pb-12 flex justify-between items-center">
        <h1 className="text-9xl font-black uppercase italic tracking-tighter leading-none">
          Admin <span className="text-indigo-600">Master</span>
        </h1>
        <div className="text-right">
          <p className="text-3xl font-black text-zinc-700 uppercase tracking-[0.5em] italic">Valente Conecta</p>
        </div>
      </header>

      {/* GRADE DE NAVEGAÇÃO COM LETRAS DOBRADAS */}
      <nav className="grid grid-cols-1 gap-12">
        {menuPrincipal.map((item) => (
          <button 
            key={item.label}
            className="group flex items-center justify-between bg-zinc-900/30 border-4 border-zinc-900 p-16 rounded-[60px] hover:border-white transition-all hover:bg-zinc-900"
          >
            <div className="flex items-center gap-16">
              {/* ÍCONES EM TAMANHO MASSIVO */}
              <div className={`${item.color} group-hover:scale-110 transition-transform duration-500`}>
                {item.icon}
              </div>

              {/* O TEXTO QUE VOCÊ EXIGIU: DOBRADO E IMPACTANTE */}
              <span className="text-8xl font-black uppercase italic tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
                {item.label}
              </span>
            </div>

            <ArrowRight size={100} strokeWidth={3} className="text-zinc-800 group-hover:text-white group-hover:translate-x-6 transition-all" />
          </button>
        ))}
      </nav>

      {/* RODAPÉ ESTRATÉGICO */}
      <footer className="mt-32 opacity-20">
        <p className="text-4xl font-black uppercase italic tracking-[1em] text-center">
          Sincronização Total 2026
        </p>
      </footer>
    </div>
  )
}