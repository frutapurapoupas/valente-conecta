'use client'

import { useState, useEffect, useCallback } from 'react'
import { getDashboardStats, DashboardStats } from '@/services/dashboardService'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOffers: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
