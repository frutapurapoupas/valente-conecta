'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, ShoppingBag, Gift, Users } from 'lucide-react'

function ConviteSucessoContent() {
  const searchParams = useSearchParams()
  const convite = searchParams?.get('convite')
  const nome = searchParams?.get('nome')

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para home
        </Link>

        <div className="max-w-2xl mx-auto text-center">
          {/* Ícone de sucesso */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Convite enviado com sucesso! 🎉
          </h1>

          {/* Mensagem personalizada */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <p className="text-emerald-300 text-lg mb-2">
              {nome ? `Você convidou ${nome}` : 'Convite enviado!'}
            </p>
            <p className="text-zinc-300">
              Código do convite: <span className="font-mono text-emerald-400 font-bold">{convite || 'N/A'}</span>
            </p>
          </div>

          {/* Próximos passos */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <ShoppingBag className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Faça compras</h3>
              <p className="text-zinc-400 text-sm">Ganhe cashback em todas as suas compras</p>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4">
              <Gift className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Ganhe bônus</h3>
              <p className="text-zinc-400 text-sm">Até R$50 de bônus por amigo que se cadastrar</p>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4">
              <Users className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Convide mais</h3>
              <p className="text-zinc-400 text-sm">Quanto mais convidar, mais você ganha</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              Começar a usar
            </Link>
            <Link
              href="/indique"
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors"
            >
              Convidar mais amigos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConviteSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    }>
      <ConviteSucessoContent />
    </Suspense>
  )
}