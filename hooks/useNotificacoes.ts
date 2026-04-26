'use client'

import { useState, useEffect } from 'react'

export interface Notificacao {
  id: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  titulo: string
  mensagem: string
  data: string
  lida: boolean
  usuarioId?: string
  acao?: {
    label: string
    onClick: () => void
  }
}

export function useNotificacoes(usuarioId?: string) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    // Carregar notificações do localStorage
    const salvas = localStorage.getItem('notificacoes')
    if (salvas) {
      const todas = JSON.parse(salvas) as Notificacao[]
      const doUsuario = usuarioId 
        ? todas.filter(n => !n.usuarioId || n.usuarioId === usuarioId)
        : todas
      setNotificacoes(doUsuario)
      setNaoLidas(doUsuario.filter(n => !n.lida).length)
    }
  }, [usuarioId])

  const criarNotificacao = (notificacao: Omit<Notificacao, 'id' | 'data' | 'lida'>) => {
    const nova: Notificacao = {
      ...notificacao,
      id: Date.now().toString(),
      data: new Date().toISOString(),
      lida: false
    }

    setNotificacoes(prev => [nova, ...prev])
    setNaoLidas(prev => prev + 1)

    // Salvar no localStorage
    const salvas = localStorage.getItem('notificacoes')
    const todas = salvas ? JSON.parse(salvas) : []
    todas.unshift(nova)
    localStorage.setItem('notificacoes', JSON.stringify(todas))

    // Enviar notificação push se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificacao.titulo, {
        body: notificacao.mensagem,
        icon: '/icon-192.png'
      })
    }

    return nova
  }

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ))
    setNaoLidas(prev => Math.max(0, prev - 1))

    // Atualizar localStorage
    const salvas = localStorage.getItem('notificacoes')
    if (salvas) {
      const todas = JSON.parse(salvas) as Notificacao[]
      const atualizadas = todas.map(n => 
        n.id === id ? { ...n, lida: true } : n
      )
      localStorage.setItem('notificacoes', JSON.stringify(atualizadas))
    }
  }

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    setNaoLidas(0)

    // Atualizar localStorage
    const salvas = localStorage.getItem('notificacoes')
    if (salvas) {
      const todas = JSON.parse(salvas) as Notificacao[]
      const atualizadas = todas.map(n => ({ ...n, lida: true }))
      localStorage.setItem('notificacoes', JSON.stringify(atualizadas))
    }
  }

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id))
    if (!notificacoes.find(n => n.id === id)?.lida) {
      setNaoLidas(prev => Math.max(0, prev - 1))
    }

    // Atualizar localStorage
    const salvas = localStorage.getItem('notificacoes')
    if (salvas) {
      const todas = JSON.parse(salvas) as Notificacao[]
      const atualizadas = todas.filter(n => n.id !== id)
      localStorage.setItem('notificacoes', JSON.stringify(atualizadas))
    }
  }

  const limparTodas = () => {
    setNotificacoes([])
    setNaoLidas(0)
    localStorage.removeItem('notificacoes')
  }

  const solicitarPermissao = async () => {
    if ('Notification' in window) {
      const permissao = await Notification.requestPermission()
      return permissao === 'granted'
    }
    return false
  }

  // Notificações pré-definidas para eventos comuns
  const notificarNovoAgendamento = (clienteNome: string, servico: string, horario: string) => {
    return criarNotificacao({
      tipo: 'info',
      titulo: 'Novo Agendamento',
      mensagem: `${clienteNome} agendou ${servico} para ${horario}`,
      usuarioId
    })
  }

  const notificarAgendamentoConfirmado = (clienteNome: string, horario: string) => {
    return criarNotificacao({
      tipo: 'sucesso',
      titulo: 'Agendamento Confirmado',
      mensagem: `Agendamento de ${clienteNome} confirmado para ${horario}`,
      usuarioId
    })
  }

  const notificarAgendamentoCancelado = (clienteNome: string, motivo?: string) => {
    return criarNotificacao({
      tipo: 'aviso',
      titulo: 'Agendamento Cancelado',
      mensagem: `${clienteNome} cancelou o agendamento${motivo ? `: ${motivo}` : ''}`,
      usuarioId
    })
  }

  const notificarPagamentoRecebido = (valor: number, clienteNome: string) => {
    return criarNotificacao({
      tipo: 'sucesso',
      titulo: 'Pagamento Recebido',
      mensagem: `Pagamento de R$${valor.toFixed(2)} recebido de ${clienteNome}`,
      usuarioId
    })
  }

  const notificarCreditoBonusRecebido = (valor: number, origem: string) => {
    return criarNotificacao({
      tipo: 'sucesso',
      titulo: 'Crédito Bônus Recebido',
      mensagem: `Você recebeu R$${valor.toFixed(2)} de bônus - ${origem}`,
      usuarioId
    })
  }

  const notificarCreditoBonusPendente = (valor: number, mes: string) => {
    return criarNotificacao({
      tipo: 'aviso',
      titulo: 'Crédito Bônus Pendente',
      mensagem: `R$${valor.toFixed(2)} aguardando resgate em ${mes}`,
      usuarioId,
      acao: {
        label: 'Ver Créditos',
        onClick: () => window.location.href = '/admin-loja/creditos-bonus'
      }
    })
  }

  const notificarNovoColaborador = (nome: string) => {
    return criarNotificacao({
      tipo: 'info',
      titulo: 'Novo Colaborador',
      mensagem: `${nome} foi adicionado à equipe`,
      usuarioId
    })
  }

  const notificarTarefaConcluida = (titulo: string, colaboradorNome: string) => {
    return criarNotificacao({
      tipo: 'sucesso',
      titulo: 'Tarefa Concluída',
      mensagem: `${colaboradorNome} concluiu: ${titulo}`,
      usuarioId
    })
  }

  return {
    notificacoes,
    naoLidas,
    criarNotificacao,
    marcarComoLida,
    marcarTodasComoLidas,
    removerNotificacao,
    limparTodas,
    solicitarPermissao,
    notificarNovoAgendamento,
    notificarAgendamentoConfirmado,
    notificarAgendamentoCancelado,
    notificarPagamentoRecebido,
    notificarCreditoBonusRecebido,
    notificarCreditoBonusPendente,
    notificarNovoColaborador,
    notificarTarefaConcluida
  }
}
