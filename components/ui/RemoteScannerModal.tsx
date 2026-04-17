'use client'

import { useState } from 'react'
import { X, QrCode, Wifi, WifiOff, CheckCircle } from 'lucide-react'
import { QRCodeGenerator } from './QRCodeGenerator'
import { ConnectionStatus } from './ConnectionStatus'
import { useRemoteScanner } from '@/hooks/useRemoteScanner'

interface RemoteScannerModalProps {
  onClose: () => void
  onScanSuccess: (barcode: string) => void
}

export function RemoteScannerModal({ onClose, onScanSuccess }: RemoteScannerModalProps) {
  const {
    sessionId,
    isConnected,
    isWaiting,
    scannedCode,
    error,
    startRemoteSession,
    stopRemoteSession,
    generateScannerUrl
  } = useRemoteScanner()

  const [hasStarted, setHasStarted] = useState(false)

  const handleStartSession = () => {
    const newSessionId = startRemoteSession()
    setHasStarted(true)
  }

  const handleStopSession = () => {
    stopRemoteSession()
    setHasStarted(false)
  }

  // Processar código escaneado
  if (scannedCode) {
    onScanSuccess(scannedCode)
    handleStopSession()
    onClose()
  }

  const scannerUrl = sessionId ? generateScannerUrl(sessionId) : ''

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Scanner Remoto</h2>
        <div className="w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        {!hasStarted ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-12 h-12 text-blue-500" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Scanner Remoto
              </h3>
              <p className="text-zinc-400 text-lg">
                Use seu celular para escanear produtos
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                O celular e o computador devem estar na mesma rede
              </p>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full max-w-sm bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-2xl hover:bg-blue-400"
            >
              Gerar QR Code
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status da Conexão */}
            <ConnectionStatus
              isConnected={isConnected}
              isWaiting={isWaiting}
              error={error}
              sessionId={sessionId}
            />

            {/* QR Code */}
            {sessionId && (
              <QRCodeGenerator value={scannerUrl} size={256} />
            )}

            {/* URL Manual */}
            <div className="text-center">
              <p className="text-zinc-500 text-xs mb-2">Ou acesse manualmente:</p>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                <p className="text-zinc-300 text-xs break-all font-mono">
                  {scannerUrl}
                </p>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleStopSession}
                className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium"
              >
                Cancelar
              </button>
              
              {isConnected && (
                <button
                  onClick={() => {
                    // Enviar ping para testar conexão
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium"
                >
                  Testar Conexão
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
