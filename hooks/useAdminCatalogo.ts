'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type FonteProduto = 'pdv' | 'manual' | 'leitor'
export type FiltroTipo = 'todos' | 'pdv' | 'estoque_atualizado' | 'ean_nao_oficial' | 'a_vencer'

export interface ProdutoCatalogo {
  id: string
  nome: string
  ean: string
  eanOficial: boolean
  empresaId: string
  empresa: string
  cidade: string
  bairro: string
  precoCusto: number
  preco: number
  estoque: number
  estoqueAtualizado: boolean
  fonte: FonteProduto
  totalVendas: number
  status: 'ativo' | 'pendente' | 'bloqueado'
  validade?: string   // YYYY-MM-DD
  criadoEm: string
  atualizadoEm: string
}

export interface InteligenciaItem {
  nome: string
  ean: string
  totalVendas: number
  lojas: { empresa: string; vendas: number; estoque: number }[]
  bairros: { bairro: string; vendas: number }[]
}

export interface ValorLoja {
  empresa: string
  cidade: string
  custo: number
  venda: number
  margem: number
  itens: number
}

export interface ValorBairro {
  bairro: string
  custo: number
  venda: number
  itens: number
}

// Data de referência dos mocks: 2026-04-10
// e1=Mercado Silva(Valente), e2=Padaria Flor(Valente), e3=Mercearia São João(Valente)
// e4=Farmácia Júlia(Nordestina), e5=Loja Tech(Santa Luz)
const TODOS_PRODUTOS: ProdutoCatalogo[] = [
  { id: '1',  nome: 'Arroz Branco 5kg',            ean: '7896005800188', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto: 16.00, preco: 24.90, estoque: 48,  estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 312, status: 'ativo',    criadoEm: '2024-01-15', atualizadoEm: '2026-04-08' },
  { id: '2',  nome: 'Arroz Branco 5kg',            ean: '7896005800188', eanOficial: true,  empresaId: 'e3', empresa: 'Mercearia São João', cidade: 'Valente',    bairro: 'Baixo',    precoCusto: 16.50, preco: 25.50, estoque: 20,  estoqueAtualizado: false, fonte: 'leitor', totalVendas: 189, status: 'ativo',    criadoEm: '2024-02-01', atualizadoEm: '2026-03-20' },
  { id: '3',  nome: 'Feijão Preto 1kg',            ean: '7891234567890', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto:  5.50, preco:  8.90, estoque: 95,  estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 274, status: 'ativo',    criadoEm: '2024-01-15', atualizadoEm: '2026-04-09' },
  { id: '4',  nome: 'Feijão Preto 1kg',            ean: '7891234567890', eanOficial: true,  empresaId: 'e2', empresa: 'Padaria Flor',       cidade: 'Valente',    bairro: 'Alto',     precoCusto:  5.80, preco:  9.20, estoque: 30,  estoqueAtualizado: true,  fonte: 'pdv',    totalVendas:  98, status: 'ativo',    criadoEm: '2024-03-10', atualizadoEm: '2026-04-07' },
  { id: '5',  nome: 'Óleo de Soja 900ml',          ean: '7891234011111', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto:  4.20, preco:  6.49, estoque: 72,  estoqueAtualizado: false, fonte: 'leitor', totalVendas: 201, status: 'ativo',    criadoEm: '2024-01-20', atualizadoEm: '2026-03-01' },
  { id: '6',  nome: 'Paracetamol 750mg cx 20cp',   ean: '7896714240027', eanOficial: true,  empresaId: 'e4', empresa: 'Farmácia Júlia',    cidade: 'Nordestina', bairro: 'Cruzeiro', precoCusto:  3.00, preco:  5.80, estoque: 150, estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 430, status: 'ativo',    validade: '2026-09-30', criadoEm: '2023-12-01', atualizadoEm: '2026-04-10' },
  { id: '7',  nome: 'Dipirona 500mg cx 10cp',      ean: '0000000000123', eanOficial: false, empresaId: 'e4', empresa: 'Farmácia Júlia',    cidade: 'Nordestina', bairro: 'Cruzeiro', precoCusto:  2.00, preco:  4.20, estoque: 88,  estoqueAtualizado: true,  fonte: 'manual', totalVendas: 315, status: 'ativo',    validade: '2026-04-15', criadoEm: '2024-02-10', atualizadoEm: '2026-04-09' },
  { id: '8',  nome: 'Pão de Forma 500g',           ean: '9999000000001', eanOficial: false, empresaId: 'e2', empresa: 'Padaria Flor',       cidade: 'Valente',    bairro: 'Alto',     precoCusto:  4.50, preco:  7.90, estoque: 14,  estoqueAtualizado: true,  fonte: 'manual', totalVendas: 178, status: 'ativo',    validade: '2026-04-12', criadoEm: '2024-04-01', atualizadoEm: '2026-04-10' },
  { id: '9',  nome: 'Cabo USB-C 1m',               ean: '0000000000456', eanOficial: false, empresaId: 'e5', empresa: 'Loja Tech',          cidade: 'Santa Luz',  bairro: 'Centro',   precoCusto: 15.00, preco: 29.90, estoque: 25,  estoqueAtualizado: false, fonte: 'manual', totalVendas:  67, status: 'pendente', criadoEm: '2025-01-10', atualizadoEm: '2026-03-30' },
  { id: '10', nome: 'Biscoito Cream Cracker 400g', ean: '7891962045014', eanOficial: true,  empresaId: 'e3', empresa: 'Mercearia São João', cidade: 'Valente',    bairro: 'Baixo',    precoCusto:  2.80, preco:  4.50, estoque: 60,  estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 244, status: 'ativo',    validade: '2026-04-11', criadoEm: '2024-03-15', atualizadoEm: '2026-04-08' },
  { id: '11', nome: 'Biscoito Cream Cracker 400g', ean: '7891962045014', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto:  2.90, preco:  4.70, estoque: 80,  estoqueAtualizado: false, fonte: 'leitor', totalVendas: 160, status: 'ativo',    validade: '2026-05-20', criadoEm: '2024-01-25', atualizadoEm: '2026-02-20' },
  { id: '12', nome: 'Leite Integral 1L',           ean: '7891000315507', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto:  3.20, preco:  4.99, estoque: 120, estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 380, status: 'ativo',    validade: '2026-04-14', criadoEm: '2024-01-15', atualizadoEm: '2026-04-10' },
  { id: '13', nome: 'Leite Integral 1L',           ean: '7891000315507', eanOficial: true,  empresaId: 'e3', empresa: 'Mercearia São João', cidade: 'Valente',    bairro: 'Baixo',    precoCusto:  3.40, preco:  5.20, estoque: 45,  estoqueAtualizado: true,  fonte: 'pdv',    totalVendas: 220, status: 'ativo',    validade: '2026-04-18', criadoEm: '2024-02-05', atualizadoEm: '2026-04-09' },
  { id: '14', nome: 'Açúcar Cristal 2kg',          ean: '7896058500018', eanOficial: true,  empresaId: 'e1', empresa: 'Mercado Silva',      cidade: 'Valente',    bairro: 'Centro',   precoCusto:  7.00, preco: 10.90, estoque: 55,  estoqueAtualizado: false, fonte: 'pdv',    totalVendas: 195, status: 'ativo',    criadoEm: '2024-01-18', atualizadoEm: '2026-03-10' },
  { id: '15', nome: 'Fone de Ouvido Bluetooth',    ean: '0000000000789', eanOficial: false, empresaId: 'e5', empresa: 'Loja Tech',          cidade: 'Santa Luz',  bairro: 'Centro',   precoCusto: 45.00, preco: 89.90, estoque: 8,   estoqueAtualizado: true,  fonte: 'manual', totalVendas:  34, status: 'ativo',    criadoEm: '2025-02-01', atualizadoEm: '2026-04-08' },
]

