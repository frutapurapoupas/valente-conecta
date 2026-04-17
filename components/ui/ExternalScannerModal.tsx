'use client'

import { useState } from 'react'
import { X, Bluetooth, Wifi, Search, Loader2 } from 'lucide-react'

interface ExternalScannerModalProps {
  onClose: () => void
  onScanSuccess: (barcode: string) => void
}

export function ExternalScannerModal({ onClose, onScanSuccess }: ExternalScannerModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bluetooth' | 'wifi' | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  const handleBluetoothConnect = () => {
    setSelectedMethod('bluetooth')
    setIsScanning(true)
    
    // Simular busca por dispositivos Bluetooth
    setTimeout(() => {
      setIsScanning(false)
      setShowManualInput(true)
    }, 3000)
  }

  const handleWifiConnect = () => {
    setSelectedMethod('wifi')
    setIsScanning(true)
    
    // Simular conexão WiFi
    setTimeout(() => {
      setIsScanning(false)
      setShowManualInput(true)
    }, 3000)
  }

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold">Scanner Externo</h2>
        <div className="w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        {!selectedMethod ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white text-center mb-6">
              Escolha o tipo de conexão
            </h3>
            
            <button
              onClick={handleBluetoothConnect}
              disabled={isScanning}
              className="w-full bg-blue-500 text-white py-6 rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-2xl hover:bg-blue-400 disabled:opacity-50 disabled:scale-100"
            >
              <Bluetooth className="w-6 h-6 inline mr-2" />
              Scanner Bluetooth
            </button>

            <button
              onClick={handleWifiConnect}
              disabled={isScanning}
              className="w-full bg-purple-500 text-white py-6 rounded-2xl font-bold text-xl active:scale-95 transition-all shadow-2xl hover:bg-purple-400 disabled:opacity-50 disabled:scale-100"
            >
              <Wifi className="w-6 h-6 inline mr-2" />
              Scanner WiFi
            </button>

            <div className="text-center mt-6">
              <p className="text-zinc-400 text-sm">
                Conecte seu scanner externo para leitura automática
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {isScanning ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {selectedMethod === 'bluetooth' ? (
                    <Bluetooth className="w-8 h-8 text-blue-500 animate-pulse" />
                  ) : (
                    <Wifi className="w-8 h-8 text-purple-500 animate-pulse" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Buscando scanner...
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  {selectedMethod === 'bluetooth' ? 'Procurando dispositivos Bluetooth próximos' : 'Procurando scanners na rede WiFi'}
                </p>
                <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
              </div>
            ) : showManualInput ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Digite o código escaneado
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Use o scanner externo e digite o código lido
                  </p>
                </div>

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
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Scanner Conectado!
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  {selectedMethod === 'bluetooth' ? 'Scanner Bluetooth conectado com sucesso' : 'Scanner WiFi conectado com sucesso'}
                </p>
                <button
                  onClick={() => setShowManualInput(true)}
                  className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-medium"
                >
                  Começar a Escanear
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
