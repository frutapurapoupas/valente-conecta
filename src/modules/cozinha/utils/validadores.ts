// src/modules/cozinha/utils/validadores.ts
// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

import { Receita, IngredienteReceita } from '../types/cozinha.types'

export const validarReceita = (receita: Partial<Receita>): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!receita.nome || receita.nome.trim() === '') {
    errors.push('Nome da receita é obrigatório')
  }
  
  if (!receita.ingredientes || receita.ingredientes.length === 0) {
    errors.push('Adicione pelo menos um ingrediente')
  }
  
  if (receita.ingredientes) {
    receita.ingredientes.forEach((item, index) => {
      if (!item.nome || item.nome.trim() === '') {
        errors.push(Ingrediente : nome é obrigatório)
      }
      if (item.quantidade <= 0) {
        errors.push(Ingrediente : quantidade deve ser maior que zero)
      }
      if (item.precoUnitario < 0) {
        errors.push(Ingrediente : preço não pode ser negativo)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export const validarEstoque = (quantidade: number): boolean => {
  return quantidade >= 0
}

export const validarPreco = (preco: number): boolean => {
  return preco >= 0
}

export const validarQuantidade = (quantidade: number): boolean => {
  return quantidade > 0
}
