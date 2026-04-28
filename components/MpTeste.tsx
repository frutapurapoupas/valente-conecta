'use client'

import { useState } from 'react'

export default function MpTeste() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTestCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Teste Mercado Pago',
          price: 1.00,
          quantity: 1
        })
      })

      const data = await response.json()

      if (data.init_point) {
        // Redireciona para o checkout do Mercado Pago
        window.location.href = data.init_point
      } else {
        setError('Erro ao obter link de pagamento')
      }
    } catch (err) {
      setError('Erro ao processar pagamento')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Teste Mercado Pago</h2>
      <p className="text-gray-600 mb-4">
        Clique no botão abaixo para testar o checkout com valor de R$ 1,00
      </p>
      <button
        onClick={handleTestCheckout}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processando...' : 'Testar Checkout'}
      </button>
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Usuário de teste:</strong> TESTUSER6931588286126056461
        </p>
      </div>
    </div>
  )
}
