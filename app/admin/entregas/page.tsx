'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  DollarSign,
  Filter,
  Search,
  Eye,
  Download,
  AlertTriangle,
  FileText,
  Bell,
  Settings,
  RefreshCw,
  ChevronRight,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

interface Entrega {
  id: string
  codigo: string
  cliente_nome: string
  cliente_telefone: string
  cliente_endereco: string
  produto_nome: string
  quantidade: number
  valor_total: number
  status: 'pendente' | 'autorizado' | 'em_transporte' | 'entregue' | 'cancelado' | 'devolvido'
  data_pedido: string
  data_entrega?: string
  data_autorizacao?: string
  autorizado_por?: string
  entregador_id?: string
  entregador_nome?: string
  observacoes?: string
  comprovante_url?: string
  distancia?: number
  tempo_estimado?: string
}

interface Filtros {
  status: string
  data_inicio: string
  data_fim: string
  cliente: string
  codigo: string
}

interface Entregador {
  id: string
  nome: string
  telefone: string
  status: 'disponivel' | 'ocupado' | 'offline'
  entregas_hoje: number
  entregas_mes: number
  avaliacao: number
}

export default function AdminEntregasPage() {
  const [activeTab, setActiveTab] = useState<'pendentes' | 'transporte' | 'historico'>('pendentes')
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [entregadores, setEntregadores] = useState<Entregador[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtros, setFiltros] = useState<Filtros>({
    status: 'todos',
    data_inicio: '',
    data_fim: '',
    cliente: '',
    codigo: ''
  })
  const [showFiltros, setShowFiltros] = useState(false)
  const [entregaSelecionada, setEntregaSelecionada] = useState<Entrega | null>(null)
  const [showDetalhes, setShowDetalhes] = useState(false)
  const [showAutorizacao, setShowAutorizacao] = useState(false)
  const [motivoRecusa, setMotivoRecusa] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    filtrarEntregas()
  }, [busca, filtros])

  const carregarDados = async () => {
    setLoading(true)
    try {
      await Promise.all([
        carregarEntregas(),
        carregarEntregadores()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarEntregas = async () => {
    const dados: Entrega[] = [
      {
        id: '1',
        codigo: 'ENT001',
        cliente_nome: 'João Silva',
        cliente_telefone: '(75) 98888-7777',
        cliente_endereco: 'Rua das Flores, 123 - Centro, Valente-BA',
        produto_nome: 'Kit de Limpeza Completo',
        quantidade: 1,
        valor_total: 89.90,
        status: 'pendente',
        data_pedido: '2026-04-16',
        distancia: 2.5,
        tempo_estimado: '30 min'
      },
      {
        id: '2',
        codigo: 'ENT002',
        cliente_nome: 'Maria Santos',
        cliente_telefone: '(75) 97777-6666',
        cliente_endereco: 'Avenida Brasil, 456 - Centro, Valente-BA',
        produto_nome: 'Cesta Básica',
        quantidade: 2,
        valor_total: 156.80,
        status: 'autorizado',
        data_pedido: '2026-04-16',
        data_autorizacao: '2026-04-16 14:30',
        autorizado_por: 'Admin Loja',
        distancia: 1.8,
        tempo_estimado: '20 min'
      },
      {
        id: '3',
        codigo: 'ENT003',
        cliente_nome: 'Carlos Oliveira',
        cliente_telefone: '(75) 96666-5555',
        cliente_endereco: 'Rua Principal, 789 - Centro, Valente-BA',
        produto_nome: 'Material de Construção',
        quantidade: 5,
        valor_total: 450.00,
        status: 'em_transporte',
        data_pedido: '2026-04-16',
        data_autorizacao: '2026-04-16 15:00',
        autorizado_por: 'Admin Loja',
        entregador_id: 'ent1',
        entregador_nome: 'Pedro Entregas',
        distancia: 3.2,
        tempo_estimado: '45 min'
      },
      {
        id: '4',
        codigo: 'ENT004',
        cliente_nome: 'Beatriz Costa',
        cliente_telefone: '(75) 95555-4444',
        cliente_endereco: 'Rua Comércio, 234 - Centro, Valente-BA',
        produto_nome: 'Kit de Cozinha',
        quantidade: 1,
        valor_total: 1250.00,
        status: 'entregue',
        data_pedido: '2026-04-15',
        data_autorizacao: '2026-04-15 16:00',
        autorizado_por: 'Admin Loja',
        data_entrega: '2026-04-15 17:30',
        entregador_id: 'ent2',
        entregador_nome: 'Ana Entregas',
        comprovante_url: '/comprovantes/ent004.jpg',
        distancia: 1.5,
        tempo_estimado: '25 min'
      }
    ]
    setEntregas(dados)
  }

  const carregarEntregadores = async () => {
    const dados: Entregador[] = [
      {
        id: 'ent1',
        nome: 'Pedro Entregas',
        telefone: '(75) 98888-1111',
        status: 'disponivel',
        entregas_hoje: 12,
        entregas_mes: 245,
        avaliacao: 4.8
      },
      {
        id: 'ent2',
        nome: 'Ana Entregas',
        telefone: '(75) 97777-2222',
        status: 'ocupado',
        entregas_hoje: 8,
        entregas_mes: 198,
        avaliacao: 4.9
      },
      {
        id: 'ent3',
        nome: 'Carlos Entregas',
        telefone: '(75) 96666-3333',
        status: 'disponivel',
        entregas_hoje: 10,
        entregas_mes: 156,
        avaliacao: 4.7
      }
    ]
    setEntregadores(dados)
  }

  const filtrarEntregas = () => {
    let filtradas = entregas

    if (busca) {
      filtradas = filtradas.filter(e => 
        e.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        e.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
        e.cliente_telefone.includes(busca) ||
        e.produto_nome.toLowerCase().includes(busca.toLowerCase())
      )
    }

    if (filtros.status !== 'todos') {
      filtradas = filtradas.filter(e => e.status === filtros.status)
    }

    if (filtros.cliente) {
      filtradas = filtradas.filter(e => 
        e.cliente_nome.toLowerCase().includes(filtros.cliente.toLowerCase())
      )
    }

    if (filtros.codigo) {
      filtradas = filtradas.filter(e => 
        e.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())
      )
    }

    return filtradas
  }

  const autorizarEntrega = async (entregaId: string, aprovado: boolean, motivo?: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEntregas(prev => prev.map(e => 
        e.id === entregaId 
          ? { 
              ...e, 
              status: aprovado ? 'autorizado' : 'cancelado',
              data_autorizacao: new Date().toISOString(),
              autorizado_por: 'Admin Loja',
              observacoes: motivo
            } 
          : e
      ))
      
      setShowAutorizacao(false)
      setMotivoRecusa('')
      setEntregaSelecionada(null)
    } catch (error) {
      console.error('Erro ao autorizar entrega:', error)
    }
  }

  const atribuirEntregador = async (entregaId: string, entregadorId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEntregas(prev => prev.map(e => 
        e.id === entregaId 
          ? { 
              ...e, 
              status: 'em_transporte',
              entregador_id: entregadorId,
              entregador_nome: entregadores.find(ent => ent.id === entregadorId)?.nome
            } 
          : e
      ))
    } catch (error) {
      console.error('Erro ao atribuir entregador:', error)
    }
  }

  const confirmarEntrega = async (entregaId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setEntregas(prev => prev.map(e => 
        e.id === entregaId 
          ? { 
              ...e, 
              status: 'entregue',
              data_entrega: new Date().toISOString()
            } 
          : e
      ))
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error)
    }
  }

  const getEntregasFiltradas = () => filtrarEntregas()

  const getStatusColor = (status: Entrega['status']) => {
    switch (status) {
      case 'pendente': return 'text-yellow-400 bg-yellow-500/20'
      case 'autorizado': return 'text-blue-400 bg-blue-500/20'
      case 'em_transporte': return 'text-purple-400 bg-purple-500/20'
      case 'entregue': return 'text-green-400 bg-green-500/20'
      case 'cancelado': return 'text-red-400 bg-red-500/20'
      case 'devolvido': return 'text-orange-400 bg-orange-500/20'
      default: return 'text-zinc-400 bg-zinc-500/20'
    }
  }

  const getStatusIcon = (status: Entrega['status']) => {
    switch (status) {
      case 'pendente': return Clock
      case 'autorizado': return CheckCircle
      case 'em_transporte': return Truck
      case 'entregue': return Package
      case 'cancelado': return XCircle
      case 'devolvido': return RefreshCw
      default: return AlertTriangle
    }
  }

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEntregasPorStatus = () => {
    const pendentes = entregas.filter(e => e.status === 'pendente').length
    const autorizados = entregas.filter(e => e.status === 'autorizado').length
    const emTransito = entregas.filter(e => e.status === 'em_transporte').length
    const entregues = entregas.filter(e => e.status === 'entregue').length
    
    return { pendentes, autorizados, emTransito, entregues }
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
                <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Gerenciar Entregas</h1>
                <p className="text-zinc-400 text-sm">Sistema completo de autorização e transporte</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative">
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(getEntregasPorStatus()).map(([status, count], index) => {
            const statusColors = {
              pendentes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
              autorizados: 'bg-blue-500/20 text-blue-400 border-blue-500',
              emTransito: 'bg-purple-500/20 text-purple-400 border-purple-500',
              entregues: 'bg-green-500/20 text-green-400 border-green-500'
            }
            
            return (
              <div key={status} className={`p-4 rounded-xl border ${statusColors[status as keyof typeof statusColors]}`}>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-sm capitalize">{status.replace('_', ' ')}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filtros e Busca */}
        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, cliente ou produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className={`p-2 rounded-lg transition ${
                showFiltros ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {showFiltros && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="todos">Todos Status</option>
                <option value="pendente">Pendente</option>
                <option value="autorizado">Autorizado</option>
                <option value="em_transporte">Em Transporte</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
              
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Data início"
              />
              
              <input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Data fim"
              />
              
              <input
                type="text"
                value={filtros.cliente}
                onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Cliente"
              />
              
              <input
                type="text"
                value={filtros.codigo}
                onChange={(e) => setFiltros({...filtros, codigo: e.target.value})}
                className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Código"
              />
            </div>
          )}
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800">
          {[
            { id: 'pendentes', label: 'Pendentes de Autorização', icon: Clock },
            { id: 'transporte', label: 'Em Transporte', icon: Truck },
            { id: 'historico', label: 'Histórico', icon: FileText }
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
          {/* Pendentes de Autorização */}
          {activeTab === 'pendentes' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Entregas Pendentes de Autorização</h2>
              
              <div className="space-y-3">
                {getEntregasFiltradas().filter(e => e.status === 'pendente' || e.status === 'cancelado').map((entrega) => {
                  const StatusIcon = getStatusIcon(entrega.status)
                  return (
                    <div key={entrega.id} className="bg-zinc-700 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Informações Principais */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white">{entrega.codigo}</h3>
                              <p className="text-zinc-400 text-sm">{entrega.cliente_nome}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(entrega.status)}`}>
                              {entrega.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span>{entrega.produto_nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatarPreco(entrega.valor_total)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{entrega.distancia}km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{entrega.tempo_estimado}</span>
                            </div>
                          </div>

                          <div className="text-sm text-zinc-400">
                            <p className="mb-1">
                              <span className="font-medium text-white">Endereço:</span> {entrega.cliente_endereco}
                            </p>
                            <p>
                              <span className="font-medium text-white">Telefone:</span> {entrega.cliente_telefone}
                            </p>
                            <p>
                              <span className="font-medium text-white">Pedido:</span> {formatarData(entrega.data_pedido)}
                            </p>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 lg:w-48">
                          <button
                            onClick={() => {
                              setEntregaSelecionada(entrega)
                              setShowDetalhes(true)
                            }}
                            className="w-full bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </button>
                          
                          {entrega.status === 'pendente' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEntregaSelecionada(entrega)
                                  setShowAutorizacao(true)
                                }}
                                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </button>
                              <button
                                onClick={() => {
                                  setEntregaSelecionada(entrega)
                                  setShowAutorizacao(true)
                                }}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Recusar
                              </button>
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

          {/* Em Transporte */}
          {activeTab === 'transporte' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Entregas em Transporte</h2>
              
              <div className="space-y-3">
                {getEntregasFiltradas().filter(e => e.status === 'em_transporte').map((entrega) => {
                  const StatusIcon = getStatusIcon(entrega.status)
                  return (
                    <div key={entrega.id} className="bg-zinc-700 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Informações da Entrega */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white">{entrega.codigo}</h3>
                              <p className="text-zinc-400 text-sm">{entrega.cliente_nome}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(entrega.status)}`}>
                              {entrega.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span>{entrega.produto_nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatarPreco(entrega.valor_total)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{entrega.entregador_nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{entrega.distancia}km</span>
                            </div>
                          </div>

                          <div className="text-sm text-zinc-400">
                            <p className="mb-1">
                              <span className="font-medium text-white">Endereço:</span> {entrega.cliente_endereco}
                            </p>
                            <p>
                              <span className="font-medium text-white">Telefone:</span> {entrega.cliente_telefone}
                            </p>
                            <p>
                              <span className="font-medium text-white">Autorizado:</span> {formatarData(entrega.data_autorizacao!)}
                            </p>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 lg:w-48">
                          <button
                            onClick={() => {
                              setEntregaSelecionada(entrega)
                              setShowDetalhes(true)
                            }}
                            className="w-full bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </button>
                          
                          <button
                            onClick={() => confirmarEntrega(entrega.id)}
                            className="w-full bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirmar Entrega
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Histórico */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Histórico de Entregas</h2>
              
              <div className="space-y-3">
                {getEntregasFiltradas().filter(e => e.status === 'entregue' || e.status === 'cancelado' || e.status === 'devolvido').map((entrega) => {
                  const StatusIcon = getStatusIcon(entrega.status)
                  return (
                    <div key={entrega.id} className="bg-zinc-700 rounded-xl p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Informações da Entrega */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white">{entrega.codigo}</h3>
                              <p className="text-zinc-400 text-sm">{entrega.cliente_nome}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(entrega.status)}`}>
                              {entrega.status.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              <span>{entrega.produto_nome}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatarPreco(entrega.valor_total)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{entrega.entregador_nome || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{entrega.data_entrega ? formatarData(entrega.data_entrega) : '-'}</span>
                            </div>
                          </div>

                          <div className="text-sm text-zinc-400">
                            <p className="mb-1">
                              <span className="font-medium text-white">Endereço:</span> {entrega.cliente_endereco}
                            </p>
                            <p>
                              <span className="font-medium text-white">Telefone:</span> {entrega.cliente_telefone}
                            </p>
                            <p>
                              <span className="font-medium text-white">Pedido:</span> {formatarData(entrega.data_pedido)}
                            </p>
                            {entrega.data_autorizacao && (
                              <p>
                                <span className="font-medium text-white">Autorizado:</span> {formatarData(entrega.data_autorizacao)}
                              </p>
                            )}
                            {entrega.comprovante_url && (
                              <div className="mt-2">
                                <a 
                                  href={entrega.comprovante_url}
                                  target="_blank"
                                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Ver Comprovante
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-2 lg:w-48">
                          <button
                            onClick={() => {
                              setEntregaSelecionada(entrega)
                              setShowDetalhes(true)
                            }}
                            className="w-full bg-zinc-600 text-white py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </button>
                          
                          {entrega.comprovante_url && (
                            <button
                              className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Baixar Comprovante
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetalhes && entregaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Detalhes da Entrega</h3>
                <button
                  onClick={() => {
                    setShowDetalhes(false)
                    setEntregaSelecionada(null)
                  }}
                  className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  <XCircle className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Código:</span>
                    <p className="text-white font-bold">{entregaSelecionada.codigo}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Status:</span>
                    <div className={`px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(entregaSelecionada.status)}`}>
                      {entregaSelecionada.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Cliente:</span>
                    <p className="text-white font-bold">{entregaSelecionada.cliente_nome}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Telefone:</span>
                    <p className="text-white font-bold">{entregaSelecionada.cliente_telefone}</p>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 text-sm">Endereço:</span>
                  <p className="text-white">{entregaSelecionada.cliente_endereco}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Produto:</span>
                    <p className="text-white font-bold">{entregaSelecionada.produto_nome}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Quantidade:</span>
                    <p className="text-white font-bold">{entregaSelecionada.quantidade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Valor Total:</span>
                    <p className="text-white font-bold text-green-400">{formatarPreco(entregaSelecionada.valor_total)}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Distância:</span>
                    <p className="text-white font-bold">{entregaSelecionada.distancia}km</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Data Pedido:</span>
                    <p className="text-white font-bold">{formatarData(entregaSelecionada.data_pedido)}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Tempo Estimado:</span>
                    <p className="text-white font-bold">{entregaSelecionada.tempo_estimado}</p>
                  </div>
                </div>

                {entregaSelecionada.data_autorizacao && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-zinc-400 text-sm">Data Autorização:</span>
                      <p className="text-white font-bold">{formatarData(entregaSelecionada.data_autorizacao)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">Autorizado por:</span>
                      <p className="text-white font-bold">{entregaSelecionada.autorizado_por}</p>
                    </div>
                  </div>
                )}

                {entregaSelecionada.data_entrega && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-zinc-400 text-sm">Data Entrega:</span>
                      <p className="text-white font-bold">{formatarData(entregaSelecionada.data_entrega)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-sm">Entregador:</span>
                      <p className="text-white font-bold">{entregaSelecionada.entregador_nome}</p>
                    </div>
                  </div>
                )}

                {entregaSelecionada.observacoes && (
                  <div>
                    <span className="text-zinc-400 text-sm">Observações:</span>
                    <p className="text-white">{entregaSelecionada.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autorização */}
      {showAutorizacao && entregaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Autorizar Entrega</h3>
                <button
                  onClick={() => {
                    setShowAutorizacao(false)
                    setEntregaSelecionada(null)
                    setMotivoRecusa('')
                  }}
                  className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  <XCircle className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-700 rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Entrega {entregaSelecionada.codigo}</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-zinc-400">Cliente:</span> {entregaSelecionada.cliente_nome}</p>
                    <p><span className="text-zinc-400">Produto:</span> {entregaSelecionada.produto_nome}</p>
                    <p><span className="text-zinc-400">Valor:</span> {formatarPreco(entregaSelecionada.valor_total)}</p>
                    <p><span className="text-zinc-400">Endereço:</span> {entregaSelecionada.cliente_endereco}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Motivo da recusa (se aplicável):
                  </label>
                  <textarea
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={3}
                    placeholder="Descreva o motivo da recusa..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAutorizacao(false)
                    setEntregaSelecionada(null)
                    setMotivoRecusa('')
                  }}
                  className="flex-1 bg-zinc-700 text-zinc-300 py-2 rounded-lg hover:bg-zinc-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => autorizarEntrega(entregaSelecionada.id, true)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Aprovar Entrega
                </button>
                <button
                  onClick={() => autorizarEntrega(entregaSelecionada.id, false, motivoRecusa)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Recusar Entrega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
