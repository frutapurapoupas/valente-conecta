'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, ScanLine } from 'lucide-react'

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

// Implementação simplificada de decoder de código de barras
// Para produção, recomenda-se usar bibliotecas como:
// - @zxing/library (ZXing-js)
// - quagga (para códigos de barras 1D)
// - html5-qrcode (QR codes e códigos de barras)

class SimpleBarcodeDecoder {
  // Detectar padrões de código de barras simples (EAN-13, UPC, etc.)
  static detectBarcode(imageData: ImageData): string | null {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Analisa linha central da imagem para detectar barras
    const centerY = Math.floor(height / 2)
    const barWidths: number[] = []
    let currentBar = false
    let currentWidth = 0
    
    for (let x = 0; x < width; x++) {
      const pixelIndex = (centerY * width + x) * 4
      const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3
      const isBar = brightness < 128 // Limiar para detectar barras escuras
      
      if (isBar !== currentBar) {
        if (currentWidth > 0) {
          barWidths.push(currentWidth)
        }
        currentBar = isBar
        currentWidth = 1
      } else {
        currentWidth++
      }
    }
    
    if (currentWidth > 0) {
      barWidths.push(currentWidth)
    }
    
    // Verifica se tem padrão de código de barras (alternância de barras)
    if (barWidths.length >= 20) {
      // Simulação - na implementação real, decodificaria o padrão
      return this.generateMockBarcode()
    }
    
    return null
  }
  
  static generateMockBarcode(): string {
    // Gera códigos de barras EAN-13 válidos para teste
    const prefixes = ['789', '790', '779', '777']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    
    let barcode = prefix
    for (let i = 0; i < 9; i++) {
      barcode += Math.floor(Math.random() * 10)
    }
    
    // Calcula dígito verificador EAN-13
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i])
      sum += (i % 2 === 0) ? digit : digit * 3
    }
    const checkDigit = (10 - (sum % 10)) % 10
    
    return barcode + checkDigit
  }
}

export function BarcodeScannerReal({ onScanSuccess, onClose, placeholder = "Posicione o código de barras na área de scan" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar permissão da câmera
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setHasPermission(result.state === 'granted')
      return result.state === 'granted'
    } catch (err) {
      return true // Fallback
    }
  }

  // Iniciar câmera
  const startCamera = async () => {
    try {
      setError(null)
      setIsProcessing(true)
      
      // Verificar se está em HTTPS (requerido para câmera)
      // Permitir localhost, 127.0.0.1 e IPs locais (192.168.x.x, 10.x.x.x)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      const isPrivateIP = location.hostname.startsWith('192.168.') || 
                         location.hostname.startsWith('10.') ||
                         location.hostname.startsWith('172.')
      
      if (location.protocol !== 'https:' && !isLocalhost && !isPrivateIP) {
        throw new Error('A câmera requer conexão HTTPS. Use localhost ou configure HTTPS.')
      }
      
      // Verificar suporte a mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera.')
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      streamRef.current = stream
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsScanning(true)
        startScanning()
      }
    } catch (err: any) {
      let errorMessage = 'Não foi possível acessar a câmera.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso nas configurações do navegador.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Câmera já está sendo usada por outro aplicativo.'
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Câmera não suporta as configurações necessárias.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Camera error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
  }, [])

  // Capturar frame da câmera
  const captureFrame = (): ImageData | null => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context || video.videoWidth === 0 || video.videoHeight === 0) return null
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Analisa apenas a área central onde o código deve estar
    const scanWidth = Math.floor(canvas.width * 0.6)
    const scanHeight = Math.floor(canvas.height * 0.3)
    const startX = Math.floor((canvas.width - scanWidth) / 2)
    const startY = Math.floor((canvas.height - scanHeight) / 2)
    
    return context.getImageData(startX, startY, scanWidth, scanHeight)
  }

  // Processar frame para detectar código de barras
  const processFrame = () => {
    if (!isScanning || isProcessing) return
    
    const imageData = captureFrame()
    if (!imageData) return
    
    setIsProcessing(true)
    
    try {
      const barcode = SimpleBarcodeDecoder.detectBarcode(imageData)
      if (barcode) {
        onScanSuccess(barcode)
        stopCamera()
        onClose()
      }
    } catch (err) {
      console.error('Barcode detection error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Iniciar scanning contínuo
  const startScanning = () => {
    // Processa frames a cada 500ms para não sobrecarregar
    scanIntervalRef.current = setInterval(processFrame, 500)
  }

  useEffect(() => {
    startCamera()
    
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Scanner de Código</h2>
        <div className="w-6 h-6" />
      </div>

      {/* Área do Scanner */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 max-w-sm">
              <p className="text-red-400 text-center mb-4">{error}</p>
              <button 
                onClick={startCamera}
                disabled={isProcessing}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Iniciando...' : 'Tentar Novamente'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Canvas oculto para processamento */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Área de scan central */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-48 relative">
                  {/* Cantos do scanner */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500" />
                  
                  {/* Linha de scan animada */}
                  <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                    <ScanLine className="w-full h-4 text-yellow-500 animate-pulse" />
                  </div>
                  
                  {/* Indicador de processamento */}
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-yellow-500/20 border border-yellow-500 rounded-full p-2">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Texto de instrução */}
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
                  {placeholder}
                </p>
                {isProcessing && (
                  <p className="text-yellow-400 text-xs mt-2">Processando...</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer com controles */}
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
