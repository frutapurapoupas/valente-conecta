'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type FiltroProfStatus = 'todos' | 'ativos' | 'bloqueados' | 'pendentes'

export interface ProfissionalAdmin {
  id: string
  nome: string
  especialidade: string | null
  telefone: string | null
  email: string | null
  cidade: string | null
  status: string | null
  aprovado: boolean | null
  avaliacao: number | null
  total_servicos: number | null
  foto_url: string | null
  created_at: string
}

export const ESPECIALIDADES_ICON: Record<string, string> = {
  manicure: '💅',
  pedicure: '🦶',
  barbeiro: '✂️',
  cabeleireiro: '💇',
  borracheiro: '🔧',
  eletricista: '⚡',
  encanador: '🔩',
  pintor: '🖌️',
  pedreiro: '🧱',
  diarista: '🧹',
  motorista: '🚗',
  costureira: '🧵',
  jardineiro: '🌿',
  marceneiro: '🪵',
  outros: '🛠️',
}

const TIPOS_PADRAO = Object.keys(ESPECIALIDADES_ICON)

const MOCK_PROFISSIONAIS: ProfissionalAdmin[] = [
  { id: 'p1', nome: 'Carla Souza', especialidade: 'manicure', telefone: '(75) 99111-0001', email: 'carla.unhas@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.9, total_servicos: 87, foto_url: null, created_at: '2026-01-10T09:00:00Z' },
  { id: 'p2', nome: 'Joao Barbearia', especialidade: 'barbeiro', telefone: '(75) 99222-0002', email: 'joao.barba@hotmail.com', cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.7, total_servicos: 134, foto_url: null, created_at: '2026-01-20T10:00:00Z' },
  { id: 'p3', nome: 'Raimundo Pneus', especialidade: 'borracheiro', telefone: '(75) 99333-0003', email: null, cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.5, total_servicos: 62, foto_url: null, created_at: '2026-02-05T08:00:00Z' },
  { id: 'p4', nome: 'Patricia Cabelos', especialidade: 'cabeleireiro', telefone: '(75) 99444-0004', email: 'patricia.hair@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.8, total_servicos: 201, foto_url: null, created_at: '2026-01-25T11:00:00Z' },
  { id: 'p5', nome: 'Edilson Eletrica', especialidade: 'eletricista', telefone: '(75) 98555-0005', email: 'edilson.eletro@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: false, avaliacao: null, total_servicos: 0, foto_url: null, created_at: '2026-04-08T14:00:00Z' },
  { id: 'p6', nome: 'Fernanda Limpeza', especialidade: 'diarista', telefone: '(75) 99666-0006', email: 'fer.limpeza@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: false, avaliacao: null, total_servicos: 0, foto_url: null, created_at: '2026-04-09T09:30:00Z' },
  { id: 'p7', nome: 'Marcos Pintura', especialidade: 'pintor', telefone: '(75) 97777-0007', email: null, cidade: 'Valente-BA', status: 'blocked', aprovado: true, avaliacao: 3.2, total_servicos: 14, foto_url: null, created_at: '2026-02-18T15:00:00Z' },
  { id: 'p8', nome: 'Sandra Pe', especialidade: 'pedicure', telefone: '(75) 99888-0008', email: 'sandra.pe@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.6, total_servicos: 55, foto_url: null, created_at: '2026-03-01T10:00:00Z' },
  { id: 'p9', nome: 'Carlos Encanador', especialidade: 'encanador', telefone: '(75) 99999-0009', email: 'carlos.agua@gmail.com', cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.3, total_servicos: 38, foto_url: null, created_at: '2026-02-28T12:00:00Z' },
  { id: 'p10', nome: 'Ze Pedreiro', especialidade: 'pedreiro', telefone: '(75) 97000-0010', email: null, cidade: 'Valente-BA', status: 'active', aprovado: true, avaliacao: 4.1, total_servicos: 29, foto_url: null, created_at: '2026-03-15T08:00:00Z' },
]

export function useAdminProfissionais() {
  const [todos, setTodos] = useState<ProfissionalAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroProfStatus>('todos')
  const [filtroEsp, setFiltroEsp] = useState('')
  const [acaoId, setAcaoId] = useState<string | null>(null)
  const [tiposEspecialidade, setTiposEspecialidade] = useState<string[]>(TIPOS_PADRAO)
  const [novaEspecialidade, setNovaEspecialidade] = useState('')

  function adicionarEspecialidade() {
    const tipo = novaEspecialidade.trim().toLowerCase()
    if (!tipo || tiposEspecialidade.includes(tipo)) return
    setTiposEspecialidade(prev => [...prev, tipo])
    if (!(tipo in ESPECIALIDADES_ICON)) {
      ESPECIALIDADES_ICON[tipo] = '🛠️'
    }
    setNovaEspecialidade('')
  }

  function removerEspecialidade(tipo: string) {
    setTiposEspecialidade(prev => prev.filter(t => t !== tipo))
    if (filtroEsp === tipo) setFiltroEsp('')
  }

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('professionals')
      .select('id, nome:user_id(name), especialidade, telefone, email, cidade, status, aprovado, avaliacao, total_servicos, foto_url, created_at')
      .order('created_at', { ascending: false })

    if (!data || data.length === 0) {
      setTodos(MOCK_PROFISSIONAIS)
      setLoading(false)
      return
    }

    setTodos(data.map((p: any) => ({
      ...p,
      nome: p.nome?.name ?? p.nome ?? 'Sem nome',
    })))
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function toggleBloquear(id: string, bloqueado: boolean) {
    setAcaoId(id)
    const novoStatus = bloqueado ? 'active' : 'blocked'
    await supabase.from('professionals').update({ status: novoStatus }).eq('id', id)
    setTodos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
    setAcaoId(null)
  }

  async function toggleAprovar(id: string, aprovado: boolean) {
    setAcaoId(id)
    await supabase.from('professionals').update({ aprovado: !aprovado }).eq('id', id)
    setTodos(prev => prev.map(p => p.id === id ? { ...p, aprovado: !aprovado } : p))
    setAcaoId(null)
  }

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const stats = {
    total: todos.length,
    ativos: todos.filter(p => p.status !== 'blocked' && p.aprovado).length,
    bloqueados: todos.filter(p => p.status === 'blocked').length,
    pendentes: todos.filter(p => !p.aprovado).length,
    novosMes: todos.filter(p => new Date(p.created_at) >= thisMonth).length,
    mediaAvaliacao: (() => {
      const comAval = todos.filter(p => p.avaliacao != null)
      if (!comAval.length) return 0
      return (comAval.reduce((s, p) => s + (p.avaliacao ?? 0), 0) / comAval.length).toFixed(1)
    })(),
  }

  const especialidades = Array.from(new Set(todos.map(p => p.especialidade).filter(Boolean))) as string[]

  const profissionais = todos.filter(p => {
    const q = filtro.toLowerCase()
    const matchText = !q ||
      p.nome.toLowerCase().includes(q) ||
      (p.especialidade ?? '').toLowerCase().includes(q) ||
      (p.telefone ?? '').includes(q) ||
      (p.cidade ?? '').toLowerCase().includes(q)

    const matchEsp = !filtroEsp || p.especialidade === filtroEsp

    const matchStatus =
      filtroStatus === 'todos' ? true :
      filtroStatus === 'ativos' ? p.status !== 'blocked' && p.aprovado !== false :
      filtroStatus === 'bloqueados' ? p.status === 'blocked' :
      filtroStatus === 'pendentes' ? !p.aprovado : true

    return matchText && matchEsp && matchStatus
  })

  return {
    profissionais, loading, stats, especialidades, ESPECIALIDADES_ICON,
    filtro, setFiltro,
    filtroStatus, setFiltroStatus,
    filtroEsp, setFiltroEsp,
    acaoId,
    toggleBloquear, toggleAprovar,
    tiposEspecialidade,
    novaEspecialidade, setNovaEspecialidade,
    adicionarEspecialidade, removerEspecialidade,
  }
}
