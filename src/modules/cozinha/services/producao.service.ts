// src/modules/cozinha/services/producao.service.ts
// ============================================
// SERVIÇO DE PRODUÇÃO
// ============================================

import { supabase } from '@/lib/supabase/client'
import { Producao, ProducaoInput, ProducaoStats } from '../types/producao.types'

export const producaoService = {
  // Listar todas as produções
  async listar(): Promise<Producao[]> {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .order('data_producao', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Buscar por ID
  async buscarPorId(id: string): Promise<Producao | null> {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Buscar por receita
  async buscarPorReceita(receitaId: string): Promise<Producao[]> {
    const { data, error } = await supabase
      .from('producao')
      .select('*')
      .eq('receitaId', receitaId)
      .order('data_producao', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Criar produção
  async criar(input: ProducaoInput): Promise<Producao> {
    const { data, error } = await supabase
      .from('producao')
      .insert([{
        receitaId: input.receitaId,
        quantidadePrevista: input.quantidadePrevista,
        quantidadeProduzida: 0,
        dataProducao: input.dataProducao || new Date().toISOString().split('T')[0],
        responsavel: input.responsavel || '',
        observacao: input.observacao || '',
        status: 'planejado'
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Atualizar produção
  async atualizar(id: string, updates: Partial<Producao>): Promise<Producao> {
    const { data, error } = await supabase
      .from('producao')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Atualizar status
  async atualizarStatus(id: string, status: Producao['status']): Promise<Producao> {
    return this.atualizar(id, { status })
  },

  // Registrar produção concluída
  async concluirProducao(id: string, quantidadeProduzida: number): Promise<Producao> {
    return this.atualizar(id, {
      quantidadeProduzida,
      status: 'concluido'
    })
  },

  // Deletar produção
  async deletar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('producao')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return true
  },

  // Estatísticas
  async obterStats(): Promise<ProducaoStats> {
    const producoes = await this.listar()
    
    const planejadas = producoes.filter(p => p.status === 'planejado')
    const emProducao = producoes.filter(p => p.status === 'em_producao')
    const concluidas = producoes.filter(p => p.status === 'concluido')
    
    return {
      totalProducoes: producoes.length,
      emProducao: emProducao.length,
      concluidas: concluidas.length,
      planejadas: planejadas.length,
      taxaConclusao: producoes.length > 0 ? (concluidas.length / producoes.length) * 100 : 0,
      custoTotal: producoes.reduce((acc, p) => acc + (p.custoTotal || 0), 0),
      totalProduzido: concluidas.reduce((acc, p) => acc + p.quantidadeProduzida, 0)
    }
  }
}
