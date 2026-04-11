'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Plano {
  id: string
  nome: string
  taxa: number
  cor: string
  border: string
}

const MOCK_PLANOS: Plano[] = [
  { id: '1', nome: 'Premium Gold', taxa: 10, cor: 'text-amber-500', border: 'border-amber-500/30' },
  { id: '2', nome: 'Master Black', taxa: 8,  cor: 'text-zinc-100',  border: 'border-zinc-500/30' },
  { id: '3', nome: 'Basic Silver', taxa: 15, cor: 'text-zinc-400',  border: 'border-zinc-700/30' },
]

export function useAdminPlanos() {
  const [planos, setPlanos] = useState<Plano[]>(MOCK_PLANOS)
  const [salvando, setSalvando] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('plans').select('id, name, nome, price, taxa, cor, border').order('created_at').then(({ data }) => {
      if (data && data.length > 0) {
        setPlanos(data.map(p => ({
          id: String(p.id),
          nome:   p.nome   ?? p.name  ?? '',
          taxa:   Number(p.taxa   ?? p.price ?? 10),
          cor:    p.cor    ?? 'text-zinc-400',
          border: p.border ?? 'border-zinc-700/30',
        })))
      }
    })
  }, [])

  const atualizarTaxa = (id: string, novaTaxa: string | number) => {
    setPlanos(planos.map(p => p.id === id ? { ...p, taxa: Number(novaTaxa) } : p))
  }

  const salvarTaxa = async (id: string) => {
    const plano = planos.find(p => p.id === id)
    if (!plano) return
    setSalvando(id)
    await supabase.from('plans').update({ taxa: plano.taxa, price: plano.taxa, updated_at: new Date().toISOString() }).eq('id', id)
    setSalvando(null)
  }

  return { planos, atualizarTaxa, salvarTaxa, salvando }
}
