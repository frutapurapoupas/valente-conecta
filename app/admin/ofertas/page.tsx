'use client'

import { useState } from 'react'
import { Search, Megaphone, TrendingDown, Eye, CheckCircle, XCircle, Trash2, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react'

interface Oferta {
  id: string
  titulo: string
  descricao: string
  preco: number
  precoAntigo?: number
  localizacao: string
  responsavel: string
  telefone: string
  fotos: string[]
  status: 'ativo' | 'expirado' | 'rejeitado'
  dataCriacao: string
  visualizacoes: number
  categoria: string
}

export default function AdminOfertas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'expirado' | 'rejeitado'>('todos')

  const [ofertas, setOfertas] = useState<Oferta[]>([
    {
      id: '1',
      titulo: 'iPhone 13 usado - ótimo estado',
      descricao: 'Celular com 1 ano de uso, bateria 85%, sem arranhões',
      preco: 2500,
      precoAntigo: 3500,
      localizacao: 'São Paulo - SP',
      responsavel: 'João Silva',
      telefone: '(11) 99999-9999',
      fotos: ['/foto1.jpg'],
      status: 'ativo',
      dataCriacao: '01/04/2026',
      visualizacoes: 45,
      categoria: 'Eletrônicos'
    },
    {
      id: '2',
      titulo: 'Sofá 3 lugares - novo',
      descricao: 'Sofá na caixa, cor cinza, nunca usado',
      preco: 1200,
      localizacao: 'Rio de Janeiro - RJ',
      responsavel: 'Maria Santos',
      telefone: '(21) 98888-8888',
      fotos: ['/foto2.jpg'],
      status: 'ativo',
      dataCriacao: '28/03/2026',
      visualizacoes: 32,
      categoria: 'Móveis'
    },
    {
      id: '3',
      titulo: 'Notebook Dell - usado',
      descricao: 'i5, 8GB RAM, 256GB SSD',
      preco: 1800,
      precoAntigo: 2500,
      localizacao: 'Belo Horizonte - MG',
      responsavel: 'Carlos Pereira',
      telefone: '(31) 97777-7777',
      fotos: [],
      status: 'expirado',
      dataCriacao: '10/03/2026',
      visualizacoes: 89,
      categoria: 'Eletrônicos'
    },
  ])

  const ofertasFiltradas = ofertas.filter(o => {
    if (filtroStatus !== 'todos' && o.status !== filtroStatus) return false
    if (searchTerm && !o.titulo.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const alterarStatus = (id: string, novoStatus: 'ativo' | 'expirado' | 'rejeitado') => {
    setOfertas(ofertas.map(o => o.id === id ? { ...o, status: novoStatus } : o))
    alert(`✅ Status da oferta alterado para ${novoStatus}`)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ativo': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">✓ Ativo</span>
      case 'expirado': return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">⌛ Expirado</span>
      case 'rejeitado': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">✗ Rejeitado</span>
      default: return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ofertas dos Usuários</h1>
          <p className="text-gray-500">Gerencie todas as ofertas publicadas pelos usuários</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
            <Megaphone className="w-5 h-5" />
            Publicar Oferta (Admin)
          </button>
        </div>
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
                placeholder="Buscar ofertas..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['todos', 'ativo', 'expirado', 'rejeitado'].map(status => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm capitalize ${
                  filtroStatus === status 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'todos' ? 'Todos' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Ofertas */}
      <div className="space-y-4">
        {ofertasFiltradas.map(oferta => (
          <div key={oferta.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg">{oferta.titulo}</h3>
                  {getStatusBadge(oferta.status)}
                  <span className="text-xs text-gray-400">{oferta.categoria}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{oferta.descricao}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Preço</p>
                    {oferta.precoAntigo ? (
                      <div>
                        <span className="text-gray-400 line-through text-sm">R$ {oferta.precoAntigo}</span>
                        <span className="font-bold text-green-600 ml-2">R$ {oferta.preco}</span>
                      </div>
                    ) : (
                      <p className="font-bold text-green-600">R$ {oferta.preco}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500">Localização</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {oferta.localizacao}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Responsável</p>
                    <p>{oferta.responsavel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contato</p>
                    <p>{oferta.telefone}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>📅 {oferta.dataCriacao}</span>
                  <span>👁️ {oferta.visualizacoes} visualizações</span>
                  <span>📸 {oferta.fotos.length} foto(s)</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Eye className="w-5 h-5" />
                </button>
                {oferta.status === 'ativo' ? (
                  <>
                    <button onClick={() => alterarStatus(oferta.id, 'expirado')} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg" title="Marcar como Expirado">
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => alterarStatus(oferta.id, 'rejeitado')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Rejeitar">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : oferta.status === 'expirado' && (
                  <button onClick={() => alterarStatus(oferta.id, 'ativo')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Reativar">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}