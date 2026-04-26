'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Shield, Crown, Store, User, MapPin, Phone, Mail, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  endereco: string
  cidade: string
  localizador: string
  plano: string
  planoStatus: 'ativo' | 'pendente' | 'expirado'
  dataCadastro: string
  status: 'ativo' | 'bloqueado' | 'pendente'
  tipo: 'usuario' | 'empresa' | 'profissional' | 'ambulante'
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      // Simulação de dados - em produção buscar do Supabase
      const mockUsuarios: Usuario[] = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '(75) 91234-5678',
          cpf: '123.456.789-00',
          endereco: 'Rua Principal, 123',
          cidade: 'Valente - BA',
          localizador: '-12.456, -41.234',
          plano: 'Usuário Grátis',
          planoStatus: 'ativo',
          dataCadastro: '2024-01-15',
          status: 'ativo',
          tipo: 'usuario'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@email.com',
          telefone: '(75) 99876-5432',
          cpf: '987.654.321-00',
          endereco: 'Av. Central, 456',
          cidade: 'Valente - BA',
          localizador: '-12.457, -41.235',
          plano: 'Multi-Cidade',
          planoStatus: 'ativo',
          dataCadastro: '2024-02-20',
          status: 'ativo',
          tipo: 'usuario'
        },
        {
          id: '3',
          nome: 'Mercado Central Valente',
          email: 'contato@mercado.com',
          telefone: '(75) 91111-2222',
          cpf: '12.345.678/0001-90',
          endereco: 'Praça Central, s/n',
          cidade: 'Valente - BA',
          localizador: '-12.458, -41.236',
          plano: 'Básico',
          planoStatus: 'ativo',
          dataCadastro: '2024-01-10',
          status: 'ativo',
          tipo: 'empresa'
        },
        {
          id: '4',
          nome: 'Barbearia Valente',
          email: 'barbearia@email.com',
          telefone: '(75) 93333-4444',
          cpf: '98.765.432/0001-10',
          endereco: 'Rua da Barbearia, 789',
          cidade: 'Valente - BA',
          localizador: '-12.459, -41.237',
          plano: 'Serviço com Agendamento Básico',
          planoStatus: 'ativo',
          dataCadastro: '2024-03-05',
          status: 'ativo',
          tipo: 'profissional'
        },
        {
          id: '5',
          nome: 'Pedro Oliveira',
          email: 'pedro@email.com',
          telefone: '(75) 95555-6666',
          cpf: '456.789.123-00',
          endereco: 'Travista do Mercado, 321',
          cidade: 'Valente - BA',
          localizador: '-12.460, -41.238',
          plano: 'Ambulante Básico',
          planoStatus: 'pendente',
          dataCadastro: '2024-03-25',
          status: 'pendente',
          tipo: 'ambulante'
        },
      ]
      setUsuarios(mockUsuarios)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const matchFiltro = filtro === '' || 
      u.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      u.email.toLowerCase().includes(filtro.toLowerCase()) ||
      u.telefone.includes(filtro) ||
      u.cpf.includes(filtro)
    
    const matchStatus = filtroStatus === 'todos' || u.status === filtroStatus
    const matchTipo = filtroTipo === 'todos' || u.tipo === filtroTipo
    
    return matchFiltro && matchStatus && matchTipo
  })

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'empresa': return <Store className="w-4 h-4 text-blue-400" />
      case 'profissional': return <Crown className="w-4 h-4 text-violet-400" />
      case 'ambulante': return <User className="w-4 h-4 text-amber-400" />
      default: return <User className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ativo</span>
      case 'pendente': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
      case 'bloqueado': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Bloqueado</span>
      default: return <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 text-xs font-bold rounded-full">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-zinc-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black italic text-indigo-400 uppercase leading-none">Usuários</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Administração &middot; Valente Conecta</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <span className="text-zinc-400 text-sm">Total: </span>
              <span className="text-white font-bold">{usuarios.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-24">
        {/* Filtros */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="usuario">Usuário</option>
              <option value="empresa">Empresa</option>
              <option value="profissional">Profissional</option>
              <option value="ambulante">Ambulante</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 mt-4">Carregando usuários...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Usuário</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Contato</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Endereço</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Plano</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Cadastro</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-zinc-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                            {getTipoIcon(usuario.tipo)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{usuario.nome}</p>
                            <p className="text-xs text-zinc-500">{usuario.cpf}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            {usuario.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            {usuario.telefone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {usuario.endereco}
                          </div>
                          <div className="text-xs text-zinc-500">{usuario.cidade}</div>
                          <div className="text-xs text-zinc-600 font-mono">{usuario.localizador}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-bold text-white">{usuario.plano}</p>
                          <span className={`text-xs ${
                            usuario.planoStatus === 'ativo' ? 'text-emerald-400' :
                            usuario.planoStatus === 'pendente' ? 'text-amber-400' :
                            'text-red-400'
                          }`}>
                            {usuario.planoStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(usuario.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors" title="Ver detalhes">
                            <Eye className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-4 h-4 text-zinc-400" />
                          </button>
                          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors" title="Bloquear/Desbloquear">
                            <Shield className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ativos', valor: usuarios.filter(u => u.status === 'ativo').length, cor: 'text-emerald-400' },
            { label: 'Pendentes', valor: usuarios.filter(u => u.status === 'pendente').length, cor: 'text-amber-400' },
            { label: 'Bloqueados', valor: usuarios.filter(u => u.status === 'bloqueado').length, cor: 'text-red-400' },
            { label: 'Empresas', valor: usuarios.filter(u => u.tipo === 'empresa').length, cor: 'text-blue-400' },
          ].map(item => (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className={`text-2xl font-black ${item.cor}`}>{item.valor}</p>
              <p className="text-zinc-500 text-xs font-bold mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
