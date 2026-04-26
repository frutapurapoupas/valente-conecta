'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotificacoes } from '@/hooks/useNotificacoes'
import { 
  Monitor, 
  Smartphone,
  Settings,
  ArrowRight,
  Search,
  ChevronRight,
  Bell,
  Clock,
  CheckCircle,
  Users,
  XCircle,
  AlertCircle,
  UserCheck,
  BarChart3,
  DollarSign,
  Calendar,
  Star,
  Download,
  Filter,
  Eye,
  Gift,
  FileText,
  Plus,
  Minus,
  Wallet,
  History,
  Edit,
  Printer,
  X
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
  const { 
    notificacoes, 
    naoLidas, 
    criarNotificacao, 
    marcarComoLida, 
    marcarTodasComoLidas,
    notificarNovoAgendamento,
    notificarPagamentoRecebido,
    notificarNovoColaborador,
    notificarCreditoBonusRecebido
  } = useNotificacoes()
  const [showNotificacoes, setShowNotificacoes] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'concluido' | 'cancelado'>('todos')
  const [loading, setLoading] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [activeTab, setActiveTab] = useState<'fila' | 'colaboradores' | 'metricas' | 'pagamentos' | 'relatorios' | 'caixa'>('fila')
  const [showNovoColaborador, setShowNovoColaborador] = useState(false)
  const [showEditarColaborador, setShowEditarColaborador] = useState(false)
  const [showHistoricoColaborador, setShowHistoricoColaborador] = useState(false)
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null)
  const [formEditarColaborador, setFormEditarColaborador] = useState({
    nome: '',
    funcao: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'ausente',
    permissoes: {
      lerRegistros: false,
      verListaEspera: false,
      confirmarPagamento: false
    }
  })
  const [showNovaTransacaoCaixa, setShowNovaTransacaoCaixa] = useState(false)
  const [formTransacaoCaixa, setFormTransacaoCaixa] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  })
  const [transacoesCaixa, setTransacoesCaixa] = useState([
    { id: '1', tipo: 'receita', descricao: 'Venda de produtos', valor: 150.00, categoria: 'Vendas', data: '2026-04-26' },
    { id: '2', tipo: 'despesa', descricao: 'Pagamento de luz', valor: 80.00, categoria: 'Contas', data: '2026-04-25' },
    { id: '3', tipo: 'receita', descricao: 'Serviço de corte', valor: 50.00, categoria: 'Serviços', data: '2026-04-26' }
  ])
  const [filtroRelatorio, setFiltroRelatorio] = useState({
    tipo: 'caixa' as 'caixa' | 'atendimentos',
    periodo: 'mes' as 'dia' | 'mes' | 'ano' | 'personalizado',
    colaborador: 'todos' as string,
    dataInicio: '',
    dataFim: ''
  })
  const [showModalAtendente, setShowModalAtendente] = useState(false)
  const [solicitacaoAtendimento, setSolicitacaoAtendimento] = useState<{
    agendamentoId: string
    atendenteId: string
    atendenteNome: string
    tipo: 'iniciar' | 'transferir'
    agendamentoOrigemId?: string
  } | null>(null)
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<Array<{
    id: string
    agendamentoId: string
    atendenteId: string
    atendenteNome: string
    tipo: 'iniciar' | 'transferir'
    timestamp: number
  }>>([])
  const [atendenteLogado, setAtendenteLogado] = useState<string | null>(null)
  const [showModalAtribuirColaborador, setShowModalAtribuirColaborador] = useState(false)
  const [agendamentoParaAtribuir, setAgendamentoParaAtribuir] = useState<string | null>(null)
  const [colaboradorParaAtribuir, setColaboradorParaAtribuir] = useState<string>('qualquer')
  const [liberarParaTodos, setLiberarParaTodos] = useState(false)
  const [filtroHistorico, setFiltroHistorico] = useState<'todos' | 'dia' | 'mes' | 'ano'>('todos')
  const [dataFiltroHistorico, setDataFiltroHistorico] = useState('')
  
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
      
      const agendamento = agendamentos.find(a => a.id === id)
      
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

      // Enviar notificações baseadas no status
      if (agendamento) {
        if (status === 'confirmado') {
          notificarAgendamentoConfirmado(agendamento.cliente_nome, agendamento.horario_agendamento)
        } else if (status === 'concluido') {
          notificarPagamentoRecebido(agendamento.valor, agendamento.cliente_nome)
        } else if (status === 'cancelado') {
          criarNotificacao({
            tipo: 'aviso',
            titulo: 'Agendamento Cancelado',
            mensagem: `${agendamento.cliente_nome} cancelou o agendamento`
          })
        }
      }
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

  const solicitarInicioAtendimento = (agendamentoId: string, atendenteId: string, atendenteNome: string) => {
    const solicitacao = {
      id: Date.now().toString(),
      agendamentoId,
      atendenteId,
      atendenteNome,
      tipo: 'iniciar' as const,
      timestamp: Date.now()
    }
    setSolicitacoesPendentes(prev => [...prev, solicitacao])
    criarNotificacao({
      tipo: 'info',
      titulo: 'Solicitação de Atendimento',
      mensagem: `${atendenteNome} solicitou iniciar atendimento`
    })
  }

  const solicitarTransferenciaCliente = (agendamentoId: string, agendamentoOrigemId: string, atendenteId: string, atendenteNome: string) => {
    const solicitacao = {
      id: Date.now().toString(),
      agendamentoId,
      atendenteId,
      atendenteNome,
      tipo: 'transferir' as const,
      timestamp: Date.now()
    }
    setSolicitacoesPendentes(prev => [...prev, solicitacao])
    criarNotificacao({
      tipo: 'aviso',
      titulo: 'Solicitação de Transferência',
      mensagem: `${atendenteNome} solicitou transferir cliente`
    })
  }

  const aprovarSolicitacao = (solicitacaoId: string) => {
    const solicitacao = solicitacoesPendentes.find(s => s.id === solicitacaoId)
    if (!solicitacao) return

    if (solicitacao.tipo === 'iniciar') {
      atualizarStatusAgendamento(solicitacao.agendamentoId, 'em_atendimento', solicitacao.atendenteId)
    } else if (solicitacao.tipo === 'transferir') {
      setAgendamentos(prev => prev.map(a => 
        a.id === solicitacao.agendamentoId 
          ? { ...a, colaborador_id: solicitacao.atendenteId, colaborador_nome: solicitacao.atendenteNome }
          : a
      ))
    }

    setSolicitacoesPendentes(prev => prev.filter(s => s.id !== solicitacaoId))
    criarNotificacao({
      tipo: 'sucesso',
      titulo: 'Solicitação Aprovada',
      mensagem: `Solicitação de ${solicitacao.atendenteNome} foi aprovada`
    })
  }

  const rejeitarSolicitacao = (solicitacaoId: string) => {
    const solicitacao = solicitacoesPendentes.find(s => s.id === solicitacaoId)
    if (!solicitacao) return

    setSolicitacoesPendentes(prev => prev.filter(s => s.id !== solicitacaoId))
    criarNotificacao({
      tipo: 'aviso',
      titulo: 'Solicitação Rejeitada',
      mensagem: `Solicitação de ${solicitacao.atendenteNome} foi rejeitada`
    })
  }

  const abrirModalAtribuirColaborador = (agendamentoId: string) => {
    setAgendamentoParaAtribuir(agendamentoId)
    setColaboradorParaAtribuir('qualquer')
    setLiberarParaTodos(false)
    setShowModalAtribuirColaborador(true)
  }

  const atribuirColaboradorAoAgendamento = () => {
    if (!agendamentoParaAtribuir) return

    if (liberarParaTodos) {
      // Libera para qualquer colaborador pegar
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamentoParaAtribuir 
          ? { ...a, colaborador_id: null, colaborador_nome: null, status: 'pendente' }
          : a
      ))
      criarNotificacao({
        tipo: 'info',
        titulo: 'Agendamento Liberado',
        mensagem: 'Agendamento liberado para qualquer colaborador'
      })
    } else if (colaboradorParaAtribuir !== 'qualquer') {
      // Atribui a colaborador específico
      const colaborador = colaboradores.find(c => c.id === colaboradorParaAtribuir)
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamentoParaAtribuir 
          ? { ...a, colaborador_id: colaboradorParaAtribuir, colaborador_nome: colaborador?.nome, status: 'confirmado' }
          : a
      ))
      criarNotificacao({
        tipo: 'sucesso',
        titulo: 'Colaborador Atribuído',
        mensagem: `${colaborador?.nome} foi atribuído ao agendamento`
      })
    } else {
      // Deixa sem atribuição (admin atribuirá depois)
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamentoParaAtribuir 
          ? { ...a, colaborador_id: null, colaborador_nome: null }
          : a
      ))
      criarNotificacao({
        tipo: 'info',
        titulo: 'Aguardando Atribuição',
        mensagem: 'Agendamento aguardando atribuição do admin'
      })
    }

    setShowModalAtribuirColaborador(false)
    setAgendamentoParaAtribuir(null)
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
              <button
                onClick={() => setShowModalAtendente(true)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative"
                title="Área do Atendente"
              >
                <Users className="w-5 h-5" />
              </button>
              <Link
                href="/admin-loja/desktop"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                title="Versão Desktop"
              >
                <Monitor className="w-5 h-5" />
              </Link>
              <Link
                href="/admin-loja/mobile"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                title="Versão Mobile"
              >
                <Smartphone className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setShowNotificacoes(true)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {(naoLidas > 0 || solicitacoesPendentes.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {naoLidas + solicitacoesPendentes.length}
                  </span>
                )}
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
            { id: 'pagamentos', label: 'Pagamentos', icon: DollarSign },
            { id: 'relatorios', label: 'Relatórios', icon: FileText },
            { id: 'caixa', label: 'Caixa', icon: Wallet },
            { id: 'creditos-bonus', label: 'Créditos Bônus', icon: Gift }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'creditos-bonus') {
                    router.push('/admin-loja/creditos-bonus')
                  } else {
                    setActiveTab(tab.id as any)
                  }
                }}
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
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
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
                              <button
                                onClick={() => abrirModalAtribuirColaborador(agendamento.id)}
                                className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                Atribuir Colaborador
                              </button>
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
                      <button 
                        onClick={() => {
                          setColaboradorSelecionado(colaborador)
                          setFormEditarColaborador({
                            nome: colaborador.nome,
                            funcao: colaborador.funcao,
                            status: colaborador.status,
                            permissoes: colaborador.permissoes || {
                              lerRegistros: false,
                              verListaEspera: false,
                              confirmarPagamento: false
                            }
                          })
                          setShowEditarColaborador(true)
                        }}
                        className="flex-1 bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Editar
                      </button>
                      <button 
                        onClick={() => {
                          setColaboradorSelecionado(colaborador)
                          setShowHistoricoColaborador(true)
                        }}
                        className="flex-1 bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center justify-center gap-1"
                      >
                        <History className="w-3 h-3" /> Histórico
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

          {/* Relatórios */}
          {activeTab === 'relatorios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Relatórios</h2>
                <button
                  onClick={() => window.print()}
                  className="bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Exportar PDF
                </button>
              </div>

              <div className="bg-zinc-700 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Tipo de Relatório</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFiltroRelatorio({ ...filtroRelatorio, tipo: 'caixa' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        filtroRelatorio.tipo === 'caixa' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-600 text-white'
                      }`}
                    >
                      Caixa (Entrada/Saída)
                    </button>
                    <button
                      onClick={() => setFiltroRelatorio({ ...filtroRelatorio, tipo: 'atendimentos' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                        filtroRelatorio.tipo === 'atendimentos' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-600 text-white'
                      }`}
                    >
                      Atendimentos
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Período</label>
                  <div className="flex gap-2 flex-wrap">
                    {['dia', 'mes', 'ano', 'personalizado'].map((periodo) => (
                      <button
                        key={periodo}
                        onClick={() => setFiltroRelatorio({ ...filtroRelatorio, periodo: periodo as any })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          filtroRelatorio.periodo === periodo ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-600 text-white'
                        }`}
                      >
                        {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {filtroRelatorio.periodo === 'personalizado' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={filtroRelatorio.dataInicio}
                      onChange={(e) => setFiltroRelatorio({ ...filtroRelatorio, dataInicio: e.target.value })}
                      className="flex-1 bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="date"
                      value={filtroRelatorio.dataFim}
                      onChange={(e) => setFiltroRelatorio({ ...filtroRelatorio, dataFim: e.target.value })}
                      className="flex-1 bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Filtrar por Colaborador</label>
                  <select
                    value={filtroRelatorio.colaborador}
                    onChange={(e) => setFiltroRelatorio({ ...filtroRelatorio, colaborador: e.target.value })}
                    className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="todos">Todos</option>
                    {colaboradores.map(col => (
                      <option key={col.id} value={col.id}>{col.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-zinc-700 rounded-xl p-4">
                <h3 className="font-bold text-white mb-4">Resultado do Relatório</h3>
                {filtroRelatorio.tipo === 'caixa' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-green-400">Total Entradas:</span>
                      <span className="text-green-400 font-bold">R${transacoesCaixa.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                      <span className="text-red-400">Total Saídas:</span>
                      <span className="text-red-400 font-bold">R${transacoesCaixa.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-600 rounded-lg">
                      <span className="text-white">Saldo:</span>
                      <span className="text-white font-bold">R${(transacoesCaixa.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0) - transacoesCaixa.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0)).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-zinc-600 rounded-lg">
                      <span className="text-white">Total Atendimentos:</span>
                      <span className="text-white font-bold">{agendamentos.filter(a => a.status === 'concluido').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-green-400">Faturamento:</span>
                      <span className="text-green-400 font-bold">R${agendamentos.filter(a => a.status === 'concluido').reduce((sum, a) => sum + a.valor, 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caixa */}
          {activeTab === 'caixa' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Caixa</h2>
                <button
                  onClick={() => setShowNovaTransacaoCaixa(true)}
                  className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Transação
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 text-green-500" />
                    <span className="text-zinc-400 text-sm">Entradas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">R${transacoesCaixa.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0).toFixed(2)}</p>
                </div>
                <div className="bg-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Minus className="w-5 h-5 text-red-500" />
                    <span className="text-zinc-400 text-sm">Saídas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">R${transacoesCaixa.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0).toFixed(2)}</p>
                </div>
                <div className="bg-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-yellow-500" />
                    <span className="text-zinc-400 text-sm">Saldo</span>
                  </div>
                  <p className="text-2xl font-bold text-white">R${(transacoesCaixa.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0) - transacoesCaixa.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0)).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-zinc-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Categoria</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Tipo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                      {transacoesCaixa.map((transacao) => (
                        <tr key={transacao.id} className="hover:bg-zinc-600/50 transition">
                          <td className="px-4 py-3 text-sm">{new Date(transacao.data).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{transacao.descricao}</td>
                          <td className="px-4 py-3 text-sm">{transacao.categoria}</td>
                          <td className={`px-4 py-3 text-sm text-right font-bold ${transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                            R${transacao.valor.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs ${transacao.tipo === 'receita' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {transacao.tipo === 'receita' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <button 
                    onClick={() => window.print()}
                    className="bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir/PDF
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

      {/* Modal Editar Colaborador */}
      {showEditarColaborador && colaboradorSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Editar Colaborador</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formEditarColaborador.nome}
                onChange={(e) => setFormEditarColaborador({ ...formEditarColaborador, nome: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="text"
                placeholder="Função"
                value={formEditarColaborador.funcao}
                onChange={(e) => setFormEditarColaborador({ ...formEditarColaborador, funcao: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <select
                value={formEditarColaborador.status}
                onChange={(e) => setFormEditarColaborador({ ...formEditarColaborador, status: e.target.value as any })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ausente">Ausente</option>
              </select>

              {/* Permissões */}
              <div className="bg-zinc-700/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase">Permissões</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lerRegistros"
                    checked={formEditarColaborador.permissoes.lerRegistros}
                    onChange={(e) => setFormEditarColaborador({
                      ...formEditarColaborador,
                      permissoes: { ...formEditarColaborador.permissoes, lerRegistros: e.target.checked }
                    })}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <label htmlFor="lerRegistros" className="text-sm text-zinc-300">
                    Ler registros de atendimentos
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verListaEspera"
                    checked={formEditarColaborador.permissoes.verListaEspera}
                    onChange={(e) => setFormEditarColaborador({
                      ...formEditarColaborador,
                      permissoes: { ...formEditarColaborador.permissoes, verListaEspera: e.target.checked }
                    })}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <label htmlFor="verListaEspera" className="text-sm text-zinc-300">
                    Ver lista de espera de clientes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmarPagamento"
                    checked={formEditarColaborador.permissoes.confirmarPagamento}
                    onChange={(e) => setFormEditarColaborador({
                      ...formEditarColaborador,
                      permissoes: { ...formEditarColaborador.permissoes, confirmarPagamento: e.target.checked }
                    })}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <label htmlFor="confirmarPagamento" className="text-sm text-zinc-300">
                    Confirmar pagamento (contas a pagar/receber)
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setColaboradores(prev => prev.map(col => 
                      col.id === colaboradorSelecionado.id 
                        ? { ...col, ...formEditarColaborador }
                        : col
                    ))
                    setShowEditarColaborador(false)
                    notificarNovoColaborador(formEditarColaborador.nome)
                  }}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowEditarColaborador(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico Colaborador */}
      {showHistoricoColaborador && colaboradorSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Histórico - {colaboradorSelecionado.nome}</h3>
              <button
                onClick={() => setShowHistoricoColaborador(false)}
                className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros de Período */}
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltroHistorico('todos')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filtroHistorico === 'todos' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroHistorico('dia')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filtroHistorico === 'dia' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Dia
                </button>
                <button
                  onClick={() => setFiltroHistorico('mes')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filtroHistorico === 'mes' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Mês
                </button>
                <button
                  onClick={() => setFiltroHistorico('ano')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filtroHistorico === 'ano' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Ano
                </button>
              </div>

              {(filtroHistorico === 'dia' || filtroHistorico === 'mes' || filtroHistorico === 'ano') && (
                <input
                  type="date"
                  value={dataFiltroHistorico}
                  onChange={(e) => setDataFiltroHistorico(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
                />
              )}
            </div>

            <div className="space-y-3">
              {agendamentos
                .filter(a => {
                  const filtroColaborador = a.colaborador_id === colaboradorSelecionado.id
                  if (!filtroColaborador) return false

                  if (filtroHistorico === 'todos') return true
                  if (!dataFiltroHistorico) return true

                  const dataAgendamento = new Date(a.data_agendamento)
                  const dataFiltro = new Date(dataFiltroHistorico)

                  if (filtroHistorico === 'dia') {
                    return dataAgendamento.toDateString() === dataFiltro.toDateString()
                  }
                  if (filtroHistorico === 'mes') {
                    return dataAgendamento.getMonth() === dataFiltro.getMonth() &&
                           dataAgendamento.getFullYear() === dataFiltro.getFullYear()
                  }
                  if (filtroHistorico === 'ano') {
                    return dataAgendamento.getFullYear() === dataFiltro.getFullYear()
                  }
                  return true
                })
                .map((agendamento) => (
                  <div key={agendamento.id} className="bg-zinc-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{agendamento.cliente_nome}</h4>
                        <p className="text-zinc-400 text-sm">{agendamento.servico}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>{agendamento.data_agendamento} às {agendamento.horario_agendamento}</span>
                      <span className="text-green-400 font-bold">R${agendamento.valor.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              {agendamentos.filter(a => {
                const filtroColaborador = a.colaborador_id === colaboradorSelecionado.id
                if (!filtroColaborador) return false

                if (filtroHistorico === 'todos') return true
                if (!dataFiltroHistorico) return true

                const dataAgendamento = new Date(a.data_agendamento)
                const dataFiltro = new Date(dataFiltroHistorico)

                if (filtroHistorico === 'dia') {
                  return dataAgendamento.toDateString() === dataFiltro.toDateString()
                }
                if (filtroHistorico === 'mes') {
                  return dataAgendamento.getMonth() === dataFiltro.getMonth() &&
                         dataAgendamento.getFullYear() === dataFiltro.getFullYear()
                }
                if (filtroHistorico === 'ano') {
                  return dataAgendamento.getFullYear() === dataFiltro.getFullYear()
                }
                return true
              }).length === 0 && (
                <p className="text-center text-zinc-400 py-8">Nenhum atendimento encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Transação Caixa */}
      {showNovaTransacaoCaixa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Transação</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFormTransacaoCaixa({ ...formTransacaoCaixa, tipo: 'receita' })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    formTransacaoCaixa.tipo === 'receita' ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Receita
                </button>
                <button
                  onClick={() => setFormTransacaoCaixa({ ...formTransacaoCaixa, tipo: 'despesa' })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    formTransacaoCaixa.tipo === 'despesa' ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Despesa
                </button>
              </div>
              <input
                type="text"
                placeholder="Descrição"
                value={formTransacaoCaixa.descricao}
                onChange={(e) => setFormTransacaoCaixa({ ...formTransacaoCaixa, descricao: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="number"
                placeholder="Valor"
                value={formTransacaoCaixa.valor}
                onChange={(e) => setFormTransacaoCaixa({ ...formTransacaoCaixa, valor: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="text"
                placeholder="Categoria (ex: Vendas, Contas, Serviços)"
                value={formTransacaoCaixa.categoria}
                onChange={(e) => setFormTransacaoCaixa({ ...formTransacaoCaixa, categoria: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="date"
                value={formTransacaoCaixa.data}
                onChange={(e) => setFormTransacaoCaixa({ ...formTransacaoCaixa, data: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!formTransacaoCaixa.descricao || !formTransacaoCaixa.valor) return
                    const novaTransacao = {
                      id: Date.now().toString(),
                      tipo: formTransacaoCaixa.tipo,
                      descricao: formTransacaoCaixa.descricao,
                      valor: parseFloat(formTransacaoCaixa.valor),
                      categoria: formTransacaoCaixa.categoria,
                      data: formTransacaoCaixa.data
                    }
                    setTransacoesCaixa([...transacoesCaixa, novaTransacao])
                    
                    // Enviar notificação
                    criarNotificacao({
                      tipo: formTransacaoCaixa.tipo === 'receita' ? 'sucesso' : 'aviso',
                      titulo: formTransacaoCaixa.tipo === 'receita' ? 'Nova Receita Registrada' : 'Nova Despesa Registrada',
                      mensagem: `${formTransacaoCaixa.descricao} - R${parseFloat(formTransacaoCaixa.valor).toFixed(2)}`
                    })
                    
                    setFormTransacaoCaixa({
                      tipo: 'receita',
                      descricao: '',
                      valor: '',
                      categoria: '',
                      data: new Date().toISOString().split('T')[0]
                    })
                    setShowNovaTransacaoCaixa(false)
                  }}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNovaTransacaoCaixa(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notificações */}
      {showNotificacoes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Notificações</h3>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <button
                    onClick={marcarTodasComoLidas}
                    className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setShowNotificacoes(false)}
                  className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {solicitacoesPendentes.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-blue-400 mb-3">Solicitações Pendentes</h4>
                  {solicitacoesPendentes.map((solicitacao) => (
                    <div key={solicitacao.id} className="bg-zinc-700 rounded-lg p-3 mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">
                            {solicitacao.tipo === 'iniciar' ? 'Iniciar Atendimento' : 'Transferir Cliente'}
                          </p>
                          <p className="text-zinc-400 text-sm">{solicitacao.atendenteNome}</p>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {new Date(solicitacao.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => aprovarSolicitacao(solicitacao.id)}
                          className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => rejeitarSolicitacao(solicitacao.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {notificacoes.length === 0 && solicitacoesPendentes.length === 0 ? (
                <p className="text-center text-zinc-400 py-8">Nenhuma notificação</p>
              ) : (
                notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`bg-zinc-700 rounded-lg p-4 ${!notificacao.lida ? 'border-l-4 border-yellow-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`font-bold ${!notificacao.lida ? 'text-white' : 'text-zinc-300'}`}>
                          {notificacao.titulo}
                        </h4>
                        <p className="text-sm text-zinc-400 mt-1">{notificacao.mensagem}</p>
                      </div>
                      {!notificacao.lida && (
                        <button
                          onClick={() => marcarComoLida(notificacao.id)}
                          className="ml-2 p-1 hover:bg-zinc-600 rounded transition"
                          title="Marcar como lida"
                        >
                          <CheckCircle className="w-4 h-4 text-zinc-400" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-zinc-500">
                        {new Date(notificacao.data).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {notificacao.acao && (
                          <button
                            onClick={notificacao.acao.onClick}
                            className="text-xs text-yellow-500 hover:text-yellow-400 transition"
                          >
                            {notificacao.acao.label}
                          </button>
                        )}
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          notificacao.tipo === 'sucesso' ? 'bg-green-500/20 text-green-400' :
                          notificacao.tipo === 'erro' ? 'bg-red-500/20 text-red-400' :
                          notificacao.tipo === 'aviso' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {notificacao.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Área do Atendente */}
      {showModalAtendente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Área do Atendente</h3>
              <button
                onClick={() => setShowModalAtendente(false)}
                className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!atendenteLogado ? (
              <div className="space-y-4">
                <p className="text-zinc-400 mb-4">Selecione seu perfil para acessar a área do atendente:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colaboradores.filter(c => c.status === 'ativo').map((colaborador) => (
                    <button
                      key={colaborador.id}
                      onClick={() => setAtendenteLogado(colaborador.id)}
                      className="bg-zinc-700 hover:bg-zinc-600 rounded-xl p-4 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{colaborador.nome}</h4>
                          <p className="text-sm text-zinc-400">{colaborador.funcao}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Logado como:</p>
                    <p className="text-white font-bold">
                      {colaboradores.find(c => c.id === atendenteLogado)?.nome}
                    </p>
                  </div>
                  <button
                    onClick={() => setAtendenteLogado(null)}
                    className="bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-500 transition"
                  >
                    Sair
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Agendamentos Disponíveis */}
                  <div>
                    <h4 className="font-bold text-white mb-4">Agendamentos Disponíveis</h4>
                    <div className="space-y-3">
                      {agendamentos
                        .filter(a => a.status === 'pendente' || (a.status === 'confirmado' && a.colaborador_id === atendenteLogado))
                        .map((agendamento) => (
                          <div key={agendamento.id} className="bg-zinc-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-bold text-white">{agendamento.cliente_nome}</h5>
                                <p className="text-sm text-zinc-400">{agendamento.servico}</p>
                              </div>
                              <span className="text-green-400 font-bold">R${agendamento.valor.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-400 mb-3">
                              <span>{agendamento.data_agendamento}</span>
                              <span>{agendamento.horario_agendamento}</span>
                            </div>
                            <button
                              onClick={() => solicitarInicioAtendimento(agendamento.id, atendenteLogado!, colaboradores.find(c => c.id === atendenteLogado)?.nome || '')}
                              className="w-full bg-yellow-500 text-zinc-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition"
                            >
                              Solicitar Início
                            </button>
                          </div>
                        ))}
                      {agendamentos.filter(a => a.status === 'pendente' || (a.status === 'confirmado' && a.colaborador_id === atendenteLogado)).length === 0 && (
                        <p className="text-center text-zinc-400 py-4">Nenhum agendamento disponível</p>
                      )}
                    </div>
                  </div>

                  {/* Agendamentos de Outros Atendentes */}
                  <div>
                    <h4 className="font-bold text-white mb-4">Agendamentos de Outros Atendentes</h4>
                    <div className="space-y-3">
                      {agendamentos
                        .filter(a => a.status === 'confirmado' && a.colaborador_id && a.colaborador_id !== atendenteLogado)
                        .map((agendamento) => (
                          <div key={agendamento.id} className="bg-zinc-700 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-bold text-white">{agendamento.cliente_nome}</h5>
                                <p className="text-sm text-zinc-400">{agendamento.servico}</p>
                              </div>
                              <span className="text-green-400 font-bold">R${agendamento.valor.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-400 mb-2">
                              <span>{agendamento.data_agendamento}</span>
                              <span>{agendamento.horario_agendamento}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mb-3">
                              Atendente atual: {agendamento.colaborador_nome}
                            </p>
                            <button
                              onClick={() => solicitarTransferenciaCliente(agendamento.id, agendamento.id, atendenteLogado!, colaboradores.find(c => c.id === atendenteLogado)?.nome || '')}
                              className="w-full bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                            >
                              Solicitar Transferência
                            </button>
                          </div>
                        ))}
                      {agendamentos.filter(a => a.status === 'confirmado' && a.colaborador_id && a.colaborador_id !== atendenteLogado).length === 0 && (
                        <p className="text-center text-zinc-400 py-4">Nenhum agendamento disponível</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meus Agendamentos em Atendimento */}
                <div>
                  <h4 className="font-bold text-white mb-4">Meus Atendimentos em Andamento</h4>
                  <div className="space-y-3">
                    {agendamentos
                      .filter(a => a.status === 'em_atendimento' && a.colaborador_id === atendenteLogado)
                      .map((agendamento) => (
                        <div key={agendamento.id} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-bold text-white">{agendamento.cliente_nome}</h5>
                              <p className="text-sm text-zinc-400">{agendamento.servico}</p>
                            </div>
                            <span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400">
                              Em Atendimento
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => marcarPresenca(agendamento.id, true)}
                              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                            >
                              Concluir
                            </button>
                            <button
                              onClick={() => marcarPresenca(agendamento.id, false)}
                              className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ))}
                    {agendamentos.filter(a => a.status === 'em_atendimento' && a.colaborador_id === atendenteLogado).length === 0 && (
                      <p className="text-center text-zinc-400 py-4">Nenhum atendimento em andamento</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Atribuir Colaborador */}
      {showModalAtribuirColaborador && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Atribuir Colaborador</h3>
              <button
                onClick={() => setShowModalAtribuirColaborador(false)}
                className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="liberarTodos"
                  checked={liberarParaTodos}
                  onChange={(e) => setLiberarParaTodos(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <label htmlFor="liberarTodos" className="text-sm text-white">
                  Liberar para qualquer colaborador pegar
                </label>
              </div>

              {!liberarParaTodos && (
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Selecione o colaborador</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setColaboradorParaAtribuir('qualquer')}
                      className={`w-full p-3 rounded-xl text-left transition-all ${colaboradorParaAtribuir === 'qualquer' ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800 border-2 border-zinc-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Aguardando atribuição</p>
                          <p className="text-xs text-zinc-500">Admin atribuirá depois</p>
                        </div>
                      </div>
                    </button>
                    {colaboradores.filter(c => c.status === 'ativo').map((colaborador) => (
                      <button
                        key={colaborador.id}
                        onClick={() => setColaboradorParaAtribuir(colaborador.id)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${colaboradorParaAtribuir === colaborador.id ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800 border-2 border-zinc-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{colaborador.nome}</p>
                            <p className="text-xs text-zinc-500">{colaborador.funcao} • {colaborador.avaliacao} ★</p>
                          </div>
                          <div className="px-2 py-1 bg-green-500/20 rounded-full">
                            <span className="text-xs text-green-400 font-medium">Disponível</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={atribuirColaboradorAoAgendamento}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowModalAtribuirColaborador(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}