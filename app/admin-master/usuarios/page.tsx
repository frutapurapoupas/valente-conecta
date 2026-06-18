'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { 
  Users, Search, Lock, Unlock, Shield, Ban, CheckCircle, 
  Filter, ChevronDown, MoreVertical, UserPlus, Crown, Dumbbell,
  Calendar, Zap, Store, Building2, TrendingUp, Award, ArrowLeft
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  role: string
  plano?: string
  planoStatus: 'ativo' | 'pendente' | 'bloqueado' | 'expirado'
  dataPlano?: string
  dataExpiracao?: string
  indicacoes: number
  bonusAcumulado: number
  bonusDisponivel: number
  status: 'ativo' | 'bloqueado'
  motivoBloqueio?: string
  cidade?: string
}

export default function AdminMasterUsuariosPage() {
  const { isAdminMaster } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'bloqueado'>('todos')
  const [filtroPlano, setFiltroPlano] = useState<'todos' | 'ambulante' | 'academia' | 'profissional' | 'servico' | 'cidade'>('todos')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('todas')
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [showModalBloqueio, setShowModalBloqueio] = useState(false)
  const [motivoBloqueio, setMotivoBloqueio] = useState('')

  const cidades = ['todas', 'Valente', 'Feira de Santana', 'Salvador', 'Juazeiro', 'Jacobina']

  // Temporariamente desabilitado para testes
  // if (!isAdminMaster) {
  //   return (
  //     <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
  //         <p className="text-zinc-400">Apenas Admin Master pode acessar esta página</p>
  //       </div>
  //     </div>
  //   )
  // }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const usuariosFormatados: Usuario[] = (data || []).map(u => ({
        id: u.id,
        nome: u.nome || 'Sem nome',
        email: u.email || '',
        telefone: u.telefone,
        role: u.role || 'usuario',
        plano: u.plano,
        planoStatus: u.plano_status || 'pendente',
        dataPlano: u.data_plano,
        dataExpiracao: u.data_expiracao,
        indicacoes: u.indicacoes || 0,
        bonusAcumulado: u.bonus_acumulado || 0,
        bonusDisponivel: u.bonus_disponivel || 0,
        status: u.status || 'ativo',
        motivoBloqueio: u.motivo_bloqueio,
      }))

      setUsuarios(usuariosFormatados)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBloquearUsuario = async () => {
    if (!usuarioSelecionado || !motivoBloqueio) return

    try {
      await supabase
        .from('users')
        .update({
          status: 'bloqueado',
          motivo_bloqueio: motivoBloqueio,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioSelecionado.id)

      await loadUsuarios()
      setShowModalBloqueio(false)
      setMotivoBloqueio('')
      setUsuarioSelecionado(null)
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error)
    }
  }

  const handleDesbloquearUsuario = async (usuarioId: string) => {
    try {
      await supabase
        .from('users')
        .update({
          status: 'ativo',
          motivo_bloqueio: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioId)

      await loadUsuarios()
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error)
    }
  }

  const getIconePlano = (plano?: string) => {
    if (!plano) return <Users className="w-4 h-4" />
    if (plano.includes('ambulante')) return <Zap className="w-4 h-4 text-amber-400" />
    if (plano.includes('academia')) return <Dumbbell className="w-4 h-4 text-emerald-400" />
    if (plano.includes('profissional')) return <Crown className="w-4 h-4 text-yellow-400" />
    if (plano.includes('servico')) return <Calendar className="w-4 h-4 text-purple-400" />
    if (plano.includes('cidade')) return <Building2 className="w-4 h-4 text-blue-400" />
    return <Store className="w-4 h-4" />
  }

  const getCorStatusPlano = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'bloqueado': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'expirado': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const matchFiltro = !filtro || 
      u.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || u.status === filtroStatus
    
    const matchPlano = filtroPlano === 'todos' || 
      (filtroPlano === 'ambulante' && u.plano?.includes('ambulante')) ||
      (filtroPlano === 'academia' && u.plano?.includes('academia')) ||
      (filtroPlano === 'profissional' && u.plano?.includes('profissional')) ||
      (filtroPlano === 'servico' && u.plano?.includes('servico')) ||
      (filtroPlano === 'cidade' && u.plano?.includes('cidade'))

    const matchCidade = cidadeSelecionada === 'todas' || u.cidade === cidadeSelecionada

    return matchFiltro && matchStatus && matchPlano && matchCidade
  })

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === 'ativo').length,
    bloqueados: usuarios.filter(u => u.status === 'bloqueado').length,
    comPlano: usuarios.filter(u => u.planoStatus === 'ativo').length,
    totalBonus: usuarios.reduce((acc, u) => acc + u.bonusAcumulado, 0),
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-master/dashboard"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              title="Voltar para Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <Shield className="w-6 h-6 text-yellow-500" />
            <div>
              <h1 className="text-xl font-bold">Gestão de Usuários</h1>
              <p className="text-zinc-400 text-sm">Admin Master</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <Users className="w-5 h-5 text-indigo-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.total}</p>
            <p className="text-xs text-zinc-400">Total</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.ativos}</p>
            <p className="text-xs text-zinc-400">Ativos</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <Lock className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.bloqueados}</p>
            <p className="text-xs text-zinc-400">Bloqueados</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <Crown className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-black text-white">{stats.comPlano}</p>
            <p className="text-xs text-zinc-400">Com Plano</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <Award className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-black text-white">R$ {stats.totalBonus.toFixed(2)}</p>
            <p className="text-xs text-zinc-400">Bônus Total</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-zinc-400"
              />
            </div>
            <select
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
            >
              <option value="todas">Todas as Cidades</option>
              {cidades.filter(c => c !== 'todas').map(cidade => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
            <select
              value={filtroPlano}
              onChange={(e) => setFiltroPlano(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white"
            >
              <option value="todos">Todos os Planos</option>
              <option value="ambulante">Ambulantes</option>
              <option value="academia">Academia</option>
              <option value="profissional">Profissionais</option>
              <option value="servico">Serviços Agendamento</option>
              <option value="cidade">Plano Cidade</option>
            </select>
          </div>
        </div>

        {/* Lista de Usuários */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Plano</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Indicações</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase">Bônus</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-zinc-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{usuario.nome}</p>
                            <p className="text-xs text-zinc-400">{usuario.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getIconePlano(usuario.plano)}
                          <div>
                            <p className="text-sm font-medium text-white">{usuario.plano || 'Sem plano'}</p>
                            {usuario.dataExpiracao && (
                              <p className="text-xs text-zinc-400">
                                Exp: {new Date(usuario.dataExpiracao).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getCorStatusPlano(usuario.planoStatus)}`}>
                            {usuario.planoStatus.toUpperCase()}
                          </span>
                          {usuario.status === 'bloqueado' && (
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              BLOQUEADO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-white">{usuario.indicacoes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-emerald-400">R$ {usuario.bonusAcumulado.toFixed(2)}</p>
                          <p className="text-xs text-zinc-400">Disponível: R$ {usuario.bonusDisponivel.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {usuario.status === 'ativo' ? (
                            <button
                              onClick={() => {
                                setUsuarioSelecionado(usuario)
                                setShowModalBloqueio(true)
                              }}
                              className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                              title="Bloquear usuário"
                            >
                              <Lock className="w-4 h-4 text-red-400" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDesbloquearUsuario(usuario.id)}
                              className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                              title="Desbloquear usuário"
                            >
                              <Unlock className="w-4 h-4 text-green-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {usuariosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Bloqueio */}
      {showModalBloqueio && usuarioSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Bloquear Usuário</h3>
                <p className="text-sm text-zinc-400">{usuarioSelecionado.nome}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Motivo do bloqueio</label>
                <textarea
                  value={motivoBloqueio}
                  onChange={(e) => setMotivoBloqueio(e.target.value)}
                  placeholder="Descreva o motivo do bloqueio..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModalBloqueio(false)
                    setMotivoBloqueio('')
                    setUsuarioSelecionado(null)
                  }}
                  className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBloquearUsuario}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
