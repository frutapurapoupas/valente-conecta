'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

export default function ConviteRejeitadoPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(8)

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
        <div className="bg-gradient-to-br from-red-500 to-red-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-black italic mb-4">Convite Recusado</h1>
        
        <p className="text-xl text-zinc-300 mb-8">
          Entendemos sua decisão. O Valente Conecta estará aqui se você mudar de ideia!
        </p>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-8">
          <h2 className="text-lg font-bold mb-4 text-zinc-300">Perdeu alguma oportunidade?</h2>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white">Aumente suas vendas</p>
                <p className="text-sm text-zinc-400">Receba pedidos diretamente no WhatsApp</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white">Clientes novos</p>
                <p className="text-sm text-zinc-400">Seja encontrado por mais pessoas na região</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white">Grátis para usar</p>
                <p className="text-sm text-zinc-400">Sem custos mensais ou taxas escondidas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/cadastro"
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-all active:scale-95"
          >
            Quero Me Cadastrar Mesmo Assim
          </Link>
          
          <Link
            href="/"
            className="w-full bg-zinc-800 text-zinc-300 py-4 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Voltar para a Home
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
