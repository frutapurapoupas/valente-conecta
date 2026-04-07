'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Wallet, QrCode, CreditCard, TrendingUp, Bell, Menu, X, Zap, Dumbbell, ShoppingBag, Gift, Clock } from 'lucide-react'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [freeSearchesLeft, setFreeSearchesLeft] = useState(5)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [balance, setBalance] = useState(150)
  const [notifications, setNotifications] = useState<string[]>([])
  
  // Dados da carteira/bônus
  const [bonusData, setBonusData] = useState({
    saldoDisponivel: 45.00,      // Disponível para resgate
    saldoBloqueado: 105.00,       // Ainda não liberado (R$150 - R$45)
    indicacoesPendentes: 3,       // Indicações que ainda não completaram o ciclo
    indicacoesCompletadas: 2,     // Indicações que já viraram bônus
    proximoPagamento: 50.00,      // R$50/mês que será liberado
    diasProximoPagamento: 15      // Dias para o próximo pagamento
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, text: '🛒 João fez uma compra de R$ 45,00', time: 'agora' },
    { id: 2, text: '🏪 Padaria Valente entrou na plataforma', time: '5 min' },
    { id: 3, text: '💰 Você ganhou R$ 2,00 de bônus!', time: '1 hora' },
    { id: 4, text: '⏳ Indicação pendente: Carlos Silva', time: '2 horas' },
  ])

  useEffect(() => {
    const saved = localStorage.getItem('freeSearchesLeft')
    if (saved) setFreeSearchesLeft(parseInt(saved))
    const savedBalance = localStorage.getItem('userBalance')
    if (savedBalance) setBalance(parseFloat(savedBalance))
  }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      addNotification('Digite algo para buscar')
      return
    }

    if (freeSearchesLeft > 0) {
      performSearch()
      const newCount = freeSearchesLeft - 1
      setFreeSearchesLeft(newCount)
      localStorage.setItem('freeSearchesLeft', String(newCount))
      addNotification(`Busca realizada! Restam ${newCount} consultas grátis.`)
    } else {
      setShowPaymentModal(true)
    }
  }

  const performSearch = () => {
    const mockResults = [
      { id: 1, name: searchTerm, price: 'R$ 25,00', location: '500m', store: 'Loja A', distance: 0.5 },
      { id: 2, name: searchTerm, price: 'R$ 32,00', location: '1.2km', store: 'Loja B', distance: 1.2 },
      { id: 3, name: searchTerm, price: 'R$ 18,00', location: '800m', store: 'Loja C', distance: 0.8 },
    ]
    setSearchResults(mockResults)
    addNotification(`🔍 Encontramos ${mockResults.length} resultados para "${searchTerm}"`)
  }

  const handlePaidSearch = (amount: number) => {
    const searchesToAdd = Math.floor(amount / 0.5)
    const newBalance = balance - amount
    if (newBalance >= 0) {
      setBalance(newBalance)
      localStorage.setItem('userBalance', String(newBalance))
      setFreeSearchesLeft(prev => prev + searchesToAdd)
      localStorage.setItem('freeSearchesLeft', String(freeSearchesLeft + searchesToAdd))
      addNotification(`✅ ${searchesToAdd} consultas adicionadas! Saldo: R$ ${newBalance.toFixed(2)}`)
      setShowPaymentModal(false)
    } else {
      addNotification('❌ Saldo insuficiente! Recarregue sua carteira.')
    }
  }

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5))
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message))
    }, 5000)
  }

  const generateQRCode = () => {
    addNotification('📱 QR Code gerado! Mostre ao estabelecimento.')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Valente Conecta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm">R$ {balance.toFixed(2)}</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notificações flutuantes */}
      <div className="fixed top-16 right-4 left-4 z-50 space-y-2">
        {notifications.map((notif, idx) => (
          <div key={idx} className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm">
            {notif}
          </div>
        ))}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-40 shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-2">
              <Link href="/" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link href="/pdv" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>PDV Colaborativo</Link>
              <Link href="/anuncios" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>Anúncios</Link>
              <Link href="/carteira" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>Carteira</Link>
              <Link href="/academia" className="block p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}>Academia</Link>
              <button onClick={generateQRCode} className="w-full text-left p-2 hover:bg-gray-100 rounded-lg">
                📱 Gerar QR Code
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-7xl mx-auto">
        {/* Banner Principal com Busca */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl mb-6">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Valente Conecta</h1>
            <p className="text-blue-100 mb-4">Saldo disponível: R$ {balance.toFixed(2)}</p>
            
            <button 
              onClick={() => setShowSearchModal(true)}
              className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/30 transition"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                <span>O que você procura?</span>
              </div>
              <span className="text-sm">🔍</span>
            </button>
            
            <div className="mt-4 text-sm bg-yellow-400/20 rounded-lg p-2 text-center">
              🎁 Você tem {freeSearchesLeft} consulta(s) grátis hoje!
              {freeSearchesLeft === 0 && (
                <button onClick={() => setShowPaymentModal(true)} className="ml-2 underline">
                  Comprar créditos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cards Principais: Oferta do Dia e Ganhe Bônus */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Card Oferta do Dia - Link para /oferta */}
          <Link href="/oferta">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl cursor-pointer hover:from-orange-600 hover:to-red-600 transition shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-6 h-6" />
                <span className="font-bold">Oferta do Dia</span>
              </div>
              <p className="text-sm opacity-90">Super Descontos!</p>
              <p className="text-xs opacity-75 mt-2">Clique e confira →</p>
            </div>
          </Link>
          
          {/* Card Ganhe Bônus - Link para /carteira */}
          <Link href="/carteira">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-4 rounded-xl cursor-pointer hover:from-yellow-500 hover:to-amber-600 transition shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6" />
                <span className="font-bold">Ganhe Bônus</span>
              </div>
              <p className="text-sm opacity-90">Indique e ganhe R$</p>
              <p className="text-xs opacity-75 mt-2">Até R$50/mês →</p>
            </div>
          </Link>
        </div>

        {/* Cards de Acesso Rápido: PDV Colaborativo e Academia */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/pdv">
            <div className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition text-center">
              <ShoppingBag className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">PDV Colaborativo</h3>
              <p className="text-xs text-gray-500">Venda e gerencie</p>
            </div>
          </Link>
          <Link href="/academia">
            <div className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition text-center">
              <Dumbbell className="w-10 h-10 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Academia</h3>
              <p className="text-xs text-gray-500">30 dias grátis</p>
            </div>
          </Link>
        </div>

        {/* Cards de Funcionalidades Extras */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <Search className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm">Busca Inteligente</h3>
            <p className="text-xs text-gray-500">R$ 0,50 por consulta</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QrCode className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm">QR Code Rápido</h3>
            <p className="text-xs text-gray-500">Instalação simplificada</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm">PDV Móvel</h3>
            <p className="text-xs text-gray-500">Venda de qualquer lugar</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <CreditCard className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-sm">Carteira Digital</h3>
            <p className="text-xs text-gray-500">Moeda Conecta</p>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Atividade Recente</h2>
          <div className="space-y-2">
            {recentActivity.map(activity => (
              <div key={activity.id} className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal de Busca */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Busca Inteligente</h2>
              <button onClick={() => setShowSearchModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o que você procura..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSearch} className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                  Buscar
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Resultados próximos a você:</h3>
                  {searchResults.map(result => (
                    <div key={result.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-500">{result.store} • {result.location}</p>
                      <p className="font-bold text-green-600">{result.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4">
            <h2 className="text-xl font-bold mb-4">Comprar Créditos</h2>
            <p className="text-gray-600 mb-4">Cada consulta custa <strong>R$ 0,50</strong></p>
            <div className="space-y-2">
              {[5, 10, 20, 50].map(amount => (
                <button
                  key={amount}
                  onClick={() => handlePaidSearch(amount)}
                  className="w-full p-3 border rounded-lg flex justify-between items-center hover:bg-blue-50 transition"
                >
                  <span>{amount} consultas</span>
                  <span className="font-bold text-green-600">R$ {(amount * 0.5).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="w-full mt-4 p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}