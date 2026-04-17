'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useMobileScanner } from '@/hooks/useRemoteScanner'
import { BarcodeScannerEnterprise } from '@/components/ui/BarcodeScannerEnterprise'

export default function ScannerRemotePage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)

  const {
    isConnected,
    connectToSession,
    sendScannedCode,
    disconnect
  } = useMobileScanner()

  // Extrair sessionId da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const session = urlParams.get('session')
    
    if (session) {
      setSessionId(session)
      connectToSession(session)
    } else {
      // Redirecionar se não tiver sessão
      router.push('/')
    }
  }, [router, connectToSession])

  // Lidar com código escaneado
  const handleScanSuccess = (code: string) => {
    setLastScannedCode(code)
    sendScannedCode(code)
    
    // Mostrar sucesso por 2 segundos
    setTimeout(() => {
      setShowScanner(false)
    }, 2000)
  }

  const handleCloseScanner = () => {
    setShowScanner(false)
  }

  // Se não tiver sessionId, mostrar loading
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Sessão não encontrada</h2>
          <p className="text-zinc-400">Verifique o QR Code e tente novamente</p>
        </div>
      </div>
    )
  }

  // Se o scanner estiver aberto
  if (showScanner) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <button 
            onClick={handleCloseScanner}
            className="p-2 bg-zinc-900/80 backdrop-blur rounded-lg text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-zinc-900/80 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-white text-sm font-medium">
              {isConnected ? 'Conectado ao PDV' : 'Conectando...'}
            </p>
          </div>
          
          <div className="w-10 h-10" />
        </div>

        <BarcodeScannerEnterprise
          onScanSuccess={handleScanSuccess}
          onClose={handleCloseScanner}
          placeholder="Posicione o código de barras"
        />

        {lastScannedCode && (
          <div className="absolute bottom-20 left-4 right-4">
            <div className="bg-emerald-500/20 border border-emerald-500 rounded-xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-400 font-medium">Código enviado!</p>
              <p className="text-emerald-300 text-sm mt-1">{lastScannedCode}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tela principal do mobile scanner
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="p-2 text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h1 className="font-bold text-lg">Scanner Remoto</h1>
            <p className="text-zinc-400 text-xs">Sessão: {sessionId.slice(-8)}</p>
          </div>
          
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="text-center space-y-6">
          {/* Status da Conexão */}
          <div className="flex items-center justify-center gap-3">
            {isConnected ? (
              <>
                <Wifi className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-emerald-500 font-bold text-lg">Conectado</p>
                  <p className="text-emerald-400 text-sm">Pronto para escanear</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-8 h-8 text-yellow-500 animate-pulse" />
                <div>
                  <p className="text-yellow-500 font-bold text-lg">Conectando...</p>
                  <p className="text-yellow-400 text-sm">Aguarde um momento</p>
                </div>
              </>
            )}
          </div>

          {/* Botão Principal */}
          <button
            onClick={() => setShowScanner(true)}
            disabled={!isConnected}
            className="w-full max-w-sm bg-yellow-500 text-black py-6 rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-2xl hover:bg-yellow-400 disabled:opacity-50 disabled:scale-100 disabled:bg-zinc-700"
          >
            <Camera className="w-6 h-6 inline mr-2" />
            {isConnected ? 'Escanear Produto' : 'Aguardando Conexão...'}
          </button>

          {/* Instruções */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left">
            <h3 className="font-semibold text-white mb-3">Como usar:</h3>
            <ol className="space-y-2 text-zinc-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">1.</span>
                <span>Aguarde a conexão com o PDV</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">2.</span>
                <span>Clique em "Escanear Produto"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">3.</span>
                <span>Aponte a câmera para o código de barras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">4.</span>
                <span>O código será enviado automaticamente para o PDV</span>
              </li>
            </ol>
          </div>

          {/* Informações da Sessão */}
          <div className="text-center">
            <p className="text-zinc-500 text-xs">
              Sessão ativa: {sessionId}
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Mantenha esta página aberta durante o uso
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
