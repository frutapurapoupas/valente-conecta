// src/modules/cozinha/pages/page.tsx
// ============================================
// DASHBOARD PRINCIPAL - COZINHA
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Package,
  Factory,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  Calendar
} from 'lucide-react'
import { CardMetric } from '../components/CardMetric'
import { StatusBadge } from '../components/StatusBadge'
import { DataTable } from '../components/DataTable'
import { useReceitas } from '../hooks/useReceitas'
import { useEstoque } from '../hooks/useEstoque'
import { useProducao } from '../hooks/useProducao'
import { useCompras } from '../hooks/useCompras'
import { formatCurrency, formatDate, formatPercent } from '../utils/formatadores'

export default function DashboardCozinha() {
  const { receitas, loading: loadingReceitas } = useReceitas()
  const { stats: estoqueStats, loading: loadingEstoque } = useEstoque()
  const { stats: producaoStats, loading: loadingProducao } = useProducao()
  const { stats: comprasStats, loading: loadingCompras } = useCompras()
  
  const [loading, setLoading] = useState(true)
  const [ultimasReceitas, setUltimasReceitas] = useState<any[]>([])
  const [ultimosPedidos, setUltimosPedidos] = useState<any[]>([])

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setUltimasReceitas(receitas.slice(0, 5))
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [receitas])

  if (loading || loadingReceitas || loadingEstoque || loadingProducao || loadingCompras) {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-4 animate-pulse h-64"></div>
          <div className="bg-white rounded-lg border p-4 animate-pulse h-64"></div>
        </div>
      </div>
    )
  }

  // Métricas principais
  const metrics = [
    {
      title: 'Receitas Ativas',
      value: receitas.filter(r => r.status === 'ativa').length,
      icon: TrendingUp,
      color: 'blue' as const
    },
    {
      title: 'Valor Estoque',
      value: formatCurrency(estoqueStats?.totalValor || 0),
      icon: Package,
      color: 'green' as const
    },
    {
      title: 'Produção Hoje',
      value: producaoStats?.emProducao || 0,
      icon: Factory,
      color: 'orange' as const
    },
    {
      title: 'Compras Pendentes',
      value: comprasStats?.pendentes || 0,
      icon: ShoppingCart,
      color: 'yellow' as const
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(comprasStats?.totalGasto || 0),
      icon: DollarSign,
      color: 'purple' as const
    },
    {
      title: 'Itens Críticos',
      value: estoqueStats?.itensCriticos || 0,
      icon: AlertTriangle,
      color: 'red' as const
    }
  ]

  // Colunas da tabela de receitas recentes
  const columns = [
    { 
      key: 'nome', 
      label: 'Receita',
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'precoSugerido', 
      label: 'Preço',
      render: (value: number) => formatCurrency(value || 0)
    },
    { 
      key: 'custoTotal', 
      label: 'Custo',
      render: (value: number) => formatCurrency(value || 0)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Cozinha</h1>
          <p className="text-gray-500">Visão geral da operação</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {formatDate(new Date())}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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

      {/* Alertas de Estoque */}
      {estoqueStats && (estoqueStats.itensBaixos > 0 || estoqueStats.itensCriticos > 0) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas de Estoque
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {estoqueStats.itensCriticos > 0 && (
              <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                🚨 {estoqueStats.itensCriticos} itens críticos
              </span>
            )}
            {estoqueStats.itensBaixos > 0 && (
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                ⚠️ {estoqueStats.itensBaixos} itens baixos
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receitas Recentes */}
        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Receitas Recentes
            </h2>
          </div>
          <DataTable
            columns={columns}
            data={ultimasReceitas}
            emptyMessage="Nenhuma receita cadastrada"
          />
        </div>

        {/* Resumo Rápido */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Resumo Rápido</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Receitas</span>
              <span className="font-bold">{receitas.length}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Produção Hoje</span>
              <span className="font-bold text-orange-600">{producaoStats?.emProducao || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Pedidos Pendentes</span>
              <span className="font-bold text-yellow-600">{comprasStats?.pendentes || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Itens em Estoque</span>
              <span className="font-bold text-blue-600">{estoqueStats?.totalItens || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Taxa Conclusão</span>
              <span className="font-bold text-green-600">
                {formatPercent(producaoStats?.taxaConclusao || 0)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Status Operacional</span>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Normal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-6 text-center text-sm text-gray-400">
        Última atualização: {new Date().toLocaleString('pt-BR')}
      </div>
    </div>
  )
}
