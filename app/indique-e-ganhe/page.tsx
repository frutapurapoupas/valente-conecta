'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Store, 
  Briefcase, 
  Calendar, 
  ShoppingCart, 
  Dumbbell,
  Wallet,
  Receipt,
  QrCode,
  Link,
  TrendingUp,
  UserCheck,
  Smartphone,
  Lock,
  Unlock,
  Settings
} from 'lucide-react'
import { useReferralSystem } from '@/hooks/useReferralSystem'

type TabType = 'amigos' | 'empresa' | 'profissionais' | 'servicos' | 'ambulantes' | 'academia'

interface WalletBalance {
  available: number
  blocked: number
  total: number
}

interface Transaction {
  id: string
  type: 'bonus' | 'unlock' | 'pending'
  amount: number
  description: string
  source: string
  date: string
  status: 'completed' | 'pending' | 'blocked'
}

interface PopulationMetrics {
  totalPopulation: number
  activePopulation: number
  whatsappUsers: number
  appActiveUsers: number
  adoptionRate: number
}

export default function IndiqueEGanhePage() {
  const [activeTab, setActiveTab] = useState<TabType>('amigos')
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    available: 0,
    blocked: 0,
    total: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [populationMetrics, setPopulationMetrics] = useState<PopulationMetrics>({
    totalPopulation: 0,
    activePopulation: 0,
    whatsappUsers: 0,
    appActiveUsers: 0,
    adoptionRate: 0
  })
  const [referralLink, setReferralLink] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [isAmbassador, setIsAmbassador] = useState(false)

  const { wallet, referrals } = useReferralSystem()

  // Carregar dados da carteira
  useEffect(() => {
    if (wallet) {
      setWalletBalance({
        available: wallet.points_available * 0.2, // R$0.20 por ponto
        blocked: 0, // Calcular bônus bloqueados
        total: wallet.points_available * 0.2
      })
    }
  }, [wallet])

  // Carregar métricas populacionais
  useEffect(() => {
    // Dados simulados - em produção viriam do backend
    setPopulationMetrics({
      totalPopulation: 40000, // População de Valente-BA
      activePopulation: 35000,
      whatsappUsers: 30000,
      appActiveUsers: 5000,
      adoptionRate: 16.67 // 5000/30000 * 100
    })
  }, [])

  // Gerar link e código de indicação
  useEffect(() => {
    const userId = '00000000-0000-0000-0000-000000000001' // Em produção: ID real do usuário
    const code = `VAL${userId.slice(-4).toUpperCase()}${Date.now().toString(36).toUpperCase()}`
    setReferralCode(code)
    setReferralLink(`https://valenteconecta.com.br/convite/${code}`)
  }, [setReferralCode, setReferralLink])

  const tabs = [
    { id: 'amigos', label: 'Amigos', icon: Users },
    { id: 'empresa', label: 'Empresa/Loja', icon: Store },
    { id: 'profissionais', label: 'Profissionais', icon: Briefcase },
    { id: 'servicos', label: 'Serviços', icon: Calendar },
    { id: 'ambulantes', label: 'Ambulantes', icon: ShoppingCart },
    { id: 'academia', label: 'Academia', icon: Dumbbell }
  ]

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'bonus',
      amount: 2.00,
      description: 'Bônus indicação amigo',
      source: 'João Silva',
      date: '2026-04-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'bonus',
      amount: 2.00,
      description: 'Bônus indicação empresa',
      source: 'Mercado Central',
      date: '2026-04-14',
      status: 'blocked'
    },
    {
      id: '3',
      type: 'pending',
      amount: 6.00,
      description: 'Bônus pendente lote 10 amigos',
      source: 'Aguardando completar lote',
      date: '2026-04-13',
      status: 'pending'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'amigos':
        return (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Indique Amigos</h3>
            <p className="text-zinc-400 mb-6">Ganhe R$2 a cada 10 amigos indicados</p>
            <div className="bg-zinc-800 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-yellow-400 font-medium">Progresso: 7/10 amigos</p>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        )
      case 'empresa':
        return (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Indique Empresas/Lojas</h3>
            <p className="text-zinc-400 mb-6">Ganhe R$2 a cada 3 empresas indicadas</p>
            <div className="bg-zinc-800 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-yellow-400 font-medium">Progresso: 1/3 empresas</p>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">Em breve</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p className="text-zinc-400">Módulo em desenvolvimento</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Indique e Ganhe</h1>
          <p className="text-zinc-400">Conquiste a cidade e ganhe com o Valente Conecta</p>
        </div>

        {/* Carteira e Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Saldo da Carteira */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-500">Minha Carteira</h2>
              <Wallet className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Disponível:</span>
                <span className="text-green-400 font-bold">R${walletBalance.available.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Bloqueado:</span>
                <span className="text-red-400 font-bold">R${walletBalance.blocked.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-yellow-400">R${walletBalance.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* QR Code e Link */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-500">Seu Convite</h2>
              <QrCode className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-center space-y-3">
              <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
                <QrCode className="w-24 h-24 text-zinc-900" />
              </div>
              <div className="bg-zinc-700 rounded p-2">
                <p className="text-xs text-zinc-400 mb-1">Código:</p>
                <p className="text-yellow-400 font-mono text-sm">{referralCode}</p>
              </div>
              <button className="w-full bg-yellow-500 text-zinc-900 py-2 rounded-lg font-bold hover:bg-yellow-400 transition">
                Copiar Link
              </button>
            </div>
          </div>

          {/* Métricas Populacionais */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yellow-500">Embaixador Conecta</h2>
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">População Total:</span>
                <span>{populationMetrics.totalPopulation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">WhatsApp Ativos:</span>
                <span>{populationMetrics.whatsappUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">App Ativos:</span>
                <span className="text-green-400 font-bold">{populationMetrics.appActiveUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Taxa Adoção:</span>
                <span className={populationMetrics.adoptionRate > 15 ? 'text-green-400' : 'text-yellow-400'}>
                  {populationMetrics.adoptionRate.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {populationMetrics.adoptionRate > 15 ? 
                  'Bônus liberados! Taxa atingida.' : 
                  `Aguardando ${15 - populationMetrics.adoptionRate.toFixed(1)}% para liberar bônus`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Indicação */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-zinc-900'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          
          <div className="min-h-[200px]">
            {renderTabContent()}
          </div>
        </div>

        {/* Extrato Bancário */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-yellow-500">Extrato Detalhado</h2>
            <Receipt className="w-6 h-6 text-yellow-500" />
          </div>
          
          <div className="space-y-3">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-zinc-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.status === 'completed' ? 'bg-green-500/20' :
                    transaction.status === 'blocked' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {transaction.status === 'completed' ? <Unlock className="w-5 h-5 text-green-400" /> :
                     transaction.status === 'blocked' ? <Lock className="w-5 h-5 text-red-400" /> :
                     <Settings className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-zinc-400">{transaction.source} · {transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.status === 'completed' ? 'text-green-400' :
                    transaction.status === 'blocked' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {transaction.status === 'completed' ? '+' : ''}
                    R${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-400 capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
