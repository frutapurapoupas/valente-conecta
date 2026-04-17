'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, ScanLine, Keyboard, AlertTriangle } from 'lucide-react'
import { CountdownTimer } from '@/components/ui/CountdownTimer'

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

// Detecção de capacidades do dispositivo
interface DeviceCapabilities {
  hasCamera: boolean
  hasMediaDevices: boolean
  isSecureContext: boolean
  browserSupport: 'full' | 'partial' | 'none'
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export function BarcodeScannerEnterprise({ onScanSuccess, onClose, placeholder = "Posicione o código de barras" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanStartTime, setScanStartTime] = useState<number | null>(null)
  const [minimumScanTime] = useState(3000) // 3 segundos obrigatórios
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar capacidades do dispositivo
  const detectCapabilities = useCallback((): DeviceCapabilities => {
    // Verificação mais robusta de mediaDevices
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasCamera = hasMediaDevices // Simplificar - se tem mediaDevices, tentar usar
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' || 
                           location.hostname === 'localhost' ||
                           location.hostname === '127.0.0.1' ||
                           location.hostname.startsWith('192.168.') ||
                           location.hostname.startsWith('10.') ||
                           location.hostname.startsWith('172.')
    
    // Detectar tipo de dispositivo
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
    const deviceType = isMobile ? 
      (userAgent.includes('tablet') || userAgent.includes('ipad') ? 'tablet' : 'mobile') : 
      'desktop'
    
    // Detectar suporte do navegador - ser mais permissivo
    let browserSupport: 'full' | 'partial' | 'none' = 'full'
    
    if (!hasMediaDevices) {
      browserSupport = 'none'
    } else if (!isSecureContext) {
      browserSupport = 'partial'
    }
    // Remover verificação específica do Safari para não bloquear desnecessariamente
    
    return {
      hasCamera,
      hasMediaDevices,
      isSecureContext,
      browserSupport,
      deviceType
    }
  }, [])

  // Inicializar detecção de capacidades
  useEffect(() => {
    const caps = detectCapabilities()
    setCapabilities(caps)
    
    // Só mostrar fallback se não tiver suporte básico de mediaDevices
    // Não fazer fallback prematuramente para hasCamera false
    if (caps.browserSupport === 'none') {
      setShowManualInput(true)
    }
  }, [detectCapabilities])

  // Iniciar câmera
  const startCamera = async () => {
    // Tentar iniciar câmera mesmo se detecção for incerta
    // Só fazer fallback se não tiver mediaDevices ou contexto inseguro
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setShowManualInput(true)
      return
    }
    
    const isSecureContext = window.isSecureContext || 
                           location.protocol === 'https:' || 
                           location.hostname === 'localhost' ||
                           location.hostname === '127.0.0.1' ||
                           location.hostname.startsWith('192.168.') ||
                           location.hostname.startsWith('10.') ||
                           location.hostname.startsWith('172.')
    
    if (!isSecureContext) {
      setShowManualInput(true)
      return
    }

    try {
      setError(null)
      setIsProcessing(true)
      setScanStartTime(Date.now())
      
      // Adicionar delay para garantir que a interface esteja pronta
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Detectar tipo de dispositivo para escolher câmera
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
      
      // Timeout mais longo para inicialização da câmera
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao acessar câmera')), 10000)
        )
      ]) as MediaStream
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Esperar o vídeo estar pronto
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        
        await videoRef.current.play()
        
        // Iniciar scanner imediatamente mas manter processing por 3 segundos
        setIsScanning(true)
        startScanning()
        
        // Usar requestAnimationFrame para performance otimizada
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
      // Mesmo com erro, esperar 3 segundos antes de mostrar fallback
      const errorStartTime = Date.now()
      const checkErrorTime = () => {
        if (Date.now() - errorStartTime >= minimumScanTime) {
          handleCameraError(err)
          setIsProcessing(false)
        } else {
          requestAnimationFrame(checkErrorTime)
        }
      }
      requestAnimationFrame(checkErrorTime)
    }
  }

  // Tratamento inteligente de erros
  const handleCameraError = (err: any) => {
    let errorMessage = 'Erro ao acessar câmera.'
    let showFallback = false
    
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        errorMessage = 'Permissão negada. Use a entrada manual ou permita o acesso.'
        showFallback = true
        break
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        errorMessage = 'Nenhuma câmera encontrada. Use a entrada manual.'
        showFallback = true
        break
      case 'NotReadableError':
      case 'TrackStartError':
        errorMessage = 'Câmera em uso. Tente novamente ou use entrada manual.'
        showFallback = true
        break
      case 'OverconstrainedError':
        errorMessage = 'Câmera não compatível. Use entrada manual.'
        showFallback = true
        break
      case 'TypeError':
        errorMessage = 'Navegador incompatível. Use entrada manual.'
        showFallback = true
        break
      default:
        errorMessage = err.message || 'Erro desconhecido. Tente entrada manual.'
        showFallback = true
    }
    
    setError(errorMessage)
    if (showFallback) {
      setTimeout(() => setShowManualInput(true), 2000)
    }
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

  // Simulação de scan (substituir com biblioteca real)
  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      // Simulação - implementar ZXing ou similar aqui
      const mockCodes = ['7891234567890', '7899876543210', '1234567890128']
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)]
      
      if (Math.random() > 0.95) { // 5% chance de detectar
        onScanSuccess(randomCode)
        stopCamera()
        onClose()
      }
    }, 1000)
  }

  // Input manual
  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim())
      onClose()
    }
  }

  // Tela de entrada manual
  if (showManualInput) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white font-semibold">Digitar Código</h2>
          <div className="w-6 h-6" />
        </div>

        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
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

            {capabilities?.browserSupport === 'partial' && (
              <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500 rounded-xl">
                <p className="text-yellow-400 text-xs text-center">
                  Dica: Use um navegador moderno para scanner automático
                </p>
              </div>
            )}
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
        <h2 className="text-white font-semibold">Scanner</h2>
        <button
          onClick={() => setShowManualInput(true)}
          className="text-zinc-400 hover:text-white"
          title="Digitar código"
        >
          <Keyboard className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 max-w-sm">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 text-center mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowManualInput(true)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium"
                >
                  Digitar Código
                </button>
                <button 
                  onClick={startCamera}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Tentar Novamente
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
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-48 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500" />
              
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                <ScanLine className="w-full h-4 text-yellow-500 animate-pulse" />
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
      </div>
    </div>
  )
}
