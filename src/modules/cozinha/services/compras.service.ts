// src/modules/cozinha/services/compras.service.ts
// ============================================
// SERVIÇO DE COMPRAS
// ============================================

import { supabase } from '@/lib/supabase/client'
import { Compra, CompraItem, CompraStats, CompraRequest } from '../types/compras.types'

export const comprasService = {
  // Listar compras
  async listar(): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Buscar por ID
  async buscarPorId(id: string): Promise<Compra | null> {
    const { data, error } = await supabase
      .from('compras')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Criar compra
  async criar(compra: Omit<Compra, 'id' | 'created_at' | 'updated_at'>): Promise<Compra> {
    const { data, error } = await supabase
      .from('compras')
      .insert([compra])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Atualizar compra
  async atualizar(id: string, updates: Partial<Compra>): Promise<Compra> {
    const { data, error } = await supabase
      .from('compras')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Deletar compra
  async deletar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('compras')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  },

  // Listar solicitações de compra
  async listarRequests(): Promise<CompraRequest[]> {
    const { data, error } = await supabase
      .from('compra_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Aprovar solicitação
  async aprovarRequest(id: string): Promise<CompraRequest> {
    const { data, error } = await supabase
      .from('compra_requests')
      .update({ status: 'aprovado' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Estatísticas
  async obterStats(): Promise<CompraStats> {
    const compras = await this.listar()
    
    return {
      totalCompras: compras.length,
      pendentes: compras.filter(c => c.status === 'pendente').length,
      aprovadas: compras.filter(c => c.status === 'aprovada').length,
      recebidas: compras.filter(c => c.status === 'recebida').length,
      totalGasto: compras.reduce((acc, c) => acc + (c.total || 0), 0),
      itensPendentes: compras.reduce((acc, c) => acc + (c.status === 'pendente' ? (c.itens || []).length : 0), 0)
    }
  }
}
