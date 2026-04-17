'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, Keyboard, AlertTriangle, Wifi, QrCode } from 'lucide-react'
import { ExternalScannerModal } from './ExternalScannerModal'
import { RemoteScannerModal } from './RemoteScannerModal'

interface DirectCameraScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

export function DirectCameraScanner({ onScanSuccess, onClose, placeholder = "Posicione o código de barras" }: DirectCameraScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual' | 'external' | 'remote'>('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [showExternalScanner, setShowExternalScanner] = useState(false)
  const [showRemoteScanner, setShowRemoteScanner] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // getUserMedia() IMEDIATO - SEM DELAYS ARTIFICIAIS
  const startCamera = useCallback(async () => {
    console.log('Iniciando câmera imediatamente...')
    
    try {
      setError(null)
      setIsScanning(true)
      
      // DETECTAR DISPOSITIVO DINAMICAMENTE
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
      const facingMode = isMobile ? 'environment' : 'user'
      
      console.log('Dispositivo detectado:', isMobile ? 'mobile' : 'desktop')
      console.log('Facing mode:', facingMode)
      
      // CHAMAR getUserMedia() IMEDIATAMENTE - SEM setTimeout
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('Stream obtido com sucesso:', stream)
      
      streamRef.current = stream
      
      if (videoRef.current) {
        console.log('Anexando stream ao elemento video...')
        videoRef.current.srcObject = stream
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        console.log('Reproduzindo video...')
        await videoRef.current.play()
        
        console.log('Câmera iniciada com sucesso!')
        startScanning()
      }
    } catch (err: any) {
      console.error('ERRO REAL DA CÂMERA:', err.name, err.message)
      
      // TRATAR ERROS REAIS - LOG DETALHADO
      let errorMessage = 'Erro ao acessar câmera.'
      
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          console.error('Usuário negou permissão da câmera')
          errorMessage = 'Permissão de câmera negada pelo usuário.'
          break
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          console.error('Nenhuma câmera encontrada')
          errorMessage = 'Nenhuma câmera encontrada no dispositivo.'
          break
        case 'NotReadableError':
        case 'TrackStartError':
          console.error('Câmera em uso por outro aplicativo')
          errorMessage = 'Câmera está sendo usada por outro aplicativo.'
          break
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          console.error('Constraints não compatíveis')
          errorMessage = 'Câmera não compatível com as configurações solicitadas.'
          break
        case 'SecurityError':
          console.error('Problema de segurança/HTTPS')
          errorMessage = 'Problema de segurança. Use conexão HTTPS.'
          break
        case 'TypeError':
          console.error('getUserMedia não disponível')
          errorMessage = 'Navegador não suporta acesso à câmera.'
          break
        default:
          console.error('Erro desconhecido:', err)
          errorMessage = `Erro: ${err.message || 'Erro desconhecido ao acessar câmera.'}`
      }
      
      setError(errorMessage)
      setIsScanning(false)
      
      // Fallback automático após erro real
      setTimeout(() => {
        setMode('manual')
      }, 2000)
    }
  }, [])

  // Simulação de scan
  const startScanning = () => {
    console.log('Iniciando simulação de scan...')
    scanIntervalRef.current = setInterval(() => {
      const mockCodes = ['7891234567890', '7899876543210', '1234567890128']
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)]
      
      if (Math.random() > 0.95) {
        console.log('Código simulado encontrado:', randomCode)
        onScanSuccess(randomCode)
        stopCamera()
        onClose()
      }
    }, 1000)
  }

  // Parar câmera
  const stopCamera = useCallback(() => {
    console.log('Parando câmera...')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }, [])

  // Input manual
  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim())
      onClose()
    }
  }

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Tela manual
  if (mode === 'manual') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white font-semibold">Digitar Código</h2>
          <button onClick={() => setMode('camera')} className="text-zinc-400">
            <Camera className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Keyboard className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Entrada Manual</h3>
              <p className="text-zinc-400 text-sm">
                Digite o código de barras manualmente
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0000000000000"
                className="w-full px-4 py-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-white text-center text-xl font-mono placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                autoFocus
                maxLength={14}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-xl font-medium disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </div>

            {/* Opções alternativas */}
            <div className="mt-6 space-y-3">
              <p className="text-zinc-500 text-sm text-center">Outras opções:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowExternalScanner(true)}
                  className="bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm"
                >
                  <Wifi className="w-4 h-4 inline mr-1" />
                  Externo
                </button>
                <button
                  onClick={() => setShowRemoteScanner(true)}
                  className="bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm"
                >
                  <QrCode className="w-4 h-4 inline mr-1" />
                  Remoto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tela da câmera
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Scanner de Câmera</h2>
        <button onClick={() => setMode('manual')} className="text-zinc-400">
          <Keyboard className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {/* Erro real */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 max-w-sm">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 text-center mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setError(null)
                    startCamera()
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-xl font-medium"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium"
                >
                  Digitar Código
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Elemento video com atributos corretos */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          controls={false}
        />
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-64 h-48 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500" />
                
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                  <div className="w-full h-4 border-t-2 border-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-20 left-0 right-0 text-center">
              <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
                {placeholder}
              </p>
              <p className="text-emerald-400 text-xs mt-2 animate-pulse">Scanner ativo</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={startCamera}
            disabled={isScanning}
            className="bg-yellow-500 text-black p-4 rounded-full active:scale-90 transition-all disabled:opacity-50"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
        
        {/* Opções alternativas */}
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setShowExternalScanner(true)}
            className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm"
          >
            <Wifi className="w-4 h-4 inline mr-1" />
            Externo
          </button>
          <button
            onClick={() => setShowRemoteScanner(true)}
            className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm"
          >
            <QrCode className="w-4 h-4 inline mr-1" />
            Remoto
          </button>
        </div>
      </div>

      {/* Modals */}
      {showExternalScanner && (
        <ExternalScannerModal
          onClose={() => setShowExternalScanner(false)}
          onScanSuccess={(codigo) => {
            onScanSuccess(codigo)
            setShowExternalScanner(false)
          }}
        />
      )}

      {showRemoteScanner && (
        <RemoteScannerModal
          onClose={() => setShowRemoteScanner(false)}
          onScanSuccess={(codigo) => {
            onScanSuccess(codigo)
            setShowRemoteScanner(false)
          }}
        />
      )}
    </div>
  )
}
