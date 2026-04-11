'use client'

import { useState } from 'react'

export interface PlanoItem {
  id: string
  categoria: 'empresa' | 'profissional' | 'academia' | 'busca'
  nome: string
  preco: number // 0 = Grátis
  descricao: string[]
  destaque?: boolean
  boasVindas?: string // ex: "30 dias grátis"
}

const PLANOS_INICIAIS: PlanoItem[] = [
  // ── EMPRESAS ─────────────────────────────────────────────
  {
    id: 'emp-free',
    categoria: 'empresa',
    nome: 'Grátis',
    preco: 0,
    descricao: [
      'Cadastro básico (nome + celular)',
      'Visibilidade no mapa/busca',
      'Perfil público simples',
      'Até 5 produtos no catálogo',
    ],
  },
  {
    id: 'emp-basico',
    categoria: 'empresa',
    nome: 'Básico',
    preco: 29.9,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Tudo do plano Grátis',
      'Cadastro completo (CNPJ + endereço)',
      'Até 50 produtos no catálogo',
      'PDV Colaborativo ativo',
      'Contatos visíveis sem custo',
    ],
  },
  {
    id: 'emp-premium',
    categoria: 'empresa',
    nome: 'Premium',
    preco: 49.9,
    destaque: true,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Tudo do plano Básico',
      'Catálogo ilimitado de produtos',
      'Inteligência comercial e relatórios',
      'Destaque no carrossel de publicidade',
      'Gestão de estoque avançada',
    ],
  },
  {
    id: 'emp-fisco',
    categoria: 'empresa',
    nome: 'Fisco',
    preco: 99.9,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Tudo do plano Premium',
      'Módulo fiscal e contábil completo',
      'Emissão de relatórios tributários',
      'Integração com dados de movimento',
      'Suporte prioritário',
    ],
  },

  // ── PROFISSIONAIS ─────────────────────────────────────────
  {
    id: 'prof-free',
    categoria: 'profissional',
    nome: 'Grátis',
    preco: 0,
    descricao: [
      'Perfil básico no app',
      'Visibilidade na busca',
      'Até 3 fotos no portfólio',
    ],
  },
  {
    id: 'prof-basico',
    categoria: 'profissional',
    nome: 'Básico',
    preco: 25,
    destaque: true,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Perfil completo com portfólio',
      'Agenda online configurável',
      'Valor de diária/serviço visível',
      'Cartão de visita digital',
      'Destaque na busca e no mapa',
    ],
  },

  // ── ACADEMIA ─────────────────────────────────────────────
  {
    id: 'aca-free',
    categoria: 'academia',
    nome: 'Grátis',
    preco: 0,
    descricao: [
      'Acesso às aulas em grupo',
      'Uso das máquinas nos horários disponíveis',
      'Sem cartão de crédito',
    ],
  },
  {
    id: 'aca-basico',
    categoria: 'academia',
    nome: 'Básico',
    preco: 9.9,
    destaque: true,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Tudo do plano Grátis',
      'App de treinos incluso',
      'Aulas extras e horários prioritários',
      'Avaliação física mensal',
    ],
  },

  // ── PESQUISA INTELIGENTE (Usuário Geral) ─────────────────
  {
    id: 'busca-30d',
    categoria: 'busca',
    nome: 'Pesquisa Inteligente',
    preco: 29.9,
    boasVindas: '20 dias grátis de boas-vindas',
    descricao: [
      'Busca avançada por cidade e categoria',
      'Filtros por preço, avaliação e distância',
      'Alertas de ofertas e promoções',
      'Válido por 30 dias · pré-pago',
    ],
  },
]

export function useAdminPrecos() {
  const [planos, setPlanos] = useState<PlanoItem[]>(PLANOS_INICIAIS)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novoPreco, setNovoPreco] = useState('')
  const [salvo, setSalvo] = useState(false)

  const iniciarEdicao = (id: string, precoAtual: number) => {
    setEditandoId(id)
    setNovoPreco(precoAtual.toString())
    setSalvo(false)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setNovoPreco('')
  }

  const salvarPreco = (id: string) => {
    const valor = parseFloat(novoPreco)
    if (isNaN(valor) || valor < 0) return
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, preco: valor } : p))
    setEditandoId(null)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  // Remove 'busca' as any — now properly typed
  const empresas = planos.filter(p => p.categoria === 'empresa')
  const profissionais = planos.filter(p => p.categoria === 'profissional')
  const academia = planos.filter(p => p.categoria === 'academia')
  const busca = planos.filter(p => p.categoria === 'busca')

  return {
    planos,
    empresas,
    profissionais,
    academia,
    busca,
    editandoId,
    novoPreco,
    setNovoPreco,
    iniciarEdicao,
    cancelarEdicao,
    salvarPreco,
    salvo,
  }
}
