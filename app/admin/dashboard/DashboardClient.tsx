// app/admin/dashboard/DashboardClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, Calendar, 
  Mic, Search, Clock, ArrowUp, ArrowDown, Package, 
  Truck, Store, BarChart3, Target, Eye, ThumbsUp,
  Download, RefreshCw, Bell, Settings, LogOut,
  UserPlus, Wallet, LayoutGrid, GraduationCap, CalendarClock,
  Megaphone, UserSquare2, ArrowRightLeft, Sparkles, Share2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface StatsData {
  total: number
  sources: {
    voice: number
    text: number
    voicePercentage: string
  }
  topTerms: Array<{
    term: string
    count: number
    percentage: string
  }>
  recentActivity: {
    last24h: number
    lastSearches: Array<{
      id: string
      term: string
      timestamp: string
      source: string
      city: string
    }>
  }
  demandInsights?: Array<{
    type: string
    message: string
    priority: string
  }>
}

interface FinanceiroData {
  saldoTotal: number
  receitasHoje: number
  receitasMes: number
  despesasMes: number
  lucroLiquido: number
  ultimasTransacoes: Array<{
    id: string
    descricao: string
    valor: number
    tipo: 'receita' | 'despesa'
    data: string
    status: 'concluido' | 'pendente' | 'cancelado'
  }>
  vendasPorCategoria: Array<{
    categoria: string
    valor: number
    porcentagem: number
  }>
}

