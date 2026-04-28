'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, TrendingUp, Activity, Dumbbell } from 'lucide-react'

export default function HistoricoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/academia" className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </Link>
          
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>HISTÓRICO</span>
          </div>
          
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-4">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Histórico de Treinos</h1>
          <p className="text-zinc-400 text-sm">Acompanhe sua evolução ao longo do tempo</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-zinc-400">Treinos Totais</span>
            </div>
            <p className="text-3xl font-black text-white">24</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-zinc-400">Horas Totais</span>
            </div>
            <p className="text-3xl font-black text-white">18.5</p>
          </div>
        </div>

        {/* Lista de treinos recentes */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6">
          <h2 className="font-bold text-white mb-4">Treinos Recentes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/30 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Peito e Tríceps</p>
                  <p className="text-xs text-zinc-400">Hoje, 10:30</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">45 min</p>
                <p className="text-xs text-zinc-400">320 kcal</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Cardio</p>
                  <p className="text-xs text-zinc-400">Ontem, 14:00</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-400">30 min</p>
                <p className="text-xs text-zinc-400">250 kcal</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Costas e Bíceps</p>
                  <p className="text-xs text-zinc-400">2 dias atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-400">50 min</p>
                <p className="text-xs text-zinc-400">380 kcal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link para histórico de cargas */}
        <Link href="/academia/historico-carga" className="block bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 hover:bg-white/15 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Histórico de Cargas</p>
                <p className="text-xs text-zinc-400">Acompanhe sua evolução de pesos</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-zinc-400 rotate-180" />
          </div>
        </Link>
      </main>
    </div>
  )
}
