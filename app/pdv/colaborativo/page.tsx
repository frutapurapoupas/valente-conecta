'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { usePDVColaborativo } from '@/hooks/usePDVColaborativo'

export default function PDVColaborativoPage() {
  const { menus } = usePDVColaborativo()

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">PDV Colaborativo</h1>
            <p className="text-xs text-zinc-500">GestÃ£o completa da sua loja fÃ­sica</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          <div>
            <p className="font-bold text-sm text-white">Bem-vindo ao seu painel de loja</p>
            <p className="text-xs text-zinc-500 mt-0.5">Vendas, estoque, perfil e plano num sÃ³ lugar.</p>
          </div>
        </div>

        <div className="space-y-2">
          {menus.map((item) => (
            <Link key={item.id} href={item.href}>
              <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all">
                <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-base">{item.label}</p>
                  <p className="text-sm text-zinc-500">{item.descricao}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs text-amber-300">
            ðŸ’¡ <strong>Dica:</strong> para vender na rua ou em feiras, use o <strong>PDV MÃ³vel</strong> na tela inicial â€” entrada direta no leitor de produtos.
          </p>
        </div>
      </main>
    </div>
  )
}
