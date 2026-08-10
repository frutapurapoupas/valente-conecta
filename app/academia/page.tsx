// Caminho: C:\valente_conecta\app\academia\page.tsx
// Substitui a versão anterior (que era o dashboard do aluno direto).
// Agora é uma tela de escolha: Sou Aluno / Sou dono de academia —
// mesmo espírito do /mototaxi, mas como escolha ANTES de entrar em
// qualquer um dos dois fluxos, em vez de um botão dentro da tela.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Dumbbell, Building2, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function AcademiaEscolhaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/")} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>ACADEMIA</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-16 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Como você quer entrar?</h1>
          <p className="text-zinc-400 text-sm">Escolha o perfil de acesso</p>
        </div>

        <Link href="/academia/aluno" className="group relative block">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-xl">Sou Aluno</h3>
                <p className="text-white/70 text-sm mt-0.5">Treinos, perfil, esportes e evolução de cargas</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>
          </div>
        </Link>

        <Link href="/academia/empresa" className="group relative block">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-xl">Sou dono de academia</h3>
                <p className="text-white/70 text-sm mt-0.5">Gestão de alunos, planos e cobrança</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition" />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
