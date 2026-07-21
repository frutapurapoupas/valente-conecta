// src/modules/cozinha/pages/producao/page.tsx
// ============================================
// PÁGINA DE PRODUÇÃO
// ============================================

'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Factory,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle
} from 'lucide-react'
import { useProducao } from '../../hooks/useProducao'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatadores'

export default function ProducaoPage() {
  const { producoes, stats, loading } = useProducao()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducoes = producoes.filter(item =>
    item.receitaNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const metrics = stats ? [
    {
      title: 'Total Produções',
      value: stats.totalProducoes,
      icon: Factory,
      color: 'blue' as const
    },
    {
      title: 'Em Produção',
      value: stats.emProducao,
      icon: PlayCircle,
      color: 'orange' as const
    },
    {
      title: 'Concluídas',
      value: stats.concluidas,
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: 'Taxa Conclusão',
      value: formatPercent(stats.taxaConclusao),
      icon: TrendingUp,
      color: 'purple' as const
    }
  ] : []

  const columns = [
    { 
      key: 'dataProducao', 
      label: 'Data',
      render: (value: string) => formatDate(new Date(value))
    },
    { key: 'receitaNome', label: 'Receita' },
    { 
      key: 'quantidadePrevista', 
      label: 'Prevista',
      render: (value: number) => ${value} un
    },
    { 
      key: 'quantidadeProduzida', 
      label: 'Produzida',
      render: (value: number) => ${value || 0} un
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'custoTotal', 
      label: 'Custo',
      render: (value: number) => formatCurrency(value || 0)
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Produção</h1>
          <p className="text-gray-500">Gerencie as ordens de produção</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Nova Produção
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

      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar produções..."
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
          data={filteredProducoes}
          loading={loading}
          emptyMessage="Nenhuma produção registrada"
        />
      </div>
    </div>
  )
}
