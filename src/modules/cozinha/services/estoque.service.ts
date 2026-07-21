// src/modules/cozinha/services/estoque.service.ts
// ============================================
// SERVIÇO DE ESTOQUE
// ============================================

import { supabase } from '@/lib/supabase/client'
import { EstoqueItem, MovimentacaoEstoque, EstoqueResumo, EstoqueStats } from '../types/estoque.types'

export const estoqueService = {
  // Listar todos os itens
  async listar(): Promise<EstoqueItem[]> {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('produto', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Buscar por ID
  async buscarPorId(id: string): Promise<EstoqueItem | null> {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Criar item
  async criar(item: Omit<EstoqueItem, 'id' | 'created_at' | 'updated_at'>): Promise<EstoqueItem> {
    const { data, error } = await supabase
      .from('estoque')
      .insert([item])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Atualizar item
  async atualizar(id: string, updates: Partial<EstoqueItem>): Promise<EstoqueItem> {
    const { data, error } = await supabase
      .from('estoque')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Deletar item
  async deletar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('estoque')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  },

  // Listar movimentações
  async listarMovimentacoes(ingredienteId?: string): Promise<MovimentacaoEstoque[]> {
    let query = supabase.from('movimentacoes_estoque').select('*')
    
    if (ingredienteId) {
      query = query.eq('ingredienteId', ingredienteId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Registrar entrada
  async registrarEntrada(
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ): Promise<MovimentacaoEstoque> {
    // Buscar item atual
    const item = await this.buscarPorId(ingredienteId)
    if (!item) throw new Error('Item não encontrado')

    const quantidadeAnterior = item.quantidade
    const quantidadeNova = quantidadeAnterior + quantidade

    // Registrar movimentação
    const { data: mov, error: movError } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        ingredienteId,
        ingredienteNome: item.produto,
        tipo: 'entrada',
        quantidade,
        quantidadeAnterior,
        quantidadeNova,
        motivo,
        usuarioId
      }])
      .select()
      .single()

    if (movError) throw new Error(movError.message)

    // Atualizar estoque
    await this.atualizar(ingredienteId, {
      quantidade: quantidadeNova,
      ultima_atualizacao: new Date().toISOString()
    })

    return mov
  },

  // Registrar saída
  async registrarSaida(
    ingredienteId: string,
    quantidade: number,
    motivo: string,
    usuarioId: string
  ): Promise<MovimentacaoEstoque> {
    const item = await this.buscarPorId(ingredienteId)
    if (!item) throw new Error('Item não encontrado')

    if (item.quantidade < quantidade) {
      throw new Error('Estoque insuficiente')
    }

    const quantidadeAnterior = item.quantidade
    const quantidadeNova = quantidadeAnterior - quantidade

    const { data: mov, error: movError } = await supabase
      .from('movimentacoes_estoque')
      .insert([{
        ingredienteId,
        ingredienteNome: item.produto,
        tipo: 'saida',
        quantidade,
        quantidadeAnterior,
        quantidadeNova,
        motivo,
        usuarioId
      }])
      .select()
      .single()

    if (movError) throw new Error(movError.message)

    await this.atualizar(ingredienteId, {
      quantidade: quantidadeNova,
      ultima_atualizacao: new Date().toISOString()
    })

    return mov
  },

  // Buscar resumo
  async buscarResumo(): Promise<EstoqueResumo[]> {
    const items = await this.listar()
    
    return items.map(item => ({
      ingredienteId: item.id,
      ingredienteNome: item.produto,
      quantidadeAtual: item.quantidade,
      estoqueMinimo: item.estoque_minimo || 0,
      status: item.quantidade <= (item.estoque_minimo || 0) / 2 ? 'critico' :
              item.quantidade <= (item.estoque_minimo || 0) ? 'baixo' : 'ok',
      valorTotal: item.quantidade * (item.preco_unitario || 0)
    }))
  },

  // Alertas de estoque baixo
  async alertasEstoqueBaixo(): Promise<EstoqueResumo[]> {
    const resumo = await this.buscarResumo()
    return resumo.filter(item => item.status === 'baixo' || item.status === 'critico')
  },

  // Estatísticas
  async obterStats(): Promise<EstoqueStats> {
    const items = await this.listar()
    const hoje = new Date().toISOString().split('T')[0]
    
    const movimentacoesHoje = await this.listarMovimentacoes()
    const movHoje = movimentacoesHoje.filter(m => m.created_at.startsWith(hoje))

    return {
      totalItens: items.length,
      totalValor: items.reduce((acc, item) => acc + (item.quantidade * (item.preco_unitario || 0)), 0),
      itensBaixos: items.filter(item => item.quantidade <= (item.estoque_minimo || 0)).length,
      itensCriticos: items.filter(item => item.quantidade <= (item.estoque_minimo || 0) / 2).length,
      movimentacoesHoje: movHoje.length
    }
  }
}
