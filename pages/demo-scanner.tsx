'use client'

import { useState } from 'react'
import { BarcodeScannerReal } from '@/components/ui/BarcodeScannerReal'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { Scan, Package, X } from 'lucide-react'

export default function DemoScannerPage() {
  const [showScanner, setShowScanner] = useState(false)
  const [scannedProducts, setScannedProducts] = useState<Array<{ barcode: string; timestamp: Date }>>([])
  
  const {
    isScanning,
    lastScannedBarcode,
    error,
    handleScanSuccess,
    handleScanError,
    clearError,
    clearLastScanned
  } = useBarcodeScanner({
    onSuccess: (barcode) => {
      setScannedProducts(prev => [
        { barcode, timestamp: new Date() },
        ...prev.slice(0, 9) // Mantém apenas os 10 últimos
      ])
    },
    onError: (error) => {
      console.error('Scanner error:', error)
    }
  })

  const handleScan = (barcode: string) => {
    handleScanSuccess(barcode)
    setShowScanner(false)
  }

  const handleCloseScanner = () => {
    setShowScanner(false)
    clearError()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <h1 className="text-xl font-black text-yellow-500">Demo Scanner</h1>
        <p className="text-zinc-400 text-sm mt-1">Teste de leitura de código de barras</p>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        {/* Botão de scan */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <button
            onClick={() => setShowScanner(true)}
            disabled={isScanning}
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black text-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Scan className="w-6 h-6" />
            {isScanning ? 'Escaneando...' : 'Iniciar Scanner'}
          </button>
        </div>

        {/* Último código escaneado */}
        {lastScannedBarcode && (
          <div className="bg-emerald-500/20 border border-emerald-500 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm font-medium">Último código escaneado:</p>
                <p className="text-emerald-300 text-2xl font-black mt-1">{lastScannedBarcode}</p>
              </div>
              <button
                onClick={clearLastScanned}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Histórico de produtos escaneados */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-500" />
            Histórico de Scans
          </h2>
          
          {scannedProducts.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Nenhum produto escaneado ainda</p>
          ) : (
            <div className="space-y-3">
              {scannedProducts.map((product, index) => (
                <div
                  key={`${product.barcode}-${index}`}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-yellow-400">{product.barcode}</p>
                      <p className="text-zinc-500 text-xs mt-1">
                        {product.timestamp.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-zinc-400">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal do Scanner */}
      {showScanner && (
        <BarcodeScannerReal
          onScanSuccess={handleScan}
          onClose={handleCloseScanner}
          placeholder="Posicione o código de barras na área indicada"
        />
      )}
    </div>
  )
}
