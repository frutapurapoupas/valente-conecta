'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Bell,
  Filter,
  Search,
  UserCheck,
  AlertCircle,
  BarChart3,
  Menu,
  Home,
  ChevronRight,
  Monitor,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Agendamento {
  id: string
  cliente_nome: string
  cliente_telefone: string
  servico: string
  valor: number
  data_agendamento: string
  horario_agendamento: string
  status: 'pendente' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado'
  posicao_fila?: number
  colaborador_id?: string
  colaborador_nome?: string
}

interface Metricas {
  hoje: {
    total: number
    concluidos: number
    pendentes: number
    faturamento: number
  }
  semana: {
    total: number
    concluidos: number
    pendentes: number
    faturamento: number
  }
}

export default function AdminLojaMobilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'fila' | 'metricas'>('fila')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    filtrarAgendamentos()
  }, [busca, filtroStatus])

  const carregarDados = async () => {
    setLoading(true)
    try {
      await Promise.all([
        carregarAgendamentos(),
        carregarMetricas()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarAgendamentos = async () => {
    const dados: Agendamento[] = [
      {
        id: '1',
        cliente_nome: 'João Silva',
        cliente_telefone: '(75) 98888-7777',
        servico: 'Corte Masculino',
        valor: 50.00,
        data_agendamento: '2026-04-16',
        horario_agendamento: '14:30',
        status: 'pendente',
        posicao_fila: 1
      },
      {
        id: '2',
        cliente_nome: 'Maria Santos',
        cliente_telefone: '(75) 97777-6666',
        servico: 'Coloração',
        valor: 120.00,
        data_agendamento: '2026-04-16',
        horario_agendamento: '15:00',
        status: 'confirmado',
        colaborador_id: 'col1',
        colaborador_nome: 'Pedro Costa'
      },
      {
        id: '3',
        cliente_nome: 'Carlos Oliveira',
        cliente_telefone: '(75) 96666-5555',
        servico: 'Consulta Médica',
        valor: 150.00,
        data_agendamento: '2026-04-16',
        horario_agendamento: '15:30',
        status: 'em_atendimento',
        colaborador_id: 'col2',
        colaborador_nome: 'Ana Silva'
      }
    ]
    setAgendamentos(dados)
  }

  const carregarMetricas = async () => {
    const dados: Metricas = {
      hoje: {
        total: 12,
        concluidos: 8,
        pendentes: 4,
        faturamento: 850.00
      },
      semana: {
        total: 67,
        concluidos: 52,
        pendentes: 15,
        faturamento: 4250.00
      }
    }
    setMetricas(dados)
  }

  const filtrarAgendamentos = () => {
    let filtrados = agendamentos

    if (busca) {
      filtrados = filtrados.filter(a => 
        a.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
        a.servico.toLowerCase().includes(busca.toLowerCase()) ||
        a.cliente_telefone.includes(busca)
      )
    }

    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(a => a.status === filtroStatus)
    }

    return filtrados
  }

  const atualizarStatusAgendamento = async (id: string, status: Agendamento['status']) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAgendamentos(prev => prev.map(a => 
        a.id === id ? { ...a, status } : a
      ))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const getAgendamentosFiltrados = () => filtrarAgendamentos()

  const getStatusColor = (status: Agendamento['status']) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20'
      case 'confirmado': return 'text-blue-400 bg-blue-500/20'
      case 'em_atendimento': return 'text-purple-400 bg-purple-500/20'
      case 'concluido': return 'text-green-400 bg-green-500/20'
      case 'cancelado': return 'text-red-400 bg-red-500/20'
      default: return 'text-zinc-400 bg-zinc-500/20'
    }
  }

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header Mobile */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
              >
                <Menu className="w-5 h-5 text-zinc-400" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Loja</h1>
                <p className="text-zinc-400 text-xs">Mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative">
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/" className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <Home className="w-5 h-5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMenu(false)}>
          <div className="bg-zinc-800 w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-yellow-500" />
                <div>
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <p className="text-zinc-400 text-sm">Admin Loja Mobile</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <Link
                  href="/admin-loja/mobile"
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  <Users className="w-5 h-5 text-zinc-400" />
                  <span>Fila de Espera</span>
                </Link>
                <Link
                  href="/admin-loja/mobile?tab=metricas"
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  <BarChart3 className="w-5 h-5 text-zinc-400" />
                  <span>Métricas</span>
                </Link>
                <Link
                  href="/admin-loja/layout-selection"
                  className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition"
                >
                  <Monitor className="w-5 h-5 text-yellow-500" />
                  <span>Trocar Layout</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span>Sair</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="flex overflow-x-auto bg-zinc-800 border-b border-zinc-700">
        <div className="flex min-w-max px-4">
          {[
            { id: 'fila', label: 'Fila de Espera', icon: Users },
            { id: 'metricas', label: 'Métricas', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="pb-20">
        {/* Fila de Espera */}
        {activeTab === 'fila' && (
          <div className="p-4 space-y-4">
            {/* Filtros */}
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente ou serviço..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                </div>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                >
                  <option value="todos">Todos Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="space-y-3">
              {getAgendamentosFiltrados().map((agendamento) => (
                <div key={agendamento.id} className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{agendamento.cliente_nome}</h3>
                      <p className="text-zinc-400 text-xs truncate">{agendamento.servico}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${getStatusColor(agendamento.status)}`}>
                      {agendamento.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{agendamento.data_agendamento}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{agendamento.horario_agendamento}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-bold">{formatarPreco(agendamento.valor)}</span>
                    {agendamento.posicao_fila && (
                      <span className="text-zinc-400">Posição: {agendamento.posicao_fila}</span>
                    )}
                  </div>

                  {agendamento.colaborador_nome && (
                    <div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-zinc-400">
                      Atendente: {agendamento.colaborador_nome}
                    </div>
                  )}

                  {/* Ações Rápidas */}
                  <div className="flex gap-2 mt-3">
                    {agendamento.status === 'pendente' && (
                      <>
                        <button
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-600 transition"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => atualizarStatusAgendamento(agendamento.id, 'cancelado')}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-red-600 transition"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    
                    {agendamento.status === 'confirmado' && (
                      <button
                        onClick={() => atualizarStatusAgendamento(agendamento.id, 'em_atendimento')}
                        className="w-full bg-purple-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-600 transition"
                      >
                        Iniciar Atendimento
                      </button>
                    )}
                    
                    {agendamento.status === 'em_atendimento' && (
                      <button
                        onClick={() => atualizarStatusAgendamento(agendamento.id, 'concluido')}
                        className="w-full bg-green-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas */}
        {activeTab === 'metricas' && metricas && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Métricas de Desempenho</h2>
            
            <div className="space-y-4">
              {/* Hoje */}
              <div className="bg-zinc-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">Hoje</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Total:</span>
                    <span className="text-white font-bold ml-2">{metricas.hoje.total}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Concluídos:</span>
                    <span className="text-green-400 font-bold ml-2">{metricas.hoje.concluidos}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Pendentes:</span>
                    <span className="text-yellow-400 font-bold ml-2">{metricas.hoje.pendentes}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Faturamento:</span>
                    <span className="text-green-400 font-bold ml-2">{formatarPreco(metricas.hoje.faturamento)}</span>
                  </div>
                </div>
              </div>

              {/* Semana */}
              <div className="bg-zinc-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-3">Esta Semana</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Total:</span>
                    <span className="text-white font-bold ml-2">{metricas.semana.total}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Concluídos:</span>
                    <span className="text-green-400 font-bold ml-2">{metricas.semana.concluidos}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Pendentes:</span>
                    <span className="text-yellow-400 font-bold ml-2">{metricas.semana.pendentes}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Faturamento:</span>
                    <span className="text-green-400 font-bold ml-2">{formatarPreco(metricas.semana.faturamento)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
