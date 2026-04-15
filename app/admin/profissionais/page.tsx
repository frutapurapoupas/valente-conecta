// app/admin/profissionais/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Edit2, Trash2, Star, Phone, Mail, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

interface Profissional {
  id: string
  nome: string
  categoria: string
  telefone: string
  email: string
  endereco: string
  avaliacao: number
  status: 'ativo' | 'inativo'
  horario: string
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')

  useEffect(() => {
    carregarProfissionais()
  }, [])

  const carregarProfissionais = async () => {
    try {
      const response = await fetch('/api/profissionais')
      const data = await response.json()
      setProfissionais(data)
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      // Dados mockados para teste
      setProfissionais([
        { id: '1', nome: 'João Silva', categoria: 'Mecânico', telefone: '(75) 98888-1111', email: 'joao@email.com', endereco: 'Centro, Valente-BA', avaliacao: 4.8, status: 'ativo', horario: '08h-18h' },
        { id: '2', nome: 'Maria Santos', categoria: 'Cabeleireira', telefone: '(75) 97777-2222', email: 'maria@email.com', endereco: 'Bairro Novo, Valente-BA', avaliacao: 4.9, status: 'ativo', horario: '09h-19h' },
        { id: '3', nome: 'Carlos Souza', categoria: 'Eletricista', telefone: '(75) 96666-3333', email: 'carlos@email.com', endereco: 'Centro, Valente-BA', avaliacao: 4.7, status: 'inativo', horario: '08h-17h' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const profissionaisFiltrados = profissionais.filter(prof => {
    const matchSearch = prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        prof.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoriaFiltro === 'todos' || prof.categoria === categoriaFiltro
    return matchSearch && matchCategoria
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando profissionais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-yellow-500">Profissionais</h1>
              <p className="text-zinc-400 text-sm">Gerencie os profissionais cadastrados em Valente-BA</p>
            </div>
            <Link 
              href="/admin/profissionais/novo"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-600 transition"
            >
              <UserPlus className="w-5 h-5" />
              Novo Profissional
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-500"
            />
          </div>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-yellow-500"
          >
            <option value="todos">Todas Categorias</option>
            <option value="Mecânico">Mecânico</option>
            <option value="Cabeleireira">Cabeleireira</option>
            <option value="Eletricista">Eletricista</option>
          </select>
        </div>

        {/* Lista de Profissionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profissionaisFiltrados.map((prof) => (
            <div key={prof.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/50 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{prof.nome}</h3>
                  <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full mt-1">
                    {prof.categoria}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-4 h-4" />
                  <span>{prof.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span>{prof.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span>{prof.endereco}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>{prof.horario}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold">{prof.avaliacao}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  prof.status === 'ativo' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {prof.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}