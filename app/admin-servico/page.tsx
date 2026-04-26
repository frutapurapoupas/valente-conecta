'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAdminServicoAgendamento } from '@/hooks/useAdminServicoAgendamento'
import { 
  Store, MessageSquare, CheckSquare, DollarSign, 
  Calendar, Plus, Edit2, Trash2, Send, 
  Filter, Download, Search, Bell, ChevronRight,
  Clock, User, Package, TrendingUp, AlertCircle, Printer,
  Users, UserPlus, Settings, Eye, EyeOff, CalendarPlus, X
} from 'lucide-react'
import Link from 'next/link'

export default function AdminServicoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const adminData = useAdminServicoAgendamento(user?.servicoId)
  
  const [activeTab, setActiveTab] = useState<'catalogo' | 'mensagens' | 'tarefas' | 'extrato'>('catalogo')
  const [showNovoProduto, setShowNovoProduto] = useState(false)
  const [showNovaTarefa, setShowNovaTarefa] = useState(false)
  const [respostaTexto, setRespostaTexto] = useState('')
  const [mensagemSelecionada, setMensagemSelecionada] = useState<string | null>(null)
  
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
  })
  
  const [formTarefa, setFormTarefa] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    dataLimite: '',
  })

  const [showNovaTransacao, setShowNovaTransacao] = useState(false)
  const [formTransacao, setFormTransacao] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
  })

  const [showGestaoUsuarios, setShowGestaoUsuarios] = useState(false)
  const [showNovoColaborador, setShowNovoColaborador] = useState(false)
  const [formColaborador, setFormColaborador] = useState({
    nome: '',
    email: '',
    telefone: '',
    funcao: 'colaborador' as 'colaborador' | 'gerente',
    permissoes: {
      verAgendasGerais: false,
      responderClientes: true,
      cancelarAgendamentos: false,
      incluirManual: false,
    },
  })

  const [colaboradores, setColaboradores] = useState([
    { id: '1', nome: 'João Silva', email: 'joao@email.com', funcao: 'gerente', permissoes: { verAgendasGerais: true, responderClientes: true, cancelarAgendamentos: true, incluirManual: true } },
    { id: '2', nome: 'Maria Santos', email: 'maria@email.com', funcao: 'colaborador', permissoes: { verAgendasGerais: false, responderClientes: true, cancelarAgendamentos: false, incluirManual: false } },
  ])

  const [showMensagensFila, setShowMensagensFila] = useState(false)
  const [mensagensFilaEspera] = useState([
    { id: '1', cliente: 'Carlos Oliveira', telefone: '75998887766', horarioOriginal: '14:00', horarioAlocado: '15:30', dataEnvio: '24/04/2026 14:15', status: 'enviado' },
    { id: '2', cliente: 'Ana Costa', telefone: '75997776655', horarioOriginal: '10:00', horarioAlocado: '11:00', dataEnvio: '24/04/2026 10:05', status: 'confirmado' },
    { id: '3', cliente: 'Pedro Lima', telefone: '75996665544', horarioOriginal: '16:00', horarioAlocado: '17:00', dataEnvio: '24/04/2026 16:10', status: 'pendente' },
  ])

  const stats = adminData.getEstatisticas()

  const handleCriarProduto = async () => {
    if (!formProduto.nome || !formProduto.preco) return
    await adminData.criarProduto({
      servicoId: user?.servicoId || '',
      nome: formProduto.nome,
      descricao: formProduto.descricao,
      preco: parseFloat(formProduto.preco),
      categoria: formProduto.categoria,
      ativo: true,
      publicado: true,
    })
    setFormProduto({ nome: '', descricao: '', preco: '', categoria: '' })
    setShowNovoProduto(false)
  }

  const handleCriarTarefa = async () => {
    if (!formTarefa.titulo) return
    await adminData.criarTarefa({
      titulo: formTarefa.titulo,
      descricao: formTarefa.descricao,
      atribuidoPor: user?.id || '',
      prioridade: formTarefa.prioridade,
      dataLimite: formTarefa.dataLimite,
    })
    setFormTarefa({ titulo: '', descricao: '', prioridade: 'media', dataLimite: '' })
    setShowNovaTarefa(false)
  }

  const handleResponderCliente = async () => {
    if (!mensagemSelecionada || !respostaTexto) return
    await adminData.responderCliente(mensagemSelecionada, respostaTexto)
    setRespostaTexto('')
    setMensagemSelecionada(null)
  }

  const handleImprimirExtrato = () => {
    window.print()
  }

  const handleCriarTransacao = () => {
    if (!formTransacao.descricao || !formTransacao.valor) return
    console.log('Criar transação:', formTransacao)
    setShowNovaTransacao(false)
    setFormTransacao({ tipo: 'receita', descricao: '', valor: '', categoria: '', data: new Date().toISOString().split('T')[0] })
  }

  const handleAdicionarColaborador = () => {
    if (!formColaborador.nome || !formColaborador.email) return
    const novoColaborador = {
      id: Date.now().toString(),
      nome: formColaborador.nome,
      email: formColaborador.email,
      telefone: formColaborador.telefone,
      funcao: formColaborador.funcao,
      permissoes: formColaborador.permissoes,
    }
    setColaboradores([...colaboradores, novoColaborador])
    setShowNovoColaborador(false)
    setFormColaborador({
      nome: '',
      email: '',
      telefone: '',
      funcao: 'colaborador',
      permissoes: { verAgendasGerais: false, responderClientes: true, cancelarAgendamentos: false, incluirManual: false },
    })
  }

  const handleTogglePermissao = (colaboradorId: string, permissao: string) => {
    setColaboradores(prev => prev.map(col => {
      if (col.id === colaboradorId) {
        return {
          ...col,
          permissoes: {
            ...col.permissoes,
            [permissao]: !col.permissoes[permissao as keyof typeof col.permissoes],
          },
        }
      }
      return col
    }))
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500/20 text-red-400'
      case 'media': return 'bg-yellow-500/20 text-yellow-400'
      case 'baixa': return 'bg-green-500/20 text-green-400'
      default: return 'bg-zinc-500/20 text-zinc-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400'
      case 'em_andamento': return 'bg-blue-500/20 text-blue-400'
      case 'concluida': return 'bg-green-500/20 text-green-400'
      case 'cancelada': return 'bg-red-500/20 text-red-400'
      case 'respondida': return 'bg-green-500/20 text-green-400'
      case 'pago': return 'bg-green-500/20 text-green-400'
      default: return 'bg-zinc-500/20 text-zinc-400'
    }
  }

  const extratoFiltrado = adminData.filtrarExtratoPorPeriodo()
  const resumoExtrato = adminData.getResumoExtrato()

  return (
    <div className="min-h-screen bg-zinc-900 text-white pb-24">
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
                <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Painel do Serviço</h1>
                <p className="text-zinc-400 text-sm">Gestão completa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMensagensFila(true)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative"
                title="Mensagens Fila de Espera"
              >
                <Bell className="w-5 h-5" />
                {mensagensFilaEspera.filter(m => m.status === 'pendente').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setShowGestaoUsuarios(true)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative"
                title="Gestão de Usuários"
              >
                <Users className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {colaboradores.length}
                </span>
              </button>
              <button className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition relative">
                <Bell className="w-5 h-5" />
                {adminData.mensagens.filter(m => m.status === 'pendente').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-yellow-500" />
              <span className="text-zinc-400 text-sm">Produtos</span>
            </div>
            <p className="text-2xl font-bold">{stats.produtosAtivos}/{stats.produtosTotal}</p>
            <p className="text-xs text-zinc-500">Ativos/Total</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span className="text-zinc-400 text-sm">Mensagens</span>
            </div>
            <p className="text-2xl font-bold">{stats.mensagensPendentes}</p>
            <p className="text-xs text-zinc-500">Pendentes</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare className="w-5 h-5 text-purple-500" />
              <span className="text-zinc-400 text-sm">Tarefas</span>
            </div>
            <p className="text-2xl font-bold">{stats.tarefasPendentes}</p>
            <p className="text-xs text-zinc-500">Pendentes</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-zinc-400 text-sm">Faturamento</span>
            </div>
            <p className="text-2xl font-bold">R${stats.faturamentoTotal.toFixed(2)}</p>
            <p className="text-xs text-zinc-500">Este mês</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-zinc-800">
          {[
            { id: 'catalogo', label: 'Catálogo', icon: Store },
            { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
            { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
            { id: 'extrato', label: 'Extrato', icon: DollarSign },
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
                {tab.id === 'mensagens' && stats.mensagensPendentes > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.mensagensPendentes}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="bg-zinc-800 rounded-xl rounded-t-none p-6 min-h-[600px]">
          
          {activeTab === 'catalogo' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Catálogo de Produtos/Serviços</h2>
                <button
                  onClick={() => setShowNovoProduto(true)}
                  className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminData.produtos.map((produto) => (
                  <div key={produto.id} className="bg-zinc-700 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{produto.nome}</h3>
                        <p className="text-zinc-400 text-sm">{produto.categoria}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-zinc-600 rounded transition">
                          <Edit2 className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button 
                          onClick={() => adminData.removerProduto(produto.id)}
                          className="p-1 hover:bg-zinc-600 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3">{produto.descricao}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-green-400">R${produto.preco.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs ${produto.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs ${produto.publicado ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                          {produto.publicado ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mensagens' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Mensagens de Clientes</h2>
              
              <div className="space-y-4">
                {adminData.mensagens.map((msg) => (
                  <div key={msg.id} className="bg-zinc-700 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-zinc-400" />
                          <h3 className="font-bold text-white">{msg.clienteNome}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(msg.status)}`}>
                            {msg.status === 'pendente' ? 'Pendente' : 'Respondida'}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">{msg.clienteTelefone}</p>
                      </div>
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-3 mb-3">
                      <p className="text-zinc-300">{msg.mensagem}</p>
                    </div>

                    {msg.status === 'pendente' && (
                      <div className="space-y-2">
                        {mensagemSelecionada === msg.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={respostaTexto}
                              onChange={(e) => setRespostaTexto(e.target.value)}
                              placeholder="Digite sua resposta..."
                              className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleResponderCliente}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition flex items-center gap-2"
                              >
                                <Send className="w-4 h-4" />
                                Enviar Resposta
                              </button>
                              <button
                                onClick={() => { setMensagemSelecionada(null); setRespostaTexto('') }}
                                className="bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-500 transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setMensagemSelecionada(msg.id)}
                            className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Responder
                          </button>
                        )}
                      </div>
                    )}

                    {msg.status === 'respondida' && msg.resposta && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-400 text-sm font-medium mb-1">Sua resposta:</p>
                        <p className="text-zinc-300">{msg.resposta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tarefas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Tarefas da Equipe</h2>
                <button
                  onClick={() => setShowNovaTarefa(true)}
                  className="bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </button>
              </div>

              <div className="space-y-3">
                {adminData.tarefas.map((tarefa) => (
                  <div key={tarefa.id} className="bg-zinc-700 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{tarefa.titulo}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs ${getPrioridadeColor(tarefa.prioridade)}`}>
                            {tarefa.prioridade}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(tarefa.status)}`}>
                            {tarefa.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">{tarefa.descricao}</p>
                      </div>
                      {tarefa.status === 'pendente' && (
                        <button
                          onClick={() => adminData.concluirTarefa(tarefa.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Criada: {new Date(tarefa.dataCriacao).toLocaleDateString()}</span>
                      </div>
                      {tarefa.dataLimite && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Prazo: {new Date(tarefa.dataLimite).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'extrato' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Extrato Financeiro</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleImprimirExtrato}
                    className="bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-zinc-500 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir PDF
                  </button>
                  <button
                    onClick={() => setShowNovaTransacao(true)}
                    className="bg-yellow-500 text-zinc-900 px-3 py-2 rounded-lg text-sm hover:bg-yellow-400 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Transação
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: 'mes', label: 'Este Mês' },
                    { id: 'personalizado', label: 'Personalizado' },
                  ].map((periodo) => (
                    <button
                      key={periodo.id}
                      onClick={() => adminData.setPeriodoExtrato(periodo.id as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        adminData.periodoExtrato === periodo.id
                          ? 'bg-yellow-500 text-zinc-900'
                          : 'bg-zinc-700 text-white hover:bg-zinc-600'
                      }`}
                    >
                      {periodo.label}
                    </button>
                  ))}
                </div>
                {adminData.periodoExtrato === 'personalizado' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={adminData.dataInicio}
                      onChange={(e) => adminData.setDataInicio(e.target.value)}
                      className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="date"
                      value={adminData.dataFim}
                      onChange={(e) => adminData.setDataFim(e.target.value)}
                      className="bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="bg-zinc-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                      {extratoFiltrado.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-600/50 transition">
                          <td className="px-4 py-3 text-sm">{new Date(item.data).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm font-medium">{item.descricao}</td>
                          <td className="px-4 py-3 text-sm">{item.clienteNome || '-'}</td>
                          <td className="px-4 py-3 text-sm capitalize">{item.tipo}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-green-400">
                            R${item.valor.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-zinc-800 p-4 border-t border-zinc-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total:</span>
                      <span className="text-white font-bold">{resumoExtrato.quantidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Valor Pago:</span>
                      <span className="text-green-400 font-bold">R${resumoExtrato.pago.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Valor Pendente:</span>
                      <span className="text-yellow-400 font-bold">R${resumoExtrato.pendente.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNovoProduto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Novo Produto/Serviço</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formProduto.nome}
                onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <textarea
                placeholder="Descrição"
                value={formProduto.descricao}
                onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
                rows={3}
              />
              <input
                type="number"
                placeholder="Preço"
                value={formProduto.preco}
                onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="text"
                placeholder="Categoria"
                value={formProduto.categoria}
                onChange={(e) => setFormProduto({ ...formProduto, categoria: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCriarProduto}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowNovoProduto(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNovaTarefa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Tarefa</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={formTarefa.titulo}
                onChange={(e) => setFormTarefa({ ...formTarefa, titulo: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <textarea
                placeholder="Descrição"
                value={formTarefa.descricao}
                onChange={(e) => setFormTarefa({ ...formTarefa, descricao: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
                rows={3}
              />
              <select
                value={formTarefa.prioridade}
                onChange={(e) => setFormTarefa({ ...formTarefa, prioridade: e.target.value as any })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
              <input
                type="date"
                value={formTarefa.dataLimite}
                onChange={(e) => setFormTarefa({ ...formTarefa, dataLimite: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCriarTarefa}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowNovaTarefa(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Transação */}
      {showNovaTransacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Transação</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFormTransacao({ ...formTransacao, tipo: 'receita' })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    formTransacao.tipo === 'receita' ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Receita
                </button>
                <button
                  onClick={() => setFormTransacao({ ...formTransacao, tipo: 'despesa' })}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    formTransacao.tipo === 'despesa' ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  Despesa
                </button>
              </div>
              <input
                type="text"
                placeholder="Descrição"
                value={formTransacao.descricao}
                onChange={(e) => setFormTransacao({ ...formTransacao, descricao: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="number"
                placeholder="Valor"
                value={formTransacao.valor}
                onChange={(e) => setFormTransacao({ ...formTransacao, valor: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="text"
                placeholder="Categoria (ex: Venda de produtos, Serviços, Aluguel)"
                value={formTransacao.categoria}
                onChange={(e) => setFormTransacao({ ...formTransacao, categoria: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="date"
                value={formTransacao.data}
                onChange={(e) => setFormTransacao({ ...formTransacao, data: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCriarTransacao}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Criar
                </button>
                <button
                  onClick={() => setShowNovaTransacao(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestão de Usuários */}
      {showGestaoUsuarios && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Gestão de Colaboradores</h3>
              <button
                onClick={() => setShowGestaoUsuarios(false)}
                className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <button
                onClick={() => setShowNovoColaborador(true)}
                className="px-4 py-2 bg-yellow-500 text-zinc-900 rounded-lg font-medium hover:bg-yellow-400 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Colaborador
              </button>
            </div>

            <div className="space-y-4">
              {colaboradores.map(colaborador => (
                <div key={colaborador.id} className="bg-zinc-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-white">{colaborador.nome}</h4>
                      <p className="text-sm text-zinc-400">{colaborador.email}</p>
                      <p className="text-sm text-zinc-400">{colaborador.telefone}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-bold ${
                        colaborador.funcao === 'gerente' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {colaborador.funcao.toUpperCase()}
                      </span>
                    </div>
                    <button className="p-2 bg-zinc-600 rounded-lg hover:bg-zinc-500 transition">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="border-t border-zinc-600 pt-4">
                    <p className="text-sm font-bold text-zinc-300 mb-3">Permissões</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between bg-zinc-600 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-300">Ver agendas gerais</span>
                        </div>
                        <button
                          onClick={() => handleTogglePermissao(colaborador.id, 'verAgendasGerais')}
                          className={`w-10 h-6 rounded-full transition ${
                            colaborador.permissoes.verAgendasGerais ? 'bg-green-500' : 'bg-zinc-500'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                            colaborador.permissoes.verAgendasGerais ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-600 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-300">Responder clientes</span>
                        </div>
                        <button
                          onClick={() => handleTogglePermissao(colaborador.id, 'responderClientes')}
                          className={`w-10 h-6 rounded-full transition ${
                            colaborador.permissoes.responderClientes ? 'bg-green-500' : 'bg-zinc-500'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                            colaborador.permissoes.responderClientes ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-600 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-300">Cancelar agendamentos</span>
                        </div>
                        <button
                          onClick={() => handleTogglePermissao(colaborador.id, 'cancelarAgendamentos')}
                          className={`w-10 h-6 rounded-full transition ${
                            colaborador.permissoes.cancelarAgendamentos ? 'bg-green-500' : 'bg-zinc-500'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                            colaborador.permissoes.cancelarAgendamentos ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-600 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CalendarPlus className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm text-zinc-300">Incluir manualmente</span>
                        </div>
                        <button
                          onClick={() => handleTogglePermissao(colaborador.id, 'incluirManual')}
                          className={`w-10 h-6 rounded-full transition ${
                            colaborador.permissoes.incluirManual ? 'bg-green-500' : 'bg-zinc-500'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                            colaborador.permissoes.incluirManual ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Colaborador */}
      {showNovoColaborador && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Adicionar Colaborador</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formColaborador.nome}
                onChange={(e) => setFormColaborador({ ...formColaborador, nome: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formColaborador.email}
                onChange={(e) => setFormColaborador({ ...formColaborador, email: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formColaborador.telefone}
                onChange={(e) => setFormColaborador({ ...formColaborador, telefone: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400"
              />
              <select
                value={formColaborador.funcao}
                onChange={(e) => setFormColaborador({ ...formColaborador, funcao: e.target.value as any })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="colaborador">Colaborador</option>
                <option value="gerente">Gerente</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAdicionarColaborador}
                  className="flex-1 bg-yellow-500 text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setShowNovoColaborador(false)}
                  className="flex-1 bg-zinc-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mensagens Fila de Espera */}
      {showMensagensFila && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Mensagens Automáticas - Fila de Espera</h3>
              <button
                onClick={() => setShowMensagensFila(false)}
                className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                <Bell className="w-4 h-4 inline mr-2" />
                Mensagens enviadas automaticamente para clientes que estavam na fila de espera e foram alocados em vagas desocupadas.
              </p>
            </div>

            <div className="space-y-3">
              {mensagensFilaEspera.map(mensagem => (
                <div key={mensagem.id} className="bg-zinc-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white">{mensagem.cliente}</h4>
                      <p className="text-sm text-zinc-400">{mensagem.telefone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      mensagem.status === 'enviado' ? 'bg-blue-500/20 text-blue-400' :
                      mensagem.status === 'confirmado' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {mensagem.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-400">Horário original:</p>
                      <p className="text-white font-medium">{mensagem.horarioOriginal}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Horário alocado:</p>
                      <p className="text-green-400 font-medium">{mensagem.horarioAlocado}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-600">
                    <p className="text-xs text-zinc-500">
                      Enviado em: {mensagem.dataEnvio}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {mensagensFilaEspera.length === 0 && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Nenhuma mensagem enviada recentemente</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
