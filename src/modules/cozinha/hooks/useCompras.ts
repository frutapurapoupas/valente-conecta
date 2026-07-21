// src/modules/cozinha/hooks/useCompras.ts
// ============================================
// HOOK DE COMPRAS
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { comprasService } from '../services/compras.service'
import { Compra, CompraStats, CompraRequest } from '../types/compras.types'

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [requests, setRequests] = useState<CompraRequest[]>([])
  const [stats, setStats] = useState<CompraStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [comprasData, requestsData, statsData] = await Promise.all([
        comprasService.listar(),
        comprasService.listarRequests(),
        comprasService.obterStats()
      ])
      
      setCompras(comprasData)
      setRequests(requestsData)
      setStats(statsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar compras'
      setError(message)
      console.error('useCompras - Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const criarCompra = useCallback(async (compra: Omit<Compra, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const novaCompra = await comprasService.criar(compra)
      await carregarDados()
      return novaCompra
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar compra'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const atualizarCompra = useCallback(async (id: string, updates: Partial<Compra>) => {
    try {
      setLoading(true)
      const compraAtualizada = await comprasService.atualizar(id, updates)
      await carregarDados()
      return compraAtualizada
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar compra'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const excluirCompra = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const sucesso = await comprasService.deletar(id)
      await carregarDados()
      return sucesso
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir compra'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const aprovarRequest = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const requestAprovada = await comprasService.aprovarRequest(id)
      await carregarDados()
      return requestAprovada
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar solicitação'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const requestsPendentes = requests.filter(r => r.status === 'pendente')

  return {
    compras,
    requests,
    requestsPendentes,
    stats,
    loading,
    error,
    carregarDados,
    criarCompra,
    atualizarCompra,
    excluirCompra,
    aprovarRequest
  }
}
