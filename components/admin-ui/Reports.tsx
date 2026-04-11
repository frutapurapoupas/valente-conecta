'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertTriangle, CheckCircle, Clock, Building, Map, LucideIcon } from 'lucide-react'

interface ReportData {
  id: string
  title: string
  description: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

interface ReportsProps {
  data?: ReportData[]
}

export default function Reports({ data }: ReportsProps) {
  const [reports, setReports] = useState<ReportData[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'Produtos Pendentes de Aprovação',
        description: '23 produtos aguardam revisão no Banco Mãe',
        value: '23 itens',
        change: 5,
        changeType: 'positive',
        icon: AlertTriangle,
        color: 'bg-orange-500',
        priority: 'high',
        category: 'Produtos'
      },
      {
        id: '2',
        title: 'Novas Empresas Cadastradas',
        description: '5 empresas solicitaram acesso ao sistema',
        value: '5 solicitações',
        change: 2,
        changeType: 'positive',
        icon: Building,
        color: 'bg-blue-500',
        priority: 'high',
        category: 'Empresas'
      },
      {
        id: '3',
        title: 'Cidades Solicitando Liberação',
        description: '2 cidades aguardam aprovação para operação',
        value: '2 cidades',
        change: 0,
        changeType: 'neutral',
        icon: Map,
        color: 'bg-green-500',
        priority: 'medium',
        category: 'Cidades'
      },
      {
        id: '4',
        title: 'Transações Conecta Hoje',
        description: 'Movimentação total da criptomoeda hoje',
        value: 'R$ 45.678',
        change: 12,
        changeType: 'positive',
        icon: DollarSign,
        color: 'bg-purple-500',
        priority: 'low',
        category: 'Financeiro'
      },
      {
        id: '5',
        title: 'PDVs em Modo Espião',
        description: '22 empresas usando integração com PDVs existentes',
        value: '22 PDVs',
        change: 3,
        changeType: 'positive',
        icon: Activity,
        color: 'bg-indigo-500',
        priority: 'medium',
        category: 'Integração'
      },
      {
        id: '6',
        title: 'Alertas de Sistema',
        description: '2 servidores com alta utilização de CPU',
        value: '2 alertas',
        change: undefined,
        changeType: undefined,
        icon: AlertTriangle,
        color: 'bg-red-500',
        priority: 'high',
        category: 'Sistema'
      }
    ]

    setReports(data || mockReports)
  }, [data])

  const filteredReports = reports.filter(report =>
    filter === 'all' || report.priority === filter
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />
      case 'medium': return <Clock size={16} className="text-yellow-500" />
      case 'low': return <CheckCircle size={16} className="text-green-500" />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Relatórios Inteligentes</h3>
          <p className="text-sm text-gray-600">Insights automáticos baseados nos seus dados</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setFilter(priority)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === priority
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {priority === 'all' ? 'Todos' :
               priority === 'high' ? 'Alta' :
               priority === 'medium' ? 'Média' : 'Baixa'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.map((report) => {
          const Icon = report.icon
          const ChangeIcon = report.changeType === 'positive' ? TrendingUp :
                            report.changeType === 'negative' ? TrendingDown : null

          return (
            <div
              key={report.id}
              className={`border-l-4 p-4 rounded-r-lg transition-all hover:shadow-md ${getPriorityColor(report.priority)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${report.color} flex-shrink-0`}>
                    <Icon size={20} className="text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      {getPriorityIcon(report.priority)}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">{report.value}</span>

                      {report.change !== undefined && ChangeIcon && (
                        <div className={`flex items-center gap-1 ${
                          report.changeType === 'positive' ? 'text-green-600' :
                          report.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <ChangeIcon size={14} />
                          <span className="text-sm font-medium">
                            {report.change > 0 ? '+' : ''}{report.change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {report.category}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum relatório encontrado para o filtro selecionado.</p>
        </div>
      )}
    </div>
  )
}
