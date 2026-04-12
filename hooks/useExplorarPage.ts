'use client'

import { useMemo, useState } from 'react'

export type StatusProfissional = 'aberto' | 'fechado' | 'ocupado'

export interface Profissional {
  id: string
  nome: string
  categoria: string
  subcategoria: string
  nota: number
  totalAvaliacoes: number
  status: StatusProfissional
  avatar: string        // emoji ou iniciais
  cor: string           // tailwind bg color
  endereco: string
  bairro: string
  distancia: string
  preco: string
  destaque: boolean
}

const MOCK_PROFISSIONAIS: Profissional[] = [
  { id: '1', nome: 'Borracharia do Baixinho', categoria: 'Borracharia', subcategoria: '24 horas', nota: 4.9, totalAvaliacoes: 312, status: 'aberto', avatar: '🔧', cor: 'bg-orange-500/20', endereco: 'Rua Principal, 45', bairro: 'Centro', distancia: '0,3 km', preco: 'Conserto a partir R$ 25', destaque: true },
  { id: '2', nome: 'Naiara Designer', categoria: 'Manicure', subcategoria: 'Unhas e sobrancelha', nota: 5.0, totalAvaliacoes: 187, status: 'aberto', avatar: '💅', cor: 'bg-pink-500/20', endereco: 'Av. Boa Vista, 102', bairro: 'Boa Vista', distancia: '0,7 km', preco: 'Manicure a partir R$ 30', destaque: true },
  { id: '3', nome: 'Rafa Barber', categoria: 'Barbearia', subcategoria: 'Cortes masculinos', nota: 4.8, totalAvaliacoes: 255, status: 'aberto', avatar: '✂️', cor: 'bg-blue-500/20', endereco: 'Rua XV de Novembro, 8', bairro: 'Centro', distancia: '0,5 km', preco: 'Corte a partir R$ 20', destaque: false },
  { id: '4', nome: 'Mecânico Valente Auto', categoria: 'Mecânico', subcategoria: 'Carros e motos', nota: 4.7, totalAvaliacoes: 140, status: 'ocupado', avatar: '🔩', cor: 'bg-zinc-500/20', endereco: 'Rua Industrial, 300', bairro: 'Bairro Novo', distancia: '1,2 km', preco: 'Diagnóstico grátis', destaque: false },
  { id: '5', nome: 'Fretes Rapidos JL', categoria: 'Fretes', subcategoria: 'Pequenos fretes', nota: 4.6, totalAvaliacoes: 98, status: 'aberto', avatar: '🚛', cor: 'bg-yellow-500/20', endereco: 'Rua das Flores, 22', bairro: 'São Sebastião', distancia: '1,8 km', preco: 'A partir R$ 35 por km', destaque: false },
  { id: '6', nome: 'Aluguel Valente Imóveis', categoria: 'Aluguel', subcategoria: 'Casas e apartamentos', nota: 4.5, totalAvaliacoes: 64, status: 'aberto', avatar: '🏠', cor: 'bg-emerald-500/20', endereco: 'Praça Central, 1', bairro: 'Centro', distancia: '0,2 km', preco: 'Casas a partir R$ 600/mês', destaque: true },
  { id: '7', nome: 'Camila Nails Studio', categoria: 'Manicure', subcategoria: 'Nail art e spa', nota: 4.9, totalAvaliacoes: 211, status: 'fechado', avatar: '💎', cor: 'bg-fuchsia-500/20', endereco: 'Av. das Acácias, 55', bairro: 'Novo Horizonte', distancia: '2,1 km', preco: 'Nail art a partir R$ 45', destaque: false },
  { id: '8', nome: 'Eletricista 24h Valente', categoria: 'Elétrica', subcategoria: 'Instalações e reparos', nota: 4.7, totalAvaliacoes: 77, status: 'aberto', avatar: '⚡', cor: 'bg-yellow-500/20', endereco: 'Rua Joinville, 14', bairro: 'Santa Cruz', distancia: '1,5 km', preco: 'Visita R$ 80 + serviço', destaque: false },
  { id: '9', nome: 'Dedetizadora Salvo', categoria: 'Serviços', subcategoria: 'Controle de pragas', nota: 4.4, totalAvaliacoes: 33, status: 'aberto', avatar: '🐛', cor: 'bg-green-500/20', endereco: 'Rua da Igreja, 90', bairro: 'Centro', distancia: '0,6 km', preco: 'Consulte por ambiente', destaque: false },
  { id: '10', nome: 'Layla Confeitaria', categoria: 'Alimentação', subcategoria: 'Bolos e doces', nota: 4.8, totalAvaliacoes: 156, status: 'aberto', avatar: '🎂', cor: 'bg-rose-500/20', endereco: 'Rua Nova, 77', bairro: 'Boa Vista', distancia: '0,9 km', preco: 'Bolos a partir R$ 120', destaque: false },
]

export const CATEGORIAS = ['Todos', 'Borracharia', 'Manicure', 'Barbearia', 'Mecânico', 'Fretes', 'Aluguel', 'Elétrica', 'Alimentação', 'Serviços']

export function useExplorarPage() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [busca, setBusca] = useState('')

  const listaFiltrada = useMemo(() => {
    return MOCK_PROFISSIONAIS
      .filter(p => {
        if (activeFilter !== 'todos' && p.categoria.toLowerCase() !== activeFilter.toLowerCase()) return false
        if (busca.trim()) {
          const q = busca.toLowerCase()
          return (
            p.nome.toLowerCase().includes(q) ||
            p.categoria.toLowerCase().includes(q) ||
            p.subcategoria.toLowerCase().includes(q) ||
            p.bairro.toLowerCase().includes(q)
          )
        }
        return true
      })
  }, [activeFilter, busca])

  const destaques = useMemo(() => MOCK_PROFISSIONAIS.filter(p => p.destaque && p.status === 'aberto'), [])

  return {
    activeFilter,
    setActiveFilter,
    categorias: CATEGORIAS,
    busca,
    setBusca,
    lista: listaFiltrada,
    destaques,
  }
}
