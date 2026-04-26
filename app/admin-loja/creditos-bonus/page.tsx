'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Gift, DollarSign, Calendar, Check, AlertCircle, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isMockMode } from '@/lib/supabase-client-switch'

interface CreditoBonus {
  id: string
  usuarioId: string
  valor: number
  dataGeracao: string
  dataResgate?: string
  lojaIdResgate?: string
  status: 'disponivel' | 'resgatado' | 'pendente'
  usuarioNome?: string
}

export default function CreditosBonusLojaPage() {
  const [loading, setLoading] = useState(false)
  const [creditos, setCreditos] = useState<CreditoBonus[]>([])
  const [filtro, setFiltro] = useState<'todos' | 'disponivel' | 'pendente' | 'resgatado' | 'cancelado'>('todos')
  const [totalDisponivel, setTotalDisponivel] = useState(0)
  const [totalPendente, setTotalPendente] = useState(0)
  const [valorBonusConfigurado, setValorBonusConfigurado] = useState(2)
  const [editandoValorBonus, setEditandoValorBonus] = useState(false)

  useEffect(() => {
    loadCreditos()
  }, [filtro])

  const loadCreditos = async () => {
    setLoading(true)
    try {
      if (isMockMode()) {
        // Mock data
        const mockCreditos: CreditoBonus[] = [
          {
            id: '1',
            usuarioId: 'user1',
            valor: 2,
            dataGeracao: new Date().toISOString(),
            status: 'disponivel',
            usuarioNome: 'João Silva'
          },
          {
            id: '2',
            usuarioId: 'user2',
            valor: 2,
            dataGeracao: new Date().toISOString(),
            status: 'pendente',
            lojaIdResgate: 'loja-id',
            usuarioNome: 'Maria Santos'
          }
        ]
        
        const filtrados = filtro === 'todos' 
          ? mockCreditos 
          : mockCreditos.filter(c => c.status === filtro)
        
        setCreditos(filtrados)
        setTotalDisponivel(mockCreditos.filter(c => c.status === 'disponivel').reduce((acc, c) => acc + c.valor, 0))
        setTotalPendente(mockCreditos.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0))
        return
      }

      // Buscar créditos do banco
      let query = supabase
        .from('creditos_bonus_usuario_comum')
        .select(`
          *,
          users!creditos_bonus_usuario_comum_usuario_id_fkey (
            nome
          )
        `)

      if (filtro !== 'todos') {
        query = query.eq('status', filtro)
      }

      const { data, error } = await query.order('data_geracao', { ascending: false })

      if (error) throw error

      const creditosFormatados = (data || []).map(item => ({
        id: item.id,
        usuarioId: item.usuario_id,
        valor: item.valor,
        dataGeracao: item.data_geracao,
        dataResgate: item.data_resgate,
        lojaIdResgate: item.loja_id_resgate,
        status: item.status,
        usuarioNome: item.users?.nome || 'Usuário'
      }))

      setCreditos(creditosFormatados)
      setTotalDisponivel(creditosFormatados.filter(c => c.status === 'disponivel').reduce((acc, c) => acc + c.valor, 0))
      setTotalPendente(creditosFormatados.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0))
    } catch (error) {
      console.error('Erro ao carregar créditos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarCredito = async (creditoId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este crédito? Esta ação não pode ser desfeita.')) return
    
    setLoading(true)
    try {
      if (isMockMode()) {
        alert('Mock: Crédito cancelado!')
        loadCreditos()
        return
      }

      const { error } = await supabase
        .from('creditos_bonus_usuario_comum')
        .update({
          status: 'cancelado',
          data_resgate: new Date().toISOString()
        })
        .eq('id', creditoId)

      if (error) throw error

      alert('Crédito cancelado com sucesso!')
      loadCreditos()
    } catch (error) {
      console.error('Erro ao cancelar crédito:', error)
      alert('Erro ao cancelar crédito')
    } finally {
      setLoading(false)
    }
  }

  const handleReverterResgate = async (creditoId: string) => {
    if (!confirm('Tem certeza que deseja reverter o resgate? O crédito voltará a ficar disponível.')) return
    
    setLoading(true)
    try {
      if (isMockMode()) {
        alert('Mock: Resgate revertido!')
        loadCreditos()
        return
      }

      const { error } = await supabase
        .from('creditos_bonus_usuario_comum')
        .update({
          status: 'disponivel',
          data_resgate: null
        })
        .eq('id', creditoId)

      if (error) throw error

      alert('Resgate revertido com sucesso!')
      loadCreditos()
    } catch (error) {
      console.error('Erro ao reverter resgate:', error)
      alert('Erro ao reverter resgate')
    } finally {
      setLoading(false)
    }
  }

  const exportarRelatorio = () => {
    const csv = [
      ['ID', 'Usuário', 'Valor', 'Data Geração', 'Status', 'Data Resgate'].join(','),
      ...creditos.map(c => [
        c.id,
        c.usuarioNome,
        c.valor.toFixed(2),
        new Date(c.dataGeracao).toLocaleDateString('pt-BR'),
        c.status,
        c.dataResgate ? new Date(c.dataResgate).toLocaleDateString('pt-BR') : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creditos-bonus-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Disponível</span>
      case 'pendente':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">Pendente</span>
      case 'resgatado':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Resgatado</span>
      case 'cancelado':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">Cancelado</span>
      default:
        return <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 rounded-full text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin-loja" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Créditos de Bônus</h1>
          <button
            onClick={exportarRelatorio}
            className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition"
            title="Exportar relatório"
          >
            <Download className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-green-400" />
              <span className="text-sm text-zinc-400">Disponível</span>
            </div>
            <p className="text-3xl font-black text-green-400">R$ {totalDisponivel.toFixed(2)}</p>
            <p className="text-xs text-zinc-400 mt-1">Pronto para uso</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-orange-400" />
              <span className="text-sm text-zinc-400">Pendente</span>
            </div>
            <p className="text-3xl font-black text-orange-400">R$ {totalPendente.toFixed(2)}</p>
            <p className="text-xs text-zinc-400 mt-1">Aguardando resgate</p>
          </div>
        </div>

        {/* Configuração de Valor do Bônus */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Configuração de Bônus</h3>
            <button
              onClick={() => setEditandoValorBonus(!editandoValorBonus)}
              className="px-3 py-1 bg-yellow-500 text-zinc-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition"
            >
              {editandoValorBonus ? 'Cancelar' : 'Editar'}
            </button>
          </div>
          
          {!editandoValorBonus ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Valor por indicação:</p>
                <p className="text-2xl font-bold text-green-400">R$ {valorBonusConfigurado.toFixed(2)}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-zinc-400">Nota para clientes:</p>
                <p className="text-sm text-zinc-300">Indique amigos e ganhe R$ {valorBonusConfigurado.toFixed(2)} de bônus para usar em nossos serviços!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Valor por indicação (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorBonusConfigurado}
                  onChange={(e) => setValorBonusConfigurado(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-xl font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Nota explicativa para clientes</label>
                <textarea
                  rows={3}
                  value={`Indique amigos e ganhe R$ ${valorBonusConfigurado.toFixed(2)} de bônus para usar em nossos serviços!`}
                  readOnly
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300"
                />
              </div>
              <button
                onClick={() => setEditandoValorBonus(false)}
                className="w-full bg-yellow-500 text-zinc-900 px-4 py-3 rounded-lg font-bold hover:bg-yellow-400 transition"
              >
                Salvar Configuração
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              filtro === 'todos' ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('disponivel')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              filtro === 'disponivel' ? 'bg-green-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setFiltro('pendente')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              filtro === 'pendente' ? 'bg-orange-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltro('resgatado')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              filtro === 'resgatado' ? 'bg-blue-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Resgatados
          </button>
          <button
            onClick={() => setFiltro('cancelado')}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${
              filtro === 'cancelado' ? 'bg-red-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Cancelados
          </button>
        </div>

        {/* Lista de Créditos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-zinc-400">Carregando...</p>
            </div>
          ) : creditos.length === 0 ? (
            <div className="p-8 text-center">
              <Gift className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Nenhum crédito encontrado</p>
              <p className="text-sm text-zinc-400 mt-1">Ajuste os filtros ou aguarde novos créditos</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {creditos.map(credito => (
                <div key={credito.id} className="p-4 hover:bg-zinc-800/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-white">{credito.usuarioNome}</span>
                        {getStatusBadge(credito.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span>Valor: R$ {credito.valor.toFixed(2)}</span>
                        <span>Gerado: {new Date(credito.dataGeracao).toLocaleDateString('pt-BR')}</span>
                        {credito.dataResgate && (
                          <span>Resgatado: {new Date(credito.dataResgate).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>

                    {/* Ações do Admin - Intervenção Manual */}
                    {credito.status === 'disponivel' && (
                      <button
                        onClick={() => handleCancelarCredito(credito.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
                        title="Cancelar este crédito"
                      >
                        Cancelar
                      </button>
                    )}

                    {credito.status === 'pendente' && (
                      <button
                        onClick={() => handleCancelarCredito(credito.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
                        title="Cancelar este crédito"
                      >
                        Cancelar
                      </button>
                    )}

                    {credito.status === 'resgatado' && (
                      <button
                        onClick={() => handleReverterResgate(credito.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 rounded-lg font-bold text-sm hover:bg-orange-700 transition disabled:opacity-50"
                        title="Reverter resgate"
                      >
                        Reverter
                      </button>
                    )}

                    {credito.status === 'cancelado' && (
                      <span className="text-zinc-500 text-sm">Cancelado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-zinc-400 mt-0.5" />
            <div className="text-sm text-zinc-400 space-y-2">
              <p><strong className="text-white">Sistema Automático de Créditos:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Créditos são disponibilizados automaticamente quando ganhos</li>
                <li>Resgate é automático quando cliente usa o crédito</li>
                <li>Admin pode cancelar créditos disponíveis/pendentes se necessário</li>
                <li>Admin pode reverter resgates em caso de erro ou devolução</li>
                <li>Exporte o relatório para análise detalhada</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
