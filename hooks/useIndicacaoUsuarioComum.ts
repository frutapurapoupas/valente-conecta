import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { isMockMode } from '@/lib/supabase-client-switch'

interface IndicacaoUsuarioComum {
  id: string
  indicadorId: string
  indicadoId: string
  whatsapp: string
  dataIndicacao: string
  dataValidacao?: string
  validado: boolean
  usado: boolean
  lojaIdUsado?: string
  dataUso?: string
}

interface CreditoBonus {
  id: string
  usuarioId: string
  valor: number
  dataGeracao: string
  dataResgate?: string
  lojaIdResgate?: string
  status: 'disponivel' | 'resgatado' | 'pendente'
}

export function useIndicacaoUsuarioComum() {
  const [loading, setLoading] = useState(false)
  const [indicacoes, setIndicacoes] = useState<IndicacaoUsuarioComum[]>([])
  const [creditos, setCreditos] = useState<CreditoBonus[]>([])
  const [configuracao, setConfiguracao] = useState({
    bonusPorIndicacao: 2,
    indicacoesNecessarias: 10
  })

  useEffect(() => {
    loadConfiguracao()
  }, [])

  const loadConfiguracao = async () => {
    try {
      if (isMockMode()) {
        setConfiguracao({
          bonusPorIndicacao: 2,
          indicacoesNecessarias: 10
        })
        return
      }

      const { data, error } = await supabase
        .from('bonus_configuracoes')
        .select('*')
        .eq('modulo', 'usuario_comum')
        .single()

      if (error) throw error

      if (data) {
        setConfiguracao({
          bonusPorIndicacao: data.bonus_por_indicacao,
          indicacoesNecessarias: data.indicacoes_necessarias
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
    }
  }

  const criarIndicacao = async (
    indicadorId: string,
    indicadoId: string,
    whatsapp: string
  ): Promise<IndicacaoUsuarioComum> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        const novaIndicacao: IndicacaoUsuarioComum = {
          id: `mock-${Date.now()}`,
          indicadorId,
          indicadoId,
          whatsapp,
          dataIndicacao: new Date().toISOString(),
          validado: false,
          usado: false
        }
        return novaIndicacao
      }

      const { data, error } = await supabase
        .from('indicacoes_usuarios_comuns')
        .insert({
          indicador_id: indicadorId,
          indicado_id: indicadoId,
          whatsapp,
          data_indicacao: new Date().toISOString(),
          validado: false,
          usado: false
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        indicadorId: data.indicador_id,
        indicadoId: data.indicado_id,
        whatsapp: data.whatsapp,
        dataIndicacao: data.data_indicacao,
        dataValidacao: data.data_validacao,
        validado: data.validado,
        usado: data.usado,
        lojaIdUsado: data.loja_id_usado,
        dataUso: data.data_uso
      }
    } catch (error) {
      console.error('Erro ao criar indicação:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const validarIndicacao = async (
    indicacaoId: string,
    codigoValidacao: string
  ): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Validando indicação', indicacaoId, codigoValidacao)
        return
      }

      // Atualizar indicação como validada
      const { error: updateError } = await supabase
        .from('indicacoes_usuarios_comuns')
        .update({
          validado: true,
          data_validacao: new Date().toISOString()
        })
        .eq('id', indicacaoId)

      if (updateError) throw updateError

      // Buscar a indicação atualizada
      const { data: indicacao, error: fetchError } = await supabase
        .from('indicacoes_usuarios_comuns')
        .select('*')
        .eq('id', indicacaoId)
        .single()

      if (fetchError) throw fetchError

      // Buscar indicações validadas do indicador
      const { data: indicacoesValidadas, error: countError } = await supabase
        .from('indicacoes_usuarios_comuns')
        .select('id')
        .eq('indicador_id', indicacao.indicador_id)
        .eq('validado', true)

      if (countError) throw countError

      const totalValidadas = indicacoesValidadas?.length || 0

      // Verificar se atingiu o número necessário para gerar crédito
      if (totalValidadas >= configuracao.indicacoesNecessarias) {
        // Calcular quantos créditos completos foram gerados
        const creditosCompletos = Math.floor(totalValidadas / configuracao.indicacoesNecessarias)
        
        // Verificar quantos créditos já foram gerados
        const { data: creditosExistentes, error: creditosError } = await supabase
          .from('creditos_bonus_usuario_comum')
          .select('id')
          .eq('usuario_id', indicacao.indicador_id)

        if (creditosError) throw creditosError

        const creditosJaGerados = creditosExistentes?.length || 0
        const creditosNovos = creditosCompletos - creditosJaGerados

        // Gerar novos créditos se necessário
        for (let i = 0; i < creditosNovos; i++) {
          await supabase
            .from('creditos_bonus_usuario_comum')
            .insert({
              usuario_id: indicacao.indicador_id,
              valor: configuracao.bonusPorIndicacao,
              data_geracao: new Date().toISOString(),
              status: 'disponivel'
            })
        }
      }
    } catch (error) {
      console.error('Erro ao validar indicação:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const usarCreditoEmLoja = async (
    creditoId: string,
    lojaId: string
  ): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Usando crédito em loja', creditoId, lojaId)
        return
      }

      // Atualizar crédito como usado
      const { error } = await supabase
        .from('creditos_bonus_usuario_comum')
        .update({
          status: 'resgatado',
          data_resgate: new Date().toISOString(),
          loja_id_resgate: lojaId
        })
        .eq('id', creditoId)

      if (error) throw error

      // Enviar notificação para o lojista
      await supabase
        .from('notifications')
        .insert({
          type: 'credito_bonus_recebido',
          title: 'Crédito de Bônus Recebido',
          message: `Você recebeu R$ ${configuracao.bonusPorIndicacao.toFixed(2)} como pagamento via bônus de indicação`,
          user_id: lojaId,
          data: {
            credito_id: creditoId,
            valor: configuracao.bonusPorIndicacao
          }
        })
    } catch (error) {
      console.error('Erro ao usar crédito:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const marcarParaResgateMensal = async (
    creditoId: string,
    lojaId: string
  ): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Marcando crédito para resgate mensal', creditoId, lojaId)
        return
      }

      // Marcar crédito como pendente de resgate
      const { error } = await supabase
        .from('creditos_bonus_usuario_comum')
        .update({
          status: 'pendente',
          loja_id_resgate: lojaId
        })
        .eq('id', creditoId)

      if (error) throw error

      // Enviar notificação para o lojista
      await supabase
        .from('notifications')
        .insert({
          type: 'credito_bonus_pendente',
          title: 'Crédito de Bônus Pendente',
          message: `Crédito de R$ ${configuracao.bonusPorIndicacao.toFixed(2)} marcado para resgate no final do mês`,
          user_id: lojaId,
          data: {
            credito_id: creditoId,
            valor: configuracao.bonusPorIndicacao
          }
        })
    } catch (error) {
      console.error('Erro ao marcar para resgate:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getIndicacoesByUsuario = async (usuarioId: string): Promise<IndicacaoUsuarioComum[]> => {
    try {
      if (isMockMode()) {
        return []
      }

      const { data, error } = await supabase
        .from('indicacoes_usuarios_comuns')
        .select('*')
        .eq('indicador_id', usuarioId)
        .order('data_indicacao', { ascending: false })

      if (error) throw error

      return (data || []).map(item => ({
        id: item.id,
        indicadorId: item.indicador_id,
        indicadoId: item.indicado_id,
        whatsapp: item.whatsapp,
        dataIndicacao: item.data_indicacao,
        dataValidacao: item.data_validacao,
        validado: item.validado,
        usado: item.usado,
        lojaIdUsado: item.loja_id_usado,
        dataUso: item.data_uso
      }))
    } catch (error) {
      console.error('Erro ao buscar indicações:', error)
      return []
    }
  }

  const getCreditosByUsuario = async (usuarioId: string): Promise<CreditoBonus[]> => {
    try {
      if (isMockMode()) {
        return []
      }

      const { data, error } = await supabase
        .from('creditos_bonus_usuario_comum')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('data_geracao', { ascending: false })

      if (error) throw error

      return (data || []).map(item => ({
        id: item.id,
        usuarioId: item.usuario_id,
        valor: item.valor,
        dataGeracao: item.data_geracao,
        dataResgate: item.data_resgate,
        lojaIdResgate: item.loja_id_resgate,
        status: item.status
      }))
    } catch (error) {
      console.error('Erro ao buscar créditos:', error)
      return []
    }
  }

  const getProgresso = async (usuarioId: string): Promise<{
    indicacoesValidadas: number
    indicacoesNecessarias: number
    creditosDisponiveis: number
    proximoCreditoEm: number
  }> => {
    try {
      if (isMockMode()) {
        return {
          indicacoesValidadas: 0,
          indicacoesNecessarias: configuracao.indicacoesNecessarias,
          creditosDisponiveis: 0,
          proximoCreditoEm: configuracao.indicacoesNecessarias
        }
      }

      const { data: indicacoes, error: indicacoesError } = await supabase
        .from('indicacoes_usuarios_comuns')
        .select('id')
        .eq('indicador_id', usuarioId)
        .eq('validado', true)

      if (indicacoesError) throw indicacoesError

      const { data: creditos, error: creditosError } = await supabase
        .from('creditos_bonus_usuario_comum')
        .select('id, status')
        .eq('usuario_id', usuarioId)
        .eq('status', 'disponivel')

      if (creditosError) throw creditosError

      const indicacoesValidadas = indicacoes?.length || 0
      const creditosDisponiveis = creditos?.length || 0
      const indicacoesNecessarias = configuracao.indicacoesNecessarias
      const proximoCreditoEm = indicacoesNecessarias - (indicacoesValidadas % indicacoesNecessarias)

      return {
        indicacoesValidadas,
        indicacoesNecessarias,
        creditosDisponiveis,
        proximoCreditoEm
      }
    } catch (error) {
      console.error('Erro ao buscar progresso:', error)
      return {
        indicacoesValidadas: 0,
        indicacoesNecessarias: configuracao.indicacoesNecessarias,
        creditosDisponiveis: 0,
        proximoCreditoEm: configuracao.indicacoesNecessarias
      }
    }
  }

  return {
    loading,
    indicacoes,
    creditos,
    configuracao,
    criarIndicacao,
    validarIndicacao,
    usarCreditoEmLoja,
    marcarParaResgateMensal,
    getIndicacoesByUsuario,
    getCreditosByUsuario,
    getProgresso
  }
}
