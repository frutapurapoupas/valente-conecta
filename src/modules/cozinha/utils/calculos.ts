// src/modules/cozinha/utils/calculos.ts
// ============================================
// FUNÇÕES DE CÁLCULO DO MÓDULO COZINHA
// ============================================

import { Receita, IngredienteReceita } from '../types/cozinha.types'

export const calcularCustoTotal = (ingredientes: IngredienteReceita[]): number => {
  return ingredientes.reduce((total, item) => total + item.subtotal, 0)
}

export const calcularPesoTotal = (ingredientes: IngredienteReceita[]): number => {
  return ingredientes.reduce((total, item) => total + item.quantidade, 0)
}

export const calcularPrecoSugerido = (custoTotal: number, margemDesejada: number = 30): number => {
  const markup = 1 + (margemDesejada / 100)
  return custoTotal * markup
}

export const calcularMargem = (preco: number, custo: number): number => {
  if (preco === 0) return 0
  return ((preco - custo) / preco) * 100
}

export const calcularCMV = (custo: number, preco: number): number => {
  if (preco === 0) return 0
  return (custo / preco) * 100
}

export const calcularLucro = (preco: number, custo: number): number => {
  return preco - custo
}

export const calcularPercentualIngrediente = (subtotal: number, total: number): number => {
  if (total === 0) return 0
  return (subtotal / total) * 100
}

export const calcularTempoPreparo = (ingredientes: IngredienteReceita[]): number => {
  // Fórmula simples: 5 minutos por ingrediente
  return ingredientes.length * 5
}

export const calcularPorcoes = (pesoTotal: number, pesoPorPorcao: number = 200): number => {
  return Math.floor(pesoTotal / pesoPorPorcao)
}

export const calcularCustoPorPorcao = (custoTotal: number, porcoes: number): number => {
  if (porcoes === 0) return 0
  return custoTotal / porcoes
}
