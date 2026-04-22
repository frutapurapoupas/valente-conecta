'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  Search, MapPin, Star, Clock, Calendar, Filter, X,
  User, Briefcase, Scissors, Stethoscope, Wrench,
  ChevronLeft, ChevronRight, Phone, Mail, MessageCircle,
  Award, Users, CheckCircle, AlertCircle, Loader2,
  Plus, History, TrendingUp, Sparkles
} from 'lucide-react'
import NotificacaoPush from '@/components/agendamento/NotificacaoPush'
import { categorias, Categoria, ServicoItem, buscarServicos } from '@/lib/servicosCategorias'

interface Profissional {
  id: string
  nome: string
  especialidade: string
  avatar?: string
  foto?: string
  avaliacao: number
  totalAvaliacoes: number
  endereco: string
  cidade: string
  bairro: string
  telefone: string
  whatsapp: string
  email: string
  descricao: string
  servicos: ServicoItem[]
  horarios: HorarioDisponivel[]
  status: 'online' | 'offline' | 'ocupado'
  tempoMedioEspera: number
  certificacoes?: string[]
}

interface HorarioDisponivel {
  id: string
  data: string
  horarios: string[]
}

interface BuscaRegistrada {
  termo: string
  data: string
  encontrou: boolean
}

export default function ServicosAgendamentoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<ServicoItem[]>([])
  const [buscasRecentes, setBuscasRecentes] = useState<BuscaRegistrada[]>([])
  const [servicosPopulares, setServicosPopulares] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [cidadeSelecionada, setCidadeSelecionada] = useState('todas')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('todas')
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<string>('todas')
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState('todas')
  const [statusSelecionado, setStatusSelecionado] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('relevancia')
  const [loading, setLoading] = useState(true)
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [buscando, setBuscando] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('servicos_buscas_recentes')
    if (saved) {
      setBuscasRecentes(JSON.parse(saved))
    }
    const popular = localStorage.getItem('servicos_populares')
    if (popular) {
      setServicosPopulares(JSON.parse(popular))
    } else {
      setServicosPopulares(['Mecânico', 'Corte de Cabelo', 'Manicure', 'Psicólogo', 'Personal Trainer'])
    }
  }, [])

  // Salvar busca no histórico
  const salvarBusca = (termo: string, encontrou: boolean) => {
    const novaBusca: BuscaRegistrada = {
      termo,
      data: new Date().toISOString(),
      encontrou
    }
    const novasBuscas = [novaBusca, ...buscasRecentes.slice(0, 9)]
    setBuscasRecentes(novasBuscas)
    localStorage.setItem('servicos_buscas_recentes', JSON.stringify(novasBuscas))
    
    // Atualizar populares
    if (!servicosPopulares.includes(termo)) {
      const novosPopulares = [termo, ...servicosPopulares.slice(0, 9)]
      setServicosPopulares(novosPopulares)
      localStorage.setItem('servicos_populares', JSON.stringify(novosPopulares))
    }
  }

  // Buscar sugestões com autocompletar inteligente
  const buscarSugestoes = useCallback(async (termo: string) => {
    if (termo.length < 2) {
      setSuggestions([])
      return
    }
    
    setBuscando(true)
    
    // Buscar nos serviços pré-cadastrados
    const resultados = buscarServicos(termo)
    
    // Adicionar termo como sugestão se não encontrado (para cadastro futuro)
    const termoSuggestion: ServicoItem = {
      id: `novo_${Date.now()}`,
      nome: termo,
      duracaoMedia: 60,
      tags: [termo.toLowerCase()],
      descricao: 'Novo serviço - Aguardando profissional'
    }
    
    let sugestoesFinais = [...resultados]
    
    // Se não encontrou exatamente, adiciona como sugestão de "cadastrar"
    if (!resultados.some(r => r.nome.toLowerCase() === termo.toLowerCase())) {
      sugestoesFinais.unshift(termoSuggestion)
    }
    
    setSuggestions(sugestoesFinais.slice(0, 8))
    setBuscando(false)
  }, [])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        buscarSugestoes(searchTerm)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
    
    return () => clearTimeout(delayDebounce)
  }, [searchTerm, buscarSugestoes])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dados mockados - incluindo Mecânico
  const mockProfissionais: Profissional[] = [
    {
      id: '1',
      nome: 'Oficina do João',
      especialidade: 'Mecânico',
      avaliacao: 4.8,
      totalAvaliacoes: 156,
      endereco: 'Rua das Oficinas, 100',
      cidade: 'Valente',
      bairro: 'Centro',
      telefone: '(75) 98888-5555',
      whatsapp: '5575988885555',
      email: 'joao@oficina.com',
      descricao: 'Mecânica geral, injeção eletrônica, suspensão e freios. Orçamento sem compromisso.',
      servicos: [
        { id: 's12', nome: 'Troca de Óleo', duracaoMedia: 30, tags: ['óleo', 'manutenção'] },
        { id: 's13', nome: 'Revisão Completa', duracaoMedia: 120, tags: ['revisão', 'manutenção'] },
        { id: 's14', nome: 'Alinhamento e Balanceamento', duracaoMedia: 45, tags: ['pneu', 'alinhamento'] },
      ],
      horarios: [
        { id: 'h10', data: '2026-04-24', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
        { id: 'h11', data: '2026-04-25', horarios: ['08:00', '09:00', '10:00', '11:00', '14:00'] },
      ],
      status: 'online',
      tempoMedioEspera: 20,
      certificacoes: ['SOS Mecânicos'],
    },
    {
      id: '2',
      nome: 'Dra. Ana Silva',
      especialidade: 'Dentista',
      avaliacao: 4.9,
      totalAvaliacoes: 128,
      endereco: 'Rua das Flores, 123',
      cidade: 'Valente',
      bairro: 'Centro',
      telefone: '(75) 98888-1111',
      whatsapp: '5575988881111',
      email: 'ana.silva@clinica.com',
      descricao: 'Especialista em odontologia estética com 10 anos de experiência.',
      servicos: [
        { id: 's1', nome: 'Limpeza Dentária', duracaoMedia: 40, tags: ['limpeza', 'odontologia'] },
        { id: 's2', nome: 'Clareamento Dental', duracaoMedia: 60, tags: ['clareamento', 'estética'] },
      ],
      horarios: [
        { id: 'h1', data: '2026-04-24', horarios: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
        { id: 'h2', data: '2026-04-25', horarios: ['09:00', '10:00', '11:00', '14:00'] },
      ],
      status: 'online',
      tempoMedioEspera: 15,
      certificacoes: ['CRO-BA 12345'],
    },
    {
      id: '3',
      nome: 'João Santos',
      especialidade: 'Cabeleireiro',
      avaliacao: 4.8,
      totalAvaliacoes: 89,
      endereco: 'Av. Principal, 456',
      cidade: 'Valente',
      bairro: 'Centro',
      telefone: '(75) 98888-2222',
      whatsapp: '5575988882222',
      email: 'joao@barbearia.com',
      descricao: 'Especialista em cortes masculinos e barba.',
      servicos: [
        { id: 's4', nome: 'Corte Masculino', duracaoMedia: 30, tags: ['corte', 'masculino'] },
        { id: 's5', nome: 'Barba', duracaoMedia: 30, tags: ['barba', 'toalha quente'] },
      ],
      horarios: [
        { id: 'h4', data: '2026-04-24', horarios: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
        { id: 'h5', data: '2026-04-25', horarios: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
      ],
      status: 'online',
      tempoMedioEspera: 10,
    },
    {
      id: '4',
      nome: 'Dr. Carlos Mota',
      especialidade: 'Fisioterapeuta',
      avaliacao: 4.9,
      totalAvaliacoes: 156,
      endereco: 'Rua do Comércio, 789',
      cidade: 'Valente',
      bairro: 'São José',
      telefone: '(75) 98888-3333',
      whatsapp: '5575988883333',
      email: 'carlos@fisio.com',
      descricao: 'Fisioterapia ortopédica e esportiva.',
      servicos: [
        { id: 's7', nome: 'Avaliação Fisioterápica', duracaoMedia: 45, tags: ['avaliação', 'diagnóstico'] },
        { id: 's8', nome: 'Sessão de Fisioterapia', duracaoMedia: 50, tags: ['tratamento', 'reabilitação'] },
      ],
      horarios: [
        { id: 'h6', data: '2026-04-24', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
        { id: 'h7', data: '2026-04-25', horarios: ['08:00', '09:00', '10:00', '11:00'] },
      ],
      status: 'ocupado',
      tempoMedioEspera: 45,
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setProfissionais(mockProfissionais)
      setLoading(false)
    }, 500)
  }, [])

  const especialidades = ['todas', 'Mecânico', 'Dentista', 'Cabeleireiro', 'Fisioterapeuta']
  const cidades = ['todas', 'Valente', 'Coité']

  const profissionaisFiltrados = profissionais.filter(p => {
    const matchSearch = searchTerm === '' || 
                        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.servicos.some(s => s.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchCidade = cidadeSelecionada === 'todas' || p.cidade === cidadeSelecionada
    const matchEspecialidade = especialidadeSelecionada === 'todas' || p.especialidade === especialidadeSelecionada
    const matchStatus = statusSelecionado === 'todos' || p.status === statusSelecionado
    return matchSearch && matchCidade && matchEspecialidade && matchStatus
  })

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'online': return { label: 'Disponível', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle }
      case 'ocupado': return { label: 'Ocupado', color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertCircle }
      default: return { label: 'Offline', color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Clock }
    }
  }

  const getEspecialidadeIcon = (especialidade: string) => {
    const icons: Record<string, any> = {
      'Mecânico': Wrench,
      'Dentista': Stethoscope,
      'Cabeleireiro': Scissors,
      'Fisioterapeuta': Wrench,
    }
    return icons[especialidade] || User
  }

  const handleSearchSubmit = (termo: string) => {
    const encontrou = profissionais.some(p => 
      p.nome.toLowerCase().includes(termo.toLowerCase()) ||
      p.especialidade.toLowerCase().includes(termo.toLowerCase()) ||
      p.servicos.some(s => s.nome.toLowerCase().includes(termo.toLowerCase()))
    )
    salvarBusca(termo, encontrou)
    setShowSuggestions(false)
    // Se não encontrou, mantém o termo para o usuário saber que pode solicitar
    if (!encontrou) {
      // Mostrar mensagem amigável
      setTimeout(() => {
        alert(`🔍 "${termo}" ainda não está disponível.\n\nQuer ser avisado quando um profissional se cadastrar?`)
      }, 100)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Serviços com Agendamento</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-zinc-800 rounded-xl">
            <Filter className={`w-5 h-5 ${showFilters ? 'text-yellow-400' : 'text-zinc-400'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <NotificacaoPush />

        {/* Barra de busca com autocompletar */}
        <div className="relative" ref={suggestionsRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchTerm)}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              placeholder="Buscar profissional, especialidade ou serviço..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
            />
            {buscando && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
            )}
          </div>

          {/* Sugestões de autocompletar */}
          {showSuggestions && (suggestions.length > 0 || buscasRecentes.length > 0) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
              {/* Serviços sugeridos */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-zinc-500 px-3 py-1">🎯 Sugestões</p>
                  {suggestions.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => {
                        setSearchTerm(sug.nome)
                        handleSearchSubmit(sug.nome)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {sug.id.startsWith('novo_') ? (
                          <Plus className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-white">{sug.nome}</span>
                      </div>
                      {sug.id.startsWith('novo_') && (
                        <span className="text-xs text-yellow-400">Cadastrar como novo</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Buscas recentes */}
              {buscasRecentes.length > 0 && (
                <div className="border-t border-zinc-800 p-2">
                  <p className="text-xs text-zinc-500 px-3 py-1 flex items-center gap-1">
                    <History className="w-3 h-3" /> Recentes
                  </p>
                  {buscasRecentes.slice(0, 5).map((busca, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTerm(busca.termo)
                        handleSearchSubmit(busca.termo)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 text-sm"
                    >
                      {busca.termo}
                      {!busca.encontrou && (
                        <span className="ml-2 text-xs text-yellow-500">(aguardando profissional)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Filtros</h3>
              <button onClick={() => {
                setCidadeSelecionada('todas')
                setCategoriaSelecionada('todas')
                setSubcategoriaSelecionada('todas')
                setEspecialidadeSelecionada('todas')
                setStatusSelecionado('todos')
                setOrdenacao('relevancia')
                setSearchTerm('')
              }} className="text-xs text-yellow-400">Limpar</button>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Cidade</label>
              <div className="flex gap-2 flex-wrap">
                {cidades.map(cidade => (
                  <button key={cidade} onClick={() => setCidadeSelecionada(cidade)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${cidadeSelecionada === cidade ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    {cidade === 'todas' ? 'Todas' : cidade}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Especialidade</label>
              <div className="flex gap-2 flex-wrap">
                {especialidades.map(esp => (
                  <button key={esp} onClick={() => setEspecialidadeSelecionada(esp)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${especialidadeSelecionada === esp ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    {esp === 'todas' ? 'Todas' : esp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Status</label>
              <div className="flex gap-2">
                {['todos', 'online', 'ocupado', 'offline'].map(status => (
                  <button key={status} onClick={() => setStatusSelecionado(status)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${statusSelecionado === status ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    {status === 'todos' ? 'Todos' : status === 'online' ? 'Disponível' : status === 'ocupado' ? 'Ocupado' : 'Offline'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Ordenar por</label>
              <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="relevancia">Relevância</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="tempo_espera">Menor tempo de espera</option>
              </select>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{profissionaisFiltrados.length} profissionais encontrados</p>
          
          {profissionaisFiltrados.map(profissional => {
            const StatusIcon = getStatusInfo(profissional.status).icon
            const EspecialidadeIcon = getEspecialidadeIcon(profissional.especialidade)
            
            return (
              <Link href={`/servicos-agendamento/${profissional.id}`} key={profissional.id}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-all">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <EspecialidadeIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white">{profissional.nome}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-yellow-400">{profissional.especialidade}</span>
                            <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-zinc-400">{profissional.avaliacao} ({profissional.totalAvaliacoes})</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusInfo(profissional.status).bg}`}>
                          <StatusIcon className={`w-3 h-3 ${getStatusInfo(profissional.status).color}`} />
                          <span className={`text-xs font-bold ${getStatusInfo(profissional.status).color}`}>{getStatusInfo(profissional.status).label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" />
                        <span>{profissional.cidade}, {profissional.bairro}</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                        <Clock className="w-3 h-3" />
                        <span>Espera ~{profissional.tempoMedioEspera}min</span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{profissional.descricao}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {profissional.servicos.slice(0, 3).map(servico => (
                          <span key={servico.id} className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                            {servico.nome}
                          </span>
                        ))}
                        {profissional.servicos.length > 3 && (
                          <span className="text-xs text-zinc-600">+{profissional.servicos.length - 3}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                        <div>
                          <span className="text-xs text-zinc-500">A partir de</span>
                          <p className="text-lg font-black text-yellow-400">R$ 45,00</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-sm font-bold hover:bg-yellow-400 transition">
                            Agendar
                          </button>
                          <button className="p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-700 transition">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          
          {profissionaisFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Nenhum profissional encontrado para "{searchTerm}"</p>
              <p className="text-sm text-zinc-600 mt-2">Seja o primeiro a se cadastrar ou sugira este serviço!</p>
              <button className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm">
                Sugerir Serviço
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}