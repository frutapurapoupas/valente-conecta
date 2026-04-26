'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isMockMode } from '@/lib/supabase-client-switch'

export interface ProdutoCatalogo {
  id: string
  servicoId: string
  nome: string
  descricao: string
  preco: number
  imagem?: string
  categoria: string
  ativo: boolean
  publicado: boolean
  createdAt: string
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string
  atribuidoPara?: string
  atribuidoPor: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta'
  dataCriacao: string
  dataLimite?: string
  concluidaEm?: string
}

export interface MensagemCliente {
  id: string
  clienteId: string
  clienteNome: string
  clienteTelefone: string
  servicoId: string
  mensagem: string
  resposta?: string
  status: 'pendente' | 'respondida'
  dataEnvio: string
  dataResposta?: string
}

export interface ExtratoItem {
  id: string
  tipo: 'agendamento' | 'produto' | 'servico'
  descricao: string
  valor: number
  data: string
  clienteNome?: string
  status: 'pago' | 'pendente' | 'cancelado'
}

export const useAdminServicoAgendamento = (servicoId?: string) => {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [mensagens, setMensagens] = useState<MensagemCliente[]>([])
  const [extrato, setExtrato] = useState<ExtratoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoExtrato, setPeriodoExtrato] = useState<'hoje' | 'mes' | 'personalizado'>('mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Carregar dados
  const carregarDados = useCallback(async () => {
    setLoading(true)
    if (isMockMode()) {
      console.log('📦 Usando dados MOCK para Admin Serviço Agendamento')
      setProdutos([])
      setTarefas([])
      setMensagens([])
      setExtrato([])
    } else {
      try {
        const [prodRes, tarefasRes, msgsRes, extratoRes] = await Promise.all([
          supabase.from('produtos_catalogo').select('*').eq('servico_id', servicoId),
          supabase.from('tarefas').select('*').eq('servico_id', servicoId),
          supabase.from('mensagens_clientes').select('*').eq('servico_id', servicoId),
          supabase.from('extrato').select('*').eq('servico_id', servicoId),
        ])
        
        if (prodRes.data) setProdutos(prodRes.data)
        if (tarefasRes.data) setTarefas(tarefasRes.data)
        if (msgsRes.data) setMensagens(msgsRes.data)
        if (extratoRes.data) setExtrato(extratoRes.data)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    setLoading(false)
  }, [servicoId])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // --- PRODUTOS/CATÁLOGO ---

  const criarProduto = async (produto: Omit<ProdutoCatalogo, 'id' | 'createdAt'>) => {
    const novo: ProdutoCatalogo = {
      ...produto,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    if (isMockMode()) {
      setProdutos(prev => [...prev, novo])
      return novo
    }

    const { data, error } = await supabase
      .from('produtos_catalogo')
      .insert(novo)
      .select()
      .single()
    if (error) throw error
    setProdutos(prev => [...prev, data])
    return data
  }

  const atualizarProduto = async (id: string, updates: Partial<ProdutoCatalogo>) => {
    if (isMockMode()) {
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
      return
    }

    const { error } = await supabase
      .from('produtos_catalogo')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const publicarProduto = async (id: string) => {
    await atualizarProduto(id, { publicado: true, ativo: true })
  }

  const despublicarProduto = async (id: string) => {
    await atualizarProduto(id, { publicado: false })
  }

  const removerProduto = async (id: string) => {
    if (isMockMode()) {
      setProdutos(prev => prev.filter(p => p.id !== id))
      return
    }

    const { error } = await supabase
      .from('produtos_catalogo')
      .delete()
      .eq('id', id)
    if (error) throw error
    setProdutos(prev => prev.filter(p => p.id !== id))
  }

  // --- TAREFAS ---

  const criarTarefa = async (tarefa: Omit<Tarefa, 'id' | 'dataCriacao'>) => {
    const nova: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString(),
    }

    if (isMockMode()) {
      setTarefas(prev => [...prev, nova])
      return nova
    }

    const { data, error } = await supabase
      .from('tarefas')
      .insert(nova)
      .select()
      .single()
    if (error) throw error
    setTarefas(prev => [...prev, data])
    return data
  }

  const atualizarTarefa = async (id: string, updates: Partial<Tarefa>) => {
    if (isMockMode()) {
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
      return
    }

    const { error } = await supabase
      .from('tarefas')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const atribuirTarefa = async (id: string, atribuidoPara: string) => {
    await atualizarTarefa(id, { atribuidoPara })
  }

  const concluirTarefa = async (id: string) => {
    await atualizarTarefa(id, { 
      status: 'concluida', 
      concluidaEm: new Date().toISOString() 
    })
  }

  // --- MENSAGENS CLIENTES ---

  const responderCliente = async (id: string, resposta: string) => {
    if (isMockMode()) {
      setMensagens(prev => prev.map(m => 
        m.id === id 
          ? { ...m, resposta, status: 'respondida', dataResposta: new Date().toISOString() }
          : m
      ))
      return
    }

    const { error } = await supabase
      .from('mensagens_clientes')
      .update({ 
        resposta, 
        status: 'respondida', 
        data_resposta: new Date().toISOString() 
      })
      .eq('id', id)
    if (error) throw error
    setMensagens(prev => prev.map(m => 
      m.id === id 
        ? { ...m, resposta, status: 'respondida', dataResposta: new Date().toISOString() }
        : m
    ))
  }

  // --- EXTRATO ---

  const filtrarExtratoPorPeriodo = useCallback(() => {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    let inicio: Date
    let fim: Date

    switch (periodoExtrato) {
      case 'hoje':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
        fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
        break
      case 'mes':
        inicio = inicioMes
        fim = fimMes
        break
      case 'personalizado':
        inicio = dataInicio ? new Date(dataInicio) : inicioMes
        fim = dataFim ? new Date(dataFim) : fimMes
        break
    }

    return extrato.filter(item => {
      const dataItem = new Date(item.data)
      return dataItem >= inicio && dataItem <= fim
    })
  }, [extrato, periodoExtrato, dataInicio, dataFim])

  const getResumoExtrato = useCallback(() => {
    const filtrado = filtrarExtratoPorPeriodo()
    const total = filtrado.reduce((sum, item) => sum + item.valor, 0)
    const pago = filtrado.filter(i => i.status === 'pago').reduce((sum, i) => sum + i.valor, 0)
    const pendente = filtrado.filter(i => i.status === 'pendente').reduce((sum, i) => sum + i.valor, 0)

    return {
      total,
      pago,
      pendente,
      quantidade: filtrado.length,
    }
  }, [filtrarExtratoPorPeriodo])

  // --- ESTATÍSTICAS ---

  const getEstatisticas = useCallback(() => {
    const produtosAtivos = produtos.filter(p => p.ativo && p.publicado).length
    const tarefasPendentes = tarefas.filter(t => t.status === 'pendente').length
    const mensagensPendentes = mensagens.filter(m => m.status === 'pendente').length
    const resumo = getResumoExtrato()

    return {
      produtosAtivos,
      produtosTotal: produtos.length,
      tarefasPendentes,
      tarefasTotal: tarefas.length,
      mensagensPendentes,
      mensagensTotal: mensagens.length,
      faturamentoTotal: resumo.pago,
      faturamentoPendente: resumo.pendente,
    }
  }, [produtos, tarefas, mensagens, getResumoExtrato])

  return {
    // Dados
    produtos,
    tarefas,
    mensagens,
    extrato,
    loading,
    periodoExtrato,
    dataInicio,
    dataFim,

    // Produtos
    criarProduto,
    atualizarProduto,
    publicarProduto,
    despublicarProduto,
    removerProduto,

    // Tarefas
    criarTarefa,
    atualizarTarefa,
    atribuirTarefa,
    concluirTarefa,

    // Mensagens
    responderCliente,

    // Extrato
    setPeriodoExtrato,
    setDataInicio,
    setDataFim,
    filtrarExtratoPorPeriodo,
    getResumoExtrato,

    // Estatísticas
    getEstatisticas,

    // Refresh
    refresh: carregarDados,
  }
}
