import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isMockMode } from '@/lib/supabase-client-switch'

interface Indicacao {
  id: string
  indicadorId: string
  indicadoId: string
  dataIndicacao: string
  status: 'pendente' | 'confirmada' | 'paga' | 'cancelada'
  planoAdquirido?: string
  valorPlano?: number
  bonusGerado?: number
}

interface ConfiguracaoBonus {
  modulo: string
  bonusPorIndicacao: number
  indicacoesNecessarias: number
  ativo: boolean
}

export function useIndicacoes() {
  const [loading, setLoading] = useState(false)
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([])
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>([])

  useEffect(() => {
    loadConfiguracoes()
  }, [])

  const loadConfiguracoes = async () => {
    try {
      if (isMockMode()) {
        // Mock data - Sistema unificado de bônus por módulo
        setConfiguracoes([
          { modulo: 'ambulante', bonusPorIndicacao: 10, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'academia', bonusPorIndicacao: 5, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'profissional', bonusPorIndicacao: 5, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'servico', bonusPorIndicacao: 5, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'cidade', bonusPorIndicacao: 10, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'empresa', bonusPorIndicacao: 10, indicacoesNecessarias: 3, ativo: true },
          { modulo: 'imovel_alugar', bonusPorIndicacao: 5, indicacoesNecessarias: 2, ativo: true },
          { modulo: 'imovel_vender', bonusPorIndicacao: 10, indicacoesNecessarias: 2, ativo: true },
          { modulo: 'transporte_delivery', bonusPorIndicacao: 5, indicacoesNecessarias: 4, ativo: true },
          { modulo: 'usuario_comum', bonusPorIndicacao: 2, indicacoesNecessarias: 10, ativo: true },
        ])
        return
      }

      const { data, error } = await supabase
        .from('bonus_configuracoes')
        .select('*')

      if (error) throw error

      setConfiguracoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar configurações de bônus:', error)
    }
  }

  const criarIndicacao = async (
    indicadorId: string,
    indicadoId: string,
    modulo: string
  ): Promise<Indicacao> => {
    setLoading(true)
    try {
      const config = configuracoes.find(c => c.modulo === modulo && c.ativo)
      
      if (!config) {
        throw new Error('Configuração de bônus não encontrada para este módulo')
      }

      if (isMockMode()) {
        const novaIndicacao: Indicacao = {
          id: `mock-${Date.now()}`,
          indicadorId,
          indicadoId,
          dataIndicacao: new Date().toISOString(),
          status: 'pendente',
        }
        return novaIndicacao
      }

      const { data, error } = await supabase
        .from('indicacoes')
        .insert({
          indicador_id: indicadorId,
          indicado_id: indicadoId,
          modulo,
          status: 'pendente',
          data_indicacao: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        indicadorId: data.indicador_id,
        indicadoId: data.indicado_id,
        dataIndicacao: data.data_indicacao,
        status: data.status,
        planoAdquirido: data.plano_adquirido,
        valorPlano: data.valor_plano,
        bonusGerado: data.bonus_gerado,
      }
    } catch (error) {
      console.error('Erro ao criar indicação:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const confirmarIndicacao = async (
    indicacaoId: string,
    planoAdquirido: string,
    valorPlano: number
  ): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Confirmando indicação', indicacaoId, planoAdquirido, valorPlano)
        return
      }

      // Buscar a indicação
      const { data: indicacao, error: indicacaoError } = await supabase
        .from('indicacoes')
        .select('*')
        .eq('id', indicacaoId)
        .single()

      if (indicacaoError) throw indicacaoError

      // Buscar configuração do módulo
      const config = configuracoes.find(c => c.modulo === indicacao.modulo)
      if (!config) throw new Error('Configuração não encontrada')

      // Calcular bônus
      const bonusGerado = config.bonusPorIndicacao

      // Atualizar indicação
      await supabase
        .from('indicacoes')
        .update({
          status: 'confirmada',
          plano_adquirido: planoAdquirido,
          valor_plano: valorPlano,
          bonus_gerado: bonusGerado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', indicacaoId)

      // Buscar indicações confirmadas do indicador
      const { data: indicacoesConfirmadas, error: countError } = await supabase
        .from('indicacoes')
        .select('id')
        .eq('indicador_id', indicacao.indicador_id)
        .in('status', ['confirmada', 'paga'])

      if (countError) throw countError

      const totalIndicacoes = indicacoesConfirmadas?.length || 0

      // Verificar se atingiu o número necessário para liberar bônus
      if (totalIndicacoes >= config.indicacoesNecessarias) {
        // Calcular bônus total disponível
        const bonusTotal = totalIndicacoes * config.bonusPorIndicacao

        // Atualizar usuário com bônus
        await supabase
          .from('users')
          .update({
            bonus_acumulado: bonusTotal,
            bonus_disponivel: bonusTotal,
            indicacoes: totalIndicacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', indicacao.indicador_id)

        // Marcar indicações como pagas
        await supabase
          .from('indicacoes')
          .update({ status: 'paga' })
          .eq('indicador_id', indicacao.indicador_id)
          .in('status', ['confirmada'])
      } else {
        // Apenas atualizar contador
        await supabase
          .from('users')
          .update({
            indicacoes: totalIndicacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', indicacao.indicador_id)
      }
    } catch (error) {
      console.error('Erro ao confirmar indicação:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getIndicacoesByUsuario = async (usuarioId: string): Promise<Indicacao[]> => {
    try {
      if (isMockMode()) {
        return []
      }

      const { data, error } = await supabase
        .from('indicacoes')
        .select('*')
        .eq('indicador_id', usuarioId)
        .order('data_indicacao', { ascending: false })

      if (error) throw error

      return (data || []).map(item => ({
        id: item.id,
        indicadorId: item.indicador_id,
        indicadoId: item.indicado_id,
        dataIndicacao: item.data_indicacao,
        status: item.status,
        planoAdquirido: item.plano_adquirido,
        valorPlano: item.valor_plano,
        bonusGerado: item.bonus_gerado,
      }))
    } catch (error) {
      console.error('Erro ao buscar indicações:', error)
      return []
    }
  }

  const getBonusDisponivel = async (usuarioId: string): Promise<number> => {
    try {
      if (isMockMode()) {
        return 0
      }

      const { data, error } = await supabase
        .from('users')
        .select('bonus_disponivel')
        .eq('id', usuarioId)
        .single()

      if (error) throw error

      return data?.bonus_disponivel || 0
    } catch (error) {
      console.error('Erro ao buscar bônus disponível:', error)
      return 0
    }
  }

  const getProgressoBonus = async (usuarioId: string, modulo: string): Promise<{
    indicacoesConfirmadas: number
    indicacoesNecessarias: number
    bonusAcumulado: number
    bonusTotal: number
    podeSacar: boolean
  }> => {
    try {
      const config = configuracoes.find(c => c.modulo === modulo && c.ativo)
      
      if (!config) {
        return {
          indicacoesConfirmadas: 0,
          indicacoesNecessarias: 0,
          bonusAcumulado: 0,
          bonusTotal: 0,
          podeSacar: false,
        }
      }

      if (isMockMode()) {
        return {
          indicacoesConfirmadas: 0,
          indicacoesNecessarias: config.indicacoesNecessarias,
          bonusAcumulado: 0,
          bonusTotal: config.bonusPorIndicacao * config.indicacoesNecessarias,
          podeSacar: false,
        }
      }

      const { data: indicacoes, error } = await supabase
        .from('indicacoes')
        .select('id, status')
        .eq('indicador_id', usuarioId)
        .in('status', ['confirmada', 'paga'])

      if (error) throw error

      const indicacoesConfirmadas = indicacoes?.length || 0
      const bonusAcumulado = indicacoesConfirmadas * config.bonusPorIndicacao
      const bonusTotal = config.bonusPorIndicacao * config.indicacoesNecessarias
      const podeSacar = indicacoesConfirmadas >= config.indicacoesNecessarias

      return {
        indicacoesConfirmadas,
        indicacoesNecessarias: config.indicacoesNecessarias,
        bonusAcumulado,
        bonusTotal,
        podeSacar,
      }
    } catch (error) {
      console.error('Erro ao buscar progresso de bônus:', error)
      return {
        indicacoesConfirmadas: 0,
        indicacoesNecessarias: 0,
        bonusAcumulado: 0,
        bonusTotal: 0,
        podeSacar: false,
      }
    }
  }

  return {
    loading,
    indicacoes,
    configuracoes,
    criarIndicacao,
    confirmarIndicacao,
    getIndicacoesByUsuario,
    getBonusDisponivel,
    getProgressoBonus,
  }
}
