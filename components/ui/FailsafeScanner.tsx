'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, Keyboard, AlertTriangle, Loader2 } from 'lucide-react'
import { CountdownTimer } from './CountdownTimer'

interface FailsafeScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

export function FailsafeScanner({ onScanSuccess, onClose, placeholder = "Posicione o código de barras" }: FailsafeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [scanStartTime, setScanStartTime] = useState<number | null>(null)
  const [minimumScanTime] = useState(3000)
  const [cameraAttempted, setCameraAttempted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // TENTAR CÂMERA SEMPRE - SEM VERIFICAÇÕES
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsProcessing(true)
      setScanStartTime(Date.now())
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // DETECTAR TIPO DE DISPOSITIVO DINAMICAMENTE
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
      const facingMode = isMobile ? 'environment' : 'user'
      
      // TENTAR COM CONSTRAINTS SIMPLES PRIMEIRO
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode } 
        })
      } catch (firstError) {
        // SE FALHAR, TENTAR COM CONSTRAINTS MAIS PERMISSIVOS
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          })
        } catch (secondError) {
          // SE FALHAR NOVAMENTE, TENTAR SEM CONSTRAINTS
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: {} 
          })
        }
      }
      
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
      console.error('Erro na câmera:', err)
      
      // MENSAGEM SEMPRE EDUCATIVA - NUNCA "navegador não compatível"
      let errorMessage = 'Não foi possível acessar a câmera.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Câmera em uso por outro aplicativo.'
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Acesso restrito. Use HTTPS.'
      }
      
      setError(errorMessage + ' Use digitação manual.')
      
      // Fallback automático após 2 segundos
      setTimeout(() => {
        setMode('manual')
        setIsProcessing(false)
      }, 2000)
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

  // TENTAR CÂMERA IMEDIATAMENTE AO MONTAR
  useEffect(() => {
    if (!cameraAttempted && mode === 'camera') {
      setCameraAttempted(true)
      startCamera()
    }
  }, [mode, startCamera, cameraAttempted])

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
        <h2 className="text-white font-semibold">Scanner</h2>
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
              <button
                onClick={() => setMode('manual')}
                className="w-full px-4 py-2 bg-yellow-500 text-black rounded-xl font-medium"
              >
                Digitar Código
              </button>
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
                <p className="text-zinc-500 text-xs">Iniciando scanner</p>
              </div>
            )}
            {isScanning && !isProcessing && (
              <p className="text-emerald-400 text-xs mt-2 animate-pulse">Scanner ativo</p>
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
      </div>
    </div>
  )
}
