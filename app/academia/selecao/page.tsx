'use client'

import Link from 'next/link'
import { Dumbbell, User, Trophy, ChevronRight, ArrowLeft, Scale } from 'lucide-react'

export default function AcademiaSelecaoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/" className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </Link>
          
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>ACADEMIA</span>
          </div>
          
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Bem-vindo à Academia</h1>
          <p className="text-zinc-400 text-sm">Escolha uma opção para começar</p>
        </div>

        <Link 
          href="/academia/cadastro-inicial"
          className="group relative flex items-center justify-between p-6 rounded-[32px] bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-indigo-400/25 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg">Cadastro Inicial</p>
              <p className="text-white/70 text-xs">Configure seu perfil físico</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </Link>

        <Link 
          href="/academia/cadastro-inicial"
          className="group relative flex items-center justify-between p-6 rounded-[32px] bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-emerald-400/25 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg">Academia</p>
              <p className="text-white/70 text-xs">Cadastre sua academia</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </Link>

        <Link 
          href="/academia/esportes"
          className="group relative flex items-center justify-between p-6 rounded-[32px] bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-orange-400/25 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg">Esportes</p>
              <p className="text-white/70 text-xs">Outras atividades físicas</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </Link>

        <Link 
          href="/academia"
          className="group relative flex items-center justify-between p-6 rounded-[32px] bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-lg">PERFIL</p>
              <p className="text-white/70 text-xs">Condições e resultados da IA</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
        </Link>
      </main>
    </div>
  )
}
