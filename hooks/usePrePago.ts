import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isMockMode } from '@/lib/supabase-client-switch'

export function usePrePago() {
  const [loading, setLoading] = useState(false)
  const [periodoPrePago, setPeriodoPrePago] = useState(15)

  const getPeriodoPrePago = async (): Promise<number> => {
    try {
      if (isMockMode()) {
        return 15
      }

      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'periodo_pre_pago')
        .single()

      if (error) throw error

      return parseInt(data?.valor || '15')
    } catch (error) {
      console.error('Erro ao buscar período pré-pago:', error)
      return 15
    }
  }

  const verificarExpiracaoPlanos = async (): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Verificando expiração de planos pré-pagos')
        return
      }

      const periodo = await getPeriodoPrePago()
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - periodo)

      // Buscar planos pré-pagos com pagamento pendente
      const { data: planos, error } = await supabase
        .from('planos_usuario')
        .select('*')
        .eq('is_pre_pago', true)
        .eq('pagamento->>status', 'aguardando_pagamento')
        .eq('status', 'ativo')
        .lt('data_inicio', dataLimite.toISOString())

      if (error) throw error

      // Bloquear planos expirados
      for (const plano of planos || []) {
        await bloquearPlanoPorExpiracao(plano.id, plano.usuario_id)
      }
    } catch (error) {
      console.error('Erro ao verificar expiração de planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const bloquearPlanoPorExpiracao = async (planoId: string, usuarioId: string): Promise<void> => {
    try {
      // Bloquear o plano
      await supabase
        .from('planos_usuario')
        .update({
          status: 'expirado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', planoId)

      // Buscar dados do usuário para notificação
      const { data: usuario } = await supabase
        .from('users')
        .select('nome, email, telefone')
        .eq('id', usuarioId)
        .single()

      // Enviar notificação push
      await enviarNotificacaoBloqueio(usuarioId, usuario?.nome, planoId)
    } catch (error) {
      console.error('Erro ao bloquear plano por expiração:', error)
    }
  }

  const enviarNotificacaoBloqueio = async (
    usuarioId: string,
    nomeUsuario?: string,
    planoId?: string
  ): Promise<void> => {
    try {
      if (isMockMode()) {
        console.log('Mock: Enviando notificação de bloqueio para', nomeUsuario)
        return
      }

      // Inserir notificação no banco
      await supabase
        .from('notificacoes')
        .insert({
          usuario_id: usuarioId,
          tipo: 'bloqueio_plano',
          titulo: 'Plano Bloqueado',
          mensagem: `Seu plano foi bloqueado devido à falta de pagamento dentro do período permitido. Entre em contato para regularizar.`,
          data_envio: new Date().toISOString(),
          lida: false,
        })

      // Aqui seria integrado com serviço de push notifications (OneSignal, Firebase, etc)
      // Por enquanto, apenas registramos no banco
      console.log('Notificação de bloqueio enviada para usuário:', usuarioId)
    } catch (error) {
      console.error('Erro ao enviar notificação de bloqueio:', error)
    }
  }

  const getDiasRestantes = (dataInicio: string): number => {
    const inicio = new Date(dataInicio)
    const agora = new Date()
    const diffMs = agora.getTime() - inicio.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return periodoPrePago - diffDias
  }

  const getStatusPrePago = (dataInicio: string, statusPagamento: string): {
    diasRestantes: number
    estaExpirado: boolean
    status: 'em_dia' | 'aviso' | 'expirado'
  } => {
    const diasRestantes = getDiasRestantes(dataInicio)
    
    if (statusPagamento === 'pago') {
      return {
        diasRestantes: 0,
        estaExpirado: false,
        status: 'em_dia',
      }
    }

    if (diasRestantes <= 0) {
      return {
        diasRestantes: 0,
        estaExpirado: true,
        status: 'expirado',
      }
    }

    if (diasRestantes <= 3) {
      return {
        diasRestantes,
        estaExpirado: false,
        status: 'aviso',
      }
    }

    return {
      diasRestantes,
      estaExpirado: false,
      status: 'em_dia',
    }
  }

  const confirmarPagamentoPrePago = async (planoId: string): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode()) {
        console.log('Mock: Confirmando pagamento pré-pago', planoId)
        return
      }

      await supabase
        .from('planos_usuario')
        .update({
          'pagamento->>status': 'pago',
          'pagamento->>data_pagamento': new Date().toISOString(),
          data_expiracao: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planoId)
    } catch (error) {
      console.error('Erro ao confirmar pagamento pré-pago:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPeriodoPrePago().then(setPeriodoPrePago)
  }, [])

  return {
    loading,
    periodoPrePago,
    verificarExpiracaoPlanos,
    bloquearPlanoPorExpiracao,
    enviarNotificacaoBloqueio,
    getDiasRestantes,
    getStatusPrePago,
    confirmarPagamentoPrePago,
  }
}
