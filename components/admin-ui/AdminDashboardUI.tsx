'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Cards, { defaultCardData } from './Cards'
import Charts from './Charts'
import Reports from './Reports'
import { AlertTriangle, CheckCircle, Clock, Users, Building2, Package, DollarSign, MapPin, Smartphone, Activity, Briefcase } from 'lucide-react'

interface AdminDashboardUIProps {
  title?: string
}

export default function AdminDashboardUI({ title = 'Admin Master - Valente Conecta' }: AdminDashboardUIProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dados específicos do Admin Master
  const adminMasterStats = [
    {
      title: 'Profissionais',
      value: '84',
      change: 7,
      changeType: 'positive' as const,
      icon: Briefcase,
      color: 'bg-violet-500',
      description: 'Cadastrados na plataforma'
    },
    {
      title: 'Produtos Pendentes',
      value: '23',
      change: 5,
      changeType: 'positive' as const,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      description: 'Aguardando aprovação'
    },
    {
      title: 'PDVs Ativos',
      value: '156',
      change: 12,
      changeType: 'positive' as const,
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Empresas conectadas'
    },
    {
      title: 'Cidades Ativas',
      value: '8',
      change: 1,
      changeType: 'positive' as const,
      icon: MapPin,
      color: 'bg-green-500',
      description: 'Bases operacionais'
    },
    {
      title: 'Transações Hoje',
      value: '1.247',
      change: -8,
      changeType: 'negative' as const,
      icon: Activity,
      color: 'bg-purple-500',
      description: 'Movimentação Conecta'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:flex-shrink-0 md:relative md:inset-auto md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />

        <main className="px-4 py-6 md:px-8 md:py-8">
          {/* Hero Section - Admin Master */}
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Smartphone size={24} className="text-white" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Sistema Valente Conecta</p>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
                  Controle Total do Ecossistema
                </h1>
                <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed">
                  Gerencie PDVs colaborativos, aprovações de produtos, cidades ativas e transações da criptomoeda Conecta em tempo real.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:w-80">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white ring-1 ring-white/20">
                  <p className="text-sm text-indigo-200 mb-2">Usuários Online</p>
                  <p className="text-3xl font-bold">2.847</p>
                  <p className="text-xs text-indigo-300 mt-1">+12% vs ontem</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-white ring-1 ring-white/20">
                  <p className="text-sm text-indigo-200 mb-2">Transações Hoje</p>
                  <p className="text-3xl font-bold">1.247</p>
                  <p className="text-xs text-emerald-300 mt-1">R$ 45.6k movimentado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Controle Admin Master */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Controle Operacional</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Atualizar Dados
                </button>
              </div>
            </div>
            <Cards data={adminMasterStats} />
          </section>

          {/* Seção de Alertas e Ações Rápidas */}
          <section className="mb-8">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Alertas Pendentes */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={20} className="text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Ações Pendentes</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm text-gray-700">Produtos aguardando aprovação</span>
                    <span className="text-sm font-semibold text-orange-600">23</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-700">Empresas solicitando acesso</span>
                    <span className="text-sm font-semibold text-blue-600">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-700">Cidades para liberar</span>
                    <span className="text-sm font-semibold text-green-600">2</span>
                  </div>
                </div>
              </div>

              {/* Profissionais */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase size={20} className="text-violet-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Profissionais</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                    <span className="text-sm text-gray-700">Total cadastrados</span>
                    <span className="text-sm font-semibold text-violet-600">84</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm text-gray-700">Com plano ativo</span>
                    <span className="text-sm font-semibold text-indigo-600">31</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm text-gray-700">Fotos aguardando aprovação</span>
                    <span className="text-sm font-semibold text-amber-600">6</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-gray-700">Itens no catálogo</span>
                    <span className="text-sm font-semibold text-emerald-600">247</span>
                  </div>
                </div>
              </div>

              {/* Feed de Atividades em Tempo Real */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Nova empresa cadastrada: Padaria Central</p>
                      <p className="text-xs text-gray-500">2 min atrás</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Produto aprovado: Café Premium</p>
                      <p className="text-xs text-gray-500">5 min atrás</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Transação Conecta: R$ 150,00</p>
                      <p className="text-xs text-gray-500">8 min atrás</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controle de Cidades */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={20} className="text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Cidades Ativas</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Coité-PE</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Ativa</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Tupanatinga-PE</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Ativa</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Salgueiro-PE</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-yellow-600">Pendente</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    Liberar Nova Cidade
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Gráficos e Relatórios */}
          <section className="mb-8">
            <div className="grid gap-6">
              <Charts />
            </div>
          </section>

          <section>
            <Reports />
          </section>
        </main>
      </div>
    </div>
  )
}
