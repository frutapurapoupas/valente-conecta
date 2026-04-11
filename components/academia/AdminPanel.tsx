'use client'

import Link from 'next/link'
import { TrendingUp, LayoutDashboard } from 'lucide-react'

export default function AdminPanel() {
  return (
    <section className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h2 className="font-bold text-sm uppercase tracking-widest">Painel Admin Master</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/financeiro"
          className="bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20 transition"
        >
          <TrendingUp className="text-green-400" />
          <span className="text-[10px] font-bold">FINANCEIRO</span>
        </Link>
        <Link
          href="/admin/usuarios"
          className="bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20 transition"
        >
          <LayoutDashboard className="text-blue-400" />
          <span className="text-[10px] font-bold">USUÁRIOS</span>
        </Link>
      </div>
    </section>
  )
}
