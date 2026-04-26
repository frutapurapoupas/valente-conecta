'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePlanos } from '@/hooks/usePlanos'

export interface TempoAtividade {
  id: string
  usuarioId: string
  tipo: 'academia' | 'esporte'
  atividade: string
  dataInicio: string
  dataFim?: string
  duracaoSegundos: number
  local?: string
}

export function useAcademiaAlertas() {
  const { user } = useAuth()
  const planosHook = usePlanos(user?.id)
  const [tempoAtivo, setTempoAtivo] = useState<TempoAtividade | null>(null)
  const [segundosDecorridos, setSegundosDecorridos] = useState(0)
  const [historico, setHistorico] = useState<TempoAtividade[]>([])
  const [alertaEnviado, setAlertaEnviado] = useState(false)

  const temPlanoAcademia = planosHook.temPlanoAcademia()

  useEffect(() => {
    carregarHistorico()
    const salvo = localStorage.getItem('tempo_ativo')
    if (salvo) {
      const tempo = JSON.parse(salvo)
      if (tempo.usuarioId === user?.id) {
        setTempoAtivo(tempo)
        const inicio = new Date(tempo.dataInicio).getTime()
        const agora = Date.now()
        setSegundosDecorridos(Math.floor((agora - inicio) / 1000))
      }
    }
  }, [user])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (tempoAtivo) {
      interval = setInterval(() => {
        setSegundosDecorridos(prev => prev + 1)
        
        // Enviar alerta a cada 30 minutos
        if (segundosDecorridos > 0 && segundosDecorridos % 1800 === 0 && !alertaEnviado) {
          enviarAlerta()
          setAlertaEnviado(true)
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [tempoAtivo, segundosDecorridos, alertaEnviado])

  const carregarHistorico = () => {
    const salvo = localStorage.getItem('historico_atividades')
    if (salvo) {
      setHistorico(JSON.parse(salvo))
    }
  }

  const iniciarAtividade = (tipo: 'academia' | 'esporte', atividade: string, local?: string) => {
    if (!temPlanoAcademia) {
      alert('Você precisa ter um plano de Academia para usar esta funcionalidade')
      return
    }

    if (tempoAtivo) {
      alert('Já existe uma atividade em andamento')
      return
    }

    const novoTempo: TempoAtividade = {
      id: Date.now().toString(),
      usuarioId: user?.id || '',
      tipo,
      atividade,
      dataInicio: new Date().toISOString(),
      duracaoSegundos: 0,
      local,
    }

    setTempoAtivo(novoTempo)
    setSegundosDecorridos(0)
    setAlertaEnviado(false)
    localStorage.setItem('tempo_ativo', JSON.stringify(novoTempo))
  }

  const pararAtividade = () => {
    if (!tempoAtivo) return

    const tempoFinalizado: TempoAtividade = {
      ...tempoAtivo,
      dataFim: new Date().toISOString(),
      duracaoSegundos: segundosDecorridos,
    }

    const novoHistorico = [tempoFinalizado, ...historico]
    setHistorico(novoHistorico)
    localStorage.setItem('historico_atividades', JSON.stringify(novoHistorico))
    
    setTempoAtivo(null)
    setSegundosDecorridos(0)
    setAlertaEnviado(false)
    localStorage.removeItem('tempo_ativo')

    // Enviar alerta final
    enviarAlertaFinal(tempoFinalizado)
  }

  const enviarAlerta = () => {
    if (!tempoAtivo) return

    const minutos = Math.floor(segundosDecorridos / 60)
    const mensagem = `⏱️ Você está há ${minutos} minutos em ${tempoAtivo.atividade}. Continue assim!`

    // Simular envio de notificação
    console.log('ALERTA:', mensagem)
    
    // Aqui seria integrado com sistema de notificações real
    // Por exemplo: enviar para o bot Telegram ou sistema de push
  }

  const enviarAlertaFinal = (tempo: TempoAtividade) => {
    const minutos = Math.floor(tempo.duracaoSegundos / 60)
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    let duracaoFormatada = ''
    if (horas > 0) {
      duracaoFormatada = `${horas}h ${minutosRestantes}min`
    } else {
      duracaoFormatada = `${minutos}min`
    }

    const mensagem = `🎉 Ótimo trabalho! Você completou ${tempo.atividade} em ${duracaoFormatada}.`
    console.log('ALERTA FINAL:', mensagem)
  }

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const seg = segundos % 60

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
    }
    return `${minutos}:${seg.toString().padStart(2, '0')}`
  }

  const getTotalHoje = useCallback(() => {
    const hoje = new Date().toDateString()
    return historico
      .filter(t => new Date(t.dataInicio).toDateString() === hoje)
      .reduce((total, t) => total + t.duracaoSegundos, 0)
  }, [historico])

  const getTotalSemana = useCallback(() => {
    const agora = new Date()
    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - agora.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    return historico
      .filter(t => new Date(t.dataInicio) >= inicioSemana)
      .reduce((total, t) => total + t.duracaoSegundos, 0)
  }, [historico])

  return {
    tempoAtivo,
    segundosDecorridos,
    historico,
    temPlanoAcademia,
    iniciarAtividade,
    pararAtividade,
    formatarTempo,
    getTotalHoje,
    getTotalSemana,
  }
}
