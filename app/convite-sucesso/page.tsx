'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Store, ArrowRight, Gift, Star } from 'lucide-react'
import Link from 'next/link'

export default function ConviteSucessoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(10)
  const storeId = searchParams?.get('store')

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-black italic mb-4">Boas-vindas!</h1>
        
        <p className="text-xl text-zinc-300 mb-8">
          Sua loja foi cadastrada com sucesso no Valente Conecta
        </p>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-8 h-8 text-yellow-500" />
            <h2 className="text-lg font-bold">Próximos passos</h2>
          </div>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-white">Faça o login no app</p>
                <p className="text-sm text-zinc-400">Use seu WhatsApp para acessar</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-white">Cadastre seus produtos</p>
                <p className="text-sm text-zinc-400">Adicione o catálogo da sua loja</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-white">Receba pedidos</p>
                <p className="text-sm text-zinc-400">Venda mais pelo WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-yellow-500">Bônus de Boas-vindas</span>
          </div>
          <p className="text-sm text-zinc-300">
            Ganhe 100 pontos extras nas suas primeiras 3 vendas!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Acessar Minha Loja
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              Redirecionando em {countdown} segundos...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
