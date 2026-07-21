// src/modules/cozinha/pages/ingredientes/page.tsx
// ============================================
// PÁGINA DE INGREDIENTES
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  DollarSign
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatWeight } from '../../utils/formatadores'

// Dados mockados
const mockIngredientes = [
  { id: 'ING-001', nome: 'Arroz Branco', categoria: 'Grãos', unidade: 'kg', precoUnitario: 8.50, estoque: 50, estoqueMinimo: 10 },
  { id: 'ING-002', nome: 'Feijão Preto', categoria: 'Grãos', unidade: 'kg', precoUnitario: 9.90, estoque: 30, estoqueMinimo: 8 },
  { id: 'ING-003', nome: 'Óleo de Soja', categoria: 'Óleos', unidade: 'L', precoUnitario: 12.00, estoque: 20, estoqueMinimo: 5 },
  { id: 'ING-004', nome: 'Sal Refinado', categoria: 'Temperos', unidade: 'kg', precoUnitario: 2.50, estoque: 8, estoqueMinimo: 3 },
  { id: 'ING-005', nome: 'Carne Bovino', categoria: 'Carnes', unidade: 'kg', precoUnitario: 45.00, estoque: 5, estoqueMinimo: 10 },
  { id: 'ING-006', nome: 'Frango', categoria: 'Carnes', unidade: 'kg', precoUnitario: 25.00, estoque: 12, estoqueMinimo: 8 },
  { id: 'ING-007', nome: 'Alface', categoria: 'Verduras', unidade: 'un', precoUnitario: 2.00, estoque: 3, estoqueMinimo: 5 }
]

export default function IngredientesPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [ingredientes, setIngredientes] = useState(mockIngredientes)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const totalItens = ingredientes.length
  const valorEstoque = ingredientes.reduce((acc, i) => acc + (i.estoque * i.precoUnitario), 0)
  const itensBaixos = ingredientes.filter(i => i.estoque <= i.estoqueMinimo).length
  const itensCriticos = ingredientes.filter(i => i.estoque <= i.estoqueMinimo / 2).length

  const metrics = [
    {
      title: 'Total Ingredientes',
      value: totalItens,
      icon: Package,
      color: 'blue' as const
    },
    {
      title: 'Valor Estoque',
      value: formatCurrency(valorEstoque),
      icon: DollarSign,
      color: 'green' as const
    },
    {
      title: 'Estoque Baixo',
      value: itensBaixos,
      icon: AlertTriangle,
      color: 'yellow' as const
    },
    {
      title: 'Críticos',
      value: itensCriticos,
      icon: AlertTriangle,
      color: 'red' as const
    }
  ]

  const filteredIngredientes = ingredientes.filter(i =>
    i.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatus = (estoque: number, minimo: number) => {
    if (estoque <= minimo / 2) return 'critico'
    if (estoque <= minimo) return 'baixo'
    return 'ok'
  }

  const columns = [
    { key: 'nome', label: 'Ingrediente' },
    { key: 'categoria', label: 'Categoria' },
    { 
      key: 'estoque', 
      label: 'Estoque',
      render: (value: number, item: any) => ${value} 
    },
    { 
      key: 'precoUnitario', 
      label: 'Preço Unit.',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (_: any, item: any) => {
        const status = getStatus(item.estoque, item.estoqueMinimo)
        return <StatusBadge status={status} />
      }
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
            <Package className="text-green-500" />
            Ingredientes
          </h1>
          <p className="text-gray-500">Gerencie todos os ingredientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Ingrediente
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

      {/* Alertas */}
      {itensCriticos > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Itens Críticos
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {ingredientes
              .filter(i => i.estoque <= i.estoqueMinimo / 2)
              .map(i => (
                <span key={i.id} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                  {i.nome}: {i.estoque} {i.unidade}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar ingredientes..."
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
            <Scale className="h-5 w-5 text-green-500" />
            Lista de Ingredientes
          </h2>
          <span className="text-sm text-gray-500">
            {filteredIngredientes.length} ingredientes
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredIngredientes}
          emptyMessage="Nenhum ingrediente encontrado"
        />
      </div>
    </div>
  )
}
