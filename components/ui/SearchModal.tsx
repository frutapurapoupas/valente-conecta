'use client'

import { useState } from 'react'
import { X, Search, CreditCard, AlertCircle } from 'lucide-react'
import PaymentModal from './PaymentModal'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  freeSearchesLeft: number
  setFreeSearchesLeft: (value: number) => void
}

export default function SearchModal({ isOpen, onClose, freeSearchesLeft, setFreeSearchesLeft }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentWarning, setShowPaymentWarning] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    if (freeSearchesLeft > 0) {
      // Consulta grátis
      performSearch()
      setFreeSearchesLeft(freeSearchesLeft - 1)
      localStorage.setItem('freeSearchesLeft', String(freeSearchesLeft - 1))
    } else {
      // Mostra aviso de pagamento
      setShowPaymentWarning(true)
      setTimeout(() => setShowPaymentWarning(false), 5000)
    }
  }

  const performSearch = async () => {
    // Simulação de busca
    const mockResults = [
      { name: 'Produto 1', price: 'R$ 25,00', location: '500m', store: 'Loja A' },
      { name: 'Produto 2', price: 'R$ 32,00', location: '1.2km', store: 'Loja B' },
      { name: 'Produto 3', price: 'R$ 18,00', location: '800m', store: 'Loja C' },
    ]
    setSearchResults(mockResults)
  }

  const handlePaidSearch = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    performSearch()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Busca Inteligente</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Aviso de Consultas Grátis */}
        {freeSearchesLeft > 0 && (
          <div className="m-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              🎁 Você tem {freeSearchesLeft} consulta(s) grátis disponível(is)!
            </p>
          </div>
        )}

        {/* Aviso de Pagamento */}
        {showPaymentWarning && (
          <div className="m-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Suas consultas grátis acabaram. Cada consulta custa R$ 0,50.
              </p>
              <button 
                onClick={handlePaidSearch}
                className="mt-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
              >
                Carregar créditos
              </button>
            </div>
          </div>
        )}

        {/* Busca */}
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite o que você procura..."
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {searchResults.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-3">Resultados encontrados:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.store} • {result.location}</p>
                    </div>
                    <p className="font-bold text-green-600">{result.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informação de Preço */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-center text-gray-500">
            💡 Cada consulta adicional custa R$ 0,50. Pague via Pix ou cartão.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}