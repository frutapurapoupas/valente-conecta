import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ConviteSucessoContent() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email')
  const token = searchParams?.get('token')
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-zinc-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Convite Enviado com Sucesso!</h1>
          <p className="text-zinc-400 mb-4">
            O convite foi enviado para {email ? <span className="text-yellow-500">{email}</span> : 'o e-mail informado'}.
          </p>
          {token && (
            <div className="bg-zinc-700 rounded-lg p-3 mb-6">
              <p className="text-xs text-zinc-400 mb-1">Token de acesso:</p>
              <p className="font-mono text-yellow-500 text-sm break-all">{token}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-yellow-500 text-zinc-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConviteSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <ConviteSucessoContent />
    </Suspense>
  )
}