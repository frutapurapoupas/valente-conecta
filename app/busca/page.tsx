'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, MapPin, Store, Package, Star } from 'lucide-react'

function BuscaContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Resultados da busca</h1>
            <p className="text-zinc-400 text-sm">"{query}"</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h2>
          <p className="text-zinc-500">
            Não encontramos nada para "{query}".<br />
            Tente usar outras palavras.
          </p>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">
            Voltar para home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center">Carregando...</div>}>
      <BuscaContent />
    </Suspense>
  )
}