'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Agendamento, AgendamentoStatus } from '@/types/agenda'
import { listarAgendamentos, atualizarStatusAgendamento } from '@/services/agendaService'

export function useAdminAgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFiltro, setStatusFiltro] = useState<AgendamentoStatus | 'todos'>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const data: Agendamento[] = listarAgendamentos()
    setAgendamentos(data)
    setLoading(false)
  }, [])

  const listaFiltrada = useMemo(() => {
    return agendamentos
      .filter(item => (statusFiltro === 'todos' ? true : item.status === statusFiltro))
      .filter(item => {
        const termo = busca.trim().toLowerCase()
        if (!termo) return true
        return (
          item.clienteNome.toLowerCase().includes(termo) ||
          item.profissionalNome.toLowerCase().includes(termo) ||
          item.servico.toLowerCase().includes(termo)
        )
      })
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
  }, [agendamentos, busca, statusFiltro])

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const hojeCount = agendamentos.filter(item => item.inicio.slice(0, 10) === hoje).length
    const confirmados = agendamentos.filter(item => item.status === 'confirmado').length
    const cancelados = agendamentos.filter(item => item.status === 'cancelado').length
    const volume = agendamentos
      .filter(item => item.status !== 'cancelado')
      .reduce((sum, item) => sum + item.valor, 0)

    return { total: agendamentos.length, hojeCount, confirmados, cancelados, volume }
  }, [agendamentos])

  function atualizarStatus(id: string, status: AgendamentoStatus) {
    const atualizado = atualizarStatusAgendamento(id, status)
    setAgendamentos(atualizado)
  }

  return {
    agendamentos: listaFiltrada,
    loading,
    statusFiltro,
    setStatusFiltro,
    busca,
    setBusca,
    atualizarStatus,
    stats,
  }
}
