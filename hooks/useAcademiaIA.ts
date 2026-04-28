'use client'

import { useState, useEffect, useCallback } from 'react'
// import { supabase } from '@/lib/supabase' // MODO OFFLINE - DESABILITADO

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface PerfilAluno {
  id: number
  user_id: string
  nome: string
  peso_atual: number
  peso_meta: number
  altura: number
  idade: number
  sexo: 'masculino' | 'feminino' | 'outro'
  objetivo: 'emagrecer' | 'hipertrofia' | 'condicionamento' | 'saude'
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  freq_semanal: number
  condicoes_fisicas: string[]
  tipo_exercicio: string[]
  ativo: boolean
}

export interface MetricasDiarias {
  id: number
  member_id: number
  data: string
  passos: number
  distancia_km: number
  calorias_ativas: number
  calorias_descanso: number
  tempo_ativo_minutos: number
  tempo_sedentario_minutos: number
  sono_horas: number
  sono_qualidade: number
  freq_cardiaca_media: number
  freq_cardiaca_max: number
  check_in_academia: boolean
  check_in_horario: string
  tempo_treino_minutos: number
  score_recuperacao: number
}

export interface Recomendacao {
  id: number
  member_id: number
  tipo: 'treino' | 'descanso' | 'hidratacao' | 'nutricao' | 'motivacao' | 'alerta'
  titulo: string
  mensagem: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  data_exibicao: string
  hora_exibicao: string
  visualizado: boolean
  score_recuperacao: number
  dias_sem_treinar: number
}

export interface PlanoTreino {
  id: number
  member_id: number
  data_geracao: string
  validade_dias: number
  intensidade: 'leve' | 'moderado' | 'intenso'
  foco_muscular: string[]
  duracao_minutos: number
  calorias_estimadas: number
  score_recuperacao: number
  sugestao_principal: string
  sugestao_secundaria: string
  ativo: boolean
  exercicios?: ExercicioPlano[]
}

export interface ExercicioPlano {
  id: number
  plan_id: number
  nome_exercicio: string
  grupo_muscular: string
  series: number
  repeticoes: number
  carga_kg: number
  descanso_segundos: number
  ordem: number
  concluido: boolean
}

export interface ScoreRecuperacao {
  valor: number
  classificacao: 'excelente' | 'bom' | 'regular' | 'ruim'
  fatores: {
    descanso: number
    sono: number
    frequencia: number
    sobrecarga: number
  }
  recomendacao: string
}

