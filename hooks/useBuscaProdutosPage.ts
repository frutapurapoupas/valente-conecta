'use client'

import { useState, useEffect } from 'react'

export type TipoResultado = 'catalogo' | 'estoque'

export interface ResultadoBusca {
  id: string
  nome: string
  preco: number
  precoAnterior?: number
  emPromocao?: boolean
  quantidade?: number
  tipo: TipoResultado
  fornecedor?: string
}

export function useBuscaProdutosPage() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])

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

    setResultados([...catalogoResults, ...estoqueResults])
  }, [query])

  return { query, setQuery, resultados }
}

