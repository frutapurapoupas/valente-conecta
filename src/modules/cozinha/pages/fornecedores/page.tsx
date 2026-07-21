// src/modules/cozinha/pages/fornecedores/page.tsx
// ============================================
// PÁGINA DE FORNECEDORES
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  StarOff,
  Building2
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatDate } from '../../utils/formatadores'

// Dados mockados
const mockFornecedores = [
  {
    id: 'FOR-001',
    nome: 'Distribuidora Alimentos Premium',
    contato: 'Carlos Souza',
    telefone: '(11) 99999-8888',
    email: 'carlos@alimentos-premium.com',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    produtos: ['Arroz', 'Feijão', 'Óleo', 'Sal'],
    status: 'ativo',
    avaliacao: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'FOR-002',
    nome: 'Carnes Nobre LTDA',
    contato: 'Ana Oliveira',
    telefone: '(11) 98888-7777',
    email: 'ana@carnesnobre.com',
    endereco: 'Av. Brasil, 456 - São Paulo, SP',
    produtos: ['Carne Bovino', 'Frango', 'Porco', 'Peixe'],
    status: 'ativo',
    avaliacao: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'FOR-003',
    nome: 'Verduras Frescas',
    contato: 'João Santos',
    telefone: '(11) 97777-6666',
    email: 'joao@verdurasfrescas.com',
    endereco: 'Rua das Hortaliças, 789 - São Paulo, SP',
    produtos: ['Alface', 'Tomate', 'Cebola', 'Pimentão'],
    status: 'inativo',
    avaliacao: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'FOR-004',
    nome: 'Laticínios da Serra',
    contato: 'Maria Pereira',
    telefone: '(11) 96666-5555',
    email: 'maria@laticiniosserra.com',
    endereco: 'Estrada da Serra, 1234 - São Paulo, SP',
    produtos: ['Leite', 'Queijo', 'Manteiga', 'Iogurte'],
    status: 'ativo',
    avaliacao: 5,
    created_at: new Date().toISOString()
  }
]

export default function FornecedoresPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [fornecedores, setFornecedores] = useState(mockFornecedores)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const ativos = fornecedores.filter(f => f.status === 'ativo').length
  const inativos = fornecedores.filter(f => f.status === 'inativo').length
  const totalProdutos = fornecedores.reduce((acc, f) => acc + f.produtos.length, 0)

  const metrics = [
    {
      title: 'Total Fornecedores',
      value: fornecedores.length,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Ativos',
      value: ativos,
      icon: Building2,
      color: 'green' as const
    },
    {
      title: 'Inativos',
      value: inativos,
      icon: Building2,
      color: 'red' as const
    },
    {
      title: 'Total Produtos',
      value: totalProdutos,
      icon: Package,
      color: 'purple' as const
    }
  ]

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { key: 'nome', label: 'Fornecedor' },
    { key: 'contato', label: 'Contato' },
    { 
      key: 'telefone', 
      label: 'Telefone',
      render: (value: string) => (
        <a href={	el:} className="text-blue-600 hover:underline">
          {value}
        </a>
      )
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (value: string) => (
        <a href={mailto:} className="text-blue-600 hover:underline">
          {value}
        </a>
      )
    },
    { 
      key: 'produtos', 
      label: 'Produtos',
      render: (value: string[]) => value.join(', ')
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'avaliacao', 
      label: 'Avaliação',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          {'★'.repeat(value)}{'☆'.repeat(5 - value)}
          <span className="text-sm text-gray-500 ml-1">({value})</span>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border p-4 animate-pulse h-64"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="text-blue-500" />
            Fornecedores
          </h1>
          <p className="text-gray-500">Gerencie seus fornecedores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <CardMetric
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Lista de Fornecedores
          </h2>
          <span className="text-sm text-gray-500">
            {filteredFornecedores.length} fornecedores
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredFornecedores}
          emptyMessage="Nenhum fornecedor encontrado"
        />
      </div>
    </div>
  )
}
