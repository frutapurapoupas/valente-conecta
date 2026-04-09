'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DashboardData, Activity } from '@/types/admin'

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Buscar dados reais do Supabase
      const [usersCount, companiesCount, productsCount, pendingProductsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).in('status', ['pending_completion', 'pending_sync'])
      ])

      // Atividades recentes mockadas (depois buscar do banco)
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'login',
          description: 'Admin Master acessou o sistema',
          timestamp: new Date().toISOString()
        }
      ]

      setData({
        totalUsers: usersCount.count || 0,
        totalCompanies: companiesCount.count || 0,
        totalProducts: productsCount.count || 0,
        pendingProducts: pendingProductsCount.count || 0,
        totalOffers: 0,
        pendingOffers: 0,
        totalTransactionsMonth: 0,
        totalConectaCirculating: 0,
        recentActivities: mockActivities
      })
      setError(null)
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
