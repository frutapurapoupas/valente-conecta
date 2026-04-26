'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Star, MapPin, Clock, Calendar, Phone, Mail, MessageCircle,
  ChevronLeft, Check, X, User, Briefcase, Award, Heart,
  Share2, AlertCircle, Loader2, CheckCircle, Clock as ClockIcon,
  CalendarCheck, BellRing, Sparkles, DollarSign, Shield
} from 'lucide-react'

interface Servico {
  id: string
  nome: string
  descricao: string
  duracao: number
  preco: number
  precoPromocional?: number
}

interface HorarioDisponivel {
  id: string
  data: string
  horarios: string[]
}

interface Avaliacao {
  id: string
  cliente: string
  nota: number
  comentario: string
  data: string
  avatar?: string
}

export default function ProfissionalDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profissional, setProfissional] = useState<any>(null)
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [showAgendamento, setShowAgendamento] = useState(false)
  const [showConfirmacao, setShowConfirmacao] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState<any>(null)
  const [favorito, setFavorito] = useState(false)
  const [atendenteSelecionado, setAtendenteSelecionado] = useState<string>('qualquer')

  // Dados mockados com mais profissionais
  useEffect(() => {
    setTimeout(() => {
      const profissionalData: Record<string, any> = {
        '1': {
          id: '1',
          nome: 'Oficina do João',
          especialidade: 'Mecânico',
          avatar: null,
          avaliacao: 4.8,
          totalAvaliacoes: 156,
          endereco: 'Rua das Oficinas, 100',
          cidade: 'Valente',
          bairro: 'Centro',
          telefone: '(75) 98888-5555',
          whatsapp: '5575988885555',
          email: 'joao@oficina.com',
          descricao: 'Mecânica geral, injeção eletrônica, suspensão e freios. Orçamento sem compromisso. Atendimento rápido e qualidade garantida.',
          servicos: [
            { id: 's12', nome: 'Troca de Óleo', descricao: 'Óleo mineral ou sintético', duracao: 30, preco: 80 },
            { id: 's13', nome: 'Revisão Completa', descricao: 'Revisão de 30 itens', duracao: 120, preco: 250, precoPromocional: 199 },
            { id: 's14', nome: 'Alinhamento e Balanceamento', descricao: 'Alinhamento das 4 rodas', duracao: 45, preco: 90 },
          ],
          horarios: [
            { id: 'h10', data: '2026-04-24', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'] },
            { id: 'h11', data: '2026-04-25', horarios: ['08:00', '09:00', '10:00', '11:00', '14:00'] },
            { id: 'h12', data: '2026-04-26', horarios: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'] },
          ],
          avaliacoes: [
            { id: 'a1', cliente: 'Carlos Souza', nota: 5, comentario: 'Excelente profissional, resolveu meu problema rapidamente. Recomendo muito!', data: '2026-04-10' },
            { id: 'a2', cliente: 'Fernanda Lima', nota: 5, comentario: 'Ótimo atendimento, preço justo e serviço bem feito.', data: '2026-04-05' },
            { id: 'a3', cliente: 'Roberto Alves', nota: 4, comentario: 'Bom serviço, só demorou um pouco.', data: '2026-03-28' },
          ],
          status: 'online',
          tempoMedioEspera: 20,
          certificacoes: ['SOS Mecânicos', 'Especialista em Injeção Eletrônica'],
        },
        '2': {
          id: '2',
          nome: 'Dra. Ana Silva',
          especialidade: 'Dentista',
          avatar: null,
          avaliacao: 4.9,
          totalAvaliacoes: 128,
          endereco: 'Rua das Flores, 123',
          cidade: 'Valente',
          bairro: 'Centro',
          telefone: '(75) 98888-1111',
          whatsapp: '5575988881111',
          email: 'ana.silva@clinica.com',
          descricao: 'Especialista em odontologia estética com 10 anos de experiência. Atendimento humanizado e tecnológico.',
          servicos: [
            { id: 's1', nome: 'Limpeza Dentária', descricao: 'Remoção de tártaro e placa bacteriana', duracao: 40, preco: 120 },
            { id: 's2', nome: 'Clareamento Dental', descricao: 'Clareamento a laser em consultório', duracao: 60, preco: 350, precoPromocional: 299 },
            { id: 's3', nome: 'Canal', descricao: 'Tratamento de canal', duracao: 90, preco: 450 },
          ],
          horarios: [
            { id: 'h1', data: '2026-04-24', horarios: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
            { id: 'h2', data: '2026-04-25', horarios: ['09:00', '10:00', '11:00', '14:00'] },
            { id: 'h3', data: '2026-04-26', horarios: ['08:00', '09:00', '13:00', '14:00', '15:00'] },
          ],
          avaliacoes: [
            { id: 'a1', cliente: 'João Silva', nota: 5, comentario: 'Atendimento excelente! Super recomendo. Profissional muito competente.', data: '2026-04-15' },
            { id: 'a2', cliente: 'Maria Santos', nota: 5, comentario: 'Profissional muito competente e atenciosa. Ambiente limpo e organizado.', data: '2026-04-10' },
            { id: 'a3', cliente: 'Carlos Souza', nota: 4, comentario: 'Bom atendimento, apenas um pouco de demora na recepção.', data: '2026-04-05' },
          ],
          status: 'online',
          tempoMedioEspera: 15,
          certificacoes: ['CRO-BA 12345', 'Especialista em Harmonização Facial'],
        },
        '3': {
          id: '3',
          nome: 'João Santos',
          especialidade: 'Cabeleireiro',
          avatar: null,
          avaliacao: 4.8,
          totalAvaliacoes: 89,
          endereco: 'Av. Principal, 456',
          cidade: 'Valente',
          bairro: 'Centro',
          telefone: '(75) 98888-2222',
          whatsapp: '5575988882222',
          email: 'joao@barbearia.com',
          descricao: 'Especialista em cortes masculinos e barba. Ambiente moderno e descontraído.',
          servicos: [
            { id: 's4', nome: 'Corte Masculino', descricao: 'Corte tradicional ou moderno', duracao: 30, preco: 45 },
            { id: 's5', nome: 'Barba', descricao: 'Barba completa com toalha quente', duracao: 30, preco: 35 },
            { id: 's6', nome: 'Corte + Barba', descricao: 'Pacote completo', duracao: 60, preco: 70, precoPromocional: 65 },
          ],
          horarios: [
            { id: 'h4', data: '2026-04-24', horarios: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
            { id: 'h5', data: '2026-04-25', horarios: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
          ],
          avaliacoes: [
            { id: 'a1', cliente: 'Pedro Costa', nota: 5, comentario: 'Melhor barbeiro da cidade! Corte perfeito e ambiente muito agradável.', data: '2026-04-12' },
            { id: 'a2', cliente: 'Lucas Ferreira', nota: 5, comentario: 'Atendimento top, saí muito satisfeito. Recomendo a todos!', data: '2026-04-08' },
          ],
          status: 'online',
          tempoMedioEspera: 10,
          certificacoes: ['Especialista em Barba', 'Tendências 2025'],
        },
        '4': {
          id: '4',
          nome: 'Dr. Carlos Mota',
          especialidade: 'Fisioterapeuta',
          avatar: null,
          avaliacao: 4.9,
          totalAvaliacoes: 156,
          endereco: 'Rua do Comércio, 789',
          cidade: 'Valente',
          bairro: 'São José',
          telefone: '(75) 98888-3333',
          whatsapp: '5575988883333',
          email: 'carlos@fisio.com',
          descricao: 'Fisioterapia ortopédica e esportiva. Atendimento domiciliar disponível.',
          servicos: [
            { id: 's7', nome: 'Avaliação Fisioterápica', descricao: 'Avaliação completa', duracao: 45, preco: 150 },
            { id: 's8', nome: 'Sessão de Fisioterapia', descricao: 'Tratamento individualizado', duracao: 50, preco: 120 },
            { id: 's9', nome: 'Massoterapia', descricao: 'Massagem relaxante', duracao: 60, preco: 100 },
          ],
          horarios: [
            { id: 'h6', data: '2026-04-24', horarios: ['08:00', '09:00', '10:00', '14:00', '15:00'] },
            { id: 'h7', data: '2026-04-25', horarios: ['08:00', '09:00', '10:00', '11:00'] },
          ],
          avaliacoes: [
            { id: 'a1', cliente: 'Ana Paula', nota: 5, comentario: 'Fisioterapeuta excelente, resolveu minha dor nas costas em poucas sessões.', data: '2026-04-14' },
            { id: 'a2', cliente: 'Roberto Lima', nota: 5, comentario: 'Profissional muito capacitado e atencioso. Recomendo fortemente.', data: '2026-04-09' },
          ],
          status: 'ocupado',
          tempoMedioEspera: 45,
          certificacoes: ['CREFITO 123456', 'Especialista em Ortopedia'],
        },
      }

      const id = params.id as string
      setProfissional(profissionalData[id] || profissionalData['1'])
      setLoading(false)
    }, 500)
  }, [params.id])

  const enviarConfirmacaoBackground = async () => {
    if (!agendamentoConfirmado) {
      console.error('Agendamento não encontrado')
      return
    }

    const mensagemCliente = `
🏥 *VALENTE CONECTA - CONFIRMAÇÃO DE AGENDAMENTO* 🏥

✅ *Agendamento confirmado!*

📋 *Serviço:* ${agendamentoConfirmado.servico || 'Não informado'}
👤 *Profissional:* ${agendamentoConfirmado.profissional || 'Não informado'}
📅 *Data:* ${agendamentoConfirmado.data ? new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR') : 'Não informada'}
⏰ *Horário:* ${agendamentoConfirmado.horario || 'Não informado'}
💰 *Valor:* R$ ${(agendamentoConfirmado.valor || 0).toFixed(2)}

📍 *Endereço:* ${profissional?.endereco || 'Não informado'}, ${profissional?.cidade || ''}

⚠️ *Importante:* Chegue 10 minutos antes do horário agendado.

_Agendamento realizado via Valente Conecta_
    `.trim()

    const mensagemProfissional = `
🏥 *VALENTE CONECTA - NOVO AGENDAMENTO* 🏥

📋 *Serviço:* ${agendamentoConfirmado.servico || 'Não informado'}
👤 *Cliente:* ${agendamentoConfirmado.cliente || 'Não informado'}
📞 *Contato:* ${agendamentoConfirmado.telefone || 'Não informado'}
📅 *Data:* ${agendamentoConfirmado.data ? new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR') : 'Não informada'}
⏰ *Horário:* ${agendamentoConfirmado.horario || 'Não informado'}
💰 *Valor:* R$ ${(agendamentoConfirmado.valor || 0).toFixed(2)}

${agendamentoConfirmado.observacoes ? `📝 *Observações:* ${agendamentoConfirmado.observacoes}` : ''}

_Agendamento recebido via Valente Conecta_
    `.trim()

    try {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: agendamentoConfirmado.telefone, mensagem: mensagemCliente })
      })
    } catch (error) {
      console.error('Erro ao enviar para cliente:', error)
    }

    try {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone: profissional?.whatsapp, mensagem: mensagemProfissional })
      })
    } catch (error) {
      console.error('Erro ao enviar para profissional:', error)
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Agendamento Confirmado!', {
        body: `Seu ${agendamentoConfirmado.servico} foi agendado para ${agendamentoConfirmado.data ? new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR') : 'data a confirmar'} às ${agendamentoConfirmado.horario}`,
        icon: '/icon-192.png'
      })
    }
  }

  const handleAgendar = async () => {
    if (!servicoSelecionado || !dataSelecionada || !horarioSelecionado) {
      alert('Selecione um serviço, data e horário')
      return
    }
    if (!nomeCliente || !telefoneCliente) {
      alert('Preencha nome e telefone para continuar')
      return
    }
    
    setEnviando(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const confirmacao = {
      id: Math.random().toString(36).substring(2).toUpperCase(),
      profissional: profissional.nome,
      servico: servicoSelecionado.nome,
      data: dataSelecionada,
      horario: horarioSelecionado,
      cliente: nomeCliente,
      telefone: telefoneCliente,
      observacoes: observacoes,
      valor: servicoSelecionado.precoPromocional || servicoSelecionado.preco,
    }
    
    setAgendamentoConfirmado(confirmacao)
    setEnviando(false)
    setShowAgendamento(false)
    
    setTimeout(async () => {
      await enviarConfirmacaoBackground()
    }, 100)
    
    setShowConfirmacao(true)
  }

  const adicionarAListaEspera = () => {
    alert('Você foi adicionado à fila de espera! Iremos notificar quando houver disponibilidade.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    )
  }

  if (!profissional) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/servicos-agendamento" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white truncate">{profissional.nome}</h1>
          <button onClick={() => setFavorito(!favorito)} className="p-2 bg-zinc-800 rounded-xl">
            <Heart className={`w-5 h-5 ${favorito ? 'fill-red-500 text-red-500' : 'text-zinc-400'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Banner/Perfil */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-white">{profissional.nome}</h2>
              <p className="text-yellow-400 text-sm">{profissional.especialidade}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-bold">{profissional.avaliacao}</span>
                </div>
                <span className="text-zinc-500 text-sm">({profissional.totalAvaliacoes} avaliações)</span>
              </div>
            </div>
            <button className="p-2 bg-zinc-800 rounded-xl">
              <Share2 className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-2">Sobre</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{profissional.descricao}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {profissional.certificacoes?.map((cert: string) => (
              <span key={cert} className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400 flex items-center gap-1">
                <Award className="w-3 h-3" /> {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Localização e Contato */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white">Localização e Contato</h3>
          <div className="space-y-2">
            <p className="text-zinc-400 text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-yellow-400" />{profissional.endereco}, {profissional.cidade}</p>
            <p className="text-zinc-400 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" />Tempo médio de espera: ~{profissional.tempoMedioEspera} minutos</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => window.open(`tel:${profissional.telefone}`)} className="flex-1 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Ligar
            </button>
            <button onClick={() => window.open(`https://wa.me/${profissional.whatsapp}`, '_blank')} className="flex-1 py-2 bg-green-600 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={() => window.open(`mailto:${profissional.email}`)} className="flex-1 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>
        </div>

        {/* Serviços */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Serviços Oferecidos</h3>
          <div className="space-y-3">
            {profissional.servicos.map((servico: Servico) => (
              <div key={servico.id} className={`p-4 rounded-xl border transition-all cursor-pointer ${servicoSelecionado?.id === servico.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-800 hover:border-zinc-700'}`} onClick={() => setServicoSelecionado(servico)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{servico.nome}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{servico.descricao}</p>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Duração: {servico.duracao} min</p>
                  </div>
                  <div className="text-right">
                    {servico.precoPromocional && (
                      <span className="text-xs text-zinc-500 line-through block">R$ {servico.preco.toFixed(2)}</span>
                    )}
                    <span className="text-xl font-black text-yellow-400">R$ {(servico.precoPromocional || servico.preco).toFixed(2)}</span>
                    {servico.precoPromocional && (
                      <span className="text-xs text-emerald-400 block">Economia R$ {(servico.preco - servico.precoPromocional).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Agendamento */}
        {servicoSelecionado && (
          <button onClick={() => setShowAgendamento(true)} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
            <Calendar className="w-5 h-5" /> Agendar {servicoSelecionado.nome}
          </button>
        )}

        {/* Seção de Avaliações - Versão Melhorada com limite de texto */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Avaliações ({profissional.totalAvaliacoes})
            </h3>
            <button className="text-yellow-400 text-sm hover:underline">Ver todas</button>
          </div>
          
          <div className="space-y-4">
            {profissional.avaliacoes.slice(0, 2).map((avaliacao: Avaliacao) => (
              <div key={avaliacao.id} className="pb-4 border-b border-zinc-800 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="font-medium text-white text-sm">{avaliacao.cliente}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < avaliacao.nota ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'}`} />
                    ))}
                  </div>
                </div>
                {/* Limite de texto: 3 linhas com line-clamp-3 */}
                <p className="text-zinc-400 text-sm mt-2 line-clamp-3">
                  {avaliacao.comentario}
                </p>
                <p className="text-xs text-zinc-600 mt-2 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
            
            {/* Botão para adicionar avaliação */}
            <button className="w-full mt-2 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-400 transition flex items-center justify-center gap-2">
              <Star className="w-4 h-4" /> Avaliar este profissional
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Agendamento */}
      {showAgendamento && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Agendar {servicoSelecionado?.nome}</h3>
              <button onClick={() => setShowAgendamento(false)} className="p-2 hover:bg-zinc-800 rounded-xl"><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Seu nome *</label>
                  <input type="text" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Nome completo" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">WhatsApp *</label>
                  <input type="tel" value={telefoneCliente} onChange={(e) => setTelefoneCliente(e.target.value)} placeholder="(75) 9 8888-7777" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Selecione a data</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {profissional.horarios.map((h: HorarioDisponivel) => (
                    <button key={h.id} onClick={() => { setDataSelecionada(h.data); setHorarioSelecionado('') }} className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${dataSelecionada === h.data ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                      {new Date(h.data).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button>
                  ))}
                </div>
              </div>

              {dataSelecionada && (
                <div>
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Selecione o horário</label>
                  <div className="grid grid-cols-3 gap-2">
                    {profissional.horarios.find((h: HorarioDisponivel) => h.data === dataSelecionada)?.horarios.map((h: string) => (
                      <button key={h} onClick={() => setHorarioSelecionado(h)} className={`py-2 rounded-xl text-sm font-bold transition-all ${horarioSelecionado === h ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{h}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Selecione o atendente (opcional)</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setAtendenteSelecionado('qualquer')}
                    className={`w-full p-3 rounded-xl text-left transition-all ${atendenteSelecionado === 'qualquer' ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800 border-2 border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Qualquer atendente disponível</p>
                        <p className="text-xs text-zinc-500">O admin atribuirá automaticamente</p>
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 rounded-full">
                        <span className="text-xs text-green-400 font-medium">Recomendado</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setAtendenteSelecionado('pedro')}
                    className={`w-full p-3 rounded-xl text-left transition-all ${atendenteSelecionado === 'pedro' ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800 border-2 border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Pedro Costa</p>
                        <p className="text-xs text-zinc-500">Cabeleireiro • 4.8 ★</p>
                      </div>
                      <div className="px-2 py-1 bg-blue-500/20 rounded-full">
                        <span className="text-xs text-blue-400 font-medium">Disponível</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setAtendenteSelecionado('ana')}
                    className={`w-full p-3 rounded-xl text-left transition-all ${atendenteSelecionado === 'ana' ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800 border-2 border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Ana Silva</p>
                        <p className="text-xs text-zinc-500">Médica • 4.9 ★</p>
                      </div>
                      <div className="px-2 py-1 bg-purple-500/20 rounded-full">
                        <span className="text-xs text-purple-400 font-medium">Disponível</span>
                      </div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Colaboradores disponíveis para atendimento
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Observações (opcional)</label>
                <textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Alguma informação adicional?" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none" />
              </div>

              {servicoSelecionado && (
                <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-zinc-400">Serviço: <span className="text-white font-bold">{servicoSelecionado.nome}</span></p>
                  <p className="text-sm text-zinc-400">Valor: <span className="text-yellow-400 font-bold">R$ {(servicoSelecionado.precoPromocional || servicoSelecionado.preco).toFixed(2)}</span></p>
                  <p className="text-sm text-zinc-400">Duração: {servicoSelecionado.duracao} minutos</p>
                </div>
              )}

              <button onClick={handleAgendar} disabled={enviando || !servicoSelecionado || !dataSelecionada || !horarioSelecionado || !nomeCliente || !telefoneCliente} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50">
                {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {enviando ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>

              <button onClick={adicionarAListaEspera} className="w-full py-3 bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-700 transition">
                Não encontrou horário? Entrar na fila de espera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Elegante */}
      {showConfirmacao && agendamentoConfirmado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-yellow-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-yellow-500/10">
            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-center">
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
                  <CheckCircle className="w-12 h-12 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-white">Agendamento Confirmado!</h2>
                <p className="text-white/80 text-sm mt-1">Seu horário foi reservado com sucesso</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-700">
                  <CalendarCheck className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Data e Horário</p>
                    <p className="text-white font-bold">
                      {agendamentoConfirmado.data ? new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR') : 'Data confirmada'} • {agendamentoConfirmado.horario}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-700">
                  <Briefcase className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Serviço</p>
                    <p className="text-white font-bold">{agendamentoConfirmado.servico}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Profissional</p>
                    <p className="text-white font-bold">{agendamentoConfirmado.profissional}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">Código do Agendamento</p>
                <p className="text-lg font-mono font-bold text-yellow-400 tracking-wider">{agendamentoConfirmado.id}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <BellRing className="w-4 h-4" />
                  <span>Confirmação enviada</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Agendamento ativo</span>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-400">🔔 Lembrete: Chegue 10 minutos antes do horário agendado</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => router.push('/servicos-agendamento')} className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition">
                  Voltar para lista
                </button>
                <button onClick={() => router.push('/')} className="flex-1 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition">
                  Ir para Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}