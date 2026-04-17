'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Monitor, 
  Smartphone,
  Settings,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

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
  observacoes?: string
}

interface Colaborador {
  id: string
  nome: string
  funcao: string
  status: 'ativo' | 'inativo' | 'ausente'
  total_atendimentos: number
  avaliacao: number
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
  mes: {
    total: number
    concluidos: number
    pendentes: number
    faturamento: number
  }
}

export default function AdminLojaPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Verificar preferência de layout
    const savedLayout = localStorage.getItem('admin-layout-preference') as 'desktop' | 'mobile'
    const userRole = localStorage.getItem('user-role') as 'admin' | 'delegado'
    
    // Se for delegado, redirecionar para mobile
    if (userRole === 'delegado') {
      router.push('/admin-loja/mobile')
      return
    }
    
    // Se houver preferência salva, redirecionar para a versão correspondente
    if (savedLayout) {
      if (savedLayout === 'desktop') {
        router.push('/admin-loja/desktop')
      } else {
        router.push('/admin-loja/mobile')
      }
      return
    }
    
    // Se não houver preferência, mostrar tela de seleção
    router.push('/admin-loja/layout-selection')
  }, [router])

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    filtrarAgendamentos()
  }, [busca, filtroStatus])

  const carregarDados = async () => {
    setLoading(true)
    try {
      // Simular dados - em produção viria da API
      await Promise.all([
        carregarAgendamentos(),
        carregarColaboradores(),
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
      },
      {
        id: '4',
        cliente_nome: 'Beatriz Costa',
        cliente_telefone: '(75) 95555-4444',
        servico: 'Limpeza Dentária',
        valor: 80.00,
        data_agendamento: '2026-04-16',
        horario_agendamento: '16:00',
        status: 'concluido',
        colaborador_id: 'col1',
        colaborador_nome: 'Pedro Costa'
      }
    ]
    setAgendamentos(dados)
  }

  const carregarColaboradores = async () => {
    const dados: Colaborador[] = [
      {
        id: 'col1',
        nome: 'Pedro Costa',
        funcao: 'Cabelereiro',
        status: 'ativo',
        total_atendimentos: 156,
        avaliacao: 4.8
      },
      {
        id: 'col2',
        nome: 'Ana Silva',
        funcao: 'Médica',
        status: 'ativo',
        total_atendimentos: 89,
        avaliacao: 4.9
      },
      {
        id: 'col3',
        nome: 'Carlos Oliveira',
        funcao: 'Recepcionista',
        status: 'inativo',
        total_atendimentos: 45,
        avaliacao: 4.5
      }
    ]
    setColaboradores(dados)
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
      },
      mes: {
        total: 245,
        concluidos: 198,
        pendentes: 47,
        faturamento: 15600.00
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

  const atualizarStatusAgendamento = async (id: string, status: Agendamento['status'], colaboradorId?: string) => {
    try {
      // Simular atualização na API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAgendamentos(prev => prev.map(a => 
        a.id === id 
          ? { 
              ...a, 
              status, 
              colaborador_id: colaboradorId || a.colaborador_id,
              colaborador_nome: colaboradorId ? 
                colaboradores.find(c => c.id === colaboradorId)?.nome : 
                a.colaborador_nome
            } 
          : a
      ))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const atribuirColaborador = async (agendamentoId: string, colaboradorId: string) => {
    await atualizarStatusAgendamento(agendamentoId, 'confirmado', colaboradorId)
  }

  const marcarPresenca = async (agendamentoId: string, presente: boolean) => {
    const status = presente ? 'concluido' : 'cancelado'
    await atualizarStatusAgendamento(agendamentoId, status)
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

  const getStatusIcon = (status: Agendamento['status']) => {
    switch (status) {
      case 'pendente': return Clock
      case 'confirmado': return CheckCircle
      case 'em_atendimento': return Users
      case 'concluido': return CheckCircle
      case 'cancelado': return XCircle
      default: return AlertCircle
    }
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
                <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Painel Admin da Loja</h1>
                <p className="text-zinc-400 text-sm">Gestão completa de agendamentos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Abas */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800">
          {[
            { id: 'fila', label: 'Fila de Espera', icon: Users },
            { id: 'colaboradores', label: 'Colaboradores', icon: UserCheck },
            { id: 'metricas', label: 'Métricas', icon: BarChart3 },
            { id: 'pagamentos', label: 'Pagamentos', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Conteúdo das Abas */}
        <div className="bg-zinc-800 rounded-xl rounded-t-none p-6 min-h-[600px]">
          {/* Fila de Espera */}
          {activeTab === 'fila' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente ou serviço..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="todos">Todos Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Lista de Agendamentos */}
              <div className="space-y-3">
                {getAgendamentosFiltrados().map((agendamento) => {
                  const StatusIcon = getStatusIcon(agendamento.status)
                  return (
                    <div key={agendamento.id} className="bg-zinc-700 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Info Principal */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white">{agendamento.cliente_nome}</h3>
                              <p className="text-zinc-400 text-sm">{agendamento.servico}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Calendar className="w-4 h-4" />
                              <span>{agendamento.data_agendamento}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Clock className="w-4 h-4" />
                              <span>{agendamento.horario_agendamento}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-green-400 font-bold">R${agendamento.valor.toFixed(2)}</span>
                            </div>
                            {agendamento.posicao_fila && (
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Users className="w-4 h-4" />
                                <span>Posição: {agendamento.posicao_fila}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
                          {agendamento.status === 'pendente' && (
                            <>
                              <select
                                onChange={(e) => atribuirColaborador(agendamento.id, e.target.value)}
                                className="bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                defaultValue=""
                              >
                                <option value="" disabled>Atribuir...</option>
                                {colaboradores.filter(c => c.status === 'ativo').map(colab => (
                                  <option key={colab.id} value={colab.id}>
                                    {colab.nome} - {colab.funcao}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => marcarPresenca(agendamento.id, true)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                              >
                                Confirmar
                              </button>
                            </>
                          )}
                          
                          {agendamento.status === 'confirmado' && (
                            <button
                              onClick={() => atualizarStatusAgendamento(agendamento.id, 'em_atendimento')}
                              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition"
                            >
                              Iniciar Atendimento
                            </button>
                          )}
                          
                          {agendamento.status === 'em_atendimento' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => marcarPresenca(agendamento.id, true)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                              >
                                Concluir
                              </button>
                              <button
                                onClick={() => marcarPresenca(agendamento.id, false)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}

                          {agendamento.colaborador_nome && (
                            <div className="text-sm text-zinc-400">
                              <span className="font-medium">Atendente:</span> {agendamento.colaborador_nome}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Colaboradores */}
          {activeTab === 'colaboradores' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Equipe</h2>
                <button
                  onClick={() => setShowNovoColaborador(true)}
                  className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Novo Colaborador
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colaboradores.map((colaborador) => (
                  <div key={colaborador.id} className="bg-zinc-700 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white">{colaborador.nome}</h3>
                        <p className="text-zinc-400 text-sm">{colaborador.funcao}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        colaborador.status === 'ativo' ? 'bg-green-500/20 text-green-400' :
                        colaborador.status === 'inativo' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {colaborador.status}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Atendimentos:</span>
                        <span className="text-white font-medium">{colaborador.total_atendimentos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Avaliação:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-white font-medium">{colaborador.avaliacao}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition">
                        Editar
                      </button>
                      <button className="flex-1 bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition">
                        Histórico
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métricas */}
          {activeTab === 'metricas' && metricas && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Métricas de Desempenho</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hoje */}
                <div className="bg-zinc-700 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">Hoje</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total:</span>
                      <span className="text-white font-bold">{metricas.hoje.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Concluídos:</span>
                      <span className="text-green-400 font-bold">{metricas.hoje.concluidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Pendentes:</span>
                      <span className="text-yellow-400 font-bold">{metricas.hoje.pendentes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Faturamento:</span>
                      <span className="text-green-400 font-bold">R${metricas.hoje.faturamento.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Semana */}
                <div className="bg-zinc-700 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-blue-400 mb-3">Esta Semana</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total:</span>
                      <span className="text-white font-bold">{metricas.semana.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Concluídos:</span>
                      <span className="text-green-400 font-bold">{metricas.semana.concluidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Pendentes:</span>
                      <span className="text-yellow-400 font-bold">{metricas.semana.pendentes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Faturamento:</span>
                      <span className="text-green-400 font-bold">R${metricas.semana.faturamento.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Mês */}
                <div className="bg-zinc-700 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Este Mês</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total:</span>
                      <span className="text-white font-bold">{metricas.mes.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Concluídos:</span>
                      <span className="text-green-400 font-bold">{metricas.mes.concluidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Pendentes:</span>
                      <span className="text-yellow-400 font-bold">{metricas.mes.pendentes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Faturamento:</span>
                      <span className="text-green-400 font-bold">R${metricas.mes.faturamento.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico Simples */}
              <div className="bg-zinc-700 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-3">Tendência</h3>
                <div className="h-32 flex items-end justify-between gap-2">
                  {[65, 78, 82, 90, 85, 92, 88].map((valor, index) => (
                    <div key={index} className="flex-1 bg-yellow-500 rounded-t" style={{ height: `${valor}%` }}>
                      <div className="text-xs text-center text-zinc-900 font-bold pt-1">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pagamentos */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Extrato de Pagamentos</h2>
                <div className="flex gap-2">
                  <button className="bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button className="bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtrar
                  </button>
                </div>
              </div>

              {/* Tabela de Pagamentos */}
              <div className="bg-zinc-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Serviço</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Profissional</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                      {agendamentos.filter(a => a.status === 'concluido').map((pagamento) => (
                        <tr key={pagamento.id} className="hover:bg-zinc-600/50 transition">
                          <td className="px-4 py-3 text-sm">{pagamento.data_agendamento}</td>
                          <td className="px-4 py-3 text-sm font-medium">{pagamento.cliente_nome}</td>
                          <td className="px-4 py-3 text-sm">{pagamento.servico}</td>
                          <td className="px-4 py-3 text-sm">{pagamento.colaborador_nome || '-'}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-400">
                            R${pagamento.valor.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(pagamento.status)}`}>
                              Pago
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-yellow-400 hover:text-yellow-300 transition">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumo */}
                <div className="bg-zinc-800 p-4 border-t border-zinc-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total de Pagamentos:</span>
                      <span className="text-white font-bold">
                        {agendamentos.filter(a => a.status === 'concluido').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Valor Total:</span>
                      <span className="text-green-400 font-bold">
                        R${agendamentos
                          .filter(a => a.status === 'concluido')
                          .reduce((sum, a) => sum + a.valor, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Média por Atendimento:</span>
                      <span className="text-white font-bold">
                        R${(agendamentos
                          .filter(a => a.status === 'concluido')
                          .reduce((sum, a) => sum + a.valor, 0) / 
                          agendamentos.filter(a => a.status === 'concluido').length
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
