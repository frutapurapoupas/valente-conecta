'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
export type VisaoCaixa        = 'DREX' | 'SISTEMA'
export type TipoLancamento    = 'RECEITA' | 'DESPESA'
export type StatusLancamento  = 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO'
export type RecorrenciaLancamento = number  // 0 = contínua, 1 = única, N = N parcelas
export type CategoriaLancamento  =
  | 'ASSINATURA' | 'DESBLOQUEIO' | 'PUBLICIDADE' | 'TAXA_PLATAFORMA'
  | 'SERVIDOR'   | 'EQUIPE'      | 'MARKETING'   | 'JURIDICO'
  | 'OPERACIONAL'| 'IMPOSTO'     | 'EVENTUAL'
  | 'BONUS_INDICACAO' | 'COMPENSACAO'

export interface Lancamento {
  id:                string
  visoes:            VisaoCaixa[]
  tipo:              TipoLancamento
  categoria:         CategoriaLancamento
  numeroDocumento?:   string        // nº NF, boleto, contrato etc.
  descricao:         string
  valor:             number
  data:              string         // YYYY-MM-DD
  vencimento:        number         // dia do mês
  status:            StatusLancamento
  recorrencia:       RecorrenciaLancamento
  cidade?:           string
  plano?:            string
  observacao?:       string
}

