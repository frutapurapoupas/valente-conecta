// src/modules/cozinha/types/compras.types.ts
// ============================================
// TIPOS DEFINITIVOS - COMPRAS
// ============================================

export interface Compra {
  id: string
  fornecedorId: string
  fornecedorNome?: string
  data: string
  status: 'pendente' | 'aprovada' | 'recebida' | 'cancelada'
  total: number
  itens: CompraItem[]
  created_at: string
  updated_at: string
}

export interface CompraItem {
  id: string
  compraId: string
  produto: string
  quantidade: number
  unidade: string
  precoUnitario: number
  total: number
  prioridade: 'alta' | 'media' | 'baixa'
  comprado: boolean
  fornecedor?: string
}

export interface CompraRequest {
  id: string
  receitaId: string
  receitaNome: string
  ingredientes: CompraRequestItem[]
  quantidadeProduzir: number
  status: 'pendente' | 'aprovado' | 'rejeitado'
  createdAt: string
  updatedAt: string
}

export interface CompraRequestItem {
  ingredientId: string
  ingredientName: string
  quantidade: number
  unit: string
  price: number
}

export interface CompraStats {
  totalCompras: number
  pendentes: number
  aprovadas: number
  recebidas: number
  totalGasto: number
  itensPendentes: number
}

export type CompraStatus = 'pendente' | 'aprovada' | 'recebida' | 'cancelada'
