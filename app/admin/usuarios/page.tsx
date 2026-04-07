'use client'

import { useState } from 'react'
import { Search, MoreVertical, CheckCircle, XCircle, AlertCircle, Eye, Ban, RefreshCw, UserPlus } from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string
  tipo: 'fisica' | 'juridica'
  plano: 'gratis' | 'basico' | 'premium'
  status: 'ativo' | 'suspenso' | 'pendente'
  dataCadastro: string
  ultimoAcesso: string
}

export default function AdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'suspenso' | 'pendente'>('todos')

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: '1', nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999', tipo: 'fisica', plano: 'gratis', status: 'ativo', dataCadastro: '01/04/2026', ultimoAcesso: 'Hoje' },
    { id: '2', nome: 'Padaria do Zé', email: 'contato@padariadoze.com', telefone: '(11) 98888-8888', tipo: 'juridica', plano: 'basico', status: 'ativo', dataCadastro: '28/03/2026', ultimoAcesso: 'Ontem' },
    { id: '3', nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 97777-7777', tipo: 'fisica', plano: 'premium', status: 'suspenso', dataCadastro: '15/03/2026', ultimoAcesso: 'Há 5 dias' },
    { id: '4', nome: 'Academia Fitness', email: 'contato@academiafitness.com', telefone: '(11) 96666-6666', tipo: 'juridica', plano: 'premium', status: 'ativo', dataCadastro: '10/03/2026', ultimoAcesso: 'Hoje' },
    { id: '5', nome: 'Carlos Pereira', email: 'carlos@email.com', telefone: '(11) 95555-5555', tipo: 'fisica', plano: 'gratis', status: 'pendente', dataCadastro: '05/04/2026', ultimoAcesso: 'Nunca' },
  ])

  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroStatus !== 'todos' && u.status !== filtroStatus) return false
    if (searchTerm && !u.nome.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const alterarStatus = (id: string, novoStatus: 'ativo' | 'suspenso' | 'pendente') => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, status: novoStatus } : u))
    alert(`✅ Status do usuário alterado para ${novoStatus}`)
  }

  const alterarPlano = (id: string, novoPlano: 'gratis' | 'basico' | 'premium') => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, plano: novoPlano } : u))
    alert(`✅ Plano alterado para ${novoPlano.toUpperCase()}`)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ativo': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ativo</span>
      case 'suspenso': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Suspenso</span>
      case 'pendente': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pendente</span>
      default: return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-gray-500">Gerencie todos os usuários da plataforma</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['todos', 'ativo', 'suspenso', 'pendente'].map(status => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  filtroStatus === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Usuário</th>
                <th className="text-left p-4 text-sm font-semibold">Contato</th>
                <th className="text-left p-4 text-sm font-semibold">Tipo</th>
                <th className="text-left p-4 text-sm font-semibold">Plano</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="text-left p-4 text-sm font-semibold">Último Acesso</th>
                <th className="text-left p-4 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{usuario.nome}</p>
                      <p className="text-xs text-gray-500">ID: {usuario.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{usuario.email}</p>
                    <p className="text-xs text-gray-500">{usuario.telefone}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${usuario.tipo === 'juridica' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {usuario.tipo === 'juridica' ? 'PJ' : 'PF'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={usuario.plano}
                      onChange={(e) => alterarPlano(usuario.id, e.target.value as any)}
                      className="text-sm border rounded-lg px-2 py-1"
                    >
                      <option value="gratis">Grátis</option>
                      <option value="basico">Básico</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-4">{getStatusBadge(usuario.status)}</td>
                  <td className="p-4 text-sm text-gray-500">{usuario.ultimoAcesso}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </button>
                      {usuario.status === 'ativo' ? (
                        <button onClick={() => alterarStatus(usuario.id, 'suspenso')} className="p-1 text-orange-500 hover:bg-orange-50 rounded" title="Suspender">
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : usuario.status === 'suspenso' ? (
                        <button onClick={() => alterarStatus(usuario.id, 'ativo')} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Reativar">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}