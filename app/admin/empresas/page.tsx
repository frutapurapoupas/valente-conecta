'use client'

import { useState } from 'react'
import { Search, Star, MapPin, Phone, Mail, CheckCircle, XCircle, Eye, Edit, Trash2, Award, Calendar, Clock, Image, MessageCircle } from 'lucide-react'

interface Empresa {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  tipo: 'empresa' | 'profissional'
  plano: 'gratis' | 'basico' | 'premium'
  status: 'ativo' | 'suspenso' | 'pendente'
  classificacao: number
  totalAvaliacoes: number
  dataCadastro: string
  servicos?: string[]
  agenda?: AgendaItem[]
}

interface AgendaItem {
  id: string
  data: string
  horario: string
  servico: string
  cliente: string
  status: 'agendado' | 'realizado' | 'cancelado'
}

interface Comentario {
  id: string
  cliente: string
  data: string
  comentario: string
  classificacao: number
  resposta?: string
}

export default function AdminEmpresas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'empresa' | 'profissional'>('todos')
  const [filtroPlano, setFiltroPlano] = useState<'todos' | 'gratis' | 'basico' | 'premium'>('todos')
  const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [empresas, setEmpresas] = useState<Empresa[]>([
    { 
      id: '1', 
      nome: 'Padaria do Zé', 
      cnpj: '12.345.678/0001-90',
      email: 'contato@padariadoze.com', 
      telefone: '(11) 98888-8888',
      endereco: 'Rua das Flores, 123 - Centro',
      tipo: 'empresa',
      plano: 'basico',
      status: 'ativo',
      classificacao: 4.8,
      totalAvaliacoes: 127,
      dataCadastro: '28/03/2026'
    },
    { 
      id: '2', 
      nome: 'Maria Personal Trainer', 
      cnpj: '98.765.432/0001-10',
      email: 'maria@personal.com', 
      telefone: '(11) 97777-7777',
      endereco: 'Av. Paulista, 1000 - Bela Vista',
      tipo: 'profissional',
      plano: 'premium',
      status: 'ativo',
      classificacao: 4.9,
      totalAvaliacoes: 89,
      dataCadastro: '15/03/2026',
      servicos: ['Treino Personalizado', 'Avaliação Física', 'Acompanhamento Online'],
      agenda: [
        { id: '1', data: '10/04/2026', horario: '09:00', servico: 'Treino Personalizado', cliente: 'João Silva', status: 'agendado' },
        { id: '2', data: '10/04/2026', horario: '10:30', servico: 'Avaliação Física', cliente: 'Maria Santos', status: 'agendado' },
      ]
    },
    { 
      id: '3', 
      nome: 'Supermercado Valente', 
      cnpj: '45.678.901/0001-23',
      email: 'contato@supervalente.com', 
      telefone: '(11) 96666-6666',
      endereco: 'Rua Augusta, 500 - Consolação',
      tipo: 'empresa',
      plano: 'premium',
      status: 'ativo',
      classificacao: 4.7,
      totalAvaliacoes: 234,
      dataCadastro: '10/03/2026'
    },
    { 
      id: '4', 
      nome: 'Carlos Mecânico', 
      cnpj: '67.890.123/0001-45',
      email: 'carlos@mecanico.com', 
      telefone: '(11) 95555-5555',
      endereco: 'Rua da Consolação, 2000 - Cerqueira César',
      tipo: 'profissional',
      plano: 'basico',
      status: 'pendente',
      classificacao: 0,
      totalAvaliacoes: 0,
      dataCadastro: '05/04/2026',
      servicos: ['Troca de Óleo', 'Revisão Preventiva', 'Suspensão']
    },
  ])

  const [comentarios, setComentarios] = useState<Comentario[]>([
    { id: '1', cliente: 'João Silva', data: '01/04/2026', comentario: 'Ótimo atendimento! Profissional muito competente.', classificacao: 5 },
    { id: '2', cliente: 'Maria Santos', data: '28/03/2026', comentario: 'Recomendo! Serviço de qualidade.', classificacao: 4 },
  ])

  const empresasFiltradas = empresas.filter(e => {
    if (filtroTipo !== 'todos' && e.tipo !== filtroTipo) return false
    if (filtroPlano !== 'todos' && e.plano !== filtroPlano) return false
    if (searchTerm && !e.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const alterarStatus = (id: string, novoStatus: 'ativo' | 'suspenso' | 'pendente') => {
    setEmpresas(empresas.map(e => e.id === id ? { ...e, status: novoStatus } : e))
    alert(`✅ Status da empresa alterado para ${novoStatus}`)
  }

  const alterarPlano = (id: string, novoPlano: 'gratis' | 'basico' | 'premium') => {
    setEmpresas(empresas.map(e => e.id === id ? { ...e, plano: novoPlano } : e))
    alert(`✅ Plano alterado para ${novoPlano.toUpperCase()}`)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ativo': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">✓ Ativo</span>
      case 'suspenso': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">✗ Suspenso</span>
      case 'pendente': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">⏳ Pendente</span>
      default: return null
    }
  }

  const getPlanoBadge = (plano: string) => {
    switch(plano) {
      case 'gratis': return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">Grátis</span>
      case 'basico': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Básico</span>
      case 'premium': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">Premium</span>
      default: return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Empresas e Profissionais</h1>
          <p className="text-gray-500">Gerencie todos os estabelecimentos e prestadores de serviço</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
          <Award className="w-5 h-5" />
          Nova Empresa
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
                placeholder="Buscar por nome..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="todos">Todos os tipos</option>
            <option value="empresa">Empresas</option>
            <option value="profissional">Profissionais</option>
          </select>
          <select
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value as any)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="todos">Todos os planos</option>
            <option value="gratis">Grátis</option>
            <option value="basico">Básico</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="space-y-4">
        {empresasFiltradas.map(empresa => (
          <div key={empresa.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{empresa.nome}</h3>
                  {getStatusBadge(empresa.status)}
                  {getPlanoBadge(empresa.plano)}
                  {empresa.classificacao > 0 && (
                    <span className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      {empresa.classificacao} ({empresa.totalAvaliacoes})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{empresa.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{empresa.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{empresa.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Cadastro: {empresa.dataCadastro}</span>
                  </div>
                </div>
                
                {/* Serviços (para profissionais) */}
                {empresa.tipo === 'profissional' && empresa.servicos && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Serviços oferecidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {empresa.servicos.map(servico => (
                        <span key={servico} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{servico}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEmpresaSelecionada(empresa); setShowModal(true) }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg">
                  <Edit className="w-5 h-5" />
                </button>
                <select
                  value={empresa.plano}
                  onChange={(e) => alterarPlano(empresa.id, e.target.value as any)}
                  className="p-2 text-sm border rounded-lg"
                >
                  <option value="gratis">Grátis</option>
                  <option value="basico">Básico</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showModal && empresaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{empresaSelecionada.nome}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="font-medium">{empresaSelecionada.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{empresaSelecionada.telefone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{empresaSelecionada.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Endereço</p>
                  <p className="font-medium">{empresaSelecionada.endereco}</p>
                </div>
              </div>

              {/* Agenda (para profissionais) */}
              {empresaSelecionada.tipo === 'profissional' && empresaSelecionada.agenda && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Agenda Próximos 60 dias
                  </h3>
                  <div className="space-y-2">
                    {empresaSelecionada.agenda.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.data} às {item.horario}</p>
                          <p className="text-sm text-gray-500">{item.servico} - {item.cliente}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          item.status === 'agendado' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'realizado' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comentários e Avaliações */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comentários e Avaliações
                </h3>
                <div className="space-y-3">
                  {comentarios.map(comentario => (
                    <div key={comentario.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{comentario.cliente}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < comentario.classificacao ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{comentario.data}</p>
                      </div>
                      <p className="text-sm">{comentario.comentario}</p>
                      {comentario.resposta && (
                        <div className="mt-2 pl-3 border-l-2 border-blue-500">
                          <p className="text-xs text-blue-600 font-medium">Resposta do profissional:</p>
                          <p className="text-sm">{comentario.resposta}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}