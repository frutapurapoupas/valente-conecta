'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type TipoItem = 'servico' | 'produto'

export type FotoStatus = 'pendente' | 'aprovado' | null

export interface CatalogoItem {
  id: string
  profissional_id: string
  nome: string
  descricao: string | null
  foto_url: string | null
  foto_pendente_url: string | null
  foto_status: FotoStatus
  preco: number | null
  tipo: TipoItem
  ativo: boolean
  created_at: string
}

export interface ProfissionalPublico {
  id: string
  nome: string
  especialidade: string | null
  cidade: string | null
  foto_url: string | null
  telefone: string | null
  email: string | null
  avaliacao: number | null
  total_servicos: number | null
  tem_plano: boolean
}

// ─── Mocks ────────────────────────────────────────────────────────────────────
const MOCK_PROFISSIONAIS: Record<string, ProfissionalPublico> = {
  p1: { id: 'p1', nome: 'Carla Souza', especialidade: 'manicure', cidade: 'Valente-BA', foto_url: null, telefone: '(75) 99111-0001', email: 'carla.unhas@gmail.com', avaliacao: 4.9, total_servicos: 87, tem_plano: true },
  p2: { id: 'p2', nome: 'Joao Barbearia', especialidade: 'barbeiro', cidade: 'Valente-BA', foto_url: null, telefone: '(75) 99222-0002', email: 'joao.barba@hotmail.com', avaliacao: 4.7, total_servicos: 134, tem_plano: false },
  p3: { id: 'p3', nome: 'Raimundo Pneus', especialidade: 'borracheiro', cidade: 'Valente-BA', foto_url: null, telefone: '(75) 99333-0003', email: null, avaliacao: 4.5, total_servicos: 62, tem_plano: false },
}

const M: Omit<CatalogoItem, 'foto_pendente_url' | 'foto_status'> & { foto_pendente_url: null; foto_status: null } = {} as any
void M

function mockItem(partial: Omit<CatalogoItem, 'foto_pendente_url' | 'foto_status'>): CatalogoItem {
  return { ...partial, foto_pendente_url: null, foto_status: null }
}

const MOCK_CATALOGOS: Record<string, CatalogoItem[]> = {
  p1: [
    mockItem({ id: 'ci1', profissional_id: 'p1', nome: 'Manicure Simples', descricao: 'Esmaltação simples com base e top coat', foto_url: null, preco: 25.00, tipo: 'servico', ativo: true, created_at: '2026-01-10T09:00:00Z' }),
    mockItem({ id: 'ci2', profissional_id: 'p1', nome: 'Manicure com Gel', descricao: 'Unhas em gel, duração até 3 semanas', foto_url: null, preco: 60.00, tipo: 'servico', ativo: true, created_at: '2026-01-12T10:00:00Z' }),
    mockItem({ id: 'ci3', profissional_id: 'p1', nome: 'Pedicure Completo', descricao: 'Esmaltação, cutícula e hidratação dos pés', foto_url: null, preco: 35.00, tipo: 'servico', ativo: true, created_at: '2026-01-15T11:00:00Z' }),
    mockItem({ id: 'ci4', profissional_id: 'p1', nome: 'Kit Esmaltes', descricao: 'Kit com 3 esmaltes premium', foto_url: null, preco: 45.00, tipo: 'produto', ativo: true, created_at: '2026-02-01T09:00:00Z' }),
  ],
  p2: [
    mockItem({ id: 'ci5', profissional_id: 'p2', nome: 'Corte Masculino', descricao: 'Corte clássico com tesoura e navalha', foto_url: null, preco: 30.00, tipo: 'servico', ativo: true, created_at: '2026-01-20T10:00:00Z' }),
    mockItem({ id: 'ci6', profissional_id: 'p2', nome: 'Barba Completa', descricao: 'Aparar, modelar, hidratação e toalha quente', foto_url: null, preco: 25.00, tipo: 'servico', ativo: true, created_at: '2026-01-21T10:00:00Z' }),
    mockItem({ id: 'ci7', profissional_id: 'p2', nome: 'Corte + Barba', descricao: 'Pacote completo com desconto', foto_url: null, preco: 50.00, tipo: 'servico', ativo: true, created_at: '2026-01-22T10:00:00Z' }),
  ],
  p3: [
    mockItem({ id: 'ci8', profissional_id: 'p3', nome: 'Remendo de Pneu', descricao: 'Remendo vulcanizado ou a frio', foto_url: null, preco: 15.00, tipo: 'servico', ativo: true, created_at: '2026-02-05T08:00:00Z' }),
    mockItem({ id: 'ci9', profissional_id: 'p3', nome: 'Calibragem', descricao: 'Calibragem dos 4 pneus', foto_url: null, preco: 10.00, tipo: 'servico', ativo: true, created_at: '2026-02-06T08:00:00Z' }),
  ],
}