export default function DashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [financeiro, setFinanceiro] = useState<FinanceiroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro' | 'demandas' | 'comerciantes'>('geral')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    carregarDados()
    
    // Auto-atualização a cada 60 segundos
    const interval = setInterval(carregarDados, 60000)
    return () => clearInterval(interval)
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      // Carregar estatísticas de busca
      const responseStats = await fetch('/api/search/register?action=stats')
      const dataStats = await responseStats.json()
      setStats(dataStats)

      // Carregar dados financeiros (v5.0 - restaurados)
      const responseFin = await fetch('/api/financeiro/dashboard')
      const dataFin = await responseFin.json()
      setFinanceiro(dataFin)

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    carregarDados()
  }

  const handleLogout = () => {
    // Implementar logout
    router.push('/')
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Carregando Admin Master...</p>
          <p className="text-zinc-500 text-sm mt-2">Valente Conecta v5.0</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header Admin Master */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-yellow-500/30 sticky top-0 z-20 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/30">
                <LayoutGrid className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black italic tracking-tighter">
                  <span className="text-yellow-500">ADMIN</span> MASTER
                </h1>
                <p className="text-zinc-500 text-xs mt-1">
                  Valente Conecta • Painel de Controle v5.0
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-all"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-xl transition-all">
                <Bell className="w-5 h-5 text-zinc-400" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
          
          {/* Tabs de Navegação */}
          <div className="flex gap-1 mt-6 border-b border-zinc-800">
            {[
              { id: 'geral', label: '📊 Visão Geral', icon: BarChart3 },
              { id: 'financeiro', label: '💰 Financeiro v5.0', icon: DollarSign },
              { id: 'demandas', label: '🎤 Demandas de Mercado', icon: Target },
              { id: 'comerciantes', label: '🏪 Comerciantes', icon: Store },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium transition-all relative
                  ${activeTab === tab.id 
                    ? 'text-yellow-500' 
                    : 'text-zinc-400 hover:text-zinc-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'geral' && (
          <>
            {/* Cards de Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Search className="w-8 h-8 text-blue-400" />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-zinc-400 text-sm">Total de Buscas</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.total || 0}</p>
                <p className="text-xs text-green-400 mt-2">↑ 12% esta semana</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Mic className="w-8 h-8 text-purple-400" />
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-zinc-400 text-sm">Buscas por Voz</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.sources?.voice || 0}</p>
                <p className="text-xs text-purple-400 mt-2">
                  {stats?.sources?.voicePercentage || 0}% do total
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-zinc-400 text-sm">Saldo Total</p>
                <p className="text-3xl font-bold text-white mt-1">
                  R$ {financeiro?.saldoTotal?.toFixed(2) || '0,00'}
                </p>
                <p className="text-xs text-emerald-400 mt-2">Atualizado agora</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600/10 to-orange-800/10 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-zinc-400 text-sm">Últimas 24h</p>
                <p className="text-3xl font-bold text-white mt-1">{stats?.recentActivity?.last24h || 0}</p>
                <p className="text-xs text-orange-400 mt-2">Buscas recentes</p>
              </div>
            </div>

            {/* Top Termos e Atividade Recente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  Top Termos Mais Buscados
                </h2>
                <div className="space-y-4">
                  {stats?.topTerms?.slice(0, 5).map((term, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-300">
                          {index + 1}. {term.term}
                        </span>
                        <span className="text-yellow-500">{term.count} buscas</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${term.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  Insights de Demanda
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-yellow-500">Alta Demanda</span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      Setor de alimentação com {stats?.topTerms?.filter(t => 
                        t.term.includes('restaurante') || t.term.includes('comida') || t.term.includes('pizza')
                      ).length || 0} termos no top 10
                    </p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-bold text-blue-400">Buscas por Voz</span>
                    </div>
                    <p className="text-sm text-zinc-300">
                      {stats?.sources?.voicePercentage || 0}% das buscas são por voz, tendência de crescimento
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas Atividades */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Últimas Atividades em Tempo Real
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentActivity?.lastSearches?.slice(0, 10).map((search, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {search.source === 'voice' ? (
                        <Mic className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Search className="w-4 h-4 text-blue-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">{search.term}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(search.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                        {search.city || 'Valente-BA'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        search.source === 'voice' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {search.source === 'voice' ? '🎤 Voz' : '⌨️ Texto'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: FINANCEIRO v5.0 */}
        {activeTab === 'financeiro' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Receitas Hoje</p>
                <p className="text-3xl font-bold text-white mt-1">
                  R$ {financeiro?.receitasHoje?.toFixed(2) || '0,00'}
                </p>
                <p className="text-xs text-green-400 mt-2">↑ vs ontem</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border border-purple-500/20 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Receitas do Mês</p>
                <p className="text-3xl font-bold text-white mt-1">
                  R$ {financeiro?.receitasMes?.toFixed(2) || '0,00'}
                </p>
                <p className="text-xs text-purple-400 mt-2">Meta: R$ 50.000,00</p>
              </div>

              <div className="bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/20 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Despesas do Mês</p>
                <p className="text-3xl font-bold text-white mt-1">
                  R$ {financeiro?.despesasMes?.toFixed(2) || '0,00'}
                </p>
                <p className="text-xs text-red-400 mt-2">35% da receita</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 border border-yellow-500/20 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Lucro Líquido</p>
                <p className="text-3xl font-bold text-white mt-1">
                  R$ {financeiro?.lucroLiquido?.toFixed(2) || '0,00'}
                </p>
                <p className="text-xs text-yellow-400 mt-2">↑ 8% este mês</p>
              </div>
            </div>

            {/* Últimas Transações */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-500" />
                Últimas Transações
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800">
                    <tr className="text-left text-zinc-500">
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Descrição</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeiro?.ultimasTransacoes?.slice(0, 10).map((transacao, index) => (
                      <tr key={index} className="border-b border-zinc-800/50">
                        <td className="py-3 text-zinc-400">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 text-white">{transacao.descricao}</td>
                        <td className={`py-3 font-medium ${
                          transacao.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transacao.status === 'concluido' 
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : transacao.status === 'pendente'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transacao.status === 'concluido' ? '✓ Concluído' : 
                             transacao.status === 'pendente' ? '⏳ Pendente' : '✗ Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vendas por Categoria */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-yellow-500" />
                Vendas por Categoria
              </h2>
              <div className="space-y-4">
                {financeiro?.vendasPorCategoria?.map((categoria, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300">{categoria.categoria}</span>
                      <span className="text-yellow-500">
                        R$ {categoria.valor.toFixed(2)} ({categoria.porcentagem}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${categoria.porcentagem}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 3: DEMANDAS DE MERCADO */}
        {activeTab === 'demandas' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-500" />
                  Análise de Demanda por Categoria
                </h2>
                <div className="space-y-4">
                  {[
                    { name: 'Alimentação', percentage: 35, demand: 'Alta', trend: 'up', value: 'R$ 45.000' },
                    { name: 'Compras', percentage: 25, demand: 'Média', trend: 'up', value: 'R$ 32.000' },
                    { name: 'Serviços', percentage: 20, demand: 'Média', trend: 'stable', value: 'R$ 25.000' },
                    { name: 'Saúde', percentage: 12, demand: 'Baixa', trend: 'down', value: 'R$ 15.000' },
                    { name: 'Tecnologia', percentage: 8, demand: 'Crescendo', trend: 'up', value: 'R$ 10.000' },
                  ].map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-zinc-300 font-medium">{category.name}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            category.demand === 'Alta' ? 'bg-red-500/20 text-red-400' :
                            category.demand === 'Média' ? 'bg-yellow-500/20 text-yellow-400' :
                            category.demand === 'Crescendo' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {category.demand}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-500 text-sm">{category.value}</span>
                          {category.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-400" />}
                          {category.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-yellow-500" />
                  Insights de Busca por Voz
                </h2>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-yellow-500/5 rounded-xl">
                    <div className="text-4xl mb-2">🎤</div>
                    <p className="text-2xl font-bold text-yellow-500">
                      {stats?.sources?.voicePercentage || 0}%
                    </p>
                    <p className="text-xs text-zinc-400">das buscas são por voz</p>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-xl">
                    <p className="text-sm text-zinc-300">
                      <strong className="text-yellow-500">Recomendação:</strong> Invista em SEO local e otimização para busca por voz em Valente-BA.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-xl">
                    <p className="text-sm text-zinc-300">
                      <strong className="text-yellow-500">Tendência:</strong> Palavras-chave como "perto de mim" e "em Valente" estão em alta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa de Calor de Buscas */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-500" />
                Horários de Pico de Busca
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-zinc-500 mb-2">{dia}</div>
                    <div className="space-y-1">
                      <div className="h-20 bg-zinc-800 rounded-lg relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-500 to-orange-500 transition-all duration-500"
                          style={{ height: `${[65, 70, 75, 80, 95, 85, 60][i]}%` }} />
                      </div>
                      <div className="text-xs text-zinc-400">{['9h', '10h', '11h', '12h', '13h', '10h', '11h'][i]}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-zinc-500 mt-4">
                Horário de pico: Sexta-feira às 13h (almoço)
              </p>
            </div>
          </>
        )}

        {/* TAB 4: COMERCIANTES */}
        {activeTab === 'comerciantes' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/20 rounded-2xl p-6">
                <Store className="w-8 h-8 text-blue-400 mb-3" />
                <p className="text-3xl font-bold text-white">48</p>
                <p className="text-zinc-400 text-sm">Comerciantes Ativos</p>
                <p className="text-xs text-green-400 mt-2">+5 este mês</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-6">
                <Users className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-3xl font-bold text-white">1.247</p>
                <p className="text-zinc-400 text-sm">Usuários Totais</p>
                <p className="text-xs text-emerald-400 mt-2">+12% crescimento</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border border-purple-500/20 rounded-2xl p-6">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
                <p className="text-3xl font-bold text-white">R$ 127.890</p>
                <p className="text-zinc-400 text-sm">Volume de Vendas</p>
                <p className="text-xs text-purple-400 mt-2">Mês atual</p>
              </div>
            </div>

            {/* Lista de Comerciantes */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-yellow-500" />
                Top Comerciantes - Valente-BA
              </h2>
              <div className="space-y-3">
                {[
                  { name: 'Mercado Bom Preço', categoria: 'Supermercado', vendas: 'R$ 45.890', rating: 4.8, status: 'destaque' },
                  { name: 'Restaurante do João', categoria: 'Alimentação', vendas: 'R$ 32.450', rating: 4.9, status: 'top' },
                  { name: 'TechValente', categoria: 'Tecnologia', vendas: 'R$ 28.760', rating: 4.7, status: 'crescendo' },
                  { name: 'Farmácia Central', categoria: 'Saúde', vendas: 'R$ 21.340', rating: 4.8, status: 'estavel' },
                  { name: 'Moda Fashion', categoria: 'Vestuário', vendas: 'R$ 18.900', rating: 4.6, status: 'crescendo' },
                ].map((comerciante, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{comerciante.name}</p>
                        <p className="text-xs text-zinc-400">{comerciante.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{comerciante.vendas}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-xs text-yellow-500">★ {comerciante.rating}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comerciante.status === 'destaque' ? 'bg-yellow-500/20 text-yellow-400' :
                          comerciante.status === 'top' ? 'bg-purple-500/20 text-purple-400' :
                          comerciante.status === 'crescendo' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {comerciante.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer do Dashboard */}
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Valente Conecta v5.0 • Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}