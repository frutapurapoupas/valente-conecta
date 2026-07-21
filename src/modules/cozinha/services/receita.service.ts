// src/modules/cozinha/services/receita.service.ts
// ============================================
// SERVIÇO DE RECEITAS
// ============================================

import { Receita, IngredienteReceita } from '../types/cozinha.types'
import { calcularCustoTotal, calcularPesoTotal } from '../utils/calculos'

// Dados mockados (substituir por API real)
let receitas: Receita[] = []

export const receitaService = {
  // Listar todas as receitas
  async listar(): Promise<Receita[]> {
    return receitas
  },

  // Buscar uma receita por ID
  async buscarPorId(id: string): Promise<Receita | null> {
    return receitas.find(r => r.id === id) || null
  },

  // Buscar receitas por status
  async buscarPorStatus(status: string): Promise<Receita[]> {
    return receitas.filter(r => r.status === status)
  },

  // Criar nova receita
  async criar(receita: Omit<Receita, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receita> {
    const novaReceita: Receita = {
      ...receita,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    receitas.push(novaReceita)
    return novaReceita
  },

  // Atualizar receita
  async atualizar(id: string, dados: Partial<Receita>): Promise<Receita | null> {
    const index = receitas.findIndex(r => r.id === id)
    if (index === -1) return null
    
    receitas[index] = {
      ...receitas[index],
      ...dados,
      updatedAt: new Date()
    }
    return receitas[index]
  },

  // Excluir receita
  async excluir(id: string): Promise<boolean> {
    const index = receitas.findIndex(r => r.id === id)
    if (index === -1) return false
    
    receitas.splice(index, 1)
    return true
  },

  // Calcular custo da receita
  calcularCusto(ingredientes: IngredienteReceita[]): number {
    return calcularCustoTotal(ingredientes)
  },

  // Calcular peso da receita
  calcularPeso(ingredientes: IngredienteReceita[]): number {
    return calcularPesoTotal(ingredientes)
  }
}
