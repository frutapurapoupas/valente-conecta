'use client'

import { useState, useCallback } from 'react'

interface Referral {
  id: string
  user_id: string
  referral_code: string
  store_name: string
  store_location: string
  store_photo?: string
  status: 'pending' | 'registered' | 'active'
  points_earned: number
  created_at: string
  updated_at: string
}

interface UserWallet {
  id: string
  user_id: string
  balance: number
  total_earned: number
  points_available: number
  points_used: number
  created_at: string
  updated_at: string
}

interface UserLevel {
  id: string
  name: string
  min_referrals: number
  points_multiplier: number
  badge_color: string
  rewards: string[]
}

// Dados mock para testes
const mockReferrals: Referral[] = [
  {
    id: '1',
    user_id: 'user_123',
    referral_code: 'VAL123ABC',
    store_name: 'Mercearia do João',
    store_location: 'Rua Principal, 123 - Centro, Coité-BA',
    store_photo: 'https://via.placeholder.com/300x200',
    status: 'pending',
    points_earned: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user_123',
    referral_code: 'VAL456DEF',
    store_name: 'Padaria Pão Quente',
    store_location: 'Avenida Central, 456 - Coité-BA',
    store_photo: 'https://via.placeholder.com/300x200',
    status: 'registered',
    points_earned: 100,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
]

const mockWallet: UserWallet = {
  id: 'wallet_123',
  user_id: 'user_123',
  balance: 100,
  total_earned: 100,
  points_available: 100,
  points_used: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export function useReferralSystem() {
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals)
  const [wallet, setWallet] = useState<UserWallet | null>(mockWallet)
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gerar código único de indicação
  const generateReferralCode = useCallback((userId: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `VAL${userId.slice(-4)}${timestamp.toString(36).toUpperCase()}${random.toUpperCase()}`
  }, [])

  // Criar nova indicação (MOCK)
  const createReferral = useCallback(async (
    userId: string,
    storeName: string,
    storeLocation: string,
    storePhoto?: string
  ): Promise<Referral> => {
    setLoading(true)
    setError(null)

    try {
      console.log('MOCK: Criando indicação:', { userId, storeName, storeLocation, storePhoto })
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const referralCode = generateReferralCode(userId)
      console.log('MOCK: Código gerado:', referralCode)

      const newReferral: Referral = {
        id: Date.now().toString(),
        user_id: userId,
        referral_code: referralCode,
        store_name: storeName,
        store_location: storeLocation,
        store_photo: storePhoto,
        status: 'pending',
        points_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('MOCK: Indicação criada com sucesso:', newReferral)

      // Atualizar lista local
      setReferrals(prev => [newReferral, ...prev])

      return newReferral
    } catch (err: any) {
      console.error('MOCK: Erro ao criar indicação:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [generateReferralCode])

  // Buscar indicações do usuário (MOCK)
  const fetchUserReferrals = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Já temos os dados mock
      setReferrals(mockReferrals)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar carteira do usuário (MOCK)
  const fetchUserWallet = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Já temos os dados mock
      setWallet(mockWallet)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Calcular nível do usuário
  const calculateUserLevel = useCallback((referralCount: number): UserLevel => {
    const levels: UserLevel[] = [
      {
        id: '1',
        name: 'Iniciante',
        min_referrals: 0,
        points_multiplier: 1.0,
        badge_color: 'bg-gray-500',
        rewards: ['Acesso básico']
      },
      {
        id: '2',
        name: 'Indicador Bronze',
        min_referrals: 3,
        points_multiplier: 1.2,
        badge_color: 'bg-orange-600',
        rewards: ['Bônus de 20%', 'Badge Bronze']
      },
      {
        id: '3',
        name: 'Indicador Prata',
        min_referrals: 10,
        points_multiplier: 1.5,
        badge_color: 'bg-gray-400',
        rewards: ['Bônus de 50%', 'Badge Prata', 'Destaque no app']
      },
      {
        id: '4',
        name: 'Indicador Ouro',
        min_referrals: 25,
        points_multiplier: 2.0,
        badge_color: 'bg-yellow-500',
        rewards: ['Bônus de 100%', 'Badge Ouro', 'Suporte prioritário']
      },
      {
        id: '5',
        name: 'Mestre Indicador',
        min_referrals: 50,
        points_multiplier: 3.0,
        badge_color: 'bg-purple-600',
        rewards: ['Bônus de 200%', 'Badge Mestre', 'Comissão especial']
      }
    ]

    // Encontrar o nível atual
    const currentLevel = levels
      .reverse()
      .find(level => referralCount >= level.min_referrals)

    return currentLevel || levels[0]
  }, [])

  // Atualizar status da indicação (MOCK)
  const updateReferralStatus = useCallback(async (
    referralId: string,
    status: 'registered' | 'active'
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Buscar a indicação atual
      const referral = referrals.find(r => r.id === referralId)
      if (!referral) {
        throw new Error('Indicação não encontrada')
      }

      let pointsToEarn = 0

      // Calcular pontos baseado no status
      if (status === 'registered' && referral.status === 'pending') {
        pointsToEarn = 100 // 100 pontos por cadastro
      } else if (status === 'active' && referral.status === 'registered') {
        pointsToEarn = 300 // 300 pontos por ativação de catálogo
      }

      // Atualizar status e pontos
      const updatedReferral = {
        ...referral,
        status,
        points_earned: referral.points_earned + pointsToEarn,
        updated_at: new Date().toISOString()
      }

      // Atualizar lista local
      setReferrals(prev => 
        prev.map(r => r.id === referralId ? updatedReferral : r)
      )

      // Adicionar pontos à carteira
      if (pointsToEarn > 0 && wallet) {
        const updatedWallet = {
          ...wallet,
          balance: wallet.balance + pointsToEarn,
          total_earned: wallet.total_earned + pointsToEarn,
          points_available: wallet.points_available + pointsToEarn,
          updated_at: new Date().toISOString()
        }
        setWallet(updatedWallet)
      }

      console.log('MOCK: Status atualizado com sucesso:', updatedReferral)
      return updatedReferral
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [referrals, wallet])

  // Usar pontos do saldo (MOCK)
  const usePoints = useCallback(async (userId: string, pointsToUse: number) => {
    setLoading(true)
    setError(null)

    try {
      if (!wallet || wallet.balance < pointsToUse) {
        throw new Error('Saldo insuficiente')
      }

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500))

      // Atualizar carteira local
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - pointsToUse,
        points_used: wallet.points_used + pointsToUse,
        updated_at: new Date().toISOString()
      }
      setWallet(updatedWallet)

      console.log('MOCK: Pontos usados com sucesso:', pointsToUse)
      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wallet])

  // Carregar dados iniciais
  const loadUserData = useCallback(async (userId: string) => {
    await Promise.all([
      fetchUserReferrals(userId),
      fetchUserWallet(userId)
    ])

    // Calcular nível após carregar indicações
    const level = calculateUserLevel(referrals.length)
    setUserLevel(level)
  }, [fetchUserReferrals, fetchUserWallet, calculateUserLevel, referrals.length])

  // Inicializar dados mock
  useState(() => {
    const level = calculateUserLevel(mockReferrals.length)
    setUserLevel(level)
  })

  return {
    referrals,
    wallet,
    userLevel,
    loading,
    error,
    createReferral,
    fetchUserReferrals,
    fetchUserWallet,
    updateReferralStatus,
    usePoints,
    loadUserData,
    generateReferralCode
  }
}
