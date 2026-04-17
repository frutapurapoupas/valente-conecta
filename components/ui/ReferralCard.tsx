'use client'

import { useState } from 'react'
import { MapPin, Star, Users, TrendingUp, Gift, Trophy } from 'lucide-react'
import Link from 'next/link'

interface ReferralCardProps {
  referral: {
    id: string
    store_name: string
    store_location: string
    status: 'pending' | 'registered' | 'active'
    points_earned: number
    created_at: string
  }
  onUpdateStatus?: (id: string, status: 'registered' | 'active') => void
}

export function ReferralCard({ referral, onUpdateStatus }: ReferralCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: 'registered' | 'active') => {
    if (!onUpdateStatus) return
    
    setIsUpdating(true)
    try {
      await onUpdateStatus(referral.id, status)
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500'
      case 'registered':
        return 'bg-blue-500/20 text-blue-500 border-blue-500'
      case 'active':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500'
      default:
        return 'bg-zinc-500/20 text-zinc-500 border-zinc-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'registered':
        return 'Cadastrada'
      case 'active':
        return 'Ativa'
      default:
        return status
    }
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-white mb-2">
              {referral.store_name}
            </h3>
            <p className="text-zinc-400 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {referral.store_location}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
              {getStatusText(referral.status)}
            </div>
            <p className="text-yellow-500 font-bold mt-2">
              {referral.points_earned} pts
            </p>
          </div>
        </div>

        {/* Data */}
        <div className="text-zinc-500 text-xs">
          Indicada em: {new Date(referral.created_at).toLocaleDateString('pt-BR')}
        </div>

        {/* Botões de Ação */}
        {onUpdateStatus && (
          <div className="flex gap-2">
            {referral.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate('registered')}
                disabled={isUpdating}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Processando...' : 'Marcar Cadastrada'}
              </button>
            )}
            {referral.status === 'registered' && (
              <button
                onClick={() => handleStatusUpdate('active')}
                disabled={isUpdating}
                className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Processando...' : 'Ativar Catálogo'}
              </button>
            )}
            {referral.status === 'active' && (
              <div className="flex-1 bg-emerald-500/20 text-emerald-500 py-2 rounded-lg text-sm text-center border border-emerald-500">
                Loja Ativa
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Card principal para a home page
export function ReferralMainCard() {
  return (
    <Link 
      href="/indicar-loja"
      className="block bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 border border-yellow-600 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <Gift className="w-12 h-12 text-white" />
        <div className="bg-white/20 px-3 py-1 rounded-full">
          <span className="text-white text-xs font-bold">NOVO</span>
        </div>
      </div>
      
      <h3 className="text-white font-bold text-xl mb-2">
        Indicar Loja
      </h3>
      
      <p className="text-white/90 text-sm mb-4">
        Ganhe pontos indicando lojas e receba recompensas
      </p>
      
      <div className="flex items-center gap-2 text-white/80 text-sm">
        <Trophy className="w-4 h-4" />
        <span>Ganhe até 400 pts por indicação</span>
      </div>
    </Link>
  )
}

// Card de estatísticas para o painel
export function ReferralStatsCard({ 
  referrals, 
  wallet, 
  userLevel 
}: { 
  referrals: any[], 
  wallet: any, 
  userLevel: any 
}) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-yellow-500" />
        Minhas Indicações
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Total</span>
          <span className="font-bold text-white">{referrals.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Pendentes</span>
          <span className="font-bold text-yellow-500">
            {referrals.filter(r => r.status === 'pending').length}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Cadastradas</span>
          <span className="font-bold text-blue-500">
            {referrals.filter(r => r.status === 'registered').length}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Ativas</span>
          <span className="font-bold text-emerald-500">
            {referrals.filter(r => r.status === 'active').length}
          </span>
        </div>
        
        <div className="border-t border-zinc-800 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Pontos Ganhos</span>
            <span className="font-bold text-yellow-500 text-lg">
              {wallet?.total_earned || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
