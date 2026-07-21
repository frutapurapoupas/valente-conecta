// src/modules/cozinha/types/cozinha.types.ts
// ============================================
// TIPOS DEFINITIVOS DO MÓDULO COZINHA
// ============================================

export interface Ingrediente {
  id: string
  nome: string
  unidade: string
  precoUnitario: number
  quantidadeEstoque: number
  fornecedorId?: string
}

export interface IngredienteReceita {
  ingredienteId: string
  nome: string
  quantidade: number
  unidade: string
  precoUnitario: number
  subtotal: number
  percentual: number
  fornecedor: string
  estoque: number
}

export interface Receita {
  id: string
  nome: string
  codigo: string
  status: 'rascunho' | 'ativa' | 'inativa'
  ingredientes: IngredienteReceita[]
  custoTotal: number
  precoSugerido: number
  margem: number
  cmv: number
  pesoTotal: number
  porcoes: number
  tempoPreparo: number
  modoPreparo: string
  fotoUrl?: string
  informacoesNutricionais?: {
    calorias: number
    proteinas: number
    carboidratos: number
    gorduras: number
  }
  embalagem?: {
    tipo: string
    custo: number
  }
  historico: {
    data: Date
    acao: string
    usuario: string
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface Estoque {
  id: string
  ingredienteId: string
  quantidade: number
  unidade: string
  localizacao: string
  dataValidade?: Date
}

export interface Producao {
  id: string
  receitaId: string
  data: Date
  quantidade: number
  status: 'agendado' | 'em_producao' | 'concluido'
  responsavel: string
}

export interface Pedido {
  id: string
  cliente: string
  itens: {
    receitaId: string
    quantidade: number
    precoUnitario: number
  }[]
  total: number
  status: 'pendente' | 'confirmado' | 'entregue' | 'cancelado'
  data: Date
}

export interface Fornecedor {
  id: string
  nome: string
  contato: string
  telefone: string
  email: string
  produtos: string[]
}

export interface Compra {
  id: string
  fornecedorId: string
  itens: {
    ingredienteId: string
    quantidade: number
    preco: number
  }[]
  total: number
  status: 'solicitado' | 'aprovado' | 'recebido'
  data: Date
}

export interface Financeiro {
  id: string
  receitaId: string
  receita: number
  custo: number
  lucro: number
  margem: number
  data: Date
}

export type StatusReceita = 'rascunho' | 'ativa' | 'inativa'
export type StatusPedido = 'pendente' | 'confirmado' | 'entregue' | 'cancelado'
export type StatusProducao = 'agendado' | 'em_producao' | 'concluido'
export type StatusCompra = 'solicitado' | 'aprovado' | 'recebido'