// ─── Hook Principal ─────────────────────────────────────────────────────────────
export function useAcademiaIA() {
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null)
  const [metricasHoje, setMetricasHoje] = useState<MetricasDiarias | null>(null)
  const [planoHoje, setPlanoHoje] = useState<PlanoTreino | null>(null)
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([])
  const [scoreRecuperacao, setScoreRecuperacao] = useState<ScoreRecuperacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Carregar dados do usuário ────────────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // TENTAR CARREGAR PERFIL DO CADASTRO PRIMEIRO
      const perfilSalvo = localStorage.getItem('academia_perfil_ia')
      let perfilAtual: PerfilAluno
      
      if (perfilSalvo) {
        // Usar perfil real do cadastro
        perfilAtual = JSON.parse(perfilSalvo)
        setPerfil(perfilAtual)
      } else {
        // MODO OFFLINE: Usar dados mockados para teste
        const mockPerfil: PerfilAluno = {
          id: 1,
          user_id: 'demo-user',
          nome: 'João Silva',
          peso_atual: 78,
          peso_meta: 72,
          altura: 175,
          idade: 30,
          sexo: 'masculino',
          objetivo: 'emagrecer',
          nivel: 'intermediario',
          freq_semanal: 3,
          condicoes_fisicas: [],
          tipo_exercicio: ['peito', 'costas', 'pernas'],
          ativo: true
        }
        perfilAtual = mockPerfil
        setPerfil(mockPerfil)
      }

      // Métricas mockadas de hoje
      const mockMetricas: MetricasDiarias = {
        id: 1,
        member_id: 1,
        data: new Date().toISOString().split('T')[0],
        passos: 8500,
        distancia_km: 5.2,
        calorias_ativas: 320,
        calorias_descanso: 1800,
        tempo_ativo_minutos: 45,
        tempo_sedentario_minutos: 420,
        sono_horas: 7.5,
        sono_qualidade: 4,
        freq_cardiaca_media: 72,
        freq_cardiaca_max: 145,
        check_in_academia: false,
        check_in_horario: '',
        tempo_treino_minutos: 0,
        score_recuperacao: 75
      }

      setMetricasHoje(mockMetricas)

      // Calcular score de recuperação
      const score = await calcularScoreRecuperacao(perfilAtual.id, mockMetricas)
      setScoreRecuperacao(score)

      // Sem plano inicial
      setPlanoHoje(null)
      setRecomendacoes([])

    } catch (error) {
      console.error('Erro ao carregar dados da academia:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ─── Motor de Inteligência: Score de Recuperação ─────────────────────────────
  const calcularScoreRecuperacao = useCallback(async (
    memberId: number, 
    metricas?: MetricasDiarias | null
  ): Promise<ScoreRecuperacao> => {
    // Valores padrão se não houver métricas
    const metricasPadrao = metricas || {
      tempo_sedentario_minutos: 480, // 8 horas sedentário
      sono_horas: 7,
      sono_qualidade: 3,
      check_in_academia: false,
      tempo_treino_minutos: 0,
      passos: 5000
    }

    // Buscar métricas dos últimos 7 dias para análise de frequência (MODO OFFLINE)
    const treinosNaSemana = 2 // Simulação: 2 treinos na semana

    // Calcular fatores individuais (0-100)
    const fatorDescanso = Math.max(0, 100 - (metricasPadrao.tempo_sedentario_minutos / 10)) // Menos sedentarismo = melhor
    const fatorSono = Math.min(100, (metricasPadrao.sono_horas / 8) * 100 * (metricasPadrao.sono_qualidade / 5))
    const fatorFrequencia = Math.min(100, (treinosNaSemana / 3) * 100) // 3 treinos/semana = 100%
    const fatorSobrecarga = metricasPadrao.check_in_academia 
      ? Math.max(0, 100 - (metricasPadrao.tempo_treino_minutos / 90) * 100) // Menos de 90min = melhor
      : 100 // Não treinou = sem sobrecarga

    // Calcular score ponderado
    const pesos = { descanso: 0.25, sono: 0.35, frequencia: 0.25, sobrecarga: 0.15 }
    const scoreFinal = Math.round(
      fatorDescanso * pesos.descanso +
      fatorSono * pesos.sono +
      fatorFrequencia * pesos.frequencia +
      fatorSobrecarga * pesos.sobrecarga
    )

    // Classificação
    let classificacao: ScoreRecuperacao['classificacao']
    if (scoreFinal >= 80) classificacao = 'excelente'
    else if (scoreFinal >= 60) classificacao = 'bom'
    else if (scoreFinal >= 40) classificacao = 'regular'
    else classificacao = 'ruim'

    // Recomendação baseada no score
    let recomendacao: string
    if (scoreFinal >= 80) {
      recomendacao = 'Ótima recuperação! Você está pronto para um treino intenso hoje.'
    } else if (scoreFinal >= 60) {
      recomendacao = 'Boa recuperação. Treino moderado recomendado.'
    } else if (scoreFinal >= 40) {
      recomendacao = 'Recuperação regular. Considere um treino leve ou dia de descanso.'
    } else {
      recomendacao = 'Recuperação ruim. Recomendo descanso e foco no sono e hidratação.'
    }

    return {
      valor: scoreFinal,
      classificacao,
      fatores: {
        descanso: fatorDescanso,
        sono: fatorSono,
        frequencia: fatorFrequencia,
        sobrecarga: fatorSobrecarga
      },
      recomendacao
    }
  }, [])

  // ─── Gerar Plano de Treino Automático ─────────────────────────────────────────────
  const gerarPlanoTreino = useCallback(async () => {
    if (!perfil || !scoreRecuperacao) return

    try {
      // Determinar intensidade baseada no score de recuperação
      let intensidade: PlanoTreino['intensidade']
      if (scoreRecuperacao.valor >= 80) intensidade = 'intenso'
      else if (scoreRecuperacao.valor >= 60) intensidade = 'moderado'
      else intensidade = 'leve'

      // Selecionar grupos musculares baseados no objetivo e frequência
      const gruposMusculares = selecionarGruposMusculares(perfil.objetivo, perfil.tipo_exercicio)
      
      // Calcular duração e calorias
      const duracaoMinutos = perfil.nivel === 'iniciante' ? 45 : perfil.nivel === 'intermediario' ? 60 : 75
      const caloriasEstimadas = Math.round(duracaoMinutos * (perfil.peso_atual * 0.08))

      // Gerar sugestões
      const sugestaoPrincipal = gerarSugestaoPrincipal(perfil, scoreRecuperacao, intensidade)
      const sugestaoSecundaria = gerarSugestaoSecundaria(perfil, scoreRecuperacao)

      // Criar plano mock (sem salvar no banco por enquanto)
      const planoMock: PlanoTreino = {
        id: Date.now(),
        member_id: perfil.id,
        data_geracao: new Date().toISOString().split('T')[0],
        validade_dias: 7,
        intensidade,
        foco_muscular: gruposMusculares,
        duracao_minutos: duracaoMinutos,
        calorias_estimadas: caloriasEstimadas,
        score_recuperacao: scoreRecuperacao.valor,
        sugestao_principal: sugestaoPrincipal,
        sugestao_secundaria: sugestaoSecundaria,
        ativo: true,
        exercicios: gerarExerciciosPlano(gruposMusculares, intensidade, perfil.nivel).map((ex, idx) => ({
          ...ex,
          id: Date.now() + idx,
          plan_id: Date.now()
        }))
      }

      setPlanoHoje(planoMock)
      
      // Gerar recomendações baseadas no plano
      await gerarRecomendacoesPlano(perfil.id, planoMock, scoreRecuperacao)

    } catch (err) {
      console.error('Erro ao gerar plano de treino:', err)
      setError('Falha ao gerar plano de treino')
    }
  }, [perfil, scoreRecuperacao])

  // ─── Registrar Métricas do Dia ───────────────────────────────────────────────────
  const registrarMetricas = useCallback(async (metricas: Partial<MetricasDiarias>) => {
    if (!perfil) return

    try {
      const hoje = new Date().toISOString().split('T')[0]
      
      // Calcular score de recuperação com as novas métricas
      const score = await calcularScoreRecuperacao(perfil.id, metricas as MetricasDiarias)

      const novasMetricas = {
        ...metricas,
        member_id: perfil.id,
        data: hoje,
        score_recuperacao: score.valor
      } as MetricasDiarias

      setMetricasHoje(novasMetricas)
      setScoreRecuperacao(score)

      // MODO OFFLINE: Não salvar no banco
      console.log('Métricas registradas (modo offline):', novasMetricas)

    } catch (err) {
      console.error('Erro ao registrar métricas:', err)
      setError('Falha ao registrar métricas')
    }
  }, [perfil, calcularScoreRecuperacao])

  // ─── Marcar Recomendação como Visualizada ────────────────────────────────────────
  const marcarRecomendacaoVisualizada = useCallback(async (recomendacaoId: number) => {
    try {
      // MODO OFFLINE: Apenas remover do estado local
      setRecomendacoes(prev => prev.filter(r => r.id !== recomendacaoId))
    } catch (err) {
      console.error('Erro ao marcar recomendação como visualizada:', err)
    }
  }, [])

  // ─── Funções Auxiliares ─────────────────────────────────────────────────────────────
  const selecionarGruposMusculares = (objetivo: string, preferencias: string[]): string[] => {
    const gruposPorObjetivo = {
      emagrecer: ['peito', 'costas', 'pernas', 'ombros'],
      hipertrofia: ['peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps'],
      condicionamento: ['pernas', 'ombros', 'core'],
      saude: ['pernas', 'costas', 'ombros', 'core']
    }

    let grupos = gruposPorObjetivo[objetivo as keyof typeof gruposPorObjetivo] || gruposPorObjetivo.saude
    
    // Filtrar por preferências se existirem
    if (preferencias.length > 0) {
      grupos = grupos.filter(g => preferencias.some((p: string) => p.toLowerCase().includes(g.toLowerCase())))
    }

    // Retornar 2-3 grupos musculares
    return grupos.slice(0, Math.min(3, grupos.length))
  }

  const gerarSugestaoPrincipal = (perfil: PerfilAluno, score: ScoreRecuperacao, intensidade: string): string => {
    const nome = perfil.nome.split(' ')[0]
    
    if (score.valor >= 80) {
      return `${nome}, você está ${score.classificacao}! Ótimo dia para treino ${intensidade} e superar limites! 💪`
    } else if (score.valor >= 60) {
      return `${nome}, sua recuperação está ${score.classificacao}. Treino ${intensidade} hoje com foco em técnica.`
    } else {
      return `${nome}, recuperação ${score.classificacao}. Considere treino leve ou focar em mobilidade e alongamento.`
    }
  }

  const gerarSugestaoSecundaria = (perfil: PerfilAluno, score: ScoreRecuperacao): string => {
    if (score.fatores.sono < 60) {
      return 'Priorize o sono hoje - 7-8 horas são essenciais para recuperação.'
    } else if (score.fatores.frequencia < 50) {
      return 'Tente manter 3 treinos por semana para melhores resultados.'
    } else if (score.fatores.descanso < 50) {
      return 'Reduza tempo sedentário - caminhe 5min a cada hora.'
    } else {
      return 'Ótimo trabalho! Continue com a consistência.'
    }
  }

  const gerarExerciciosPlano = (
    gruposMusculares: string[], 
    intensidade: string, 
    nivel: string
  ): Omit<ExercicioPlano, 'id' | 'plan_id'>[] => {
    const exerciciosPorGrupo = {
      peito: ['Supino Reto', 'Supino Inclinado', 'Crossover'],
      costas: ['Puxada Frontal', 'Remada Curvada', 'Barra Fixa'],
      pernas: ['Agachamento', 'Leg Press', 'Cadeira Extensora'],
      ombros: ['Desenvolvimento', 'Elevação Lateral', 'Encolhimento'],
      biceps: ['Rosca Direta', 'Rosca Martelo', 'Rosca Concentrada'],
      triceps: ['Triceps Testa', 'Triceps Puxa', 'Triceps Corda'],
      core: ['Prancha', 'Abdominal', 'Elevação de Pernas']
    }

    const intensidadeParams = {
      leve: { series: 3, reps: 12, carga: 0.6 },
      moderado: { series: 4, reps: 10, carga: 0.75 },
      intenso: { series: 4, reps: 8, carga: 0.85 }
    }

    const nivelParams = {
      iniciante: { descanso: 90, cargaBase: 20 },
      intermediario: { descanso: 60, cargaBase: 40 },
      avancado: { descanso: 45, cargaBase: 60 }
    }

    const params = { ...intensidadeParams[intensidade as keyof typeof intensidadeParams], ...nivelParams[nivel as keyof typeof nivelParams] }

    let ordem = 1
    const exercicios: Omit<ExercicioPlano, 'id' | 'plan_id'>[] = []

    for (const grupo of gruposMusculares) {
      const exerciciosGrupo = exerciciosPorGrupo[grupo as keyof typeof exerciciosPorGrupo] || []
      const exercicioSelecionado = exerciciosGrupo[0] // Pega o primeiro exercício do grupo

      if (exercicioSelecionado) {
        exercicios.push({
          nome_exercicio: exercicioSelecionado,
          grupo_muscular: grupo,
          series: params.series,
          repeticoes: params.reps,
          carga_kg: params.cargaBase * params.carga,
          descanso_segundos: params.descanso,
          ordem: ordem++,
          concluido: false
        })
      }
    }

    return exercicios
  }

  const gerarRecomendacoesPlano = async (
    memberId: number, 
    plano: PlanoTreino, 
    score: ScoreRecuperacao
  ) => {
    const recomendacoes: Omit<Recomendacao, 'id'>[] = []
    const hoje = new Date().toISOString().split('T')[0]

    // Recomendação principal baseada no plano
    recomendacoes.push({
      member_id: memberId,
      tipo: 'treino',
      titulo: 'Seu Treino de Hoje',
      mensagem: plano.sugestao_principal,
      prioridade: 'alta',
      data_exibicao: hoje,
      hora_exibicao: '08:00',
      visualizado: false,
      score_recuperacao: score.valor,
      dias_sem_treinar: 0
    })

    // Recomendação secundária
    recomendacoes.push({
      member_id: memberId,
      tipo: 'motivacao',
      titulo: 'Dica do Dia',
      mensagem: plano.sugestao_secundaria,
      prioridade: 'media',
      data_exibicao: hoje,
      hora_exibicao: '12:00',
      visualizado: false,
      score_recuperacao: score.valor,
      dias_sem_treinar: 0
    })

    // Recomendação de hidratação
    recomendacoes.push({
      member_id: memberId,
      tipo: 'hidratacao',
      titulo: 'Hidrate-se!',
      mensagem: `Meta de água hoje: ${Math.round(plano.duracao_minutos * 0.025)}L durante o treino.`,
      prioridade: 'media',
      data_exibicao: hoje,
      hora_exibicao: '15:00',
      visualizado: false,
      score_recuperacao: score.valor,
      dias_sem_treinar: 0
    })

    // Inserir recomendações no banco (MODO OFFLINE)
    console.log('Recomendações geradas (modo offline):', recomendacoes)

    // Atualizar estado local
    setRecomendacoes(prev => [...prev, ...recomendacoes.map((r, i) => ({ ...r, id: Date.now() + i })) as Recomendacao[]])
  }

  return {
    // Estado
    perfil,
    metricasHoje,
    planoHoje,
    recomendacoes,
    scoreRecuperacao,
    loading,
    error,

    // Ações
    carregarDados,
    gerarPlanoTreino,
    registrarMetricas,
    marcarRecomendacaoVisualizada,
    calcularScoreRecuperacao
  }
}
