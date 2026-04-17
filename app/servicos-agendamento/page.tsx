'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  Filter,
  ChevronRight,
  User,
  Stethoscope,
  Briefcase,
  Scissors,
  Heart,
  Wrench,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

interface Profissional {
  id: string
  name: string
  especialidade: string
  avatar?: string
  avaliacao: number
  total_servicos: number
  telefone: string
  localizacao: string
  preco_minimo: number
  tempo_espera: string
  disponibilidade: boolean
  servicos: Servico[]
}

interface Servico {
  id: string
  name: string
  preco: number
  duracao: string
  descricao: string
}

const ESPECIALIDADES = [
  { id: 'todos', nome: 'Todos', icon: User, cor: 'text-zinc-400' },
  { id: 'medico', nome: 'Médico', icon: Stethoscope, cor: 'text-red-500' },
  { id: 'dentista', nome: 'Dentista', icon: Heart, cor: 'text-pink-500' },
  { id: 'advogado', nome: 'Advogado', icon: Briefcase, cor: 'text-blue-500' },
  { id: 'cabelereiro', nome: 'Cabelereiro', icon: Scissors, cor: 'text-purple-500' },
  { id: 'mecanico', nome: 'Mecânico', icon: Wrench, cor: 'text-orange-500' }
]

export default function ServicosAgendamentoPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('todos')
  const [precoFiltro, setPrecoFiltro] = useState('todos')
  const [showFiltros, setShowFiltros] = useState(false)

  useEffect(() => {
    carregarProfissionais()
  }, [])

  useEffect(() => {
    filtrarProfissionais()
  }, [busca, especialidadeFiltro, precoFiltro])

  const carregarProfissionais = async () => {
    setLoading(true)
    try {
      // Simular dados - em produção viria da API
      const dados: Profissional[] = [
        {
          id: '1',
          name: 'Dr. João Silva',
          especialidade: 'medico',
          avatar: '/avatars/medico.jpg',
          avaliacao: 4.8,
          total_servicos: 156,
          telefone: '(75) 98888-7777',
          localizacao: 'Centro, Valente-BA',
          preco_minimo: 150,
          tempo_espera: '2 dias',
          disponibilidade: true,
          servicos: [
            { id: '1', name: 'Consulta Clínica', preco: 150, duracao: '30 min', descricao: 'Consulta médica geral' },
            { id: '2', name: 'Avaliação Física', preco: 200, duracao: '45 min', descricao: 'Avaliação completa' }
          ]
        },
        {
          id: '2',
          name: 'Dra. Maria Santos',
          especialidade: 'dentista',
          avatar: '/avatars/dentista.jpg',
          avaliacao: 4.9,
          total_servicos: 89,
          telefone: '(75) 97777-6666',
          localizacao: 'Rua Principal, 123 - Centro',
          preco_minimo: 80,
          tempo_espera: '1 dia',
          disponibilidade: true,
          servicos: [
            { id: '3', name: 'Limpeza Dentária', preco: 80, duracao: '40 min', descricao: 'Limpeza completa' },
            { id: '4', name: 'Clareamento', preco: 300, duracao: '60 min', descricao: 'Clareamento dental' }
          ]
        },
        {
          id: '3',
          name: 'Pedro Costa',
          especialidade: 'cabelereiro',
          avatar: '/avatars/cabelereiro.jpg',
          avaliacao: 4.7,
          total_servicos: 234,
          telefone: '(75) 96666-5555',
          localizacao: 'Shopping Valente',
          preco_minimo: 50,
          tempo_espera: 'Hoje',
          disponibilidade: true,
          servicos: [
            { id: '5', name: 'Corte Masculino', preco: 50, duracao: '30 min', descricao: 'Corte e barba' },
            { id: '6', name: 'Coloração', preco: 120, duracao: '90 min', descricao: 'Coloração completa' }
          ]
        }
      ]
      setProfissionais(dados)
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarProfissionais = () => {
    let filtrados = profissionais

    if (busca) {
      filtrados = filtrados.filter(p => 
        p.name.toLowerCase().includes(busca.toLowerCase()) ||
        p.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
        p.localizacao.toLowerCase().includes(busca.toLowerCase())
      )
    }

    if (especialidadeFiltro !== 'todos') {
      filtrados = filtrados.filter(p => p.especialidade === especialidadeFiltro)
    }

    if (precoFiltro !== 'todos') {
      if (precoFiltro === 'baixo') {
        filtrados = filtrados.filter(p => p.preco_minimo <= 100)
      } else if (precoFiltro === 'medio') {
        filtrados = filtrados.filter(p => p.preco_minimo > 100 && p.preco_minimo <= 200)
      } else if (precoFiltro === 'alto') {
        filtrados = filtrados.filter(p => p.preco_minimo > 200)
      }
    }

    return filtrados
  }

  const profissionaisFiltrados = filtrarProfissionais()

  const getEspecialidadeIcon = (especialidade: string) => {
    const esp = ESPECIALIDADES.find(e => e.id === especialidade)
    return esp?.icon || User
  }

  const getEspecialidadeCor = (especialidade: string) => {
    const esp = ESPECIALIDADES.find(e => e.id === especialidade)
    return esp?.cor || 'text-zinc-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
              <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Serviços com Agendamento</h1>
              <p className="text-zinc-400 text-sm">Encontre o profissional ideal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Busca */}
        <section className="bg-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3 bg-zinc-700 rounded-xl px-4 py-3">
            <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar profissional..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-zinc-400 text-sm"
            />
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="p-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 transition flex-shrink-0"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Filtros */}
        {showFiltros && (
          <section className="bg-zinc-800 rounded-xl p-4 space-y-4">
            {/* Especialidades */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Especialidade</h3>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {ESPECIALIDADES.map((esp) => {
                  const Icon = esp.icon
                  return (
                    <button
                      key={esp.id}
                      onClick={() => setEspecialidadeFiltro(esp.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        especialidadeFiltro === esp.id
                          ? 'bg-yellow-500 text-zinc-900'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{esp.nome}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Preço */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Faixa de Preço</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'baixo', label: 'Até R$100' },
                  { id: 'medio', label: 'R$100 - R$200' },
                  { id: 'alto', label: 'Acima de R$200' }
                ].map((preco) => (
                  <button
                    key={preco.id}
                    onClick={() => setPrecoFiltro(preco.id)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm transition ${
                      precoFiltro === preco.id
                        ? 'bg-yellow-500 text-zinc-900'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    {preco.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Resultados */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {profissionaisFiltrados.length} profissionais encontrados
            </h2>
            {profissionaisFiltrados.length === 0 && (
              <p className="text-zinc-400 text-sm">Tente ajustar os filtros</p>
            )}
          </div>

          {profissionaisFiltrados.map((profissional) => {
            const Icon = getEspecialidadeIcon(profissional.especialidade)
            const Cor = getEspecialidadeCor(profissional.especialidade)
            
            return (
              <Link
                key={profissional.id}
                href={`/servicos-agendamento/${profissional.id}`}
                className="bg-zinc-800 rounded-xl p-4 hover:bg-zinc-750 transition block"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${Cor}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">{profissional.name}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${Cor} flex-shrink-0`} />
                          <span className="capitalize truncate">{profissional.especialidade}</span>
                        </div>
                      </div>
                      {profissional.disponibilidade && (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs flex-shrink-0 ml-2">
                          Disponível
                        </div>
                      )}
                    </div>

                    {/* Avaliação e Stats */}
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-400 mb-2 sm:mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                        <span>{profissional.avaliacao}</span>
                      </div>
                      <span>{profissional.total_servicos} serviços</span>
                      <span className="hidden sm:inline">{profissional.tempo_espera}</span>
                    </div>

                    {/* Localização e Preço */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{profissional.localizacao}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                        <span className="text-green-400 font-bold">
                          R${profissional.preco_minimo}+
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