// ─── Form novo item ────────────────────────────────────────────────────────────
export type FormItem = {
  nome: string
  descricao: string
  foto_url: string
  preco: string
  tipo: TipoItem
}

export const FORM_VAZIO: FormItem = { nome: '', descricao: '', foto_url: '', preco: '', tipo: 'servico' }

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCatalogoProfissional(profissionalId?: string) {
  const [profissional, setProfissional] = useState<ProfissionalPublico | null>(null)
  const [itens, setItens] = useState<CatalogoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadandoId, setUploadandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormItem>(FORM_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoItem>('todos')

  const carregar = useCallback(async () => {
    setLoading(true)

    if (!profissionalId) {
      // sem ID → usa primeiro mock
      const pid = 'p1'
      setProfissional(MOCK_PROFISSIONAIS[pid])
      setItens(MOCK_CATALOGOS[pid] ?? [])
      setLoading(false)
      return
    }

    const [{ data: prof }, { data: catalog }] = await Promise.all([
      supabase
        .from('professionals')
        .select('id, nome:user_id(name), especialidade, cidade, foto_url, telefone, email, avaliacao, total_servicos, plano')
        .eq('id', profissionalId)
        .single(),
      supabase
        .from('professional_catalog')
        .select('*')
        .eq('profissional_id', profissionalId)
        .order('created_at', { ascending: true }),
    ])

    if (!prof) {
      // fallback mock pelo ID
      const mock = MOCK_PROFISSIONAIS[profissionalId] ?? Object.values(MOCK_PROFISSIONAIS)[0]
      setProfissional(mock)
      setItens(MOCK_CATALOGOS[profissionalId] ?? MOCK_CATALOGOS['p1'])
    } else {
      setProfissional({
        id: prof.id,
        nome: (prof.nome as any)?.name ?? 'Profissional',
        especialidade: prof.especialidade,
        cidade: prof.cidade,
        foto_url: prof.foto_url,
        telefone: prof.telefone,
        email: prof.email,
        avaliacao: prof.avaliacao,
        total_servicos: prof.total_servicos,
        tem_plano: !!(prof as any).plano && (prof as any).plano !== 'free',
      })
      setItens(catalog ?? [])
    }
    setLoading(false)
  }, [profissionalId])

  useEffect(() => { carregar() }, [carregar])

  async function adicionarItem() {
    if (!form.nome.trim()) return
    setSalvando(true)

    const payload = {
      profissional_id: profissionalId ?? 'p1',
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      foto_url: form.foto_url.trim() || null,
      foto_pendente_url: null as string | null,
      foto_status: null as FotoStatus,
      preco: form.preco ? parseFloat(form.preco.replace(',', '.')) : null,
      tipo: form.tipo,
      ativo: true,
    }

    const { data } = await supabase.from('professional_catalog').insert(payload).select().single()
    const item: CatalogoItem = data ?? {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }

    setItens(prev => [...prev, item])
    setForm(FORM_VAZIO)
    setMostrarForm(false)
    setSalvando(false)
  }

  async function toggleAtivo(id: string) {
    const item = itens.find(i => i.id === id)
    if (!item) return
    const novoAtivo = !item.ativo
    await supabase.from('professional_catalog').update({ ativo: novoAtivo }).eq('id', id)
    setItens(prev => prev.map(i => i.id === id ? { ...i, ativo: novoAtivo } : i))
  }

  async function removerItem(id: string) {
    await supabase.from('professional_catalog').delete().eq('id', id)
    setItens(prev => prev.filter(i => i.id !== id))
  }

  // Upload de foto — admin envia diretamente (aprovado imediato)
  // Profissional envia com autoAprovar=false → fica pendente
  async function uploadFoto(itemId: string, file: File, autoAprovar = false) {
    setUploadandoId(itemId)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `catalog/${profissionalId ?? 'misc'}/${itemId}-${Date.now()}.${ext}`

    let fotoUrl: string | null = null
    const { data: up, error } = await supabase.storage.from('catalog-photos').upload(path, file, { upsert: true })
    if (!error && up) {
      const { data: pub } = supabase.storage.from('catalog-photos').getPublicUrl(path)
      fotoUrl = pub.publicUrl
    } else {
      // fallback: object URL (memória, apenas para preview)
      fotoUrl = URL.createObjectURL(file)
    }

    if (autoAprovar) {
      await supabase.from('professional_catalog')
        .update({ foto_url: fotoUrl, foto_pendente_url: null, foto_status: 'aprovado' })
        .eq('id', itemId)
      setItens(prev => prev.map(i =>
        i.id === itemId ? { ...i, foto_url: fotoUrl, foto_pendente_url: null, foto_status: 'aprovado' } : i
      ))
    } else {
      await supabase.from('professional_catalog')
        .update({ foto_pendente_url: fotoUrl, foto_status: 'pendente' })
        .eq('id', itemId)
      setItens(prev => prev.map(i =>
        i.id === itemId ? { ...i, foto_pendente_url: fotoUrl, foto_status: 'pendente' } : i
      ))
    }
    setUploadandoId(null)
  }

  async function aprovarFoto(itemId: string) {
    const item = itens.find(i => i.id === itemId)
    if (!item?.foto_pendente_url) return
    const url = item.foto_pendente_url
    await supabase.from('professional_catalog')
      .update({ foto_url: url, foto_pendente_url: null, foto_status: 'aprovado' })
      .eq('id', itemId)
    setItens(prev => prev.map(i =>
      i.id === itemId ? { ...i, foto_url: url, foto_pendente_url: null, foto_status: 'aprovado' } : i
    ))
  }

  async function rejeitarFoto(itemId: string) {
    await supabase.from('professional_catalog')
      .update({ foto_pendente_url: null, foto_status: null })
      .eq('id', itemId)
    setItens(prev => prev.map(i =>
      i.id === itemId ? { ...i, foto_pendente_url: null, foto_status: null } : i
    ))
  }

  const itensFiltrados = filtroTipo === 'todos'
    ? itens
    : itens.filter(i => i.tipo === filtroTipo)

  const fotosPendentes = itens.filter(i => i.foto_status === 'pendente')

  const stats = {
    total: itens.length,
    servicos: itens.filter(i => i.tipo === 'servico').length,
    produtos: itens.filter(i => i.tipo === 'produto').length,
    ativos: itens.filter(i => i.ativo).length,
  }

  return {
    profissional, itens: itensFiltrados, loading, salvando, uploadandoId,
    fotosPendentes,
    form, setForm,
    mostrarForm, setMostrarForm,
    filtroTipo, setFiltroTipo,
    stats,
    adicionarItem, toggleAtivo, removerItem, carregar,
    uploadFoto, aprovarFoto, rejeitarFoto,
  }
}
