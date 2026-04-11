'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LancamentoTipo = 'receita' | 'despesa' | 'fatura'

export type LancamentoStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

export type LancamentoCategoria =
  | 'pro-labore' | 'salario' | 'bonus' | 'dividendos' | 'outros_receita'
  | 'alimentacao' | 'moradia' | 'transporte' | 'saude' | 'educacao'
  | 'lazer' | 'cartao_credito' | 'financiamento' | 'assinatura' | 'outros_despesa'

export type Periodicidade = 'mensal' | 'quinzenal' | 'semanal' | 'anual'

export interface Lancamento {
  id: string
  tipo: LancamentoTipo
  descricao: string
  valor: number
  categoria: LancamentoCategoria
  vencimento: string        // YYYY-MM-DD
  status: LancamentoStatus
  recorrente: boolean
  periodos?: number         // quantos meses repetir (0 = indefinido)
  periodicidade?: Periodicidade
  grupoRecorrencia?: string // ID compartilhado entre instâncias recorrentes
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export interface ResumoPessoal {
  saldoMes: number
  totalReceitas: number
  totalDespesas: number
  aVencer: number           // soma de pendentes com venc. futura
  atrasados: number         // soma de pendentes vencidos
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const CATEGORIAS_RECEITA: { value: LancamentoCategoria; label: string; emoji: string }[] = [
  { value: 'pro-labore',      label: 'Pró-labore',        emoji: '💼' },
  { value: 'salario',         label: 'Salário',           emoji: '💰' },
  { value: 'bonus',           label: 'Bônus',             emoji: '🎁' },
  { value: 'dividendos',      label: 'Dividendos',        emoji: '📈' },
  { value: 'outros_receita',  label: 'Outros (receita)',  emoji: '➕' },
]

export const CATEGORIAS_DESPESA: { value: LancamentoCategoria; label: string; emoji: string }[] = [
  { value: 'moradia',         label: 'Moradia',           emoji: '🏠' },
  { value: 'alimentacao',     label: 'Alimentação',       emoji: '🍽️' },
  { value: 'transporte',      label: 'Transporte',        emoji: '🚗' },
  { value: 'saude',           label: 'Saúde',             emoji: '❤️‍🩹' },
  { value: 'educacao',        label: 'Educação',          emoji: '📚' },
  { value: 'lazer',           label: 'Lazer',             emoji: '🎮' },
  { value: 'cartao_credito',  label: 'Cartão de Crédito', emoji: '💳' },
  { value: 'financiamento',   label: 'Financiamento',     emoji: '🏦' },
  { value: 'assinatura',      label: 'Assinatura',        emoji: '📱' },
  { value: 'outros_despesa',  label: 'Outros (despesa)',  emoji: '📌' },
]

const STORAGE_KEY = 'fin_pessoal_lancamentos'
const now = () => new Date().toISOString()
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFinanceiroPessoal() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [filtroMes, setFiltroMes] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [filtroTipo, setFiltroTipo] = useState<LancamentoTipo | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<LancamentoStatus | 'todos'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<Lancamento | null>(null)

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLancamentos(JSON.parse(raw))
    } catch { /* noop */ }
  }, [])

  // persist
  const persist = useCallback((list: Lancamento[]) => {
    setLancamentos(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [])

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const adicionarLancamento = useCallback((dados: Omit<Lancamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const lista: Lancamento[] = []
    const grupoId = dados.recorrente ? uid() : undefined
    const totalPeriodos = dados.recorrente && (dados.periodos ?? 0) > 0 ? dados.periodos! : dados.recorrente ? 12 : 1

    for (let i = 0; i < totalPeriodos; i++) {
      const baseDate = new Date(dados.vencimento + 'T12:00:00')
      let venc = new Date(baseDate)

      if (i > 0) {
        const per = dados.periodicidade ?? 'mensal'
        if (per === 'mensal')     { venc.setMonth(venc.getMonth() + i) }
        else if (per === 'anual') { venc.setFullYear(venc.getFullYear() + i) }
        else if (per === 'quinzenal') { venc.setDate(venc.getDate() + 15 * i) }
        else if (per === 'semanal')   { venc.setDate(venc.getDate() + 7 * i) }
      }

      lista.push({
        ...dados,
        id: uid(),
        vencimento: venc.toISOString().slice(0, 10),
        grupoRecorrencia: grupoId,
        criadoEm: now(),
        atualizadoEm: now(),
      })
    }

    persist([...lancamentos, ...lista])
  }, [lancamentos, persist])

  const atualizarLancamento = useCallback((id: string, dados: Partial<Lancamento>) => {
    persist(lancamentos.map(l => l.id === id ? { ...l, ...dados, atualizadoEm: now() } : l))
  }, [lancamentos, persist])

  const removerLancamento = useCallback((id: string) => {
    persist(lancamentos.filter(l => l.id !== id))
  }, [lancamentos, persist])

  const removerGrupoRecorrencia = useCallback((grupoId: string) => {
    persist(lancamentos.filter(l => l.grupoRecorrencia !== grupoId))
  }, [lancamentos, persist])

  const marcarPago = useCallback((id: string) => {
    atualizarLancamento(id, { status: 'pago' })
  }, [atualizarLancamento])

  // ─── Pró-labore automático ───────────────────────────────────────────────────

  const adicionarProlabore = useCallback((valor: number, mesRef?: string) => {
    const ref = mesRef ?? filtroMes
    const venc = ref + '-05' // dia 5 do mês referência
    const jaExiste = lancamentos.some(
      l => l.categoria === 'pro-labore' && l.vencimento.startsWith(ref)
    )
    if (jaExiste) return
    adicionarLancamento({
      tipo: 'receita',
      descricao: `Pró-labore ${ref}`,
      valor,
      categoria: 'pro-labore',
      vencimento: venc,
      status: 'pendente',
      recorrente: false,
    })
  }, [lancamentos, adicionarLancamento, filtroMes])

  // ─── Filtros + cálculos ─────────────────────────────────────────────────────

  const hoje = new Date().toISOString().slice(0, 10)

  // atualiza status de atrasados automaticamente
  const lancamentosNormalizados: Lancamento[] = lancamentos.map(l => {
    if (l.status === 'pendente' && l.vencimento < hoje) return { ...l, status: 'atrasado' as LancamentoStatus }
    return l
  })

  const lancamentosFiltrados = lancamentosNormalizados.filter(l => {
    const noMes    = l.vencimento.startsWith(filtroMes)
    const tipoOk   = filtroTipo === 'todos' || l.tipo === filtroTipo
    const statusOk = filtroStatus === 'todos' || l.status === filtroStatus
    return noMes && tipoOk && statusOk
  })

  const todosMes = lancamentosNormalizados.filter(l => l.vencimento.startsWith(filtroMes))

  const resumo: ResumoPessoal = {
    totalReceitas: todosMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0),
    totalDespesas: todosMes.filter(l => l.tipo !== 'receita').reduce((s, l) => s + l.valor, 0),
    saldoMes: todosMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
              - todosMes.filter(l => l.tipo !== 'receita').reduce((s, l) => s + l.valor, 0),
    aVencer: todosMes.filter(l => l.status === 'pendente' && l.vencimento >= hoje).reduce((s, l) => s + l.valor, 0),
    atrasados: lancamentosNormalizados.filter(l => l.status === 'atrasado').reduce((s, l) => s + l.valor, 0),
  }

  // ─── Modal helpers ──────────────────────────────────────────────────────────

  const abrirNovo = useCallback(() => { setEditando(null); setShowModal(true) }, [])
  const abrirEdicao = useCallback((l: Lancamento) => { setEditando(l); setShowModal(true) }, [])
  const fecharModal = useCallback(() => { setEditando(null); setShowModal(false) }, [])

  return {
    lancamentos: lancamentosFiltrados,
    todosMes,
    resumo,
    filtroMes, setFiltroMes,
    filtroTipo, setFiltroTipo,
    filtroStatus, setFiltroStatus,
    showModal, editando,
    abrirNovo, abrirEdicao, fecharModal,
    adicionarLancamento,
    atualizarLancamento,
    removerLancamento,
    removerGrupoRecorrencia,
    marcarPago,
    adicionarProlabore,
  }
}
