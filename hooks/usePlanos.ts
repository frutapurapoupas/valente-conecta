'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client-switch'
import { isMockMode } from '@/lib/supabase-client-switch'
import { MOCK_DATA } from '@/lib/mock/mock-data'
import { useAuth } from './useAuth'
import { 
  TipoPlano, 
  CategoriaPlano, 
  ConfiguracaoPlano, 
  PlanoUsuario, 
  DadosPlanoConfiguravel,
  CONFIGURACOES_PLANOS_INICIAIS,
  PRECOS_CONFIGURAVEIS_INICIAIS,
  getPlanoPorTipo,
  getPlanosPorCategoria,
  isPlanoGestao,
  isPlanoAcademia
} from '@/types/planos'

export function usePlanos(usuarioId?: string) {
  const { updateUser } = useAuth()
  const [planosUsuario, setPlanosUsuario] = useState<PlanoUsuario[]>([])
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoPlano[]>(CONFIGURACOES_PLANOS_INICIAIS)
  const [precosConfiguraveis, setPrecosConfiguraveis] = useState<DadosPlanoConfiguravel>(PRECOS_CONFIGURAVEIS_INICIAIS)
  const [loading, setLoading] = useState(true)

  const carregarPlanosUsuario = useCallback(async () => {
    if (!usuarioId) return
    
    setLoading(true)
    if (isMockMode()) {
      console.log('📋 Usando dados MOCK para Planos do Usuário')
      setPlanosUsuario(MOCK_DATA.planosUsuario || [])
    } else {
      try {
        const { data, error } = await supabase
          .from('planos_usuario')
          .select('*')
          .eq('usuario_id', usuarioId)
          .eq('status', 'ativo')
        if (error) throw error
        setPlanosUsuario(data || [])
      } catch (error) {
        console.error('Erro ao carregar planos do usuário:', error)
      }
    }
    setLoading(false)
  }, [usuarioId])

  const carregarConfiguracoes = useCallback(async () => {
    if (isMockMode()) {
      setConfiguracoes(CONFIGURACOES_PLANOS_INICIAIS)
      setPrecosConfiguraveis(PRECOS_CONFIGURAVEIS_INICIAIS)
    } else {
      try {
        const { data } = await supabase
          .from('configuracoes_planos')
          .select('*')
        if (data) {
          setConfiguracoes(data)
        }
        
        const { data: precos } = await supabase
          .from('precos_configuraveis')
          .select('*')
          .single()
        if (precos) {
          setPrecosConfiguraveis(precos)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }
  }, [])

  useEffect(() => {
    carregarPlanosUsuario()
    carregarConfiguracoes()
  }, [carregarPlanosUsuario, carregarConfiguracoes])

  const assinarPlano = async (
    tipoPlano: TipoPlano,
    dadosCadastro: PlanoUsuario['dadosCadastro'],
    metodoPagamento: string,
    isPrePago: boolean = false
  ): Promise<PlanoUsuario> => {
    const planoConfig = getPlanoPorTipo(tipoPlano)
    if (!planoConfig) throw new Error('Plano não encontrado')

    const precoAtual = precosConfiguraveis[tipoPlano as keyof DadosPlanoConfiguravel] || planoConfig.preco

    // Buscar período pré-pago configurado
    let periodoPrePago = 15 // padrão
    if (!isMockMode()) {
      const { data: config } = await supabase
        .from('configuracoes_sistema')
        .select('valor')
        .eq('chave', 'periodo_pre_pago')
        .single()
      if (config) {
        periodoPrePago = parseInt(config.valor) || 15
      }
    }

    const dataInicio = new Date()
    const dataExpiracao = isPrePago 
      ? new Date(dataInicio.getTime() + periodoPrePago * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    const novoPlano: PlanoUsuario = {
      id: Date.now().toString(),
      usuarioId: usuarioId || '',
      tipoPlano,
      status: isPrePago ? 'ativo' : 'pendente',
      dataInicio: dataInicio.toISOString(),
      dataExpiracao,
      isPrePago,
      periodoPrePago,
      dadosCadastro,
      pagamento: {
        status: isPrePago ? 'aguardando_pagamento' : 'pendente',
        metodo: metodoPagamento,
        valorPago: precoAtual
      },
      createdAt: new Date().toISOString()
    }

    if (isMockMode()) {
      setPlanosUsuario(prev => [...prev, novoPlano])
      
      // Atualizar role do usuário se for plano de serviço com agendamento
      if (tipoPlano.includes('servico_agendamento')) {
        updateUser({ role: 'servico_agendamento', servicoId: novoPlano.id })
      }
      
      return novoPlano
    }

    const { data, error } = await supabase
      .from('planos_usuario')
      .insert(novoPlano)
      .select()
      .single()
    if (error) throw error
    setPlanosUsuario(prev => [...prev, data])
    return data
  }

  const confirmarPagamento = async (planoId: string) => {
    if (isMockMode()) {
      const planoAtualizado = planosUsuario.find(p => p.id === planoId)
      if (planoAtualizado) {
        setPlanosUsuario(prev => prev.map(p => 
          p.id === planoId 
            ? { 
                ...p, 
                status: 'ativo' as const, 
                pagamento: { ...p.pagamento, status: 'pago' as const }
              } 
            : p
        ))
        
        // Atualizar role do usuário se for plano de serviço com agendamento
        if (planoAtualizado.tipoPlano.includes('servico_agendamento')) {
          updateUser({ role: 'servico_agendamento', servicoId: planoId })
        }
      }
      return
    }

    const { error } = await supabase
      .from('planos_usuario')
      .update({ 
        status: 'ativo',
        pagamento: { ...planosUsuario.find(p => p.id === planoId)?.pagamento, status: 'pago' }
      })
      .eq('id', planoId)
    if (error) throw error
    
    const planoAtualizado = planosUsuario.find(p => p.id === planoId)
    setPlanosUsuario(prev => prev.map(p => 
      p.id === planoId 
        ? { 
            ...p, 
            status: 'ativo' as const, 
            pagamento: { ...p.pagamento, status: 'pago' as const }
          } 
        : p
    ))
    
    // Atualizar role do usuário se for plano de serviço com agendamento
    if (planoAtualizado && planoAtualizado.tipoPlano.includes('servico_agendamento')) {
      updateUser({ role: 'servico_agendamento', servicoId: planoId })
    }
  }

  const cancelarPlano = async (planoId: string) => {
    if (isMockMode()) {
      setPlanosUsuario(prev => prev.map(p => 
        p.id === planoId ? { ...p, status: 'cancelado' as const } : p
      ))
      return
    }

    const { error } = await supabase
      .from('planos_usuario')
      .update({ status: 'cancelado' })
      .eq('id', planoId)
    if (error) throw error
    
    setPlanosUsuario(prev => prev.map(p => 
      p.id === planoId ? { ...p, status: 'cancelado' as const } : p
    ))
  }

  const atualizarPlano = async (planoId: string, novoTipo: TipoPlano) => {
    const planoAtual = planosUsuario.find(p => p.id === planoId)
    if (!planoAtual) throw new Error('Plano não encontrado')

    const novoPlanoConfig = getPlanoPorTipo(novoTipo)
    if (!novoPlanoConfig) throw new Error('Novo plano não encontrado')

    const precoAtual = precosConfiguraveis[novoTipo as keyof DadosPlanoConfiguravel] || novoPlanoConfig.preco

    if (isMockMode()) {
      setPlanosUsuario(prev => prev.map(p => 
        p.id === planoId 
          ? { 
              ...p, 
              tipoPlano: novoTipo,
              pagamento: { ...p.pagamento, status: 'pendente' as const, valorPago: precoAtual }
            } 
          : p
      ))
      return
    }

    const { error } = await supabase
      .from('planos_usuario')
      .update({ 
        tipo_plano: novoTipo,
        pagamento: { status: 'pendente', valor_pago: precoAtual }
      })
      .eq('id', planoId)
    if (error) throw error
    
    setPlanosUsuario(prev => prev.map(p => 
      p.id === planoId 
        ? { 
            ...p, 
            tipoPlano: novoTipo,
            pagamento: { ...p.pagamento, status: 'pendente' as const, valorPago: precoAtual }
          } 
        : p
    ))
  }

  const temPlanoGestao = useCallback(() => {
    return planosUsuario.some(p => p.status === 'ativo' && isPlanoGestao(p.tipoPlano))
  }, [planosUsuario])

  const temPlanoAcademia = useCallback(() => {
    return planosUsuario.some(p => p.status === 'ativo' && isPlanoAcademia(p.tipoPlano))
  }, [planosUsuario])

  const getPlanosAtivos = useCallback(() => {
    return planosUsuario.filter(p => p.status === 'ativo')
  }, [planosUsuario])

  const getPlanoPorCategoria = useCallback((categoria: CategoriaPlano) => {
    return planosUsuario.find(p => p.status === 'ativo' && getPlanoPorTipo(p.tipoPlano)?.categoria === categoria)
  }, [planosUsuario])

  const atualizarPrecoConfiguravel = async (plano: keyof DadosPlanoConfiguravel, novoPreco: number) => {
    const novosPrecos = { ...precosConfiguraveis, [plano]: novoPreco }
    setPrecosConfiguraveis(novosPrecos)

    if (isMockMode()) {
      localStorage.setItem('precos_configuraveis', JSON.stringify(novosPrecos))
      return
    }

    const { error } = await supabase
      .from('precos_configuraveis')
      .update(novosPrecos)
      .single()
    if (error) throw error
  }

  return {
    planosUsuario,
    configuracoes,
    precosConfiguraveis,
    loading,
    assinarPlano,
    confirmarPagamento,
    cancelarPlano,
    atualizarPlano,
    temPlanoGestao,
    temPlanoAcademia,
    getPlanosAtivos,
    getPlanoPorCategoria,
    atualizarPrecoConfiguravel,
    refresh: carregarPlanosUsuario
  }
}
