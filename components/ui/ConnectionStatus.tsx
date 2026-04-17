'use client'

import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  isWaiting: boolean
  error: string | null
  sessionId: string | null
}

export function ConnectionStatus({ isConnected, isWaiting, error, sessionId }: ConnectionStatusProps) {
  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Erro de conexão</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="bg-emerald-500/20 border border-emerald-500 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 font-medium">Conectado</p>
            <p className="text-emerald-300 text-sm">Celular conectado com sucesso</p>
          </div>
        </div>
      </div>
    )
  }

  if (isWaiting) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-pulse" />
          <div>
            <p className="text-yellow-400 font-medium">Aguardando celular...</p>
            <p className="text-yellow-300 text-sm">
              Escaneie o QR Code com seu celular
            </p>
            {sessionId && (
              <p className="text-yellow-200 text-xs mt-1">
                Sessão: {sessionId.slice(-8)}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Wifi className="w-5 h-5 text-zinc-400 flex-shrink-0" />
        <div>
          <p className="text-zinc-300 font-medium">Desconectado</p>
          <p className="text-zinc-400 text-sm">Clique para iniciar sessão</p>
        </div>
      </div>
    </div>
  )
}
