'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos para Sistema de Alertas Preditivos ────────────────────────────────────────
export interface AlertaPreditivo {
  id: number
  member_id: number
  tipo: 'abandono' | 'lesao' | 'sobrecarga' | 'desmotivacao' | 'meta_nao_atingida' | 'sono_ruim'
  titulo: string
  mensagem: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  probabilidade: number // 0-100
  data_prevista: string
  status: 'ativo' | 'resolvido' | 'ignorado'
  criado_em: string
  resolvido_em?: string
  acoes_recomendadas: string[]
}

export interface FatorRisco {
  nome: string
  peso: number // 0-1
  valor_atual: number
  valor_limite: number
  tendencia: 'melhorando' | 'estavel' | 'piorando'
}

export interface AnalisePreditiva {
  member_id: number
  data_analise: string
  score_geral: number // 0-100
  fatores_risco: FatorRisco[]
  alertas_ativos: AlertaPreditivo[]
  recomendacoes_ia: string[]
  proxima_analise: string
}

// ─── Hook Principal de Alertas Preditivos ───────────────────────────────────────────────
export function useAlertasPreditivos() {
  const [alertas, setAlertas] = useState<AlertaPreditivo[]>([])
  const [analise, setAnalise] = useState<AnalisePreditiva | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Motor de Análise Preditiva ───────────────────────────────────────────────────────
  const analisarRiscoAbandono = useCallback(async (memberId: number): Promise<number> => {
    try {
      // Buscar dados dos últimos 30 dias
      const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const { data: metricas } = await supabase
        .from('gym_metrics')
        .select('data, check_in_academia, tempo_treino_minutos, score_recuperacao')
        .eq('member_id', memberId)
        .gte('data', trintaDiasAtras)
        .order('data')

      if (!metricas || metricas.length === 0) return 0

      // Análise de padrões
      const diasTotais = 30
      const diasComTreino = metricas.filter(m => m.check_in_academia).length
      const frequenciaAtual = (diasComTreino / diasTotais) * 100

      // Tendência de frequência (última semana vs semana anterior)
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const quatorzeDiasAtras = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const treinosUltimaSemana = metricas.filter(m => 
        m.data >= seteDiasAtras && m.check_in_academia
      ).length
      const treinosSemanaAnterior = metricas.filter(m => 
        m.data >= quatorzeDiasAtras && m.data < seteDiasAtras && m.check_in_academia
      ).length

      const tendenciaFrequencia = treinosUltimaSemana - treinosSemanaAnterior

      // Score médio de recuperação
      const scoreMedioRecuperacao = metricas.reduce((sum, m) => sum + (m.score_recuperacao || 50), 0) / metricas.length

      // Cálculo de risco de abandono (0-100)
      let riscoAbandono = 0

      // Frequência baixa aumenta risco
      if (frequenciaAtual < 30) riscoAbandono += 40
      else if (frequenciaAtual < 50) riscoAbandono += 25
      else if (frequenciaAtual < 70) riscoAbandono += 10

      // Tendência negativa aumenta risco
      if (tendenciaFrequencia < -2) riscoAbandono += 30
      else if (tendenciaFrequencia < -1) riscoAbandono += 15

      // Recuperação ruim aumenta risco
      if (scoreMedioRecuperacao < 30) riscoAbandono += 20
      else if (scoreMedioRecuperacao < 50) riscoAbandono += 10

      // Dias sem treinar recentes
      const ultimoTreino = metricas.filter(m => m.check_in_academia).pop()
      if (ultimoTreino) {
        const diasSemTreinar = Math.floor((Date.now() - new Date(ultimoTreino.data).getTime()) / (24 * 60 * 60 * 1000))
        if (diasSemTreinar > 7) riscoAbandono += 25
        else if (diasSemTreinar > 3) riscoAbandono += 10
      }

      return Math.min(100, Math.max(0, riscoAbandono))
    } catch (error) {
      console.error('Erro ao analisar risco de abandono:', error)
      return 0
    }
  }, [])

  const analisarRiscoLesao = useCallback(async (memberId: number): Promise<number> => {
    try {
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const { data: metricas } = await supabase
        .from('gym_metrics')
        .select('tempo_treino_minutos, score_recuperacao, freq_cardiaca_max, data')
        .eq('member_id', memberId)
        .gte('data', seteDiasAtras)
        .order('data')

      if (!metricas || metricas.length === 0) return 0

      let riscoLesao = 0

      // Sobrecarga de treino
      const tempoMedioTreino = metricas.reduce((sum, m) => sum + (m.tempo_treino_minutos || 0), 0) / metricas.length
      if (tempoMedioTreino > 90) riscoLesao += 25
      else if (tempoMedioTreino > 75) riscoLesao += 15

      // Recuperação inadequada
      const scoreMedioRecuperacao = metricas.reduce((sum, m) => sum + (m.score_recuperacao || 50), 0) / metricas.length
      if (scoreMedioRecuperacao < 30) riscoLesao += 30
      else if (scoreMedioRecuperacao < 50) riscoLesao += 15

      // Frequência cardíaca elevada
      const freqCardiacaMaxMedia = metricas.reduce((sum, m) => sum + (m.freq_cardiaca_max || 0), 0) / metricas.length
      if (freqCardiacaMaxMedia > 180) riscoLesao += 20
      else if (freqCardiacaMaxMedia > 160) riscoLesao += 10

      return Math.min(100, Math.max(0, riscoLesao))
    } catch (error) {
      console.error('Erro ao analisar risco de lesão:', error)
      return 0
    }
  }, [])

  const analisarDesmotivacao = useCallback(async (memberId: number): Promise<number> => {
    try {
      const quatorzeDiasAtras = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const { data: metricas } = await supabase
        .from('gym_metrics')
        .select('passos, tempo_ativo_minutos, score_recuperacao, data')
        .eq('member_id', memberId)
        .gte('data', quatorzeDiasAtras)
        .order('data')

      if (!metricas || metricas.length === 0) return 0

      let riscoDesmotivacao = 0

      // Redução gradual de atividade
      const passosMediosPrimeiraSemana = metricas.slice(0, 7).reduce((sum, m) => sum + (m.passos || 0), 0) / 7
      const passosMediosSegundaSemana = metricas.slice(-7).reduce((sum, m) => sum + (m.passos || 0), 0) / 7
      
      const reducaoPassos = ((passosMediosPrimeiraSemana - passosMediosSegundaSemana) / passosMediosPrimeiraSemana) * 100
      if (reducaoPassos > 30) riscoDesmotivacao += 30
      else if (reducaoPassos > 15) riscoDesmotivacao += 15

      // Tempo ativo reduzido
      const tempoAtivoMedio = metricas.reduce((sum, m) => sum + (m.tempo_ativo_minutos || 0), 0) / metricas.length
      if (tempoAtivoMedio < 20) riscoDesmotivacao += 25
      else if (tempoAtivoMedio < 40) riscoDesmotivacao += 10

      return Math.min(100, Math.max(0, riscoDesmotivacao))
    } catch (error) {
      console.error('Erro ao analisar desmotivação:', error)
      return 0
    }
  }, [])

  // ─── Gerar Alertas Preditivos ───────────────────────────────────────────────────────
  const gerarAlertas = useCallback(async (memberId: number) => {
    try {
      setLoading(true)
      setError(null)

      // Analisar diferentes tipos de risco
      const [riscoAbandono, riscoLesao, riscoDesmotivacao] = await Promise.all([
        analisarRiscoAbandono(memberId),
        analisarRiscoLesao(memberId),
        analisarDesmotivacao(memberId)
      ])

      const novosAlertas: Omit<AlertaPreditivo, 'id' | 'criado_em'>[] = []

      // Alerta de abandono
      if (riscoAbandono > 60) {
        novosAlertas.push({
          member_id: memberId,
          tipo: 'abandono',
          titulo: 'Risco de Abandono Detectado',
          mensagem: `Baseado na sua frequência recente, há ${riscoAbandono}% de probabilidade de abandono. Vamos retomar os treinos?`,
          severidade: riscoAbandono > 80 ? 'critica' : riscoAbandono > 70 ? 'alta' : 'media',
          probabilidade: riscoAbandono,
          data_prevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ativo',
          acoes_recomendadas: [
            'Reduzir frequência para 2x por semana temporariamente',
            'Focar em atividades mais prazerosas',
            'Buscar um treino partner para motivação',
            'Reavaliar metas e objetivos'
          ]
        })
      }

      // Alerta de lesão
      if (riscoLesao > 50) {
        novosAlertas.push({
          member_id: memberId,
          tipo: 'lesao',
          titulo: 'Risco de Lesão Elevado',
          mensagem: `Seu padrão de treino atual indica ${riscoLesao}% de risco de lesão. Considere reduzir a intensidade.`,
          severidade: riscoLesao > 70 ? 'critica' : 'alta',
          probabilidade: riscoLesao,
          data_prevista: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ativo',
          acoes_recomendadas: [
            'Adicionar 1-2 dias de descanso na semana',
            'Reduzir tempo dos treinos em 20%',
            'Focar em alongamento e mobilidade',
            'Verificar técnica dos exercícios'
          ]
        })
      }

      // Alerta de desmotivação
      if (riscoDesmotivacao > 50) {
        novosAlertas.push({
          member_id: memberId,
          tipo: 'desmotivacao',
          titulo: 'Queda de Motivação Detectada',
          mensagem: `Notamos uma redução na sua atividade. Que tal tentar algo novo para reacender a motivação?`,
          severidade: riscoDesmotivacao > 70 ? 'alta' : 'media',
          probabilidade: riscoDesmotivacao,
          data_prevista: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ativo',
          acoes_recomendadas: [
            'Experimentar novas modalidades de treino',
            'Definir metas de curto prazo mais fáceis',
            'Buscar um personal trainer temporariamente',
            'Participar de aulas em grupo'
          ]
        })
      }

      // Inserir alertas no banco
      for (const alerta of novosAlertas) {
        await supabase
          .from('gym_alertas_preditivos')
          .insert({
            ...alerta,
            criado_em: new Date().toISOString()
          })
      }

      // Atualizar estado local
      setAlertas(prev => [...prev, ...novosAlertas.map((a, i) => ({ ...a, id: Date.now() + i })) as AlertaPreditivo[]])

      return novosAlertas
    } catch (error) {
      console.error('Erro ao gerar alertas preditivos:', error)
      setError('Falha ao gerar alertas preditivos')
      return []
    } finally {
      setLoading(false)
    }
  }, [analisarRiscoAbandono, analisarRiscoLesao, analisarDesmotivacao])

  // ─── Análise Completa ───────────────────────────────────────────────────────────────
  const realizarAnaliseCompleta = useCallback(async (memberId: number) => {
    try {
      setLoading(true)
      setError(null)

      // Buscar perfil do membro
      const { data: perfil } = await supabase
        .from('gym_members')
        .select('nome, objetivo, nivel, freq_semanal')
        .eq('id', memberId)
        .single()

      if (!perfil) throw new Error('Perfil não encontrado')

      // Analisar riscos
      const [riscoAbandono, riscoLesao, riscoDesmotivacao] = await Promise.all([
        analisarRiscoAbandono(memberId),
        analisarRiscoLesao(memberId),
        analisarDesmotivacao(memberId)
      ])

      // Calcular score geral
      const scoreGeral = Math.max(riscoAbandono, riscoLesao, riscoDesmotivacao)

      // Definir fatores de risco
      const fatoresRisco: FatorRisco[] = [
        {
          nome: 'Frequência de Treino',
          peso: 0.4,
          valor_atual: 100 - riscoAbandono,
          valor_limite: 70,
          tendencia: riscoAbandono > 50 ? 'piorando' : 'estavel'
        },
        {
          nome: 'Recuperação',
          peso: 0.3,
          valor_atual: 100 - riscoLesao,
          valor_limite: 60,
          tendencia: riscoLesao > 50 ? 'piorando' : 'estavel'
        },
        {
          nome: 'Motivação',
          peso: 0.3,
          valor_atual: 100 - riscoDesmotivacao,
          valor_limite: 70,
          tendencia: riscoDesmotivacao > 50 ? 'piorando' : 'estavel'
        }
      ]

      // Gerar recomendações da IA
      const recomendacoes: string[] = []
      
      if (riscoAbandono > 60) {
        recomendacoes.push('Considere reduzir a frequência para 2x por semana temporariamente')
        recomendacoes.push('Experimente novas modalidades para manter o interesse')
      }
      
      if (riscoLesao > 50) {
        recomendacoes.push('Adicione mais dias de descanso entre treinos intensos')
        recomendacoes.push('Foque em técnica em vez de carga')
      }
      
      if (riscoDesmotivacao > 50) {
        recomendacoes.push('Defina metas menores e mais alcançáveis')
        recomendacoes.push('Busque um treino partner para maior engajamento')
      }

      if (scoreGeral < 40) {
        recomendacoes.push('Você está indo muito bem! Continue com a consistência atual.')
      }

      // Criar análise
      const analiseCompleta: AnalisePreditiva = {
        member_id: memberId,
        data_analise: new Date().toISOString(),
        score_geral: scoreGeral,
        fatores_risco: fatoresRisco,
        alertas_ativos: alertas.filter(a => a.member_id === memberId && a.status === 'ativo'),
        recomendacoes_ia: recomendacoes,
        proxima_analise: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      setAnalise(analiseCompleta)
      
      // Salvar análise no banco
      await supabase
        .from('gym_analises_preditivas')
        .insert({
          member_id: memberId,
          data_analise: analiseCompleta.data_analise,
          score_geral: analiseCompleta.score_geral,
          fatores_risco: analiseCompleta.fatores_risco,
          alertas_ativos: analiseCompleta.alertas_ativos,
          recomendacoes_ia: analiseCompleta.recomendacoes_ia,
          proxima_analise: analiseCompleta.proxima_analise
        })

      return analiseCompleta
    } catch (error) {
      console.error('Erro na análise completa:', error)
      setError('Falha na análise preditiva')
      return null
    } finally {
      setLoading(false)
    }
  }, [alertas, analisarRiscoAbandono, analisarRiscoLesao, analisarDesmotivacao])

  // ─── Carregar Alertas Existentes ─────────────────────────────────────────────────────
  const carregarAlertas = useCallback(async (memberId: number) => {
    try {
      const { data } = await supabase
        .from('gym_alertas_preditivos')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'ativo')
        .order('criado_em', { ascending: false })

      if (data) {
        setAlertas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
    }
  }, [])

  // ─── Resolver Alerta ───────────────────────────────────────────────────────────────
  const resolverAlerta = useCallback(async (alertaId: number) => {
    try {
      await supabase
        .from('gym_alertas_preditivos')
        .update({ 
          status: 'resolvido', 
          resolvido_em: new Date().toISOString() 
        })
        .eq('id', alertaId)

      setAlertas(prev => prev.map(a => 
        a.id === alertaId 
          ? { ...a, status: 'resolvido' as const, resolvido_em: new Date().toISOString() }
          : a
      ))
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }, [])

  // ─── Ignorar Alerta ───────────────────────────────────────────────────────────────
  const ignorarAlerta = useCallback(async (alertaId: number) => {
    try {
      await supabase
        .from('gym_alertas_preditivos')
        .update({ status: 'ignorado' })
        .eq('id', alertaId)

      setAlertas(prev => prev.map(a => 
        a.id === alertaId 
          ? { ...a, status: 'ignorado' as const }
          : a
      ))
    } catch (error) {
      console.error('Erro ao ignorar alerta:', error)
    }
  }, [])

  return {
    // Estado
    alertas,
    analise,
    loading,
    error,

    // Ações
    gerarAlertas,
    realizarAnaliseCompleta,
    carregarAlertas,
    resolverAlerta,
    ignorarAlerta,
    
    // Análises individuais
    analisarRiscoAbandono,
    analisarRiscoLesao,
    analisarDesmotivacao
  }
}
