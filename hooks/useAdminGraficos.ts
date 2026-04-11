'use client'

import { useState } from 'react'

export type FiltroPeriodo = 'hoje' | 'semana' | 'mes'

export interface DadosSemanalBar {
  dia: string
  faturamento: number
  bonus: number
}

export interface DadosPizza {
  name: string
  value: number
  color: string
}

const DADOS_SEMANAIS: DadosSemanalBar[] = [
  { dia: 'Seg', faturamento: 1200, bonus: 180 },
  { dia: 'Ter', faturamento: 980, bonus: 145 },
  { dia: 'Qua', faturamento: 1450, bonus: 218 },
  { dia: 'Qui', faturamento: 1100, bonus: 160 },
  { dia: 'Sex', faturamento: 1820, bonus: 275 },
  { dia: 'Sáb', faturamento: 2100, bonus: 315 },
  { dia: 'Dom', faturamento: 850, bonus: 120 },
]

const PIZZA_HOJE: DadosPizza[] = [
  { name: 'Desbloqueios', value: 87, color: '#6366f1' },
  { name: 'Carrossel', value: 35, color: '#f59e0b' },
  { name: 'Planos Empresas', value: 290, color: '#10b981' },
  { name: 'Planos Profissionais', value: 80, color: '#3b82f6' },
  { name: 'Plano Academia', value: 39.6, color: '#ec4899' },
]

const PIZZA_SEMANA: DadosPizza[] = [
  { name: 'Desbloqueios', value: 523, color: '#6366f1' },
  { name: 'Carrossel', value: 245, color: '#f59e0b' },
  { name: 'Planos Empresas', value: 1450, color: '#10b981' },
  { name: 'Planos Profissionais', value: 380, color: '#3b82f6' },
  { name: 'Plano Academia', value: 178.2, color: '#ec4899' },
]

const PIZZA_MES: DadosPizza[] = [
  { name: 'Desbloqueios', value: 2140, color: '#6366f1' },
  { name: 'Carrossel', value: 980, color: '#f59e0b' },
  { name: 'Planos Empresas', value: 5800, color: '#10b981' },
  { name: 'Planos Profissionais', value: 1530, color: '#3b82f6' },
  { name: 'Plano Academia', value: 693, color: '#ec4899' },
]

const PIZZA_MAP: Record<FiltroPeriodo, DadosPizza[]> = {
  hoje: PIZZA_HOJE,
  semana: PIZZA_SEMANA,
  mes: PIZZA_MES,
}

export function useAdminGraficos() {
  const [filtroPizza, setFiltroPizza] = useState<FiltroPeriodo>('semana')

  const dadosSemanais = DADOS_SEMANAIS
  const dadosPizza = PIZZA_MAP[filtroPizza]

  const totalPizza = dadosPizza.reduce((acc, d) => acc + d.value, 0)
  const totalFaturamentoSemana = DADOS_SEMANAIS.reduce((acc, d) => acc + d.faturamento, 0)
  const totalBonusSemana = DADOS_SEMANAIS.reduce((acc, d) => acc + d.bonus, 0)

  return {
    dadosSemanais,
    dadosPizza,
    filtroPizza,
    setFiltroPizza,
    totalPizza,
    totalFaturamentoSemana,
    totalBonusSemana,
  }
}
