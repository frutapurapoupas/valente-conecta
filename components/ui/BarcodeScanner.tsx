'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, ScanLine } from 'lucide-react'

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
  placeholder?: string
}

export function BarcodeScanner({ onScanSuccess, onClose, placeholder = "Posicione o código de barras na área de scan" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  // Verificar permissão da câmera
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setHasPermission(result.state === 'granted')
      return result.state === 'granted'
    } catch (err) {
      // Fallback para navegadores que não suportam permissions API
      return true
    }
  }

  // Iniciar câmera
  const startCamera = async () => {
    try {
      setError(null)
      
      const hasCamPermission = await checkCameraPermission()
      if (!hasCamPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        setHasPermission(true)
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsScanning(true)
          startScanning()
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsScanning(true)
          startScanning()
        }
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
      console.error('Camera error:', err)
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
    setIsScanning(false)
  }, [])

  // Função de scan usando canvas (implementação básica)
  const startScanning = () => {
    if (!videoRef.current || !isScanning) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    const scanFrame = () => {
      if (!videoRef.current || !isScanning) return

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Aqui você implementaria a detecção de código de barras
      // Por enquanto, vamos simular uma detecção
      // Na implementação real, você usaria uma biblioteca como ZXing-js
      
      animationRef.current = requestAnimationFrame(scanFrame)
    }

    scanFrame()
  }

  // Simular leitura de código (substituir com biblioteca real)
  const simulateBarcodeRead = () => {
    // Simulação - remova este código quando integrar com biblioteca real
    const mockBarcodes = ['7891234567890', '7899876543210', '1234567890128']
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
    
    setTimeout(() => {
      if (isScanning) {
        onScanSuccess(randomBarcode)
        stopCamera()
        onClose()
      }
    }, 3000)
  }

  useEffect(() => {
    startCamera()
    
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isScanning) {
      simulateBarcodeRead()
    }
  }, [isScanning])

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
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-medium"
              >
                Tentar Novamente
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
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Área de scan central */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 relative">
                  {/* Cantos do scanner */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500" />
                  
                  {/* Linha de scan animada */}
                  <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Texto de instrução */}
              <div className="absolute bottom-20 left-0 right-0 text-center">
                <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
                  {placeholder}
                </p>
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
            className="bg-yellow-500 text-black p-4 rounded-full active:scale-90 transition-all"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
