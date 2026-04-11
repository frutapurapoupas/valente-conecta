'use client'

import { useState, useEffect } from 'react'

export type ActivityItem = {
  id: number
  text: string
  time: string
}

export type SearchResult = {
  id: number
  // ── Público (visível sem desbloqueio)
  name: string        // nome da loja / profissional
  foto: string        // avatar colorido ou URL de foto
  categoria: string   // tipo: Mercado, Pedreiro, etc.
  // ── Privado (só após desbloqueio pago)
  price: string
  location: string
  store: string
  distance: number
  distanciaDetalhada: string  // ex: "500m do centro"
  bairro: string
  endereco: string
  coordenadas: string   // lat,long ou link de mapa
  telefone: string
  email: string
  locked: boolean
}

export type TipoDemo = 'empresa' | 'profissional' | 'ambulante' | 'usuario' | null

const WELCOME_SEARCHES = 5
const UNLOCK_PRICE = 1.00 // R$ — configurável pelo Admin Master

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: 1, text: '🛒 João fez uma compra de R$ 45,00', time: 'agora' },
  { id: 2, text: '🏪 Padaria Valente entrou na plataforma', time: '5 min' },
  { id: 3, text: '💰 Você ganhou R$ 2,00 de bônus!', time: '1 hora' },
  { id: 4, text: '⏳ Indicação pendente: Carlos Silva', time: '2 horas' },
]

export function useHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [welcomeSearchesLeft, setWelcomeSearchesLeft] = useState(WELCOME_SEARCHES)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockTarget, setUnlockTarget] = useState<SearchResult | null>(null)
  const [loadingUnlock, setLoadingUnlock] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [unlockedIds, setUnlockedIds] = useState<number[]>([])
  const [balance, setBalance] = useState(150)
  const [notifications, setNotifications] = useState<string[]>([])
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [tipoDemo, setTipoDemo] = useState<TipoDemo>(null)

  const recentActivity: ActivityItem[] = INITIAL_ACTIVITY

  useEffect(() => {
    const saved = localStorage.getItem('welcomeSearchesLeft')
    if (saved !== null) setWelcomeSearchesLeft(parseInt(saved))
    const savedBalance = localStorage.getItem('userBalance')
    if (savedBalance) setBalance(parseFloat(savedBalance))
    const savedUnlocked = localStorage.getItem('unlockedContacts')
    if (savedUnlocked) setUnlockedIds(JSON.parse(savedUnlocked))
  }, [])

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5))
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message))
    }, 5000)
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      addNotification('Digite algo para buscar')
      return
    }

    const rawResults: Omit<SearchResult, 'locked'>[] = [
      {
        id: 1, name: 'Mercadinho São José', foto: 'MS', categoria: 'Supermercado',
        price: 'R$ 25,00', location: '500m', store: 'Mercadinho São José', distance: 0.5,
        distanciaDetalhada: '500m do centro', bairro: 'Centro',
        endereco: 'Rua XV de Novembro, 128 — Centro, Valente, BA',
        coordenadas: '-11.4050,-39.3140',
        telefone: '(75) 99812-0001', email: 'contato@mercadinhosj.com',
      },
      {
        id: 2, name: 'Borracharia do Baixinho', foto: 'BB', categoria: 'Borracharia',
        price: 'R$ 32,00', location: '1.2km', store: 'Borracharia do Baixinho', distance: 1.2,
        distanciaDetalhada: '1,2km do centro', bairro: 'Bairro Novo',
        endereco: 'Av. Principal, 45 — Bairro Novo, Valente, BA',
        coordenadas: '-11.4100,-39.3160',
        telefone: '(75) 99812-0002', email: 'borracharia@email.com',
      },
      {
        id: 3, name: 'Farmácia Popular', foto: 'FP', categoria: 'Farmácia',
        price: 'R$ 18,00', location: '800m', store: 'Farmácia Popular', distance: 0.8,
        distanciaDetalhada: '800m do centro', bairro: 'Centro',
        endereco: 'Praça da Matriz, 12 — Centro, Valente, BA',
        coordenadas: '-11.4060,-39.3145',
        telefone: '(75) 99812-0003', email: 'farmacia@email.com',
      },
    ]

    if (welcomeSearchesLeft > 0) {
      // Bônus de boas-vindas — contatos desbloqueados
      setSearchResults(rawResults.map(r => ({ ...r, locked: false })))
      const newCount = welcomeSearchesLeft - 1
      setWelcomeSearchesLeft(newCount)
      localStorage.setItem('welcomeSearchesLeft', String(newCount))
      addNotification(
        newCount === 0
          ? '🎁 Último bônus de boas-vindas usado!'
          : `🎁 Bônus de boas-vindas: ${newCount} consulta(s) restante(s).`
      )
    } else {
      // Bônus esgotado — contatos bloqueados
      setSearchResults(rawResults.map(r => ({
        ...r,
        locked: !unlockedIds.includes(r.id),
      })))
      addNotification('🔒 Desbloqueie o contato por R$ 1,00 para ver telefone e endereço.')
    }
  }

  const handleUnlockContact = (result: SearchResult) => {
    setUnlockTarget(result)
    setShowUnlockModal(true)
  }

  const confirmUnlockPayment = (_method: 'pix' | 'debito' | 'credito') => {
    if (!unlockTarget) return
    setLoadingUnlock(true)
    setTimeout(() => {
      const newUnlocked = [...unlockedIds, unlockTarget.id]
      setUnlockedIds(newUnlocked)
      localStorage.setItem('unlockedContacts', JSON.stringify(newUnlocked))
      setSearchResults(prev =>
        prev.map(r => r.id === unlockTarget.id ? { ...r, locked: false } : r)
      )
      setShowUnlockModal(false)
      setUnlockTarget(null)
      setLoadingUnlock(false)
      addNotification('✅ Contato desbloqueado! Acesso com geolocalização liberado.')
    }, 1500)
  }

  const generateQRCode = () => {
    addNotification('📱 QR Code gerado! Mostre ao estabelecimento.')
  }

  return {
    isMenuOpen, setIsMenuOpen,
    showSearchModal, setShowSearchModal,
    showUnlockModal, setShowUnlockModal,
    unlockTarget, loadingUnlock,
    unlockPrice: UNLOCK_PRICE,
    searchTerm, setSearchTerm,
    searchResults, welcomeSearchesLeft,
    handleSearch,
    handleUnlockContact, confirmUnlockPayment,
    balance, notifications, recentActivity,
    generateQRCode,
    // demo mode
    showDemoModal, setShowDemoModal,
    tipoDemo, setTipoDemo,
  }
}
