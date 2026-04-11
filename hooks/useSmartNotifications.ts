'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UserData {
  academia_dados: {
    peso: string
    altura: string
    consumoAgua: string
    alimentacao: string
    estresse: string
    objetivo: string
    experiencia: string
    disponibilidade: string[]
    condicoesMedicas: string[]
  }
}

interface NotificationData {
  id: string
  titulo: string
  mensagem: string
  tipo: 'lembrete' | 'motivacao' | 'saude' | 'meta'
  prioridade: 'baixa' | 'media' | 'alta'
  horario?: string
}

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    loadUserData()
    checkForNewNotifications()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('academia_dados')
          .eq('id', user.id)
          .single()

        if (data) {
          setUserData(data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const checkForNewNotifications = () => {
    const lastCheck = localStorage.getItem('academia_ultima_notificacao')
    const now = new Date()
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0)

    // Verificar se já passou tempo suficiente para nova notificação
    const hoursSinceLastCheck = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastCheck >= 4) { // A cada 4 horas
      generateNotifications()
      localStorage.setItem('academia_ultima_notificacao', now.toISOString())
    }
  }

  const generateNotifications = () => {
    if (!userData?.academia_dados) return

    const dados = userData.academia_dados
    const novasNotificacoes: NotificationData[] = []
    const now = new Date()
    const horaAtual = now.getHours()

    // 1. Notificações baseadas no horário
    if (horaAtual >= 6 && horaAtual <= 10) {
      // Manhã - Café da manhã e hidratação
      novasNotificacoes.push({
        id: `manha-${now.getDate()}`,
        titulo: '🌅 Bom dia! Comece o dia bem',
        mensagem: `Beba pelo menos ${getRecomendacaoAgua(dados.consumoAgua)} de água hoje e faça um café da manhã saudável!`,
        tipo: 'saude',
        prioridade: 'media'
      })
    }

    if (horaAtual >= 12 && horaAtual <= 14) {
      // Almoço
      novasNotificacoes.push({
        id: `almoco-${now.getDate()}`,
        titulo: '🍽️ Hora do almoço!',
        mensagem: 'Lembre-se de comer alimentos ricos em proteínas e vegetais. Hidrate-se bem!',
        tipo: 'saude',
        prioridade: 'baixa'
      })
    }

    if (horaAtual >= 18 && horaAtual <= 21) {
      // Jantar
      novasNotificacoes.push({
        id: `jantar-${now.getDate()}`,
        titulo: '🍽️ Jantar saudável',
        mensagem: 'Opte por refeições leves e balanceadas. Prepare-se para uma boa noite de sono!',
        tipo: 'saude',
        prioridade: 'baixa'
      })
    }

    // 2. Notificações baseadas nos dados de saúde
    if (dados.consumoAgua === 'menos_1l') {
      novasNotificacoes.push({
        id: `agua-${now.getDate()}`,
        titulo: '💧 Hidratação é fundamental!',
        mensagem: 'Você relatou beber menos de 1L de água por dia. Tente aumentar para pelo menos 2L!',
        tipo: 'saude',
        prioridade: 'alta'
      })
    }

    if (dados.alimentacao === 'muito_ruim' || dados.alimentacao === 'ruim') {
      novasNotificacoes.push({
        id: `alimentacao-${now.getDate()}`,
        titulo: '🥗 Melhore sua alimentação',
        mensagem: 'Uma alimentação balanceada é essencial para seus resultados. Foque em proteínas, carboidratos complexos e gorduras saudáveis!',
        tipo: 'saude',
        prioridade: 'media'
      })
    }

    if (dados.estresse === 'alto' || dados.estresse === 'muito_alto') {
      novasNotificacoes.push({
        id: `estresse-${now.getDate()}`,
        titulo: '🧘 Gerencie seu estresse',
        mensagem: 'Pratique respiração profunda, meditação ou alongamentos para reduzir o estresse.',
        tipo: 'saude',
        prioridade: 'media'
      })
    }

    // 3. Notificações baseadas no objetivo
    if (dados.objetivo === 'perda_peso') {
      novasNotificacoes.push({
        id: `peso-${now.getDate()}`,
        titulo: '⚖️ Meta de perda de peso',
        mensagem: 'Combine treino com déficit calórico saudável. Consulte um nutricionista para orientação personalizada.',
        tipo: 'meta',
        prioridade: 'baixa'
      })
    }

    if (dados.objetivo === 'ganho_muscular') {
      novasNotificacoes.push({
        id: `musculo-${now.getDate()}`,
        titulo: '💪 Ganho muscular',
        mensagem: 'Proteína + treino de força + descanso adequado = crescimento muscular!',
        tipo: 'meta',
        prioridade: 'baixa'
      })
    }

    // 4. Verificar check-ins e metas
    const checkinsHoje = getCheckinsHoje()
    const metas = getMetasUsuario()

    if (checkinsHoje.length === 0 && horaAtual >= 17) {
      novasNotificacoes.push({
        id: `treino-hoje-${now.getDate()}`,
        titulo: '🏋️ Ainda dá tempo!',
        mensagem: 'Você ainda não treinou hoje. Mesmo uma sessão curta é melhor que nada!',
        tipo: 'lembrete',
        prioridade: 'alta'
      })
    }

    // Verificar metas semanais
    const metaSemanal = metas.find((m: any) => m.tipo === 'semanal')
    if (metaSemanal && !metaSemanal.conquistada) {
      const diasRestantes = 7 - now.getDay()
      const treinosFaltando = metaSemanal.meta - metaSemanal.atual

      if (diasRestantes <= 3 && treinosFaltando > 0) {
        novasNotificacoes.push({
          id: `meta-semanal-${now.getDate()}`,
          titulo: '🎯 Meta semanal em risco!',
          mensagem: `Faltam ${treinosFaltando} treino(s) para bater sua meta semanal. Você tem ${diasRestantes} dia(s)!`,
          tipo: 'meta',
          prioridade: 'alta'
        })
      }
    }

    // 5. Notificações motivacionais
    if (Math.random() > 0.7) { // 30% de chance de aparecer
      const mensagensMotivacionais = [
        '💪 Cada treino te deixa mais forte!',
        '🎯 Pequenos passos levam a grandes resultados!',
        '🌟 Você é capaz de conquistar seus objetivos!',
        '🔥 Continue assim, você está no caminho certo!',
        '🏆 Cada dia é uma oportunidade de melhorar!'
      ]

      const mensagemAleatoria = mensagensMotivacionais[Math.floor(Math.random() * mensagensMotivacionais.length)]

      novasNotificacoes.push({
        id: `motivacao-${Date.now()}`,
        titulo: '💪 Motivação do dia',
        mensagem: mensagemAleatoria,
        tipo: 'motivacao',
        prioridade: 'baixa'
      })
    }

    // Salvar notificações
    if (novasNotificacoes.length > 0) {
      setNotifications(prev => [...novasNotificacoes, ...prev])

      // Salvar no localStorage
      const notificacoesExistentes = JSON.parse(localStorage.getItem('academia_notificacoes') || '[]')
      const todasNotificacoes = [...novasNotificacoes, ...notificacoesExistentes]
      localStorage.setItem('academia_notificacoes', JSON.stringify(todasNotificacoes))

      // Mostrar primeira notificação como alert
      if (novasNotificacoes[0]) {
        setTimeout(() => {
          alert(`${novasNotificacoes[0].titulo}\n\n${novasNotificacoes[0].mensagem}`)
        }, 1000)
      }
    }
  }

  const getRecomendacaoAgua = (consumoAtual: string) => {
    switch (consumoAtual) {
      case 'menos_1l': return '2-3L'
      case '1-2l': return '2.5-3L'
      case '2-3l': return '3L'
      case 'mais_3l': return '3-4L'
      default: return '2-3L'
    }
  }

  const getCheckinsHoje = () => {
    const hoje = new Date().toDateString()
    const checkins = JSON.parse(localStorage.getItem('academia_checkins') || '[]')
    return checkins.filter((checkin: any) => new Date(checkin.date).toDateString() === hoje)
  }

  const getMetasUsuario = () => {
    return JSON.parse(localStorage.getItem('academia_metas') || '[]')
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))

    // Atualizar localStorage
    const notificacoesStorage = JSON.parse(localStorage.getItem('academia_notificacoes') || '[]')
    const atualizadas = notificacoesStorage.filter((n: any) => n.id !== id)
    localStorage.setItem('academia_notificacoes', JSON.stringify(atualizadas))
  }

  return {
    notifications,
    dismissNotification,
    generateNotifications: checkForNewNotifications
  }
}