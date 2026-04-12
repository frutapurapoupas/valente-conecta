'use client'

import Link from 'next/link'
import { ArrowLeft, Megaphone, Plus, Gavel, Zap } from 'lucide-react'

export default function AnunciosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">Anúncios</h1>
            <p className="text-xs text-zinc-500">Divulgue sua loja ou serviço</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Leilão Carrossel — destaque */}
        <Link
          href="/anuncios/leilao"
          className="block bg-gradient-to-br from-violet-600/30 to-indigo-600/20 border border-violet-500/30 rounded-2xl p-5 hover:border-violet-400/50 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Gavel className="w-7 h-7 text-violet-300" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lg text-white">Leilão Carrossel</p>
              <p className="text-sm text-zinc-400">Dispute um dos 3 slots do carrossel principal. Semana 14/04 – 20/04/2026.</p>
              <p className="text-xs text-violet-400 font-bold mt-1">Encerra em 22h · Lance mínimo R$ 35</p>
            </div>
            <Zap className="w-5 h-5 text-violet-400 flex-shrink-0" />
          </div>
        </Link>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Meus Anúncios</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* CTA + Empty state */}
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Publicar Anúncio
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 flex flex-col items-center text-center">
          <Megaphone className="w-12 h-12 text-zinc-700 mb-4" />
          <p className="text-zinc-500 font-bold">Nenhum anúncio publicado</p>
          <p className="text-xs text-zinc-600 mt-1">Clique em "Publicar Anúncio" para começar</p>
        </div>
      </main>
    </div>
  )
}
