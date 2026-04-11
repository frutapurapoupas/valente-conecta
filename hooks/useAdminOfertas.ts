'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type StatusOferta = 'pending' | 'active' | 'paused' | 'rejected' | 'expired' | 'sold'

export type OfertaAdmin = {
  id: string
  titulo: string
  descricao: string
  empresa: string
  empresaId: string
  cidade: string
  categoria: string
  preco: number
  precoOriginal: number
  percentualDesconto: number
  imagemUrl: string
  status: StatusOferta
  criadaEm: string
  validadeAte: string
  destaque: boolean
  motivoRejeicao?: string
  visualizacoes: number
}

function mapRow(row: any): OfertaAdmin {
  const preco = Number(row.preco ?? row.price ?? 0)
  const precoOriginal = Number(row.preco_original ?? row.original_price ?? preco)
  return {
    id: row.id,
    titulo: row.title ?? row.titulo ?? '',
    descricao: row.description ?? row.descricao ?? '',
    empresa: row.companies?.nome_fantasia ?? row.empresa ?? '',
    empresaId: row.empresa_id ?? row.empresaId ?? '',
    cidade: row.cidade ?? '',
    categoria: row.categoria ?? row.category ?? '',
    preco,
    precoOriginal,
    percentualDesconto: precoOriginal > 0 ? Math.round(((precoOriginal - preco) / precoOriginal) * 100 * 10) / 10 : 0,
    imagemUrl: row.imagem_url ?? row.imagemUrl ?? '',
    status: row.status as StatusOferta,
    criadaEm: row.created_at ?? row.criadaEm ?? '',
    validadeAte: row.validade_ate ?? row.validadeAte ?? '',
    destaque: Boolean(row.destaque),
    motivoRejeicao: row.motivo_rejeicao ?? row.motivoRejeicao,
    visualizacoes: Number(row.visualizacoes ?? row.views ?? 0),
  }
}

export function useAdminOfertas() {
  const [aba, setAba] = useState<'pendentes' | 'ativas' | 'encerradas' | 'stats'>('pendentes')
  const [ofertas, setOfertas] = useState<OfertaAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [modalRejeitar, setModalRejeitar] = useState<{ aberto: boolean; ofertaId: string | null }>({ aberto: false, ofertaId: null })
  const [motivoInput, setMotivoInput] = useState('')
  const [processando, setProcessando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('offers').select('*, companies(nome_fantasia)').order('created_at', { ascending: false })
    setOfertas((data || []).map(mapRow))
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const pendentes = useMemo(() => ofertas.filter(o => o.status === 'pending'), [ofertas])
  const ativas = useMemo(() => ofertas.filter(o => o.status === 'active' || o.status === 'paused'), [ofertas])
  const encerradas = useMemo(() => {
    const base = ofertas.filter(o => o.status === 'rejected' || o.status === 'expired' || o.status === 'sold')
    if (!filtroEmpresa.trim()) return base
    return base.filter(o => o.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase()))
  }, [ofertas, filtroEmpresa])

  const stats = useMemo(() => {
    const aprovadas7d = ofertas.filter(o => o.status !== 'pending' && o.status !== 'rejected' && new Date(o.criadaEm) >= new Date(Date.now() - 7 * 86_400_000)).length
    const totalDecididas = ofertas.filter(o => o.status !== 'pending').length
    const totalAprovadas = ofertas.filter(o => ['active', 'paused', 'sold', 'expired'].includes(o.status)).length
    const taxaAprovacao = totalDecididas > 0 ? Math.round((totalAprovadas / totalDecididas) * 100) : 0
    const vencendoHoje = ativas.filter(o => { const d = Math.ceil((new Date(o.validadeAte).getTime() - Date.now()) / 86_400_000); return d >= 0 && d <= 2 }).length
    const freq: Record<string, { nome: string; total: number }> = {}
    ofertas.forEach(o => { if (!freq[o.empresaId]) freq[o.empresaId] = { nome: o.empresa, total: 0 }; freq[o.empresaId].total++ })
    const empresaMaisAtiva = Object.values(freq).sort((a, b) => b.total - a.total)[0]?.nome ?? ''
    return { pendentes: pendentes.length, ativas: ativas.filter(o => o.status === 'active').length, aprovadas7d, taxaAprovacao, encerradas: encerradas.length, vencendoHoje, empresaMaisAtiva, totalVisualizacoes: ativas.reduce((s, o) => s + o.visualizacoes, 0) }
  }, [ofertas, pendentes, ativas, encerradas])

  async function aprovar(id: string) {
    setProcessando(id)
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, status: 'active' as StatusOferta } : o))
    await supabase.from('offers').update({ status: 'active' }).eq('id', id)
    setProcessando(null)
  }

  function abrirRejeitar(id: string) { setModalRejeitar({ aberto: true, ofertaId: id }); setMotivoInput('') }

  async function confirmarRejeicao() {
    if (!modalRejeitar.ofertaId) return
    const motivo = motivoInput.trim() || 'Não especificado'
    setProcessando(modalRejeitar.ofertaId)
    setOfertas(prev => prev.map(o => o.id === modalRejeitar.ofertaId ? { ...o, status: 'rejected' as StatusOferta, motivoRejeicao: motivo } : o))
    await supabase.from('offers').update({ status: 'rejected', motivo_rejeicao: motivo }).eq('id', modalRejeitar.ofertaId)
    setProcessando(null)
    setModalRejeitar({ aberto: false, ofertaId: null })
    setMotivoInput('')
  }

  async function togglePausar(id: string) {
    setProcessando(id)
    const novoStatus = ofertas.find(o => o.id === id)?.status === 'active' ? 'paused' : 'active'
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, status: novoStatus as StatusOferta } : o))
    await supabase.from('offers').update({ status: novoStatus }).eq('id', id)
    setProcessando(null)
  }

  async function toggleDestaque(id: string) {
    const pinned = ofertas.filter(o => o.destaque && o.id !== id).length
    const oferta = ofertas.find(o => o.id === id)
    if (!oferta?.destaque && pinned >= 3) return
    const novoDestaque = !oferta?.destaque
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, destaque: novoDestaque } : o))
    await supabase.from('offers').update({ destaque: novoDestaque }).eq('id', id)
  }

  async function expirar(id: string) {
    setProcessando(id)
    const agora = new Date().toISOString()
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, status: 'expired' as StatusOferta, validadeAte: agora } : o))
    await supabase.from('offers').update({ status: 'expired', validade_ate: agora }).eq('id', id)
    setProcessando(null)
  }

  function diasRestantes(validadeAte: string) { return Math.ceil((new Date(validadeAte).getTime() - Date.now()) / 86_400_000) }

  return {
    aba, setAba, loading,
    pendentes, ativas, encerradas, stats,
    filtroEmpresa, setFiltroEmpresa,
    modalRejeitar, motivoInput, setMotivoInput,
    processando,
    aprovar, abrirRejeitar, confirmarRejeicao,
    fecharModalRejeitar: () => setModalRejeitar({ aberto: false, ofertaId: null }),
    togglePausar, toggleDestaque, expirar, diasRestantes,
    refetch: carregar,
  }
}
