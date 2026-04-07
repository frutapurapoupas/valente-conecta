'use client'

import { useState } from 'react'
import { X, CreditCard, QrCode, Zap } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const SEARCH_COST = 0.50
const MULTIPLE_OPTIONS = [10, 20, 50, 100] // Quantidade de consultas

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card'>('pix')
  const [selectedQuantity, setSelectedQuantity] = useState(10)
  const [loading, setLoading] = useState(false)

  const totalAmount = selectedQuantity * SEARCH_COST

  const handlePayment = async () => {
    setLoading(true)
    // Simulação de pagamento
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Carregar Créditos</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Quantidade de Consultas */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantidade de consultas:</label>
            <div className="grid grid-cols-4 gap-2">
              {MULTIPLE_OPTIONS.map((qty) => (
                <button
                  key={qty}
                  onClick={() => setSelectedQuantity(qty)}
                  className={`
                    py-2 rounded-lg border transition
                    ${selectedQuantity === qty 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-gray-300 hover:border-blue-500'
                    }
                  `}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Valor Total */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Valor total</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalAmount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">({selectedQuantity} consultas x R$ 0,50)</p>
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium mb-2">Método de pagamento:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMethod('pix')}
                className={`
                  py-3 rounded-lg border flex flex-col items-center gap-1 transition
                  ${selectedMethod === 'pix' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300'
                  }
                `}
              >
                <QrCode className="w-6 h-6" />
                <span className="text-sm">PIX</span>
              </button>
              <button
                onClick={() => setSelectedMethod('card')}
                className={`
                  py-3 rounded-lg border flex flex-col items-center gap-1 transition
                  ${selectedMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300'
                  }
                `}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-sm">Cartão</span>
              </button>
            </div>
          </div>

          {/* Botão de Pagamento */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Pagar R$ {totalAmount.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            Pagamento seguro via provedor integrado
          </p>
        </div>
      </div>
    </div>
  )
}