export interface LancamentoComSaldo extends Lancamento {
  saldoAcumulado: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const CIDADES = ['Todas', 'Uberlândia', 'Uberaba', 'Patos de Minas', 'Araxá', 'Ituiutaba']

export const CATEGORIA_LABEL: Record<CategoriaLancamento, string> = {
  ASSINATURA:       'Assinatura',
  DESBLOQUEIO:      'Desbloqueio',
  PUBLICIDADE:      'Publicidade',
  TAXA_PLATAFORMA:  'Taxa Plataforma',
  SERVIDOR:         'Servidor',
  EQUIPE:           'Equipe',
  MARKETING:        'Marketing',
  JURIDICO:         'Jurídico',
  OPERACIONAL:      'Operacional',
  IMPOSTO:          'Imposto',
  EVENTUAL:         'Eventual',
  BONUS_INDICACAO:  'Bônus Indicação',
  COMPENSACAO:      'Compensação',
}

export const CATEGORIA_COR: Record<CategoriaLancamento, string> = {
  ASSINATURA:       'bg-blue-500/15 text-blue-300',
  DESBLOQUEIO:      'bg-violet-500/15 text-violet-300',
  PUBLICIDADE:      'bg-amber-500/15 text-amber-300',
  TAXA_PLATAFORMA:  'bg-cyan-500/15 text-cyan-300',
  SERVIDOR:         'bg-indigo-500/15 text-indigo-300',
  EQUIPE:           'bg-rose-500/15 text-rose-300',
  MARKETING:        'bg-orange-500/15 text-orange-300',
  JURIDICO:         'bg-zinc-500/15 text-zinc-400',
  OPERACIONAL:      'bg-zinc-500/15 text-zinc-400',
  IMPOSTO:          'bg-red-500/15 text-red-300',
  EVENTUAL:         'bg-yellow-500/15 text-yellow-300',
  BONUS_INDICACAO:  'bg-emerald-500/15 text-emerald-300',
  COMPENSACAO:      'bg-teal-500/15 text-teal-300',
}

export const CATEGORIAS_RECEITA: CategoriaLancamento[] = [
  'ASSINATURA', 'DESBLOQUEIO', 'PUBLICIDADE', 'TAXA_PLATAFORMA', 'BONUS_INDICACAO', 'COMPENSACAO',
]
export const CATEGORIAS_DESPESA: CategoriaLancamento[] = [
  'SERVIDOR', 'EQUIPE', 'MARKETING', 'JURIDICO', 'OPERACIONAL', 'IMPOSTO', 'EVENTUAL',
]

// ─── Despesas Fixas DREX — templates mensais ─────────────────────────────────
interface DespesaFixaTemplate {
  id:         string
  categoria:  CategoriaLancamento
  descricao:  string
  valor:      number
  vencimento: number
}
export const DESPESAS_FIXAS_DREX: DespesaFixaTemplate[] = [
  // EQUIPE
  { id:'FX01', categoria:'EQUIPE',      descricao:'Folha Pagamento — Equipe Técnica e CS',           valor:28000, vencimento:5  },
  // INFRAESTRUTURA / SERVIDOR
  { id:'FX02', categoria:'SERVIDOR',    descricao:'AWS — Servidores, RDS, S3, CloudFront',           valor:3200,  vencimento:5  },
  { id:'FX03', categoria:'SERVIDOR',    descricao:'CDN / Edge Network Global',                        valor:890,   vencimento:5  },
  { id:'FX04', categoria:'SERVIDOR',    descricao:'Supabase — Banco de Dados Cloud',                 valor:450,   vencimento:10 },
  { id:'FX05', categoria:'SERVIDOR',    descricao:'Firebase — Push & Auth',                          valor:320,   vencimento:10 },
  { id:'FX06', categoria:'SERVIDOR',    descricao:'Licenças de Software (Figma, Notion, Linear)',    valor:890,   vencimento:1  },
  { id:'FX07', categoria:'SERVIDOR',    descricao:'Domínios e Certificados SSL',                     valor:180,   vencimento:1  },
  // MARKETING
  { id:'FX08', categoria:'MARKETING',   descricao:'Marketing Digital — Tráfego Pago (Meta/Google)', valor:4800,  vencimento:10 },
  { id:'FX09', categoria:'MARKETING',   descricao:'Produção de Conteúdo e Design',                  valor:1800,  vencimento:10 },
  // OPERACIONAL
  { id:'FX10', categoria:'OPERACIONAL', descricao:'Aluguel Escritório',                              valor:3800,  vencimento:5  },
  { id:'FX11', categoria:'OPERACIONAL', descricao:'Internet Fibra Empresarial (1 Gb)',               valor:450,   vencimento:5  },
  { id:'FX12', categoria:'OPERACIONAL', descricao:'Energia Elétrica',                                valor:680,   vencimento:15 },
  { id:'FX13', categoria:'OPERACIONAL', descricao:'Telefonia e Plano Mobile',                        valor:340,   vencimento:15 },
  { id:'FX14', categoria:'OPERACIONAL', descricao:'Limpeza e Manutenção Predial',                    valor:500,   vencimento:5  },
  // JURÍDICO / CONTÁBIL
  { id:'FX15', categoria:'JURIDICO',    descricao:'Assessoria Jurídica Mensal',                      valor:2200,  vencimento:15 },
  { id:'FX16', categoria:'JURIDICO',    descricao:'Contabilidade e BPO Financeiro',                  valor:1500,  vencimento:10 },
  // IMPOSTOS
  { id:'FX17', categoria:'IMPOSTO',     descricao:'INSS / Obrigações Tributárias',                   valor:3850,  vencimento:20 },
  { id:'FX18', categoria:'IMPOSTO',     descricao:'ISS / Simples Nacional',                          valor:1240,  vencimento:20 },
]

// --- Dados base --- migrados para caixa_lancamentos (DB) ---
// Ver: sql-migrations/seed-caixa-base.sql
const BASE_LANCAMENTOS: Lancamento[] = []

// Chart data — 6 months rolling
export const CHART_DREX = [
  { mes:'Nov/25', receitas:28400, despesas:42100 },
  { mes:'Dez/25', receitas:31200, despesas:44800 },
  { mes:'Jan/26', receitas:38900, despesas:45200 },
  { mes:'Fev/26', receitas:44100, despesas:46800 },
  { mes:'Mar/26', receitas:52700, despesas:48200 },
  { mes:'Abr/26', receitas:0,     despesas:0     }, // computed live
]
export const CHART_SISTEMA = [
  { mes:'Nov/25', receitas: 87200, despesas:61400  },
  { mes:'Dez/25', receitas: 94800, despesas:68200  },
  { mes:'Jan/26', receitas:112400, despesas:72800  },
  { mes:'Fev/26', receitas:128900, despesas:78400  },
  { mes:'Mar/26', receitas:147200, despesas:84600  },
  { mes:'Abr/26', receitas:0,      despesas:0      }, // computed live
]

// ─── Helper ───────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useControleCaixa() {
  const [visao,              setVisao]              = useState<VisaoCaixa>('DREX')
  const [mesFiltro,          setMesFiltro]          = useState(4)
  const [anoFiltro,          setAnoFiltro]          = useState(2026)
  const [filtroTipo,         setFiltroTipo]         = useState<TipoLancamento | 'TODOS'>('TODOS')
  const [filtroCategoria,    setFiltroCategoria]    = useState<CategoriaLancamento | 'TODOS'>('TODOS')
  const [filtroCidade,       setFiltroCidade]       = useState('Todas')
  const [filtroStatus,       setFiltroStatus]       = useState<StatusLancamento | 'TODOS'>('TODOS')
  const [filtroRecorrencia,  setFiltroRecorrencia]  = useState<number | 'TODOS'>('TODOS')
  const [lancamentosExtra,     setLancamentosExtra]     = useState<Lancamento[]>([])
  const [lancamentosRemovidos, setLancamentosRemovidos] = useState<Set<string>>(new Set())
  const [despesasExcluidas,    setDespesasExcluidas]    = useState<Set<string>>(new Set())
  const [mostrarModal,         setMostrarModal]         = useState(false)
  const [loading,              setLoading]              = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const [lancRes, exclRes] = await Promise.all([
        supabase.from('caixa_lancamentos').select('*').order('data', { ascending: true }),
        supabase.from('caixa_exclusoes_fixas').select('template_id, mes, ano'),
      ])
      if (lancRes.data) {
        setLancamentosExtra(lancRes.data.map(r => ({
          id:              r.id,
          visoes:          r.visoes as VisaoCaixa[],
          tipo:            r.tipo as TipoLancamento,
          categoria:       r.categoria as CategoriaLancamento,
          numeroDocumento: r.numero_documento ?? undefined,
          descricao:       r.descricao,
          valor:           Number(r.valor),
          data:            r.data,
          vencimento:      r.vencimento,
          status:          r.status as StatusLancamento,
          recorrencia:     r.recorrencia as RecorrenciaLancamento,
          cidade:          r.cidade ?? undefined,
          plano:           r.plano ?? undefined,
          observacao:      r.observacao ?? undefined,
        })))
      }
      if (exclRes.data) {
        setDespesasExcluidas(new Set(
          exclRes.data.map(r => `${r.template_id}-${r.ano}-${String(r.mes).padStart(2, '0')}`)
        ))
      }
      setLoading(false)
    }
    carregar()
  }, [])

  // ── Base + extras + templates de despesas fixas DREX ─────────────────────
  const lancamentosComFixas: Lancamento[] = useMemo(() => {
    const mes2 = String(mesFiltro).padStart(2, '0')
    const fixasGeradas: Lancamento[] = visao === 'DREX'
      ? DESPESAS_FIXAS_DREX
          .filter(t => !despesasExcluidas.has(`${t.id}-${anoFiltro}-${mes2}`))
          .map(t => ({
            id:          `${t.id}-${anoFiltro}-${mes2}`,
            visoes:      ['DREX'] as VisaoCaixa[],
            tipo:        'DESPESA' as TipoLancamento,
            categoria:   t.categoria,
            descricao:   t.descricao,
            valor:       t.valor,
            data:        `${anoFiltro}-${mes2}-${String(t.vencimento).padStart(2, '0')}`,
            vencimento:  t.vencimento,
            status:      'PENDENTE' as StatusLancamento,
            recorrencia: 0 as RecorrenciaLancamento,
          }))
      : []
    return [...BASE_LANCAMENTOS, ...lancamentosExtra, ...fixasGeradas]
      .filter(l => !lancamentosRemovidos.has(l.id))
  }, [visao, mesFiltro, anoFiltro, lancamentosExtra, despesasExcluidas, lancamentosRemovidos])

  // ── Filtered extrato ───────────────────────────────────────────────────────
  const lancamentosFiltrados: Lancamento[] = useMemo(() => {
    return lancamentosComFixas
      .filter(l => {
        if (!l.visoes.includes(visao)) return false
        const d = new Date(l.data)
        if (d.getFullYear() !== anoFiltro || d.getMonth() + 1 !== mesFiltro) return false
        if (filtroTipo        !== 'TODOS' && l.tipo        !== filtroTipo)        return false
        if (filtroCategoria   !== 'TODOS' && l.categoria   !== filtroCategoria)   return false
        if (filtroCidade      !== 'Todas' && l.cidade      !== filtroCidade)      return false
        if (filtroStatus      !== 'TODOS' && l.status      !== filtroStatus)      return false
        if (filtroRecorrencia !== 'TODOS' && l.recorrencia !== filtroRecorrencia) return false
        return true
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }, [lancamentosComFixas, visao, mesFiltro, anoFiltro, filtroTipo, filtroCategoria, filtroCidade, filtroStatus, filtroRecorrencia])

  // ── Running balance ────────────────────────────────────────────────────────
  const extratoComSaldo: LancamentoComSaldo[] = useMemo(() => {
    let saldo = 0
    return lancamentosFiltrados.map(l => {
      if (l.status !== 'CANCELADO') {
        saldo += l.tipo === 'RECEITA' ? l.valor : -l.valor
      }
      return { ...l, saldoAcumulado: saldo }
    })
  }, [lancamentosFiltrados])

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const rec  = lancamentosFiltrados.filter(l => l.tipo === 'RECEITA')
    const desp = lancamentosFiltrados.filter(l => l.tipo === 'DESPESA')
    const totalReceitas    = rec.reduce((s, l)  => s + l.valor, 0)
    const totalDespesas    = desp.reduce((s, l) => s + l.valor, 0)
    const saldoLiquido     = totalReceitas - totalDespesas
    const margem           = totalReceitas > 0 ? (saldoLiquido / totalReceitas) * 100 : 0
    const totalPendente    = lancamentosFiltrados.filter(l => l.status === 'PENDENTE').reduce((s,l)=>s+l.valor,0)
    const totalAtrasado    = lancamentosFiltrados.filter(l => l.status === 'ATRASADO').reduce((s,l)=>s+l.valor,0)
    const receitasPagas    = rec.filter(l  => l.status === 'PAGO').reduce((s,l) => s + l.valor, 0)
    const despesasPagas    = desp.filter(l => l.status === 'PAGO').reduce((s,l) => s + l.valor, 0)
    // by city
    const porCidade = CIDADES.slice(1).map(cidade => ({
      cidade,
      receitas: rec.filter(l  => l.cidade === cidade).reduce((s,l) => s + l.valor, 0),
      despesas: desp.filter(l => l.cidade === cidade).reduce((s,l) => s + l.valor, 0),
    })).filter(c => c.receitas + c.despesas > 0)
    // by subscriber plan
    const porPlano = ['Ouro','Prata','Bronze'].map(plano => ({
      plano,
      valor: rec.filter(l => l.categoria === 'ASSINATURA' && l.plano === plano)
                .reduce((s,l) => s + l.valor, 0),
    })).filter(p => p.valor > 0)
    return {
      totalReceitas, totalDespesas, saldoLiquido, margem,
      totalPendente, totalAtrasado, receitasPagas, despesasPagas,
      porCidade, porPlano,
    }
  }, [lancamentosFiltrados])

  // ── Category breakdown ─────────────────────────────────────────────────────
  const breakdownCategorias = useMemo(() => {
    const mapa = new Map<CategoriaLancamento, { receita: number; despesa: number }>()
    lancamentosFiltrados.forEach(l => {
      const atual = mapa.get(l.categoria) ?? { receita: 0, despesa: 0 }
      if (l.tipo === 'RECEITA') atual.receita += l.valor
      else                      atual.despesa += l.valor
      mapa.set(l.categoria, atual)
    })
    return Array.from(mapa.entries())
      .map(([cat, v]) => ({ cat, ...v, total: v.receita + v.despesa }))
      .sort((a, b) => b.total - a.total)
  }, [lancamentosFiltrados])

  // ── Chart data (replaces last bar with live totals) ───────────────────────
  const chartData = useMemo(() => {
    const base = visao === 'DREX' ? [...CHART_DREX] : [...CHART_SISTEMA]
    const allForMonth = lancamentosComFixas.filter(l => {
      const d = new Date(l.data)
      return l.visoes.includes(visao) && d.getFullYear() === anoFiltro && d.getMonth() + 1 === mesFiltro
    })
    const liveReceitas = allForMonth.filter(l => l.tipo === 'RECEITA').reduce((s,l) => s+l.valor,0)
    const liveDespesas = allForMonth.filter(l => l.tipo === 'DESPESA').reduce((s,l) => s+l.valor,0)
    const mesLabel = `${mesFiltro.toString().padStart(2,'0')}/${String(anoFiltro).slice(2)}`
    const idx = base.findIndex(b => b.mes === mesLabel)
    if (idx >= 0) {
      base[idx] = { ...base[idx], receitas: liveReceitas, despesas: liveDespesas }
    } else {
      base[base.length - 1] = { mes: mesLabel, receitas: liveReceitas, despesas: liveDespesas }
    }
    return base
  }, [visao, mesFiltro, anoFiltro, lancamentosComFixas])

  // ── Add new lancamento ─────────────────────────────────────────────────────
  const adicionarLancamento = useCallback(async (l: Omit<Lancamento, 'id'>) => {
    const { data, error } = await supabase
      .from('caixa_lancamentos')
      .insert({
        visoes:           l.visoes,
        tipo:             l.tipo,
        categoria:        l.categoria,
        numero_documento: l.numeroDocumento ?? null,
        descricao:        l.descricao,
        valor:            l.valor,
        data:             l.data,
        vencimento:       l.vencimento,
        status:           l.status,
        recorrencia:      l.recorrencia,
        cidade:           l.cidade ?? null,
        plano:            l.plano ?? null,
        observacao:       l.observacao ?? null,
      })
      .select('id')
      .single()
    if (!error && data) {
      setLancamentosExtra(prev => [...prev, { ...l, id: data.id }])
    }
    setMostrarModal(false)
  }, [])

  // ── Remove lancamento (templates FX*, base entries, DB entries) ──────────
  const removerLancamento = useCallback(async (id: string) => {
    if (/^FX\d/.test(id)) {
      // Despesa fixa template — persiste exclusao no banco
      const parts = id.split('-') // FX01-2026-04
      await supabase.from('caixa_exclusoes_fixas').insert({
        template_id: parts[0],
        mes:         Number(parts[2]),
        ano:         Number(parts[1]),
      })
      setDespesasExcluidas(prev => new Set(Array.from(prev).concat(id)))
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(id)) {
      // UUID do banco — deleta da tabela
      await supabase.from('caixa_lancamentos').delete().eq('id', id)
      setLancamentosExtra(prev => prev.filter(l => l.id !== id))
    } else {
      // Entrada BASE (R*, D*, S*) — oculta localmente apenas
      setLancamentosRemovidos(prev => new Set(Array.from(prev).concat(id)))
    }
  }, [])

  // ── CSV Export ────────────────────────────────────────────────────────────
  function exportarCSV() {
    const cab = ['Data','Vencimento (dia)','Descrição','Tipo','Categoria','Recorrência','Cidade','Plano','Status','Valor (R$)','Saldo Acumulado (R$)']
    const linhas = extratoComSaldo.map(l => [
      l.data,
      l.vencimento,
      l.descricao,
      l.tipo,
      CATEGORIA_LABEL[l.categoria],
      l.recorrencia,
      l.cidade  ?? '',
      l.plano   ?? '',
      l.status,
      (l.tipo === 'RECEITA' ? l.valor : -l.valor).toFixed(2).replace('.',','),
      l.saldoAcumulado.toFixed(2).replace('.',','),
    ])
    const rodape = ['TOTAL','','','','','','','','',
      lancamentosFiltrados.filter(l=>l.tipo==='RECEITA').reduce((s,l)=>s+l.valor,0).toFixed(2).replace('.',','),
      '',
    ]
    const csv = [cab, ...linhas, rodape]
      .map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(';'))
      .join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `caixa-${visao.toLowerCase()}-${mesFiltro.toString().padStart(2,'0')}-${anoFiltro}.csv`,
    })
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return {
    // state
    visao,           setVisao,
    mesFiltro,       setMesFiltro,
    anoFiltro,       setAnoFiltro,
    filtroTipo,      setFiltroTipo,
    filtroCategoria, setFiltroCategoria,
    filtroCidade,    setFiltroCidade,
    filtroStatus,    setFiltroStatus,
    filtroRecorrencia, setFiltroRecorrencia,
    mostrarModal,    setMostrarModal,
    // data
    extratoComSaldo,
    kpis,
    breakdownCategorias,
    chartData,
    // actions
    adicionarLancamento,
    removerLancamento,
    exportarCSV,
    // utils
    fmt,
    loading,
  }
}
