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
const STORAGE_KEY_CARTOES = 'fin_pessoal_cartoes'
const now = () => new Date().toISOString()
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// ─── Cartões ──────────────────────────────────────────────────────────────────

export type BandeiraCartao = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outro'

export interface Cartao {
  id: string
  apelido: string           // "Nubank principal", "Inter débito"
  bandeira: BandeiraCartao
  ultimos4: string          // últimos 4 dígitos
  limite: number
  diaVencimento: number     // 1-31
  melhorDiaCompra: number   // calculado: vencimento - 10 dias
  cor: string               // hex ou tailwind p/ personalização
  criadoEm: string
  atualizadoEm: string
}

export interface AlertaCartao {
  cartaoId: string
  apelido: string
  tipo: 'melhor_dia' | 'fatura_proxima' | 'fatura_hoje' | 'fatura_atrasada'
  diasRestantes: number     // negativo = já passou
  mensagem: string
  urgencia: 'info' | 'aviso' | 'critico'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFinanceiroPessoal() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [cartoes, setCartoes] = useState<Cartao[]>([])
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
    try {
      const rawC = localStorage.getItem(STORAGE_KEY_CARTOES)
      if (rawC) setCartoes(JSON.parse(rawC))
    } catch { /* noop */ }
  }, [])

  // persist
  const persist = useCallback((list: Lancamento[]) => {
    setLancamentos(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }, [])

  const persistCartoes = useCallback((list: Cartao[]) => {
    setCartoes(list)
    localStorage.setItem(STORAGE_KEY_CARTOES, JSON.stringify(list))
  }, [])

  // ─── CRUD cartões ────────────────────────────────────────────────────────────

  const adicionarCartao = useCallback((dados: Omit<Cartao, 'id' | 'melhorDiaCompra' | 'criadoEm' | 'atualizadoEm'>) => {
    // melhor dia = vencimento - 10, ajustado p/ mês
    const melhor = dados.diaVencimento > 10 ? dados.diaVencimento - 10 : dados.diaVencimento + 20
    const novo: Cartao = { ...dados, id: uid(), melhorDiaCompra: melhor, criadoEm: now(), atualizadoEm: now() }
    persistCartoes([...cartoes, novo])
  }, [cartoes, persistCartoes])

  const atualizarCartao = useCallback((id: string, dados: Partial<Omit<Cartao, 'id' | 'criadoEm'>>) => {
    const melhor = dados.diaVencimento
      ? dados.diaVencimento > 10 ? dados.diaVencimento - 10 : dados.diaVencimento + 20
      : undefined
    persistCartoes(cartoes.map(c => c.id === id
      ? { ...c, ...dados, ...(melhor !== undefined ? { melhorDiaCompra: melhor } : {}), atualizadoEm: now() }
      : c
    ))
  }, [cartoes, persistCartoes])

  const removerCartao = useCallback((id: string) => {
    persistCartoes(cartoes.filter(c => c.id !== id))
  }, [cartoes, persistCartoes])

  // ─── Alertas de cartão ───────────────────────────────────────────────────────

  const alertasCartoes: AlertaCartao[] = cartoes.flatMap(c => {
    const hoje = new Date()
    const diaHoje = hoje.getDate()
    const alertas: AlertaCartao[] = []

    // melhor dia de compra: avisa no dia exato
    if (diaHoje === c.melhorDiaCompra) {
      alertas.push({
        cartaoId: c.id, apelido: c.apelido,
        tipo: 'melhor_dia', diasRestantes: 0,
        mensagem: `Hoje é o melhor dia para comprar no ${c.apelido}!`,
        urgencia: 'info',
      })
    }

    // próximo vencimento de fatura
    const proxVenc = new Date(hoje.getFullYear(), hoje.getMonth(), c.diaVencimento)
    if (proxVenc < hoje) proxVenc.setMonth(proxVenc.getMonth() + 1)
    const diff = Math.round((proxVenc.getTime() - hoje.getTime()) / 86400000)

    if (diff < 0) {
      alertas.push({
        cartaoId: c.id, apelido: c.apelido,
        tipo: 'fatura_atrasada', diasRestantes: diff,
        mensagem: `Fatura ${c.apelido} está ${Math.abs(diff)} dia(s) em atraso!`,
        urgencia: 'critico',
      })
    } else if (diff === 0) {
      alertas.push({
        cartaoId: c.id, apelido: c.apelido,
        tipo: 'fatura_hoje', diasRestantes: 0,
        mensagem: `Fatura ${c.apelido} vence HOJE!`,
        urgencia: 'critico',
      })
    } else if (diff <= 5) {
      alertas.push({
        cartaoId: c.id, apelido: c.apelido,
        tipo: 'fatura_proxima', diasRestantes: diff,
        mensagem: `Fatura ${c.apelido} vence em ${diff} dia(s)`,
        urgencia: diff <= 2 ? 'critico' : 'aviso',
      })
    }

    return alertas
  })

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
    cartoes,
    adicionarCartao,
    atualizarCartao,
    removerCartao,
    alertasCartoes,
  }
}
