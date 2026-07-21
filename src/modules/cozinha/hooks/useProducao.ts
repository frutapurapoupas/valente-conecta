// src/modules/cozinha/hooks/useProducao.ts
// ============================================
// HOOK DE PRODUÇÃO
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { producaoService } from '../services/producao.service'
import { Producao, ProducaoStats } from '../types/producao.types'

export function useProducao() {
  const [producoes, setProducoes] = useState<Producao[]>([])
  const [stats, setStats] = useState<ProducaoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [producoesData, statsData] = await Promise.all([
        producaoService.listar(),
        producaoService.obterStats()
      ])
      
      setProducoes(producoesData)
      setStats(statsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar produções'
      setError(message)
      console.error('useProducao - Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const criarProducao = useCallback(async (input: Omit<Producao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const novaProducao = await producaoService.criar(input)
      await carregarDados()
      return novaProducao
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar produção'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const atualizarProducao = useCallback(async (id: string, updates: Partial<Producao>) => {
    try {
      setLoading(true)
      const producaoAtualizada = await producaoService.atualizar(id, updates)
      await carregarDados()
      return producaoAtualizada
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produção'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const atualizarStatus = useCallback(async (id: string, status: Producao['status']) => {
    try {
      setLoading(true)
      const producaoAtualizada = await producaoService.atualizarStatus(id, status)
      await carregarDados()
      return producaoAtualizada
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const concluirProducao = useCallback(async (id: string, quantidadeProduzida: number) => {
    try {
      setLoading(true)
      const producaoConcluida = await producaoService.concluirProducao(id, quantidadeProduzida)
      await carregarDados()
      return producaoConcluida
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao concluir produção'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const excluirProducao = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const sucesso = await producaoService.deletar(id)
      await carregarDados()
      return sucesso
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir produção'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  return {
    producoes,
    stats,
    loading,
    error,
    carregarDados,
    criarProducao,
    atualizarProducao,
    atualizarStatus,
    concluirProducao,
    excluirProducao
  }
}
