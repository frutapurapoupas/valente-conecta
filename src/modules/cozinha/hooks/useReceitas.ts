// src/modules/cozinha/hooks/useReceitas.ts
// ============================================
// HOOK DE RECEITAS
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { Receita, IngredienteReceita } from '../types/cozinha.types'
import { receitaService } from '../services/receita.service'
import {
  calcularCustoTotal,
  calcularPesoTotal,
  calcularPrecoSugerido,
  calcularMargem,
  calcularCMV,
  calcularLucro,
  calcularTempoPreparo,
  calcularPorcoes
} from '../utils/calculos'

export function useReceitas() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar receitas
  const carregarReceitas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await receitaService.listar()
      setReceitas(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar receitas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarReceitas()
  }, [carregarReceitas])

  // Criar receita
  const criarReceita = useCallback(async (dados: Omit<Receita, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const novaReceita = await receitaService.criar(dados)
      setReceitas(prev => [...prev, novaReceita])
      return novaReceita
    } catch (err) {
      console.error('Erro ao criar receita:', err)
      throw err
    }
  }, [])

  // Atualizar receita
  const atualizarReceita = useCallback(async (id: string, dados: Partial<Receita>) => {
    try {
      const receitaAtualizada = await receitaService.atualizar(id, dados)
      if (receitaAtualizada) {
        setReceitas(prev => prev.map(r => r.id === id ? receitaAtualizada : r))
      }
      return receitaAtualizada
    } catch (err) {
      console.error('Erro ao atualizar receita:', err)
      throw err
    }
  }, [])

  // Excluir receita
  const excluirReceita = useCallback(async (id: string) => {
    try {
      const sucesso = await receitaService.excluir(id)
      if (sucesso) {
        setReceitas(prev => prev.filter(r => r.id !== id))
      }
      return sucesso
    } catch (err) {
      console.error('Erro ao excluir receita:', err)
      throw err
    }
  }, [])

  // Calcular métricas da receita
  const calcularMetricas = useCallback((ingredientes: IngredienteReceita[]) => {
    const custoTotal = calcularCustoTotal(ingredientes)
    const pesoTotal = calcularPesoTotal(ingredientes)
    const precoSugerido = calcularPrecoSugerido(custoTotal)
    const margem = calcularMargem(precoSugerido, custoTotal)
    const cmv = calcularCMV(custoTotal, precoSugerido)
    const lucro = calcularLucro(precoSugerido, custoTotal)
    const tempoPreparo = calcularTempoPreparo(ingredientes)
    const porcoes = calcularPorcoes(pesoTotal)

    return {
      custoTotal,
      pesoTotal,
      precoSugerido,
      margem,
      cmv,
      lucro,
      tempoPreparo,
      porcoes
    }
  }, [])

  return {
    receitas,
    loading,
    error,
    carregarReceitas,
    criarReceita,
    atualizarReceita,
    excluirReceita,
    calcularMetricas
  }
}
