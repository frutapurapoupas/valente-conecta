'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useReferralSystem() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [wallet, setWallet] = useState<UserWallet | null>(null)
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gerar código único de indicação
  const generateReferralCode = useCallback((userId: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `VAL${userId.slice(-4)}${timestamp.toString(36).toUpperCase()}${random.toUpperCase()}`
  }, [])

  // Criar nova indicação
  const createReferral = useCallback(async (
    userId: string,
    storeName: string,
    storeLocation: string,
    storePhoto?: string
  ): Promise<Referral> => {
    setLoading(true)
    setError(null)

    try {
      console.log('Criando indicação:', { userId, storeName, storeLocation, storePhoto })
      
      const referralCode = generateReferralCode(userId)
      console.log('Código gerado:', referralCode)

      const referralData = {
        user_id: userId,
        referral_code: referralCode,
        store_name: storeName,
        store_location: storeLocation,
        store_photo: storePhoto,
        status: 'pending',
        points_earned: 0
      }
      
      console.log('Dados para inserir:', referralData)

      const { data, error } = await supabase
        .from('referrals')
        .insert(referralData)
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase:', error)
        
        // Verificar se é erro de conexão
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          console.error('Erro de conexão com Supabase - verifique .env.local')
          throw new Error('Erro de conexão com o banco de dados. Verifique as configurações do Supabase.')
        }
        
        throw error
      }

      console.log('Indicação criada com sucesso:', data)

      // Atualizar lista local
      setReferrals(prev => [data, ...prev])

      // Enviar notificação para admin
      await supabase
        .from('notifications')
        .insert({
          type: 'new_referral',
          title: 'Nova Indicação de Loja',
          message: `${storeName} foi indicada`,
          data: {
            referral_id: data.id,
            user_id: userId,
            store_name: storeName
          }
        })

      return data
    } catch (err: any) {
      console.error('Erro completo ao criar indicação:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [generateReferralCode])

  // Buscar indicações do usuário
  const fetchUserReferrals = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReferrals(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar carteira do usuário
  const fetchUserWallet = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Se não existir carteira, criar uma
      if (!data) {
        const { data: newWallet, error: createError } = await supabase
          .from('user_wallets')
          .insert({
            user_id: userId,
            balance: 0,
            total_earned: 0,
            points_available: 0,
            points_used: 0
          })
          .select()
          .single()

        if (createError) throw createError
        setWallet(newWallet)
      } else {
        setWallet(data)
      }
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

  // Atualizar status da indicação e liberar pontos
  const updateReferralStatus = useCallback(async (
    referralId: string,
    status: 'registered' | 'active'
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Buscar a indicação atual
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single()

      if (fetchError) throw fetchError

      let pointsToEarn = 0

      // Calcular pontos baseado no status
      if (status === 'registered' && referral.status === 'pending') {
        pointsToEarn = 100 // 100 pontos por cadastro
      } else if (status === 'active' && referral.status === 'registered') {
        pointsToEarn = 300 // 300 pontos por ativação de catálogo
      }

      // Atualizar status e pontos
      const { data, error } = await supabase
        .from('referrals')
        .update({
          status,
          points_earned: referral.points_earned + pointsToEarn,
          updated_at: new Date().toISOString()
        })
        .eq('id', referralId)
        .select()
        .single()

      if (error) throw error

      // Adicionar pontos à carteira
      if (pointsToEarn > 0) {
        const { error: walletError } = await supabase
          .from('user_wallets')
          .update({
            balance: (wallet?.balance || 0) + pointsToEarn,
            total_earned: (wallet?.total_earned || 0) + pointsToEarn,
            points_available: (wallet?.points_available || 0) + pointsToEarn,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referral.user_id)

        if (walletError) throw walletError

        // Atualizar carteira local
        if (wallet) {
          setWallet({
            ...wallet,
            balance: wallet.balance + pointsToEarn,
            total_earned: wallet.total_earned + pointsToEarn,
            points_available: wallet.points_available + pointsToEarn
          })
        }
      }

      // Atualizar lista local
      setReferrals(prev => 
        prev.map(r => r.id === referralId ? data : r)
      )

      // Enviar notificação
      await supabase
        .from('notifications')
        .insert({
          type: 'referral_points',
          title: 'Pontos Ganhos!',
          message: `Você ganhou ${pointsToEarn} pontos pela indicação!`,
          user_id: referral.user_id,
          data: {
            referral_id: referralId,
            points_earned: pointsToEarn
          }
        })

      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wallet])

  // Usar pontos do saldo
  const usePoints = useCallback(async (userId: string, pointsToUse: number) => {
    setLoading(true)
    setError(null)

    try {
      if (!wallet || wallet.balance < pointsToUse) {
        throw new Error('Saldo insuficiente')
      }

      const { error } = await supabase
        .from('user_wallets')
        .update({
          balance: wallet.balance - pointsToUse,
          points_used: wallet.points_used + pointsToUse,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      // Atualizar carteira local
      setWallet({
        ...wallet,
        balance: wallet.balance - pointsToUse,
        points_used: wallet.points_used + pointsToUse
      })

      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wallet])

  // Gerar UUID válido para testes
  const generateTestUserId = useCallback((): string => {
    return '00000000-0000-0000-0000-000000000001'
  }, [])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (userId?: string) => {
    const actualUserId = userId || generateTestUserId()
    try {
      await Promise.all([
        fetchUserReferrals(actualUserId),
        fetchUserWallet(actualUserId)
      ])
    } catch (err: any) {
      setError(err.message)
    }
  }, [fetchUserReferrals, fetchUserWallet, generateTestUserId])

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
    generateTestUserId
  }
}
