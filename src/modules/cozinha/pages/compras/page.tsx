// src/modules/cozinha/pages/compras/page.tsx
// ============================================
// PÁGINA DE COMPRAS
// ============================================

'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Package
} from 'lucide-react'
import { useCompras } from '../../hooks/useCompras'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatDate } from '../../utils/formatadores'

export default function ComprasPage() {
  const { compras, requestsPendentes, stats, loading } = useCompras()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompras = compras.filter(item =>
    item.fornecedorNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const metrics = stats ? [
    {
      title: 'Total Compras',
      value: stats.totalCompras,
      icon: ShoppingCart,
      color: 'blue' as const
    },
    {
      title: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      color: 'yellow' as const
    },
    {
      title: 'Recebidas',
      value: stats.recebidas,
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(stats.totalGasto),
      icon: TrendingUp,
      color: 'purple' as const
    }
  ] : []

  const columns = [
    { 
      key: 'data', 
      label: 'Data',
      render: (value: string) => formatDate(new Date(value))
    },
    { key: 'fornecedorNome', label: 'Fornecedor' },
    { 
      key: 'itens', 
      label: 'Itens',
      render: (value: any[]) => value?.length || 0
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (value: number) => formatCurrency(value || 0)
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compras</h1>
          <p className="text-gray-500">Gerencie as compras e solicitações</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Nova Compra
        </button>
      </div>

      {/* Dashboard */}
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

      {/* Solicitações Pendentes */}
      {requestsPendentes.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Solicitações Pendentes
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {requestsPendentes.map((req) => (
              <span key={req.id} className="text-sm bg-white px-3 py-1 rounded-full border border-blue-200">
                {req.receitaNome}: {req.ingredientes.length} itens
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
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredCompras}
          loading={loading}
          emptyMessage="Nenhuma compra registrada"
        />
      </div>
    </div>
  )
}
