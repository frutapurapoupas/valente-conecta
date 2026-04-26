'use client'

import { useState, useEffect } from 'react'
import { supabase, isMockMode } from '@/lib/supabase-client-switch'

export type TipoResultado = 'catalogo' | 'estoque' | 'servico'

export interface ResultadoBusca {
  id: string
  nome: string
  preco: number
  precoAnterior?: number
  emPromocao?: boolean
  quantidade?: number
  tipo: TipoResultado
  fornecedor?: string
  servicoId?: string
  categoria?: string
  descricao?: string
}

export function useBuscaProdutosPage() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [produtosServico, setProdutosServico] = useState<any[]>([])

  useEffect(() => {
    carregarProdutosServico()
  }, [])

  const carregarProdutosServico = async () => {
    if (isMockMode()) {
      setProdutosServico([])
    } else {
      try {
        const { data } = await supabase
          .from('produtos_catalogo')
          .select('*')
          .eq('publicado', true)
          .eq('ativo', true)
        setProdutosServico(data || [])
      } catch (error) {
        console.error('Erro ao carregar produtos de serviço:', error)
      }
    }
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([])
      return
    }

    const q = query.toLowerCase()

    // Use produtos_estoque as source of truth
    const estoque: any[] = JSON.parse(localStorage.getItem('produtos_estoque') || '[]')

    const catalogoResults: ResultadoBusca[] = estoque
      .filter(p => !p.pendenteAprovacao && (p.quantidade ?? 0) > 0 && p.nome?.toLowerCase().includes(q))
      .map(p => ({
        id: String(p.id),
        nome: p.nome,
        preco: Number(p.preco),
        precoAnterior: p.precoAnterior,
        emPromocao: !!p.emPromocao,
        quantidade: p.quantidade,
        tipo: 'catalogo',
        fornecedor: p.fornecedor,
      }))

    // Products pending approval: visible in search as "estoque" only
    const estoqueResults: ResultadoBusca[] = estoque
      .filter(p => !!p.pendenteAprovacao && (p.quantidade ?? 0) > 0 && p.nome?.toLowerCase().includes(q))
      .map(p => ({
        id: String(p.id),
        nome: p.nome,
        preco: Number(p.preco),
        precoAnterior: p.precoAnterior,
        emPromocao: !!p.emPromocao,
        quantidade: p.quantidade,
        tipo: 'estoque',
        fornecedor: p.fornecedor,
      }))

    // Produtos de serviços com agendamento (catálogo publicado)
    const servicoResults: ResultadoBusca[] = produtosServico
      .filter(p => p.publicado && p.ativo && (p.nome?.toLowerCase().includes(q) || p.descricao?.toLowerCase().includes(q)))
      .map(p => ({
        id: String(p.id),
        nome: p.nome,
        preco: Number(p.preco),
        tipo: 'servico',
        servicoId: p.servicoId,
        categoria: p.categoria,
        descricao: p.descricao,
      }))

    setResultados([...catalogoResults, ...estoqueResults, ...servicoResults])
  }, [query, produtosServico])

  return { query, setQuery, resultados }
}

