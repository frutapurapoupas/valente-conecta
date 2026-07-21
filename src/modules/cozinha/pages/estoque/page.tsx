// src/modules/cozinha/pages/estoque/page.tsx
// ============================================
// PÁGINA DE ESTOQUE
// ============================================

'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { useEstoque } from '../../hooks/useEstoque'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatPercent } from '../../utils/formatadores'

export default function EstoquePage() {
  const { items, stats, alertas, loading, registrarEntrada, registrarSaida } = useEstoque()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = items.filter(item =>
    item.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const metrics = stats ? [
    {
      title: 'Total de Itens',
      value: stats.totalItens,
      icon: Package,
      color: 'blue' as const
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.totalValor),
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Itens Baixos',
      value: stats.itensBaixos,
      icon: AlertTriangle,
      color: 'yellow' as const
    },
    {
      title: 'Itens Críticos',
      value: stats.itensCriticos,
      icon: AlertTriangle,
      color: 'red' as const
    }
  ] : []

  const columns = [
    { key: 'produto', label: 'Produto' },
    { key: 'categoria', label: 'Categoria' },
    { 
      key: 'quantidade', 
      label: 'Quantidade',
      render: (value: number, item: any) => ${value} 
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'valor_total', 
      label: 'Valor Total',
      render: (value: number) => formatCurrency(value || 0)
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-gray-500">Gerencie todos os itens do estoque</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Item
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

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas de Estoque
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {alertas.map((item) => (
              <span key={item.ingredienteId} className="text-sm bg-white px-3 py-1 rounded-full border border-yellow-200">
                {item.ingredienteNome}: {item.quantidadeAtual} {item.status === 'critico' ? '🚨' : '⚠️'}
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
            placeholder="Buscar itens..."
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
          data={filteredItems}
          loading={loading}
          emptyMessage="Nenhum item no estoque"
        />
      </div>
    </div>
  )
}
