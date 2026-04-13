import Link from 'next/link'
import { ArrowLeft, Eye, Upload } from 'lucide-react'

export default function OfertaEscolhaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/oferta" className="p-2 hover:bg-zinc-800 rounded-lg text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg text-white">Ofertas</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md mt-8">
          <Link href="/oferta/ver" className="block bg-zinc-900 border border-zinc-800 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all">
            <Eye className="w-10 h-10 text-blue-400" />
            <span className="font-black text-lg text-white">Ver ofertas</span>
            <span className="text-zinc-400 text-center text-sm">Visualize as ofertas disponíveis no momento</span>
          </Link>
          <Link href="/oferta/publicar" className="block bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all">
            <Upload className="w-10 h-10 text-emerald-400" />
            <span className="font-black text-lg text-white">Publicar oferta</span>
            <span className="text-zinc-400 text-center text-sm">Cadastre uma nova oferta para sua loja</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
