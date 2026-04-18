'use client'

export const dynamic = 'force-dynamic'

export default function ConviteExpiradoPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-zinc-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-500">Convite Expirado</h1>
          <p className="text-zinc-400 mb-6">
            Este convite não é mais válido ou já foi utilizado.
          </p>
          <p className="text-zinc-500 text-sm mb-6">
            Solicite um novo convite ao administrador da loja.
          </p>
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