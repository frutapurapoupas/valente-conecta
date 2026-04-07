'use client'

import Link from 'next/link'
import { ArrowLeft, Megaphone, Plus, Image } from 'lucide-react'

export default function AnunciosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Anúncios</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl flex items-center justify-center gap-2 mb-6">
          <Plus className="w-5 h-5" />
          Publicar Anúncio
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Megaphone className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Nenhum anúncio publicado</p>
          <p className="text-sm text-gray-400">Clique em "Publicar Anúncio" para começar</p>
        </div>
      </main>
    </div>
  )
}