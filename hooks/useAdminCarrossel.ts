'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type StatusLance = 'aberto' | 'encerrado' | 'publicado'
export type StatusAprovacao = 'pendente' | 'aprovado' | 'rejeitado'

export interface SlotCarrossel {
  slot: 1 | 2 | 3
  disponivel: boolean
  lanceAtual: number
  vencedor: string | null
  imagemUrl: string | null
}

export interface LeilaoSemana {
  id: string
  semana: string // "14/04 – 20/04"
  status: StatusLance
  encerraEm: string // ISO
  slots: SlotCarrossel[]
}

export interface AnuncioCarrossel {
  id: string
  empresa: string
  imagemUrl: string
  semana: string
  slotGanho: number
  valorPago: number
  statusAprovacao: StatusAprovacao
}

const MOCK_LEILAO: LeilaoSemana = {
  id: 'leilao-2026-w16',
  semana: '14/04 – 20/04/2026',
  status: 'aberto',
  encerraEm: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  slots: [
    { slot: 1, disponivel: true, lanceAtual: 85, vencedor: 'Mercadinho Bom Preço', imagemUrl: null },
    { slot: 2, disponivel: true, lanceAtual: 60, vencedor: 'Farmácia Saúde', imagemUrl: null },
    { slot: 3, disponivel: true, lanceAtual: 35, vencedor: null, imagemUrl: null },
  ],
}

const MOCK_ANUNCIOS: AnuncioCarrossel[] = [
  { id: 'a1', empresa: 'Mercadinho Bom Preço', imagemUrl: '', semana: '07/04 – 13/04', slotGanho: 1, valorPago: 85, statusAprovacao: 'aprovado' },
  { id: 'a2', empresa: 'Farmácia Saúde', imagemUrl: '', semana: '07/04 – 13/04', slotGanho: 2, valorPago: 60, statusAprovacao: 'pendente' },
  { id: 'a3', empresa: 'Açougue Leblon', imagemUrl: '', semana: '07/04 – 13/04', slotGanho: 3, valorPago: 35, statusAprovacao: 'pendente' },
]

export function useAdminCarrossel() {
  const [leilao, setLeilao] = useState<LeilaoSemana>(MOCK_LEILAO)
  const [anuncios, setAnuncios] = useState<AnuncioCarrossel[]>(MOCK_ANUNCIOS)
  const [modoAutoAprovacao, setModoAutoAprovacao] = useState(false)
  const [pendentesAlert] = useState(anuncios.filter(a => a.statusAprovacao === 'pendente').length)

  // ── Carrega do Supabase ─────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // Leilão aberto mais recente
    const { data: leiloes } = await supabase
      .from('auction_leiloes')
      .select('*, auction_slots(*)')
      .order('created_at', { ascending: false })
      .limit(1)

    if (leiloes && leiloes.length > 0) {
      const l = leiloes[0]
      setLeilao({
        id: l.id,
        semana: l.semana,
        status: l.status as StatusLance,
        encerraEm: l.encerra_em,
        slots: (l.auction_slots ?? []).map((s: any) => ({
          slot: s.slot as 1 | 2 | 3,
          disponivel: s.disponivel,
          lanceAtual: Number(s.lance_atual),
          vencedor: s.vencedor ?? null,
          imagemUrl: s.imagem_url ?? null,
        })),
      })
    }

    const { data: ads } = await supabase
      .from('auction_anuncios')
      .select('*')
      .order('created_at', { ascending: false })

    if (ads && ads.length > 0) {
      setAnuncios(ads.map(a => ({
        id: a.id,
        empresa: a.empresa,
        imagemUrl: a.imagem_url ?? '',
        semana: a.semana,
        slotGanho: a.slot_ganho,
        valorPago: Number(a.valor_pago),
        statusAprovacao: a.status_aprovacao as StatusAprovacao,
      })))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const aprovarAnuncio = (id: string) => {
    setAnuncios(prev => prev.map(a => a.id === id ? { ...a, statusAprovacao: 'aprovado' } : a))
    supabase.from('auction_anuncios').update({ status_aprovacao: 'aprovado' }).eq('id', id)
  }

  const rejeitarAnuncio = (id: string) => {
    setAnuncios(prev => prev.map(a => a.id === id ? { ...a, statusAprovacao: 'rejeitado' } : a))
    supabase.from('auction_anuncios').update({ status_aprovacao: 'rejeitado' }).eq('id', id)
  }

  const toggleAutoAprovacao = () => setModoAutoAprovacao(prev => !prev)

  const pendentes = anuncios.filter(a => a.statusAprovacao === 'pendente')

  return {
    leilao,
    anuncios,
    pendentes,
    pendentesAlert,
    modoAutoAprovacao,
    toggleAutoAprovacao,
    aprovarAnuncio,
    rejeitarAnuncio,
  }
}
