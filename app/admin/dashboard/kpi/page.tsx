'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, ShoppingCart, Award, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function KPIDashboard() {
  const [periodo, setPeriodo] = useState('30dias')

  const kpis = [
    { titulo: 'Receita Total', valor: 'R$ 89.450', variacao: '+18%', cor: 'text-green-600', icone: DollarSign },
    { titulo: 'Novos Usuários', valor: '+124', variacao: '+12%', cor: 'text-green-600', icone: Users },
    { titulo: 'Taxa Conversão', valor: '23.5%', variacao: '+2.3%', cor: 'text-green-600', icone: TrendingUp },
    { titulo: 'Ticket Médio', valor: 'R$ 47,50', variacao: '+5%', cor: 'text-green-600', icone: ShoppingCart },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">KPIs</h1>
          <p className="text-gray-500 text-base mt-1">Indicadores-chave de desempenho</p>
        </div>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 border rounded-lg text-base"
        >
          <option value="7dias">Últimos 7 dias</option>
          <option value="30dias">Últimos 30 dias</option>
          <option value="90dias">Últimos 90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.titulo} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <kpi.icone className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 flex items-center gap-1 text-sm font-semibold">
                <ArrowUpRight className="w-4 h-4" />
                {kpi.variacao}
              </span>
            </div>
            <p className="text-2xl font-bold">{kpi.valor}</p>
            <p className="text-gray-500 text-sm mt-1">{kpi.titulo}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Metas vs Realizado</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Receita Mensal</span>
                <span>R$ 15.420 / R$ 20.000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 rounded-full h-2" style={{ width: '77%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Novos Usuários</span>
                <span>124 / 150</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2" style={{ width: '83%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Transações Conecta</span>
                <span>1.250 / 1.500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 rounded-full h-2" style={{ width: '83%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Alertas e Ações</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium">Compensação pendente</p>
                <p className="text-sm text-gray-500">Compensação mensal agendada para 30/04</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">5 produtos aguardando aprovação</p>
                <p className="text-sm text-gray-500">Verificar catálogo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">12 novos usuários esta semana</p>
                <p className="text-sm text-gray-500">+8% vs semana anterior</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}