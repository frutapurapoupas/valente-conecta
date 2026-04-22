'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  AlertCircle, ChevronLeft, Download, Printer, Search,
  Filter, DollarSign, TrendingUp, Users, Clock as ClockIcon,
  MessageCircle, Check, Ban, Loader2
} from 'lucide-react'

interface Agendamento {
  id: string
  cliente: string
  telefone: string
  servico: string
  profissional: string
  data: string
  horario: string
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado'
  valor: number
  observacoes?: string
  dataCriacao: string
}

interface CaixaMovimento {
  id: string
  tipo: 'entrada' | 'saida'
  descricao: string
  valor: number
  data: string
  categoria: string
  agendamentoId?: string
}

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    { id: '1', cliente: 'João Silva', telefone: '(75) 98888-1111', servico: 'Limpeza Dentária', profissional: 'Dra. Ana Silva', data: '2026-04-22', horario: '10:00', status: 'pendente', valor: 120, dataCriacao: '2026-04-21' },
    { id: '2', cliente: 'Maria Santos', telefone: '(75) 98888-2222', servico: 'Corte Masculino', profissional: 'João Santos', data: '2026-04-22', horario: '14:00', status: 'confirmado', valor: 45, dataCriacao: '2026-04-20' },
    { id: '3', cliente: 'Carlos Souza', telefone: '(75) 98888-3333', servico: 'Fisioterapia', profissional: 'Dr. Carlos Mota', data: '2026-04-23', horario: '09:00', status: 'pendente', valor: 120, dataCriacao: '2026-04-21' },
    { id: '4', cliente: 'Ana Paula', telefone: '(75) 98888-4444', servico: 'Consulta Psicologia', profissional: 'Maria Oliveira', data: '2026-04-22', horario: '15:00', status: 'concluido', valor: 180, dataCriacao: '2026-04-15' },
  ])

  const [caixa, setCaixa] = useState<CaixaMovimento[]>([
    { id: 'c1', tipo: 'entrada', descricao: 'Limpeza Dentária - João Silva', valor: 120, data: '2026-04-22', categoria: 'Serviços', agendamentoId: '1' },
    { id: 'c2', tipo: 'entrada', descricao: 'Corte Masculino - Maria Santos', valor: 45, data: '2026-04-22', categoria: 'Serviços', agendamentoId: '2' },
    { id: 'c3', tipo: 'saida', descricao: 'Comissão Profissional', valor: 50, data: '2026-04-22', categoria: 'Despesas' },
  ])

  const [aba, setAba] = useState<'agendamentos' | 'caixa' | 'relatorios'>('agendamentos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false)

  const agendamentosFiltrados = agendamentos.filter(a => {
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus
    const matchBusca = a.cliente.toLowerCase().includes(busca.toLowerCase()) || a.servico.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  const caixaFiltrado = caixa.filter(m => {
    if (dataInicio && m.data < dataInicio) return false
    if (dataFim && m.data > dataFim) return false
    return true
  })

  const totalEntradas = caixaFiltrado.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0)
  const totalSaidas = caixaFiltrado.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0)
  const saldo = totalEntradas - totalSaidas

  const atualizarStatus = (id: string, novoStatus: Agendamento['status']) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a))
    
    // Se confirmado, adicionar ao caixa
    if (novoStatus === 'confirmado') {
      const agendamento = agendamentos.find(a => a.id === id)
      if (agendamento) {
        setCaixa(prev => [...prev, {
          id: Math.random().toString(36).substring(2),
          tipo: 'entrada',
          descricao: `${agendamento.servico} - ${agendamento.cliente}`,
          valor: agendamento.valor,
          data: new Date().toISOString().split('T')[0],
          categoria: 'Serviços',
          agendamentoId: id
        }])
      }
    }
  }

  const gerarRelatorioPDF = () => {
    setGerandoRelatorio(true)
    setTimeout(() => {
      const relatorio = `
        RELATÓRIO DE AGENDAMENTOS
        Período: ${dataInicio || 'início'} a ${dataFim || 'hoje'}
        Total de agendamentos: ${agendamentosFiltrados.length}
        Total confirmados: ${agendamentosFiltrados.filter(a => a.status === 'confirmado').length}
        Total concluídos: ${agendamentosFiltrados.filter(a => a.status === 'concluido').length}
        Total cancelados: ${agendamentosFiltrados.filter(a => a.status === 'cancelado').length}
        Receita total: R$ ${totalEntradas.toFixed(2)}
        Despesas: R$ ${totalSaidas.toFixed(2)}
        Saldo: R$ ${saldo.toFixed(2)}
      `
      const blob = new Blob([relatorio], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio_agendamentos_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      URL.revokeObjectURL(url)
      setGerandoRelatorio(false)
    }, 1000)
  }

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'pendente': return { label: 'Pendente', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: ClockIcon }
      case 'confirmado': return { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: CheckCircle }
      case 'concluido': return { label: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Check }
      case 'cancelado': return { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle }
      default: return { label: 'Desconhecido', color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: AlertCircle }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/admin-loja" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Gestão de Agendamentos</h1>
          <button className="p-2 bg-zinc-800 rounded-xl">
            <Download className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Abas */}
      <div className="flex border-b border-zinc-800">
        <button onClick={() => setAba('agendamentos')} className={`flex-1 py-3 text-sm font-bold uppercase transition-all ${aba === 'agendamentos' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500'}`}>Agendamentos</button>
        <button onClick={() => setAba('caixa')} className={`flex-1 py-3 text-sm font-bold uppercase transition-all ${aba === 'caixa' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500'}`}>Caixa</button>
        <button onClick={() => setAba('relatorios')} className={`flex-1 py-3 text-sm font-bold uppercase transition-all ${aba === 'relatorios' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500'}`}>Relatórios</button>
      </div>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {aba === 'agendamentos' && (
          <>
            {/* Busca e Filtros */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente ou serviço..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
              </div>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white">
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="confirmado">Confirmados</option>
                <option value="concluido">Concluídos</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-yellow-400 text-xs font-bold">Pendentes</p>
                <p className="text-2xl font-black text-white">{agendamentos.filter(a => a.status === 'pendente').length}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-xs font-bold">Receita do Dia</p>
                <p className="text-2xl font-black text-white">R$ {agendamentos.filter(a => a.data === new Date().toISOString().split('T')[0] && a.status === 'confirmado').reduce((s, a) => s + a.valor, 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Lista de agendamentos */}
            <div className="space-y-3">
              {agendamentosFiltrados.map(agendamento => {
                const StatusInfo = getStatusInfo(agendamento.status)
                return (
                  <div key={agendamento.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{agendamento.cliente}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${StatusInfo.bg} ${StatusInfo.color}`}>{StatusInfo.label}</span>
                        </div>
                        <p className="text-sm text-zinc-400">{agendamento.servico}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(agendamento.data).toLocaleDateString('pt-BR')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{agendamento.horario}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{agendamento.profissional}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-yellow-400">R$ {agendamento.valor.toFixed(2)}</p>
                        <button onClick={() => window.open(`https://wa.me/${agendamento.telefone.replace(/\D/g, '')}`, '_blank')} className="mt-1 text-green-400">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {agendamento.status === 'pendente' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                        <button onClick={() => atualizarStatus(agendamento.id, 'confirmado')} className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Confirmar</button>
                        <button onClick={() => atualizarStatus(agendamento.id, 'cancelado')} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1"><Ban className="w-4 h-4" /> Cancelar</button>
                      </div>
                    )}
                    {agendamento.status === 'confirmado' && (
                      <button onClick={() => atualizarStatus(agendamento.id, 'concluido')} className="w-full mt-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Marcar como Concluído</button>
                    )}
                  </div>
                )
              })}
              {agendamentosFiltrados.length === 0 && (
                <div className="text-center py-12"><p className="text-zinc-500">Nenhum agendamento encontrado</p></div>
              )}
            </div>
          </>
        )}

        {aba === 'caixa' && (
          <div className="space-y-4">
            {/* Filtro de período */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <h3 className="font-bold text-white mb-3">Filtrar por período</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center"><p className="text-emerald-400 text-xs font-bold">Entradas</p><p className="text-xl font-black text-white">R$ {totalEntradas.toFixed(2)}</p></div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center"><p className="text-red-400 text-xs font-bold">Saídas</p><p className="text-xl font-black text-white">R$ {totalSaidas.toFixed(2)}</p></div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center"><p className="text-yellow-400 text-xs font-bold">Saldo</p><p className={`text-xl font-black ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>R$ {saldo.toFixed(2)}</p></div>
            </div>

            {/* Extrato bancário */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-800 p-3 flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Extrato de Movimentações</h3>
                <button onClick={() => window.print()} className="text-zinc-400 hover:text-white"><Printer className="w-4 h-4" /></button>
              </div>
              <div className="divide-y divide-zinc-800">
                {caixaFiltrado.map(movimento => (
                  <div key={movimento.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{movimento.descricao}</p>
                      <p className="text-xs text-zinc-500">{new Date(movimento.data).toLocaleDateString('pt-BR')} • {movimento.categoria}</p>
                    </div>
                    <p className={`font-bold ${movimento.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {movimento.tipo === 'entrada' ? '+' : '-'} R$ {movimento.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
                {caixaFiltrado.length === 0 && <div className="p-8 text-center text-zinc-500">Nenhuma movimentação no período</div>}
              </div>
            </div>
          </div>
        )}

        {aba === 'relatorios' && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white">Gerar Relatório</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-zinc-500 block mb-1">Data inicial</label><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
                <div><label className="text-xs text-zinc-500 block mb-1">Data final</label><input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
              </div>
              <button onClick={gerarRelatorioPDF} disabled={gerandoRelatorio} className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold flex items-center justify-center gap-2">
                {gerandoRelatorio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {gerandoRelatorio ? 'Gerando...' : 'Exportar Relatório (PDF/TXT)'}
              </button>
            </div>

            {/* Estatísticas */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-white">Estatísticas do Período</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-zinc-400">Total de agendamentos</span><span className="text-white font-bold">{agendamentos.filter(a => (!dataInicio || a.data >= dataInicio) && (!dataFim || a.data <= dataFim)).length}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Taxa de ocupação</span><span className="text-white font-bold">{Math.round((agendamentos.filter(a => a.status === 'confirmado' || a.status === 'concluido').length / Math.max(agendamentos.length, 1)) * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Ticket médio</span><span className="text-white font-bold">R$ {(totalEntradas / Math.max(agendamentos.filter(a => a.status === 'confirmado' || a.status === 'concluido').length, 1)).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}