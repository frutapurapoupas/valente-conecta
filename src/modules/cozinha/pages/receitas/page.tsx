// src/modules/cozinha/pages/receitas/page.tsx
// PÁGINA PRINCIPAL - RECEITAS

'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Printer
} from 'lucide-react'
import { useReceitas } from '../../hooks/useReceitas'
import { CardMetric } from '../../components/CardMetric'
import { formatCurrency, formatPercent, formatWeight, formatStatus } from '../../utils/formatadores'

export default function ReceitasPage() {
  const { receitas, loading, calcularMetricas } = useReceitas()
  const [searchTerm, setSearchTerm] = useState('')

  // Calcular métricas gerais
  const totalReceitas = receitas.length
  const totalCusto = receitas.reduce((acc, r) => acc + (r.custoTotal || 0), 0)
  const totalPreco = receitas.reduce((acc, r) => acc + (r.precoSugerido || 0), 0)
  const margemMedia = totalPreco > 0 ? ((totalPreco - totalCusto) / totalPreco) * 100 : 0

  const metrics = [
    {
      title: 'Receitas',
      value: totalReceitas,
      icon: '📋',
      color: 'blue' as const
    },
    {
      title: 'Custo Total',
      value: formatCurrency(totalCusto),
      icon: '💰',
      color: 'red' as const
    },
    {
      title: 'Preço Total',
      value: formatCurrency(totalPreco),
      icon: '💵',
      color: 'green' as const
    },
    {
      title: 'Margem Média',
      value: formatPercent(margemMedia),
      icon: '📈',
      color: 'purple' as const
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Receitas</h1>
          <p className="text-gray-500">Gerencie todas as receitas da cozinha</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Nova Receita
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <CardMetric
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon as any}
            color={metric.color}
          />
        ))}
      </div>

      {/* Filtros */}
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
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      {/* Lista de Receitas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : receitas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma receita cadastrada</p>
          <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
            Criar primeira receita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {receitas.map((receita) => {
            const calc = calcularMetricas(receita.ingredientes || [])
            const statusInfo = formatStatus(receita.status || 'rascunho')
            const statusClass = 
              statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
              statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            
            return (
              <div key={receita.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold truncate">{receita.nome}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-500">#{receita.codigo || 'N/A'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>💰 {formatCurrency(calc.custoTotal)}</span>
                      <span>💵 {formatCurrency(calc.precoSugerido)}</span>
                      <span>📈 {formatPercent(calc.margem)}</span>
                      <span>⚖️ {formatWeight(calc.pesoTotal)}</span>
                      <span>🍽️ {calc.porcoes} porções</span>
                      <span>⏱️ {calc.tempoPreparo}min</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Duplicar">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Imprimir">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}