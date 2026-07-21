// src/modules/cozinha/pages/financeiro/page.tsx
// ============================================
// PÁGINA FINANCEIRO
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { DataTable } from '../../components/DataTable'
import { StatusBadge } from '../../components/StatusBadge'
import { useReceitas } from '../../hooks/useReceitas'
import { useCompras } from '../../hooks/useCompras'
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatadores'

export default function FinanceiroPage() {
  const { receitas, loading: loadingReceitas } = useReceitas()
  const { compras, loading: loadingCompras } = useCompras()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading || loadingReceitas || loadingCompras) {
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

  // Calcular métricas financeiras
  const totalReceitas = receitas.reduce((acc, r) => acc + (r.precoSugerido || 0), 0)
  const totalCusto = receitas.reduce((acc, r) => acc + (r.custoTotal || 0), 0)
  const totalGasto = compras.reduce((acc, c) => acc + (c.total || 0), 0)
  const lucroTotal = totalReceitas - totalCusto
  const margemMedia = totalReceitas > 0 ? ((totalReceitas - totalCusto) / totalReceitas) * 100 : 0

  const metrics = [
    {
      title: 'Receita Total',
      value: formatCurrency(totalReceitas),
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Custo Total',
      value: formatCurrency(totalCusto),
      icon: TrendingDown,
      color: 'red' as const
    },
    {
      title: 'Lucro Total',
      value: formatCurrency(lucroTotal),
      icon: Wallet,
      color: lucroTotal >= 0 ? 'green' as const : 'red' as const
    },
    {
      title: 'Margem Média',
      value: formatPercent(margemMedia),
      icon: PieChart,
      color: margemMedia >= 50 ? 'green' as const : margemMedia >= 30 ? 'yellow' as const : 'red' as const
    }
  ]

  // Dados para tabela de receitas
  const receitasData = receitas.map(r => ({
    ...r,
    lucro: (r.precoSugerido || 0) - (r.custoTotal || 0),
    margem: r.precoSugerido > 0 ? ((r.precoSugerido - r.custoTotal) / r.precoSugerido) * 100 : 0
  }))

  const filteredReceitas = receitasData.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { key: 'nome', label: 'Receita' },
    { 
      key: 'custoTotal', 
      label: 'Custo',
      render: (value: number) => formatCurrency(value || 0)
    },
    { 
      key: 'precoSugerido', 
      label: 'Preço',
      render: (value: number) => formatCurrency(value || 0)
    },
    { 
      key: 'lucro', 
      label: 'Lucro',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(value || 0)}
        </span>
      )
    },
    { 
      key: 'margem', 
      label: 'Margem',
      render: (value: number) => {
        const color = value >= 50 ? 'text-green-600' : value >= 30 ? 'text-yellow-600' : 'text-red-600'
        return <span className={color}>{formatPercent(value || 0)}</span>
      }
    },
    { key: 'status', label: 'Status', render: (value: string) => <StatusBadge status={value} /> }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-500" />
            Financeiro
          </h1>
          <p className="text-gray-500">Análise financeira da cozinha</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
        </div>
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

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total de Receitas</p>
          <p className="text-2xl font-bold">{receitas.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total de Compras</p>
          <p className="text-2xl font-bold">{compras.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Ticket Médio</p>
          <p className="text-2xl font-bold">
            {receitas.length > 0 ? formatCurrency(totalReceitas / receitas.length) : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabela de Receitas */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Análise por Receita
          </h2>
          <span className="text-sm text-gray-500">
            {filteredReceitas.length} receitas
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredReceitas}
          emptyMessage="Nenhuma receita encontrada"
        />
      </div>
    </div>
  )
}
