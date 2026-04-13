'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Agendamento, AgendamentoStatus } from '@/types/agenda'
import {
  listarAgendamentosProfissional,
  listarHorariosLivres,
  criarAgendamento,
  atualizarStatusAgendamento,
  adicionarFilaEspera,
  clienteJaAgendadoNoDia,
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

export function useAgendaProfissionalPage(dia: string = new Date().toISOString().slice(0, 10)) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [horariosLivres, setHorariosLivres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showNovo, setShowNovo] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<AgendamentoStatus | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState<FormAgendamento>(FORM_VAZIO)
  const [erroAgendamento, setErroAgendamento] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
      setAgendamentos(data)
      const livres = await listarHorariosLivres(PROFISSIONAL_FIXO.id, dia)
      setHorariosLivres(livres)
      setLoading(false)
    }
    fetchData()
  }, [dia])

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

  async function salvarNovoAgendamento() {
    setErroAgendamento(null)
    const valor = Number(form.valor.replace(',', '.'))
    if (
      !form.clienteNome.trim() ||
      !form.servico.trim() ||
      !form.inicio ||
      !form.fim ||
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      setErroAgendamento('Preencha todos os campos obrigatórios.')
      return
    }
    // Previne agendamento duplicado no mesmo dia
    const jaAgendado = await clienteJaAgendadoNoDia(form.clienteTelefone.trim(), form.inicio.slice(0, 10))
    if (jaAgendado) {
      setErroAgendamento('Você já possui agendamento neste dia.')
      return
    }
    // Tenta criar agendamento
    const { agendamento, conflito } = await criarAgendamento({
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
    if (conflito) {
      setErroAgendamento('Horário já ocupado. Deseja entrar na fila de espera?')
      return
    }
    // Atualiza lista
    const atualizado = await listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
    setAgendamentos(atualizado)
    setForm(FORM_VAZIO)
    setShowNovo(false)
  }

  async function atualizarStatus(id: string, status: AgendamentoStatus) {
    await atualizarStatusAgendamento(id, status)
    const atualizado = await listarAgendamentosProfissional(PROFISSIONAL_FIXO.id)
    setAgendamentos(atualizado)
  }

  async function entrarFilaEspera() {
    await adicionarFilaEspera(
      PROFISSIONAL_FIXO.id,
      new Date(form.inicio).toISOString(),
      form.clienteNome.trim(),
      form.clienteTelefone.trim()
    )
    setErroAgendamento('Você foi adicionado à fila de espera.')
  }

  return {
    profissional: PROFISSIONAL_FIXO,
    agendamentos: listaFiltrada,
    horariosLivres,
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
    entrarFilaEspera,
    erroAgendamento,
    stats,
  }
}
