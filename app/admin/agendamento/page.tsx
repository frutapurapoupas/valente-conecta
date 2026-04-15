'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Calendar, Clock, User, Check, X, Phone, ArrowLeft, Plus, Settings, Bell } from 'lucide-react'
import Link from 'next/link'

interface Agendamento {
  id: number
  items: any[]
  total: number
  tipo: string
  data_agendamento: string
  horario_agendamento: string
  status_agendamento: string
  profissional_id: string
  cliente_nome: string
  cliente_telefone: string
  posicao_fila: number | null
  observacao: string | null
  profissional?: { id: string; name: string; category: string }
}

export default function ServicosAgendamentoPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [profissional, setProfissional] = useState<any>(null)
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    carregarProfissional()
  }, [])

  useEffect(() => {
    if (profissional) {
      carregarAgendamentos()
    }
  }, [filtroData, profissional])

  const carregarProfissional = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setProfissional(data)
    }
    setLoading(false)
  }

  const carregarAgendamentos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/agendamentos?data=${filtroData}&profissional_id=${profissional?.id}`)
      const data = await response.json()
      setAgendamentos(data)
    } catch (error) {
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/agendamentos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status_agendamento: status })
      })
      if (response.ok) {
        carregarAgendamentos()
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const getServicoNome = (items: any[]) => {
    return items?.[0]?.name || 'Serviço'
  }

  const getServicoValor = (items: any[]) => {
    return items?.[0]?.total || items?.[0]?.unit_price || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-b border-blue-500/30 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-blue-400">Serviços</span> com Agendamento
                </h1>
                <p className="text-zinc-400 text-sm">
                  {profissional?.name || 'Meu Negócio'} • {profissional?.category || 'Profissional'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/agendamento/config" className="p-2 hover:bg-white/10 rounded-xl transition">
                <Settings className="w-5 h-5" />
              </Link>
              <button className="p-2 hover:bg-white/10 rounded-xl relative transition">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Filtros */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <Link 
            href="/admin/agendamento/novo" 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{agendamentos.length}</p>
            <p className="text-xs text-zinc-400">Total Hoje</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {agendamentos.filter(a => a.status_agendamento === 'PENDENTE').length}
            </p>
            <p className="text-xs text-zinc-400">Pendentes</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {agendamentos.filter(a => a.status_agendamento === 'CONFIRMADO').length}
            </p>
            <p className="text-xs text-zinc-400">Confirmados</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {agendamentos.filter(a => a.status_agendamento === 'CONCLUIDO').length}
            </p>
            <p className="text-xs text-zinc-400">Concluídos</p>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        {agendamentos.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl">
            <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">Nenhum agendamento para esta data</p>
            <Link 
              href="/admin/agendamento/novo" 
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition"
            >
              + Criar primeiro agendamento
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((ag) => (
              <div 
                key={ag.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-zinc-800 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-400">{getServicoNome(ag.items)}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                        <User className="w-4 h-4" />
                        {ag.cliente_nome}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Phone className="w-4 h-4" />
                        {ag.cliente_telefone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold mt-1">
                        R$ {getServicoValor(ag.items).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-400">{ag.horario_agendamento}</div>
                    <div className="mt-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        ag.status_agendamento === 'PENDENTE' ? 'bg-yellow-500/20 text-yellow-400' :
                        ag.status_agendamento === 'CONFIRMADO' ? 'bg-blue-500/20 text-blue-400' :
                        ag.status_agendamento === 'CONCLUIDO' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {ag.status_agendamento === 'PENDENTE' && '⏳ Pendente'}
                        {ag.status_agendamento === 'CONFIRMADO' && '✓ Confirmado'}
                        {ag.status_agendamento === 'CONCLUIDO' && '✅ Concluído'}
                        {ag.status_agendamento === 'CANCELADO' && '✗ Cancelado'}
                      </span>
                    </div>
                    {ag.posicao_fila && (
                      <p className="text-xs text-zinc-500 mt-2">Posição: {ag.posicao_fila}º</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {ag.status_agendamento === 'PENDENTE' && (
                      <>
                        <button
                          onClick={() => atualizarStatus(ag.id, 'CONFIRMADO')}
                          className="p-2 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition"
                          title="Confirmar"
                        >
                          <Check className="w-5 h-5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => atualizarStatus(ag.id, 'CANCELADO')}
                          className="p-2 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5 text-red-400" />
                        </button>
                      </>
                    )}
                    {ag.status_agendamento === 'CONFIRMADO' && (
                      <button
                        onClick={() => atualizarStatus(ag.id, 'CONCLUIDO')}
                        className="p-2 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition"
                        title="Concluir"
                      >
                        <Check className="w-5 h-5 text-emerald-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}