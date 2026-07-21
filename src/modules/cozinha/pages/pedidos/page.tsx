// src/modules/cozinha/pages/pedidos/page.tsx
// ============================================
// PÁGINA DE PEDIDOS
// ============================================

'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react'
import { CardMetric } from '../../components/CardMetric'
import { StatusBadge } from '../../components/StatusBadge'
import { DataTable } from '../../components/DataTable'
import { formatCurrency, formatDate } from '../../utils/formatadores'

// Dados mockados para demonstração
const mockPedidos = [
  {
    id: 'PED-001',
    cliente: 'João Silva',
    itens: ['Feijoada', 'Arroz', 'Salada'],
    total: 89.90,
    status: 'confirmado',
    data: new Date().toISOString(),
    metodo: 'Pix'
  },
  {
    id: 'PED-002',
    cliente: 'Maria Santos',
    itens: ['Strogonoff', 'Batata Frita'],
    total: 65.50,
    status: 'entregue',
    data: new Date(Date.now() - 86400000).toISOString(),
    metodo: 'Cartão'
  },
  {
    id: 'PED-003',
    cliente: 'Carlos Oliveira',
    itens: ['Lasanha', 'Suco'],
    total: 47.00,
    status: 'pendente',
    data: new Date().toISOString(),
    metodo: 'Dinheiro'
  },
  {
    id: 'PED-004',
    cliente: 'Ana Pereira',
    itens: ['Bife Acebolado', 'Salada'],
    total: 53.50,
    status: 'cancelado',
    data: new Date(Date.now() - 172800000).toISOString(),
    metodo: 'Pix'
  },
  {
    id: 'PED-005',
    cliente: 'Pedro Costa',
    itens: ['Macarrão', 'Sobremesa'],
    total: 38.00,
    status: 'confirmado',
    data: new Date().toISOString(),
    metodo: 'Cartão'
  }
]

export default function PedidosPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pedidos, setPedidos] = useState(mockPedidos)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Calcular métricas
  const totalPedidos = pedidos.length
  const totalVendas = pedidos.reduce((acc, p) => acc + (p.status !== 'cancelado' ? p.total : 0), 0)
  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente').length
  const pedidosEntregues = pedidos.filter(p => p.status === 'entregue').length

  const metrics = [
    {
      title: 'Total Pedidos',
      value: totalPedidos,
      icon: ShoppingCart,
      color: 'blue' as const
    },
    {
      title: 'Total Vendas',
      value: formatCurrency(totalVendas),
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Pendentes',
      value: pedidosPendentes,
      icon: Clock,
      color: 'yellow' as const
    },
    {
      title: 'Entregues',
      value: pedidosEntregues,
      icon: CheckCircle,
      color: 'green' as const
    }
  ]

  const filteredPedidos = pedidos.filter(p =>
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { key: 'id', label: 'Pedido' },
    { key: 'cliente', label: 'Cliente' },
    { 
      key: 'itens', 
      label: 'Itens',
      render: (value: string[]) => value.join(', ')
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (value: number) => formatCurrency(value)
    },
    { 
      key: 'data', 
      label: 'Data',
      render: (value: string) => formatDate(new Date(value))
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: 'metodo', 
      label: 'Pagamento',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
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
            <ShoppingCart className="text-blue-500" />
            Pedidos
          </h1>
          <p className="text-gray-500">Gerencie todos os pedidos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Pedido
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

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Ticket Médio</p>
          <p className="text-2xl font-bold">
            {pedidos.length > 0 ? formatCurrency(totalVendas / pedidos.filter(p => p.status !== 'cancelado').length) : formatCurrency(0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Cancelados</p>
          <p className="text-2xl font-bold text-red-600">
            {pedidos.filter(p => p.status === 'cancelado').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Taxa de Sucesso</p>
          <p className="text-2xl font-bold text-green-600">
            {pedidos.length > 0 ? ${Math.round((pedidos.filter(p => p.status === 'entregue').length / pedidos.length) * 100)}% : '0%'}
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Calendar className="h-4 w-4" />
            Hoje
          </button>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Lista de Pedidos
          </h2>
          <span className="text-sm text-gray-500">
            {filteredPedidos.length} pedidos
          </span>
        </div>
        <DataTable
          columns={columns}
          data={filteredPedidos}
          emptyMessage="Nenhum pedido encontrado"
        />
      </div>
    </div>
  )
}
