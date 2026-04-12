'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Agendamento, AgendamentoStatus } from '@/types/agenda'
import {
  listarAgendamentosProfissional,
  criarAgendamento,
  atualizarStatusAgendamento,
} from '@/services/agendaService'

const PROFISSIONAL_FIXO = {
  id: 'p1',
  nome: 'Naiara Designer',
}

interface FormAgendamento {
  clienteNome: string
  clienteTelefone: string
  servico: string
  valor: string
  inicio: string
  fim: string
  observacoes: string
}

const FORM_VAZIO: FormAgendamento = {
  clienteNome: '',
  clienteTelefone: '',
  servico: '',
  valor: '',
  inicio: '',
  fim: '',
  observacoes: '',
}

export function useAgendaProfissionalPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showNovo, setShowNovo] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<AgendamentoStatus | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState<FormAgendamento>(FORM_VAZIO)

  useEffect(() => {
    const data = listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
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
          item.servico.toLowerCase().includes(termo)
        )
      })
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
  }, [agendamentos, busca, statusFiltro])

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    const totalHoje = agendamentos.filter(item => item.inicio.slice(0, 10) === hoje).length
    const pendentes = agendamentos.filter(item => item.status === 'pendente').length
    const receitaPrevista = agendamentos
      .filter(item => item.status !== 'cancelado')
      .reduce((sum, item) => sum + item.valor, 0)

    return { totalHoje, pendentes, receitaPrevista }
  }, [agendamentos])

  function salvarNovoAgendamento() {
    const valor = Number(form.valor.replace(',', '.'))
    if (
      !form.clienteNome.trim() ||
      !form.servico.trim() ||
      !form.inicio ||
      !form.fim ||
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      return
    }

    criarAgendamento({
      profissionalId: PROFISSIONAL_FIXO.id,
      profissionalNome: PROFISSIONAL_FIXO.nome,
      clienteNome: form.clienteNome.trim(),
      clienteTelefone: form.clienteTelefone.trim(),
      servico: form.servico.trim(),
      valor,
      inicio: new Date(form.inicio).toISOString(),
      fim: new Date(form.fim).toISOString(),
      observacoes: form.observacoes.trim() || undefined,
    })

    const atualizado = listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
    setAgendamentos(atualizado)
    setForm(FORM_VAZIO)
    setShowNovo(false)
  }

  function atualizarStatus(id: string, status: AgendamentoStatus) {
    atualizarStatusAgendamento(id, status)
    const atualizado = listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
    setAgendamentos(atualizado)
  }

  return {
    profissional: PROFISSIONAL_FIXO,
    agendamentos: listaFiltrada,
    loading,
    showNovo,
    setShowNovo,
    statusFiltro,
    setStatusFiltro,
    busca,
    setBusca,
    form,
    setForm,
    salvarNovoAgendamento,
    atualizarStatus,
    stats,
  }
}