export function diasParaVencer(validade: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(validade + 'T00:00:00')
  return Math.floor((venc.getTime() - hoje.getTime()) / 86_400_000)
}

function calcValor(list: ProdutoCatalogo[]) {
  const custo = list.reduce((s, p) => s + p.precoCusto * p.estoque, 0)
  const venda = list.reduce((s, p) => s + p.preco * p.estoque, 0)
  const margem = custo > 0 ? ((venda - custo) / custo) * 100 : 0
  return { custo, venda, margem }
}

export function useAdminCatalogo() {
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>(TODOS_PRODUTOS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*, companies(nome_fantasia, cidade)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProdutos(data.map((p: any) => ({
            id:               p.id,
            nome:             p.name ?? p.nome ?? '',
            ean:              p.ean ?? p.codigo ?? '',
            eanOficial:       Boolean(p.ean_oficial ?? p.eanOficial ?? false),
            empresaId:        p.empresa_id ?? p.empresaId ?? '',
            empresa:          p.companies?.nome_fantasia ?? p.empresa ?? '',
            cidade:           p.companies?.cidade ?? p.cidade ?? '',
            bairro:           p.bairro ?? '',
            precoCusto:       Number(p.preco_custo ?? p.precoCusto ?? 0),
            preco:            Number(p.preco ?? p.price ?? 0),
            estoque:          Number(p.estoque ?? p.quantidade ?? 0),
            estoqueAtualizado: Boolean(p.estoque_atualizado ?? p.estoqueAtualizado ?? false),
            fonte:            (p.fonte ?? 'manual') as FonteProduto,
            totalVendas:      Number(p.total_vendas ?? p.totalVendas ?? 0),
            status:           (p.status ?? 'ativo') as ProdutoCatalogo['status'],
            validade:         p.validade ?? undefined,
            criadoEm:         p.created_at ?? '',
            atualizadoEm:     p.updated_at ?? p.created_at ?? '',
          })))
        }
        setLoading(false)
      })
  }, [])

  // ── Segmentação geográfica / por loja ──────────────────────────────
  const [cidadeSelecionada, setCidadeRaw] = useState<string>('todas')
  const [lojaSelecionada, setLojaRaw]    = useState<string | null>(null)
  const [bairroSelecionado, setBairroRaw] = useState<string | null>(null)

  const setCidadeSelecionada  = (c: string) => { setCidadeRaw(c); setLojaRaw(null); setBairroRaw(null) }
  const setLojaSelecionada    = (l: string | null) => { setLojaRaw(l); setBairroRaw(null) }
  const setBairroSelecionado  = (b: string | null) => setBairroRaw(b)

  // ── Filtros de lista ───────────────────────────────────────────────
  const [filtroEmpresa,       setFiltroEmpresa]       = useState('')
  const [filtroTipo,          setFiltroTipo]          = useState<FiltroTipo>('todos')
  const [intelItemIdx,        setIntelItemIdx]        = useState<number>(0)
  const [topNInput,           setTopNInput]           = useState('5')
  const [diasVencimentoInput, setDiasVencimentoInput] = useState('5')

  const topN      = Math.max(1, parseInt(topNInput) || 5)
  const diasAlerta = Math.max(1, parseInt(diasVencimentoInput) || 5)

  // ── Listas de navegação ────────────────────────────────────────────
  const cidades = useMemo(() => {
    const seen = new Set<string>()
    return produtos.reduce<string[]>((acc, p) => {
      if (!seen.has(p.cidade)) { seen.add(p.cidade); acc.push(p.cidade) }
      return acc
    }, []).sort()
  }, [produtos])

  const lojasDaCidade = useMemo(() => {
    const src = cidadeSelecionada === 'todas'
      ? produtos
      : produtos.filter(p => p.cidade === cidadeSelecionada)
    const seen = new Set<string>()
    return src.reduce<string[]>((acc, p) => {
      if (!seen.has(p.empresa)) { seen.add(p.empresa); acc.push(p.empresa) }
      return acc
    }, []).sort()
  }, [cidadeSelecionada, produtos])

  // ── Escopos base ───────────────────────────────────────────────────
  // baseCidade: apenas filtro por cidade → usado para breakdown por loja
  const baseCidade = useMemo(() =>
    cidadeSelecionada === 'todas'
      ? produtos
      : produtos.filter(p => p.cidade === cidadeSelecionada),
  [cidadeSelecionada, produtos])

  // Bairros disponíveis no escopo cidade + loja (para o seletor de bairro)
  const bairrosDaBase = useMemo(() => {
    const src = lojaSelecionada
      ? baseCidade.filter(p => p.empresa === lojaSelecionada)
      : baseCidade
    const seen = new Set<string>()
    return src.reduce<string[]>((acc, p) => {
      if (!seen.has(p.bairro)) { seen.add(p.bairro); acc.push(p.bairro) }
      return acc
    }, []).sort()
  }, [baseCidade, lojaSelecionada])

  // base: cidade + loja + bairro → usado para tudo o mais
  const base = useMemo(() => {
    const porLoja = lojaSelecionada
      ? baseCidade.filter(p => p.empresa === lojaSelecionada)
      : baseCidade
    return bairroSelecionado
      ? porLoja.filter(p => p.bairro === bairroSelecionado)
      : porLoja
  }, [baseCidade, lojaSelecionada, bairroSelecionado])

  // ── Stats (valem para o escopo atual) ─────────────────────────────
  const stats = useMemo(() => ({
    totalItens:       base.length,
    itensPDV:         base.filter(p => p.fonte === 'pdv').length,
    estoqueAtualizado: base.filter(p => p.estoqueAtualizado).length,
    eanNaoOficial:    base.filter(p => !p.eanOficial).length,
  }), [base])

  // ── Valor total do escopo (cidade + loja) ─────────────────────────
  const valorTotalEstoque = useMemo(() => calcValor(base), [base])

  // ── Breakdown por loja (escopo = cidade + loja selecionada) ──────────
  const valorPorLoja = useMemo<ValorLoja[]>(() => {
    const src = lojaSelecionada
      ? baseCidade.filter(p => p.empresa === lojaSelecionada)
      : baseCidade
    const map: Record<string, { custo: number; venda: number; itens: number; cidade: string }> = {}
    src.forEach(p => {
      if (!map[p.empresa]) map[p.empresa] = { custo: 0, venda: 0, itens: 0, cidade: p.cidade }
      map[p.empresa].custo += p.precoCusto * p.estoque
      map[p.empresa].venda += p.preco * p.estoque
      map[p.empresa].itens++
    })
    return Object.entries(map)
      .map(([empresa, v]) => ({
        empresa,
        cidade: v.cidade,
        custo:  v.custo,
        venda:  v.venda,
        itens:  v.itens,
        margem: v.custo > 0 ? ((v.venda - v.custo) / v.custo) * 100 : 0,
      }))
      .sort((a, b) => b.venda - a.venda)
  }, [baseCidade, lojaSelecionada])

  // ── Breakdown por bairro (escopo = cidade + loja) ─────────────────
  const valorPorBairro = useMemo<ValorBairro[]>(() => {
    const map: Record<string, { custo: number; venda: number; itens: number }> = {}
    base.forEach(p => {
      if (!map[p.bairro]) map[p.bairro] = { custo: 0, venda: 0, itens: 0 }
      map[p.bairro].custo += p.precoCusto * p.estoque
      map[p.bairro].venda += p.preco * p.estoque
      map[p.bairro].itens++
    })
    return Object.entries(map)
      .map(([bairro, v]) => ({ bairro, custo: v.custo, venda: v.venda, itens: v.itens }))
      .sort((a, b) => b.venda - a.venda)
  }, [base])

  // ── Itens a vencer ─────────────────────────────────────────────────
  const itensVencendo = useMemo(() =>
    base
      .filter(p => p.validade !== undefined && diasParaVencer(p.validade) <= diasAlerta)
      .sort((a, b) => diasParaVencer(a.validade!) - diasParaVencer(b.validade!)),
  [base, diasAlerta])

  // ── Lista filtrada ─────────────────────────────────────────────────
  const produtosFiltrados = useMemo(() =>
    base.filter(p => {
      if (filtroEmpresa && !p.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase())) return false
      if (filtroTipo === 'pdv'                && p.fonte !== 'pdv')                                         return false
      if (filtroTipo === 'estoque_atualizado' && !p.estoqueAtualizado)                                      return false
      if (filtroTipo === 'ean_nao_oficial'    && p.eanOficial)                                              return false
      if (filtroTipo === 'a_vencer'           && !(p.validade && diasParaVencer(p.validade) <= diasAlerta)) return false
      return true
    }),
  [base, filtroEmpresa, filtroTipo, diasAlerta])

  // ── Inteligência Comercial ─────────────────────────────────────────
  const topItens = useMemo<InteligenciaItem[]>(() => {
    const grouped: Record<string, ProdutoCatalogo[]> = {}
    base.forEach(p => {
      if (!grouped[p.nome]) grouped[p.nome] = []
      grouped[p.nome].push(p)
    })
    return Object.entries(grouped)
      .map(([nome, itens]) => {
        const totalVendas = itens.reduce((s, i) => s + i.totalVendas, 0)
        const lojas = [...itens]
          .sort((a, b) => b.totalVendas - a.totalVendas)
          .map(i => ({ empresa: i.empresa, vendas: i.totalVendas, estoque: i.estoque }))
        const bairroMap: Record<string, number> = {}
        itens.forEach(i => { bairroMap[i.bairro] = (bairroMap[i.bairro] || 0) + i.totalVendas })
        const bairros = Object.entries(bairroMap)
          .map(([bairro, vendas]) => ({ bairro, vendas }))
          .sort((a, b) => b.vendas - a.vendas)
        return { nome, ean: itens[0].ean, totalVendas, lojas, bairros }
      })
      .sort((a, b) => b.totalVendas - a.totalVendas)
      .slice(0, topN)
  }, [base, topN])

  const clampedIdx = Math.min(intelItemIdx, Math.max(0, topItens.length - 1))
  const intelItem  = topItens[clampedIdx] ?? null

  return {
    loading,
    // segmentação
    cidadeSelecionada, setCidadeSelecionada,
    lojaSelecionada,   setLojaSelecionada,
    bairroSelecionado, setBairroSelecionado,
    cidades,
    lojasDaCidade,
    bairrosDaBase,
    // filtros de lista
    filtroEmpresa, setFiltroEmpresa,
    filtroTipo,    setFiltroTipo,
    topNInput,     setTopNInput,
    diasVencimentoInput, setDiasVencimentoInput,
    diasAlerta,
    // dados
    stats,
    valorTotalEstoque,
    valorPorLoja,
    valorPorBairro,
    topItens,
    intelItemIdx: clampedIdx, setIntelItemIdx,
    intelItem,
    itensVencendo,
    produtosFiltrados,
  }
}
