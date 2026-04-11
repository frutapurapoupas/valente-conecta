'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type FiltroStatus = 'todas' | 'ativas' | 'bloqueadas' | 'pendentes'

export interface EmpresaAdmin {
  id: string
  name: string
  nome_fantasia: string | null
  cnpj: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  status: string | null
  aprovado: boolean | null
  plan: string | null
  logo_url: string | null
  responsavel: string | null
  created_at: string
  totalOfertas?: number
}

const MOCK_EMPRESAS: EmpresaAdmin[] = [
  { id: 'm1', name: 'Mercado Bom Preco', nome_fantasia: 'Mercado Bom Preco', cnpj: '12.345.678/0001-90', email: 'contato@bompreco.com.br', telefone: '(75) 99111-2233', cidade: 'Valente-BA', status: 'active', aprovado: true, plan: 'premium', logo_url: null, responsavel: 'Jose Ferreira', created_at: '2026-01-15T10:00:00Z', totalOfertas: 12 },
  { id: 'm2', name: 'Farmacia Saude Total', nome_fantasia: 'Farmacia Saude Total', cnpj: '98.765.432/0001-11', email: 'farm.saudetotal@gmail.com', telefone: '(75) 99222-3344', cidade: 'Valente-BA', status: 'active', aprovado: true, plan: 'basic', logo_url: null, responsavel: 'Ana Rodrigues', created_at: '2026-02-03T08:30:00Z', totalOfertas: 7 },
  { id: 'm3', name: 'Acougue do Ze', nome_fantasia: 'Acougue do Ze', cnpj: '45.678.901/0001-22', email: null, telefone: '(75) 99333-4455', cidade: 'Valente-BA', status: 'active', aprovado: true, plan: 'free', logo_url: null, responsavel: 'Jose Carlos', created_at: '2026-02-20T14:00:00Z', totalOfertas: 3 },
  { id: 'm4', name: 'Loja de Roupas Chic', nome_fantasia: 'Modas Chic', cnpj: '11.222.333/0001-44', email: 'modaschic@hotmail.com', telefone: '(75) 98444-5566', cidade: 'Valente-BA', status: 'active', aprovado: false, plan: 'free', logo_url: null, responsavel: 'Claudia Mendes', created_at: '2026-03-28T09:15:00Z', totalOfertas: 0 },
  { id: 'm5', name: 'Papelaria Central', nome_fantasia: 'Papelaria Central', cnpj: '22.333.444/0001-55', email: 'papelaria.central@gmail.com', telefone: '(75) 99555-6677', cidade: 'Valente-BA', status: 'active', aprovado: false, plan: 'free', logo_url: null, responsavel: 'Marcos Alves', created_at: '2026-04-05T11:00:00Z', totalOfertas: 0 },
  { id: 'm6', name: 'Auto Pecas Norte', nome_fantasia: 'Auto Pecas Norte', cnpj: '33.444.555/0001-66', email: 'autopecasnorte@outlook.com', telefone: '(75) 97666-7788', cidade: 'Valente-BA', status: 'blocked', aprovado: true, plan: 'basic', logo_url: null, responsavel: 'Roberto Lima', created_at: '2026-01-28T16:00:00Z', totalOfertas: 1 },
  { id: 'm7', name: 'Padaria Pao Quente', nome_fantasia: 'Padaria Pao Quente', cnpj: '44.555.666/0001-77', email: 'paoquente@gmail.com', telefone: '(75) 99777-8899', cidade: 'Valente-BA', status: 'active', aprovado: true, plan: 'premium', logo_url: null, responsavel: 'Dona Maria', created_at: '2026-02-10T07:00:00Z', totalOfertas: 9 },
  { id: 'm8', name: 'Eletronicos Plus', nome_fantasia: 'Eletronicos Plus', cnpj: '55.666.777/0001-88', email: 'eletronicosplus@gmail.com', telefone: '(75) 98888-9900', cidade: 'Valente-BA', status: 'active', aprovado: true, plan: 'basic', logo_url: null, responsavel: 'Thiago Ribeiro', created_at: '2026-03-01T13:30:00Z', totalOfertas: 5 },
]

export function useAdminEmpresas() {
  const [todas, setTodas] = useState<EmpresaAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas')
  const [acaoId, setAcaoId] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data: comps } = await supabase
      .from('companies')
      .select('id, name, nome_fantasia, cnpj, email, telefone, cidade, status, aprovado, plan, logo_url, responsavel, created_at')
      .order('created_at', { ascending: false })

    if (!comps || comps.length === 0) {
      setTodas(MOCK_EMPRESAS)
      setLoading(false)
      return
    }

    const { data: ofertasAgg } = await supabase.from('ofertas').select('company_id')
    const countMap: Record<string, number> = {}
    ;(ofertasAgg || []).forEach((o: any) => {
      if (o.company_id) countMap[o.company_id] = (countMap[o.company_id] || 0) + 1
    })

    setTodas(comps.map((c: any) => ({ ...c, totalOfertas: countMap[c.id] || 0 })))
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function toggleBloquear(id: string, bloqueada: boolean) {
    setAcaoId(id)
    const novoStatus = bloqueada ? 'active' : 'blocked'
    await supabase.from('companies').update({ status: novoStatus }).eq('id', id)
    setTodas(prev => prev.map(e => e.id === id ? { ...e, status: novoStatus } : e))
    setAcaoId(null)
  }

  async function toggleAprovar(id: string, aprovado: boolean) {
    setAcaoId(id)
    await supabase.from('companies').update({ aprovado: !aprovado }).eq('id', id)
    setTodas(prev => prev.map(e => e.id === id ? { ...e, aprovado: !aprovado } : e))
    setAcaoId(null)
  }

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const stats = {
    total: todas.length,
    ativas: todas.filter(e => e.status !== 'blocked').length,
    bloqueadas: todas.filter(e => e.status === 'blocked').length,
    pendentes: todas.filter(e => !e.aprovado).length,
    novasMes: todas.filter(e => new Date(e.created_at) >= thisMonth).length,
    comOfertas: todas.filter(e => (e.totalOfertas ?? 0) > 0).length,
  }

  const empresas = todas.filter(e => {
    const q = filtro.toLowerCase()
    const matchText = !q ||
      (e.nome_fantasia ?? e.name ?? '').toLowerCase().includes(q) ||
      (e.cnpj ?? '').includes(q) ||
      (e.cidade ?? '').toLowerCase().includes(q) ||
      (e.email ?? '').toLowerCase().includes(q)

    const matchStatus =
      filtroStatus === 'todas' ? true :
      filtroStatus === 'ativas' ? e.status !== 'blocked' && e.aprovado !== false :
      filtroStatus === 'bloqueadas' ? e.status === 'blocked' :
      filtroStatus === 'pendentes' ? !e.aprovado : true

    return matchText && matchStatus
  })

  return {
    empresas, loading, stats,
    filtro, setFiltro,
    filtroStatus, setFiltroStatus,
    acaoId,
    toggleBloquear, toggleAprovar,
  }
}