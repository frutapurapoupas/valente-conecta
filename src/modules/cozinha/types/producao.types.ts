// src/modules/cozinha/types/producao.types.ts
// ============================================
// TIPOS DEFINITIVOS - PRODUCAO
// ============================================

export interface Producao {
  id: string
  receitaId: string
  receitaNome?: string
  dataProducao: string
  quantidadePrevista: number
  quantidadeProduzida: number
  ingredientesUtilizados: ProducaoIngrediente[]
  custoTotal: number
  status: 'planejado' | 'em_producao' | 'concluido' | 'cancelado'
  responsavel?: string
  observacao?: string
  created_at: string
  updated_at: string
}

export interface ProducaoIngrediente {
  ingredienteId: string
  ingredienteNome: string
  quantidadeNecessaria: number
  quantidadeUtilizada: number
  unidade: string
  custoUnitario: number
  custoTotal: number
}

export interface ProducaoInput {
  receitaId: string
  quantidadePrevista: number
  dataProducao?: string
  responsavel?: string
  observacao?: string
}

export interface ProducaoStats {
  totalProducoes: number
  emProducao: number
  concluidas: number
  planejadas: number
  taxaConclusao: number
  custoTotal: number
  totalProduzido: number
}

export type ProducaoStatus = 'planejado' | 'em_producao' | 'concluido' | 'cancelado'
