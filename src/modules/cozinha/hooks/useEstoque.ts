// src/modules/cozinha/hooks/useEstoque.ts
// ============================================
// HOOK DE ESTOQUE
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { estoqueService } from '../services/estoque.service'
import { EstoqueItem, EstoqueResumo, EstoqueStats } from '../types/estoque.types'

export function useEstoque() {
  const [items, setItems] = useState<EstoqueItem[]>([])
  const [resumo, setResumo] = useState<EstoqueResumo[]>([])
  const [stats, setStats] = useState<EstoqueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [itemsData, resumoData, statsData] = await Promise.all([
        estoqueService.listar(),
        estoqueService.buscarResumo(),
        estoqueService.obterStats()
      ])
      
      setItems(itemsData)
      setResumo(resumoData)
      setStats(statsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar estoque'
      setError(message)
      console.error('useEstoque - Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const criarItem = useCallback(async (item: Omit<EstoqueItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const novoItem = await estoqueService.criar(item)
      await carregarDados()
      return novoItem
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar item'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const atualizarItem = useCallback(async (id: string, updates: Partial<EstoqueItem>) => {
    try {
      setLoading(true)
      const itemAtualizado = await estoqueService.atualizar(id, updates)
      await carregarDados()
      return itemAtualizado
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar item'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const excluirItem = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const sucesso = await estoqueService.deletar(id)
      await carregarDados()
      return sucesso
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir item'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const registrarEntrada = useCallback(async (
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ) => {
    try {
      setLoading(true)
      const mov = await estoqueService.registrarEntrada(ingredienteId, quantidade, motivo, usuarioId)
      await carregarDados()
      return mov
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar entrada'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const registrarSaida = useCallback(async (
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ) => {
    try {
      setLoading(true)
      const mov = await estoqueService.registrarSaida(ingredienteId, quantidade, motivo, usuarioId)
      await carregarDados()
      return mov
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar saída'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [carregarDados])

  const alertas = resumo.filter(item => item.status === 'baixo' || item.status === 'critico')

  return {
    items,
    resumo,
    stats,
    alertas,
    loading,
    error,
    carregarDados,
    criarItem,
    atualizarItem,
    excluirItem,
    registrarEntrada,
    registrarSaida
  }
}
