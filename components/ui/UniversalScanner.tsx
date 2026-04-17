'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, Search, AlertTriangle, Wifi, QrCode, Keyboard, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'
import { ExternalScannerModal } from './ExternalScannerModal'
import { RemoteScannerModal } from './RemoteScannerModal'

interface UniversalScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

export function UniversalScanner({ onScanSuccess, onClose, placeholder = "Posicione o código de barras" }: UniversalScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual' | 'external' | 'remote'>('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [scanStartTime, setScanStartTime] = useState<number | null>(null)
  const [minimumScanTime] = useState(3000)
  const [showExternalScanner, setShowExternalScanner] = useState(false)
  const [showRemoteScanner, setShowRemoteScanner] = useState(false)
  const [cameraAttempted, setCameraAttempted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Iniciar câmera - SEMPRE tentar primeiro, sem verificações pessimistas
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsProcessing(true)
      setScanStartTime(Date.now())
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
      const facingMode = isMobile ? 'environment' : 'user'
      
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      }
      
      // TENTAR CÂMERA DIRETAMENTE - SEM VERIFICAÇÕES ANTECIPADAS
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao acessar câmera')), 10000)
        )
      ]) as MediaStream
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        
        setIsScanning(true)
        startScanning()
        
        const checkMinimumTime = () => {
          if (scanStartTime && Date.now() - scanStartTime >= minimumScanTime) {
            setIsProcessing(false)
            setScanStartTime(null)
          } else {
            requestAnimationFrame(checkMinimumTime)
          }
        }
        
        requestAnimationFrame(checkMinimumTime)
      }
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err)
      
      // TRATAR ERROS ESPECÍFICOS - só fazer fallback após FALHA REAL
      let errorMessage = 'Erro ao acessar câmera.'
      let shouldFallback = true
      
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage = 'Permissão de câmera negada. Use digitação manual.'
          shouldFallback = true
          break
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMessage = 'Nenhuma câmera encontrada. Use digitação manual.'
          shouldFallback = true
          break
        case 'NotReadableError':
        case 'TrackStartError':
          errorMessage = 'Câmera em uso. Tente novamente ou use digitação manual.'
          shouldFallback = true
          break
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          errorMessage = 'Câmera não compatível. Use digitação manual.'
          shouldFallback = true
          break
        case 'SecurityError':
          errorMessage = 'Problema de segurança. Use HTTPS ou digitação manual.'
          shouldFallback = true
          break
        case 'TypeError':
          // NUNCA mostrar "navegador não compatível" - sempre tentar primeiro
          errorMessage = 'Não foi possível acessar a câmera. Use digitação manual.'
          shouldFallback = true
          break
        default:
          errorMessage = err.message || 'Erro desconhecido. Use digitação manual.'
          shouldFallback = true
      }
      
      setError(errorMessage)
      
      if (shouldFallback) {
        // Fallback só após erro real
        setTimeout(() => {
          setMode('manual')
          setIsProcessing(false)
        }, 2000)
      } else {
        setIsProcessing(false)
      }
    }
  }, [minimumScanTime, scanStartTime])

  // Simulação de scan
  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      const mockCodes = ['7891234567890', '7899876543210', '1234567890128']
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)]
      
      if (Math.random() > 0.95) {
        onScanSuccess(randomCode)
        stopCamera()
        onClose()
      }
    }, 1000)
  }

  // Parar câmera
  const stopCamera = useCallback(() => {
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

  // Iniciar câmera automaticamente - SEMPRE tentar primeiro ao montar
  useEffect(() => {
    // Tentar câmera IMEDIATAMENTE ao montar, sem depender de modo
    if (!cameraAttempted) {
      setCameraAttempted(true)
      startCamera()
    }
  }, [startCamera, cameraAttempted])

  // Tela de entrada manual
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

  // Tela principal do scanner
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Scanner Universal</h2>
        <button onClick={() => setMode('manual')} className="text-zinc-400">
          <Keyboard className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-2xl p-6 max-w-sm">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-yellow-400 text-center mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('manual')}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-xl font-medium"
                >
                  Digitar Código
                </button>
                <button 
                  onClick={startCamera}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-xl font-medium"
                >
                  Tentar Câmera
                </button>
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
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
              
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CountdownTimer 
                    startTime={scanStartTime} 
                    duration={minimumScanTime}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-20 left-0 right-0 text-center">
            <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
              {isProcessing ? 'Preparando câmera...' : placeholder}
            </p>
            {isProcessing && (
              <div className="mt-3 space-y-1">
                <p className="text-yellow-400 text-xs animate-pulse">Aguarde 2-3 segundos...</p>
                <p className="text-zinc-500 text-xs">Iniciando scanner automático</p>
              </div>
            )}
            {isScanning && !isProcessing && (
              <p className="text-emerald-400 text-xs mt-2 animate-pulse">Scanner ativo - Posicione o código</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              stopCamera()
              startCamera()
            }}
            disabled={isProcessing}
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
