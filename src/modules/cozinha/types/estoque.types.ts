// src/modules/cozinha/types/estoque.types.ts
// ============================================
// TIPOS DEFINITIVOS - ESTOQUE
// ============================================

export interface EstoqueItem {
  id: string
  produto: string
  categoria: string
  quantidade: number
  unidade: string
  estoque_minimo: number
  estoque_maximo: number
  localizacao: string
  preco_unitario: number
  valor_total: number
  ultima_atualizacao: string
  created_at: string
  updated_at: string
}

export interface MovimentacaoEstoque {
  id: string
  ingredienteId: string
  ingredienteNome: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  quantidadeAnterior: number
  quantidadeNova: number
  motivo: string
  usuarioId: string
  usuarioNome?: string
  created_at: string
}

export interface EstoqueResumo {
  ingredienteId: string
  ingredienteNome: string
  quantidadeAtual: number
  estoqueMinimo: number
  status: 'ok' | 'baixo' | 'critico'
  valorTotal: number
}

export interface EstoqueStats {
  totalItens: number
  totalValor: number
  itensBaixos: number
  itensCriticos: number
  movimentacoesHoje: number
}

export type EstoqueStatus = 'ok' | 'baixo' | 'critico'
