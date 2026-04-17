'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Phone,
  ChevronRight,
  Check,
  X,
  DollarSign,
  User,
  MessageCircle,
  Heart
} from 'lucide-react'

interface Profissional {
  id: string
  name: string
  especialidade: string
  avatar?: string
  avaliacao: number
  total_servicos: number
  telefone: string
  whatsapp: string
  localizacao: string
  descricao: string
  servicos: Servico[]
  disponibilidade: Disponibilidade[]
}

interface Servico {
  id: string
  name: string
  preco: number
  duracao: string
  descricao: string
}

interface Disponibilidade {
  data: string
  horarios: string[]
}

interface AgendamentoForm {
  servico_id: string
  data: string
  horario: string
  observacoes: string
}

export default function ProfissionalDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const [profissional, setProfissional] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showAgendamento, setShowAgendamento] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (params?.id) {
      carregarProfissional()
    }
  }, [params?.id])

  const carregarProfissional = async () => {
    setLoading(true)
    try {
      // Simular dados - em produção viria da API
      const dados: Profissional = {
        id: params?.id as string,
        name: 'Dr. João Silva',
        especialidade: 'medico',
        avatar: '/avatars/medico.jpg',
        avaliacao: 4.8,
        total_servicos: 156,
        telefone: '(75) 98888-7777',
        whatsapp: '(75) 98888-7777',
        localizacao: 'Centro, Valente-BA',
        descricao: 'Médico com mais de 10 anos de experiência, especializado em clínica geral e prevenção. Atendimento humanizado e focado no bem-estar dos pacientes.',
        servicos: [
          { id: '1', name: 'Consulta Clínica', preco: 150, duracao: '30 min', descricao: 'Consulta médica geral para avaliação e diagnóstico' },
          { id: '2', name: 'Avaliação Física', preco: 200, duracao: '45 min', descricao: 'Avaliação completa com exames físicos' },
          { id: '3', name: 'Retorno', preco: 100, duracao: '20 min', descricao: 'Consulta de retorno para acompanhamento' }
        ],
        disponibilidade: gerarDisponibilidade()
      }
      setProfissional(dados)
    } catch (error) {
      console.error('Erro ao carregar profissional:', error)
    } finally {
      setLoading(false)
    }
  }

  const gerarDisponibilidade = (): Disponibilidade[] => {
    const dias: Disponibilidade[] = []
    const hoje = new Date()
    
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() + i)
      
      // Pular domingos
      if (data.getDay() === 0) continue
      
      const dataStr = data.toISOString().split('T')[0]
      const horarios = gerarHorarios(data)
      
      if (horarios.length > 0) {
        dias.push({ data: dataStr, horarios })
      }
    }
    
    return dias
  }

  const gerarHorarios = (data: Date): string[] => {
    const horarios = []
    const diaSemana = data.getDay()
    
    // Horários diferentes por dia da semana
    let horarioInicio = 8
    let horarioFim = 18
    
    if (diaSemana === 6) { // Sábado
      horarioFim = 12
    }
    
    for (let hora = horarioInicio; hora < horarioFim; hora++) {
      for (let min = 0; min < 60; min += 30) {
        const horario = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        horarios.push(horario)
      }
    }
    
    return horarios
  }

  const handleAgendar = async () => {
    if (!selectedServico || !selectedDate || !selectedTime) {
      alert('Selecione serviço, data e horário')
      return
    }

    setIsSubmitting(true)
    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Enviar confirmação via WhatsApp
      const mensagem = `Olá! Gostaria de agendar:\n\n` +
        `Serviço: ${selectedServico.name}\n` +
        `Data: ${selectedDate}\n` +
        `Horário: ${selectedTime}\n` +
        `Profissional: ${profissional?.name}\n\n` +
        `Por favor, confirmem a disponibilidade.`
      
      window.open(`https://wa.me/55${profissional?.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank')
      
      alert('Agendamento solicitado! Você receberá a confirmação via WhatsApp.')
      setShowAgendamento(false)
      setSelectedServico(null)
      setSelectedDate('')
      setSelectedTime('')
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao agendar:', error)
      alert('Erro ao agendar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDisponibilidadeParaData = (data: string): string[] => {
    const disp = profissional?.disponibilidade.find(d => d.data === data)
    return disp?.horarios || []
  }

  const formatarData = (dataStr: string): string => {
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!profissional) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profissional não encontrado</h1>
          <Link href="/servicos-agendamento" className="text-yellow-500 hover:underline">
            Voltar para busca
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/servicos-agendamento" className="p-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profissional.name}</h1>
              <p className="text-zinc-400 text-sm capitalize">{profissional.especialidade}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Card Principal */}
        <section className="bg-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-700 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400" />
            </div>

            {/* Info Principal */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{profissional.name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{profissional.avaliacao}</span>
                </div>
                <span>{profissional.total_servicos} serviços</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 text-zinc-400 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profissional.localizacao}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profissional.telefone}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button className="flex-1 bg-zinc-700 text-white py-2 rounded-lg font-medium hover:bg-zinc-600 transition flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Ligar
                </button>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Sobre</h3>
            <p className="text-zinc-400 leading-relaxed">{profissional.descricao}</p>
          </div>
        </section>

        {/* Serviços */}
        <section className="bg-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Serviços</h3>
          <div className="space-y-3">
            {profissional.servicos.map((servico) => (
              <div
                key={servico.id}
                onClick={() => setSelectedServico(servico)}
                className={`border rounded-xl p-4 cursor-pointer transition ${
                  selectedServico?.id === servico.id
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white">{servico.name}</h4>
                    <p className="text-zinc-400 text-sm">{servico.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">R${servico.preco}</p>
                    <p className="text-zinc-400 text-sm">{servico.duracao}</p>
                  </div>
                </div>
                {selectedServico?.id === servico.id && (
                  <Check className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Botão Agendar */}
        <section>
          <button
            onClick={() => setShowAgendamento(true)}
            disabled={!selectedServico}
            className="w-full bg-yellow-500 text-zinc-900 py-4 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agendar Horário
          </button>
        </section>

        {/* Modal de Agendamento */}
        {showAgendamento && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Agendar Horário</h3>
                  <button
                    onClick={() => setShowAgendamento(false)}
                    className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Serviço Selecionado */}
                {selectedServico && (
                  <div className="bg-zinc-700 rounded-lg p-4 mb-6">
                    <p className="text-sm text-zinc-400 mb-1">Serviço selecionado</p>
                    <p className="font-bold text-white">{selectedServico.name}</p>
                    <p className="text-green-400 font-bold">R${selectedServico.preco}</p>
                  </div>
                )}

                {/* Calendário */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">Selecione a data</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {profissional.disponibilidade.map((disp) => (
                      <button
                        key={disp.data}
                        onClick={() => {
                          setSelectedDate(disp.data)
                          setSelectedTime('')
                        }}
                        className={`p-3 rounded-lg text-xs sm:text-sm transition ${
                          selectedDate === disp.data
                            ? 'bg-yellow-500 text-zinc-900'
                            : 'bg-zinc-700 hover:bg-zinc-600'
                        }`}
                      >
                        {formatarData(disp.data)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horários */}
                {selectedDate && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3">Selecione o horário</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {getDisponibilidadeParaData(selectedDate).map((horario) => (
                        <button
                          key={horario}
                          onClick={() => setSelectedTime(horario)}
                          className={`p-2 rounded-lg text-xs sm:text-sm transition ${
                            selectedTime === horario
                              ? 'bg-yellow-500 text-zinc-900'
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          }`}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div className="mb-6">
                  <h4 className="font-bold mb-3">Observações (opcional)</h4>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    rows={3}
                    placeholder="Alguma informação adicional..."
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAgendamento(false)}
                    className="flex-1 bg-zinc-700 text-white py-3 rounded-lg font-medium hover:bg-zinc-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAgendar}
                    disabled={!selectedDate || !selectedTime || isSubmitting}
                    className="flex-1 bg-yellow-500 text-zinc-900 py-3 rounded-lg font-medium hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
