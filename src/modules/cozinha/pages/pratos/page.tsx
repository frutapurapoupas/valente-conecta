// src/modules/cozinha/pages/pratos/page.tsx
// ============================================
// PÁGINA DE PRATOS
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import {
  Utensils,
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Star,
  StarOff,
  Tag,
  ChefHat
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatTime } from '../../utils/formatadores'

// Dados mockados
const mockPratos = [
  { 
    id: 'PRA-001', 
    nome: 'Feijoada Completa', 
    categoria: 'Prato Principal', 
    preco: 45.00, 
    custo: 18.50, 
    tempoPreparo: 60,
    porcoes: 4,
    status: 'ativo',
    destaque: true
  },
  { 
    id: 'PRA-002', 
    nome: 'Strogonoff de Frango', 
    categoria: 'Prato Principal', 
    preco: 35.00, 
    custo: 14.20, 
    tempoPreparo: 30,
    porcoes: 2,
    status: 'ativo',
    destaque: false
  },
  { 
    id: 'PRA-003', 
    nome: 'Lasanha Bolonhesa', 
    categoria: 'Massas', 
    preco: 32.00, 
    custo: 12.80, 
    tempoPreparo: 45,
    porcoes: 3,
    status: 'ativo',
    destaque: true
  },
  { 
    id: 'PRA-004', 
    nome: 'Bife Acebolado', 
    categoria: 'Carnes', 
    preco: 28.00, 
    custo: 11.20, 
    tempoPreparo: 20,
    porcoes: 1,
    status: 'inativo',
    destaque: false
  },
  { 
    id: 'PRA-005', 
    nome: 'Pudim de Leite', 
    categoria: 'Sobremesa', 
    preco: 15.00, 
    custo: 6.00, 
    tempoPreparo: 90,
    porcoes: 6,
    status: 'ativo',
    destaque: true
  }
]

export default function PratosPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pratos, setPratos] = useState(mockPratos)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const ativos = pratos.filter(p => p.status === 'ativo').length
  const inativos = pratos.filter(p => p.status === 'inativo').length
  const emDestaque = pratos.filter(p => p.destaque).length
  const valorMedio = pratos.reduce((acc, p) => acc + p.preco, 0) / pratos.length

  const metrics = [
    {
      title: 'Total Pratos',
      value: pratos.length,
      icon: Utensils,
      color: 'blue' as const
    },
    {
      title: 'Ativos',
      value: ativos,
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: 'Em Destaque',
      value: emDestaque,
      icon: Star,
      color: 'yellow' as const
    },
    {
      title: 'Preço Médio',
      value: formatCurrency(valorMedio),
      icon: DollarSign,
      color: 'purple' as const
    }
  ]

  const filteredPratos = pratos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { key: 'nome', label: 'Prato' },
    { key: 'categoria', label: 'Categoria' },
    { 
      key: 'preco', 
      label: 'Preço',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'custo', 
      label: 'Custo',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'tempoPreparo', 
      label: 'Tempo',
      render: (value: number) => formatTime(value)
    },
    { 
      key: 'porcoes', 
      label: 'Porções',
      render: (value: number) => ${value} un
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'destaque', 
      label: 'Destaque',
      render: (value: boolean) => value ? 
        <span className="text-yellow-500">★</span> : 
        <span className="text-gray-300">☆</span>
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
            <ChefHat className="text-orange-500" />
            Pratos
          </h1>
          <p className="text-gray-500">Gerencie os pratos do cardápio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Prato
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
            placeholder="Buscar pratos..."
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
            <Utensils className="h-5 w-5 text-orange-500" />
            Lista de Pratos
          </h2>
          <span className="text-sm text-gray-500">
            {filteredPratos.length} pratos
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredPratos}
          emptyMessage="Nenhum prato encontrado"
        />
      </div>
    </div>
  )
}
