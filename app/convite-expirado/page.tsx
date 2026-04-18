'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Clock, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

function ConviteExpiradoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const status = searchParams?.get('status') || 'expired'

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

  const getStatusMessage = () => {
    switch (status) {
      case 'accepted':
        return {
          title: 'Convite Aceito',
          message: 'Este convite já foi aceito por outra pessoa.',
          color: 'emerald'
        }
      case 'rejected':
        return {
          title: 'Convite Recusado',
          message: 'Este convite foi recusado anteriormente.',
          color: 'red'
        }
      default:
        return {
          title: 'Convite Expirado',
          message: 'Este convite expirou ou não é mais válido.',
          color: 'yellow'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className={`bg-gradient-to-br from-${statusInfo.color}-500 to-${statusInfo.color}-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8`}>
          {status === 'accepted' ? (
            <AlertCircle className="w-12 h-12 text-white" />
          ) : (
            <Clock className="w-12 h-12 text-white" />
          )}
        </div>

        <h1 className="text-4xl font-black italic mb-4">{statusInfo.title}</h1>
        
        <p className="text-xl text-zinc-300 mb-8">
          {statusInfo.message}
        </p>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-8">
          <h2 className="text-lg font-bold mb-4 text-zinc-300">Quer participar mesmo assim?</h2>
          
          <p className="text-zinc-400 mb-4">
            Faça seu cadastro direto no Valente Conecta e comece a vender mais hoje mesmo!
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">Cadastro rápido e gratuito</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">Receba pedidos pelo WhatsApp</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">Aumente suas vendas localmente</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/cadastro"
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 transition-all active:scale-95"
          >
            Fazer Cadastro Direto
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

export default function ConviteExpiradoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Carregando...</div>}>
      <ConviteExpiradoContent />
    </Suspense>
  )
}
