'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Dumbbell, Calendar, TrendingUp, Award, Users, ChevronLeft, LogIn, 
  Settings, MapPin, Clock, Bell, Droplet, Coffee, Activity, Heart,
  Edit2, Plus, Trash2, Navigation, Target, Flame, Battery, Footprints,
  Zap, AlertCircle, CheckCircle, MessageCircle, ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react'

interface AcademiaDados {
  nome: string
  endereco: string
  lat?: number
  lng?: number
  horarioInicio: string
  horarioFim: string
  frequenciaSemanal: number
  exercicios: string[]
}

interface EsporteLocal {
  id: string
  nome: string
  local: string
  endereco: string
  lat?: number
  lng?: number
  diasSemana: number[]
  duracao: number
  horario: string
}

export default function AcademiaPage() {
  const [cadastrado, setCadastrado] = useState(false)
  const [dadosAcademia, setDadosAcademia] = useState<AcademiaDados | null>(null)
  const [esportes, setEsportes] = useState<EsporteLocal[]>([])
  const [showModalAcademia, setShowModalAcademia] = useState(false)
  const [showModalEsporte, setShowModalEsporte] = useState(false)
  const [editandoEsporte, setEditandoEsporte] = useState<EsporteLocal | null>(null)
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [slideAtual, setSlideAtual] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Slides do carrossel
  const slides = [
    {
      titulo: '💪 Desafio da Semana',
      descricao: 'Complete 5 treinos e ganhe um brinde exclusivo!',
      cor: 'from-purple-500 to-pink-500',
      acao: 'Participar'
    },
    {
      titulo: '🏆 Ranking de Presenças',
      descricao: 'Você está no top 10! Continue assim!',
      cor: 'from-yellow-500 to-orange-500',
      acao: 'Ver ranking'
    },
    {
      titulo: '🎯 Meta Pessoal',
      descricao: 'Você está a 2 treinos de bater sua meta mensal!',
      cor: 'from-green-500 to-emerald-500',
      acao: 'Ver metas'
    }
  ]

  // Dados do formulário de academia
  const [formAcademia, setFormAcademia] = useState<AcademiaDados>({
    nome: '',
    endereco: '',
    horarioInicio: '08:00',
    horarioFim: '20:00',
    frequenciaSemanal: 3,
    exercicios: []
  })

  // Dados do formulário de esporte
  const [formEsporte, setFormEsporte] = useState({
    nome: '',
    local: '',
    endereco: '',
    diasSemana: [] as number[],
    duracao: 60,
    horario: '18:00'
  })

  const dias = [
    { id: 0, nome: 'Dom', abreviado: 'D' },
    { id: 1, nome: 'Seg', abreviado: 'S' },
    { id: 2, nome: 'Ter', abreviado: 'T' },
    { id: 3, nome: 'Qua', abreviado: 'Q' },
    { id: 4, nome: 'Qui', abreviado: 'Q' },
    { id: 5, nome: 'Sex', abreviado: 'S' },
    { id: 6, nome: 'Sáb', abreviado: 'S' },
  ]

  const exerciciosLista = [
    'Musculação', 'Esteira', 'Bicicleta', 'Alongamento', 'Funcional',
    'Crossfit', 'Boxe', 'Dança', 'Yoga', 'Pilates', 'Natação', 'Corrida'
  ]

  // Carregar dados salvos
  useEffect(() => {
    const savedCadastro = localStorage.getItem('academia_cadastrado')
    setCadastrado(savedCadastro === 'true')
    
    const savedAcademia = localStorage.getItem('academia_dados_academia')
    if (savedAcademia) {
      setDadosAcademia(JSON.parse(savedAcademia))
      setFormAcademia(JSON.parse(savedAcademia))
    }
    
    const savedEsportes = localStorage.getItem('academia_esportes')
    if (savedEsportes) {
      setEsportes(JSON.parse(savedEsportes))
    }
  }, [])

  // Auto-play do carrossel
  useEffect(() => {
    if (intervalId) clearInterval(intervalId)
    const id = setInterval(() => {
      setSlideAtual((prev) => (prev + 1) % slides.length)
    }, 5000)
    setIntervalId(id)
    return () => clearInterval(id)
  }, [slides.length])

  const proximoSlide = () => {
    setSlideAtual((prev) => (prev + 1) % slides.length)
    resetarTimer()
  }

  const slideAnterior = () => {
    setSlideAtual((prev) => (prev - 1 + slides.length) % slides.length)
    resetarTimer()
  }

  const resetarTimer = () => {
    if (intervalId) clearInterval(intervalId)
    const id = setInterval(() => {
      setSlideAtual((prev) => (prev + 1) % slides.length)
    }, 5000)
    setIntervalId(id)
  }

  const capturarLocalizacao = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocalizacao({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setMensagem('📍 Localização capturada com sucesso!')
        setTimeout(() => setMensagem(''), 3000)
      })
    } else {
      setMensagem('❌ Geolocalização não suportada')
      setTimeout(() => setMensagem(''), 3000)
    }
  }

  const salvarAcademia = () => {
    const dadosCompletos = {
      ...formAcademia,
      lat: localizacao?.lat,
      lng: localizacao?.lng
    }
    setDadosAcademia(dadosCompletos)
    localStorage.setItem('academia_dados_academia', JSON.stringify(dadosCompletos))
    localStorage.setItem('academia_cadastrado', 'true')
    setCadastrado(true)
    setShowModalAcademia(false)
    setMensagem('✅ Academia salva com sucesso!')
    setTimeout(() => setMensagem(''), 3000)
  }

  const salvarEsporte = () => {
    if (editandoEsporte) {
      const novosEsportes = esportes.map(e => 
        e.id === editandoEsporte.id ? { ...formEsporte, id: e.id, lat: localizacao?.lat, lng: localizacao?.lng } : e
      )
      setEsportes(novosEsportes)
      localStorage.setItem('academia_esportes', JSON.stringify(novosEsportes))
      setMensagem('✏️ Esporte atualizado!')
    } else {
      const novoEsporte: EsporteLocal = {
        id: Date.now().toString(),
        ...formEsporte,
        lat: localizacao?.lat,
        lng: localizacao?.lng
      }
      const novosEsportes = [...esportes, novoEsporte]
      setEsportes(novosEsportes)
      localStorage.setItem('academia_esportes', JSON.stringify(novosEsportes))
      setMensagem('➕ Esporte adicionado!')
    }
    setShowModalEsporte(false)
    setEditandoEsporte(null)
    setFormEsporte({ nome: '', local: '', endereco: '', diasSemana: [], duracao: 60, horario: '18:00' })
    setTimeout(() => setMensagem(''), 3000)
  }

  const removerEsporte = (id: string) => {
    const novosEsportes = esportes.filter(e => e.id !== id)
    setEsportes(novosEsportes)
    localStorage.setItem('academia_esportes', JSON.stringify(novosEsportes))
    setMensagem('🗑️ Esporte removido')
    setTimeout(() => setMensagem(''), 3000)
  }

  const enviarLembrete = (tipo: string, nome?: string) => {
    const numero = localStorage.getItem('academia_telefone') || ''
    let mensagemWhats = ''
    
    if (tipo === 'agua') {
      mensagemWhats = '💧 *Hora de hidratar!* 💧\n\nNão esqueça de beber água durante o treino. Mantenha-se saudável! 🏋️‍♂️'
    } else if (tipo === 'treino') {
      mensagemWhats = `⏰ *Hora do treino!* ⏰\n\nSeu treino na ${dadosAcademia?.nome || 'academia'} está marcado para agora. Prepare-se e vamos com tudo! 💪`
    } else if (tipo === 'esporte' && nome) {
      mensagemWhats = `⚽ *Hora do ${nome}!* ⚽\n\nSua atividade está marcada para agora. Divirta-se e aproveite! 🎉`
    }
    
    if (numero) {
      window.open(`https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemWhats)}`, '_blank')
    } else {
      setMensagem('📱 Cadastre seu telefone primeiro!')
      setTimeout(() => setMensagem(''), 3000)
    }
  }

  const dicas = [
    { icone: Droplet, texto: 'Beba água a cada 30 minutos', cor: 'text-blue-400', ação: 'agua' },
    { icone: Clock, texto: 'Chegue 15 minutos antes para aquecer', cor: 'text-yellow-400' },
    { icone: Activity, texto: 'Você está a 2 treinos de bater sua meta!', cor: 'text-green-400' },
    { icone: Heart, texto: 'Seu batimento ideal é 120-140 bpm', cor: 'text-red-400' },
    { icone: Battery, texto: 'Descanço é tão importante quanto o treino', cor: 'text-purple-400' },
    { icone: Flame, texto: 'Você queimou 450 calorias esta semana', cor: 'text-orange-400' },
  ]

  const toggleDia = (diaId: number) => {
    setFormEsporte(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(diaId)
        ? prev.diasSemana.filter(d => d !== diaId)
        : [...prev.diasSemana, diaId]
    }))
  }

  const toggleExercicio = (exercicio: string) => {
    setFormAcademia(prev => ({
      ...prev,
      exercicios: prev.exercicios.includes(exercicio)
        ? prev.exercicios.filter(e => e !== exercicio)
        : [...prev.exercicios, exercicio]
    }))
  }

  const noticias = [
    { id: 1, titulo: 'Desafio de 30 dias', descricao: 'Participe e ganhe prêmios exclusivos', data: 'Amanhã', cor: 'from-blue-500 to-cyan-500' },
    { id: 2, titulo: 'Avaliação física gratuita', descricao: 'Agende sua avaliação com nossos profissionais', data: 'Essa semana', cor: 'from-green-500 to-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header - sem o texto "Minha Academia" */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="w-10" />
          {cadastrado && dadosAcademia && (
            <button onClick={() => setShowModalAcademia(true)} className="p-2 bg-zinc-800 rounded-xl">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Carrossel Fixo */}
        <div className="sticky top-16 z-30 bg-zinc-950 pt-2 pb-2 -mt-2">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${slideAtual * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className={`bg-gradient-to-r ${slide.cor} rounded-2xl p-6 text-center min-h-[140px] flex flex-col justify-between`}>
                      <div>
                        <h3 className="text-xl font-black text-white">{slide.titulo}</h3>
                        <p className="text-white/80 text-sm mt-2">{slide.descricao}</p>
                      </div>
                      <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-bold transition w-fit mx-auto">
                        {slide.acao} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={slideAnterior} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all">
              <ChevronLeftIcon className="w-5 h-5 text-white" />
            </button>
            <button onClick={proximoSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all">
              <ChevronRightIcon className="w-5 h-5 text-white" />
            </button>
            
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, index) => (
                <button key={index} onClick={() => setSlideAtual(index)} className={`h-1.5 rounded-full transition-all ${slideAtual === index ? 'w-6 bg-yellow-400' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Card da Academia */}
        <div className="bg-gradient-to-r from-amber-800/50 to-orange-800/50 rounded-2xl p-5 border border-amber-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-yellow-400" />
              <h2 className="font-bold text-white text-sm uppercase tracking-wider">MINHA ACADEMIA</h2>
            </div>
            <button onClick={() => setShowModalAcademia(true)} className="p-1 hover:bg-white/10 rounded-lg transition">
              <Edit2 className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
          
          <h3 className="text-xl font-black text-white mb-3">
            {dadosAcademia?.nome || 'Nenhuma academia cadastrada'}
          </h3>
          
          {dadosAcademia ? (
            <div className="space-y-2 text-sm">
              <p className="text-zinc-300 flex items-center gap-2"><MapPin className="w-3 h-3" />{dadosAcademia.endereco}</p>
              <p className="text-zinc-300 flex items-center gap-2"><Clock className="w-3 h-3" />{dadosAcademia.horarioInicio} - {dadosAcademia.horarioFim}</p>
              <p className="text-zinc-300 flex items-center gap-2"><Calendar className="w-3 h-3" />{dadosAcademia.frequenciaSemanal} dias/semana</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {dadosAcademia.exercicios.slice(0, 3).map(ex => (
                  <span key={ex} className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">{ex}</span>
                ))}
                {dadosAcademia.exercicios.length > 3 && (
                  <span className="text-xs text-zinc-500">+{dadosAcademia.exercicios.length - 3}</span>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowModalAcademia(true)} className="w-full py-3 bg-yellow-500 text-black rounded-xl font-bold text-sm mt-2">
              Configurar Academia →
            </button>
          )}
        </div>

        {/* Card de Esportes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Esportes
            </h2>
            <button onClick={() => { setEditandoEsporte(null); setFormEsporte({ nome: '', local: '', endereco: '', diasSemana: [], duracao: 60, horario: '18:00' }); setShowModalEsporte(true) }} className="p-1 hover:bg-white/10 rounded-lg transition">
              <Plus className="w-5 h-5 text-yellow-400" />
            </button>
          </div>
          
          {esportes.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">Nenhum esporte cadastrado. Clique em + para adicionar.</p>
          ) : (
            <div className="space-y-3">
              {esportes.map(esporte => (
                <div key={esporte.id} className="bg-zinc-800/50 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{esporte.nome}</h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {esporte.local} - {esporte.endereco}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{esporte.horario}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{esporte.duracao} min</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {dias.filter(d => esporte.diasSemana.includes(d.id)).map(d => (
                          <span key={d.id} className="text-xs bg-green-500/20 px-1.5 py-0.5 rounded text-green-400">{d.abreviado}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => enviarLembrete('esporte', esporte.nome)} className="p-1.5 bg-green-600 rounded-lg hover:bg-green-500 transition" title="Enviar lembrete">
                        <Bell className="w-3 h-3 text-white" />
                      </button>
                      <button onClick={() => { setEditandoEsporte(esporte); setFormEsporte({ nome: esporte.nome, local: esporte.local, endereco: esporte.endereco, diasSemana: esporte.diasSemana, duracao: esporte.duracao, horario: esporte.horario }); setShowModalEsporte(true) }} className="p-1.5 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition">
                        <Edit2 className="w-3 h-3 text-zinc-400" />
                      </button>
                      <button onClick={() => removerEsporte(esporte.id)} className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão Começar Agora */}
        <Link href="/academia/cadastro" className="block w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-2xl font-black text-lg text-center hover:scale-105 transition">
          Começar Agora →
        </Link>

        {/* Notícias */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">📢 Novidades</h3>
          {noticias.map(noticia => (
            <div key={noticia.id} className={`bg-gradient-to-r ${noticia.cor} rounded-2xl p-4`}>
              <h4 className="font-bold text-black">{noticia.titulo}</h4>
              <p className="text-black/80 text-sm">{noticia.descricao}</p>
              <span className="text-black/60 text-xs mt-2 inline-block">{noticia.data}</span>
            </div>
          ))}
        </div>

        {/* Dicas e curiosidades */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Dicas e Curiosidades
          </h3>
          <div className="space-y-2">
            {dicas.map((dica, idx) => {
              const Icon = dica.icone
              return (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition">
                  <Icon className={`w-4 h-4 ${dica.cor}`} />
                  <p className="text-sm text-zinc-300 flex-1">{dica.texto}</p>
                  {dica.ação && (
                    <button onClick={() => enviarLembrete(dica.ação as string)} className="text-xs text-green-400 hover:underline">
                      Lembrar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Mensagem flutuante */}
      {mensagem && (
        <div className="fixed bottom-24 left-4 right-4 bg-zinc-800 border border-yellow-500/30 rounded-xl p-3 text-center animate-slide-up z-50">
          <p className="text-sm text-yellow-400">{mensagem}</p>
        </div>
      )}

      {/* Modais... (manter iguais) */}
      {showModalAcademia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Configurar Academia</h3>
              <button onClick={() => setShowModalAcademia(false)} className="p-1 hover:bg-zinc-800 rounded-lg"><Trash2 className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-white text-sm font-bold mb-1">Nome da academia *</label><input type="text" value={formAcademia.nome} onChange={e => setFormAcademia({...formAcademia, nome: e.target.value})} placeholder="Ex: Smart Fit" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-1">Endereço *</label><input type="text" value={formAcademia.endereco} onChange={e => setFormAcademia({...formAcademia, endereco: e.target.value})} placeholder="Rua, número, bairro" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <button onClick={capturarLocalizacao} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Capturar Localização</button>
              {localizacao && <p className="text-xs text-green-400 text-center">✅ Localização capturada!</p>}
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-white text-sm font-bold mb-1">Horário início</label><input type="time" value={formAcademia.horarioInicio} onChange={e => setFormAcademia({...formAcademia, horarioInicio: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div><div><label className="block text-white text-sm font-bold mb-1">Horário fim</label><input type="time" value={formAcademia.horarioFim} onChange={e => setFormAcademia({...formAcademia, horarioFim: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div></div>
              <div><label className="block text-white text-sm font-bold mb-1">Dias por semana</label><div className="flex gap-2">{ [1,2,3,4,5,6,7].map(num => (<button key={num} onClick={() => setFormAcademia({...formAcademia, frequenciaSemanal: num})} className={`w-10 h-10 rounded-full text-sm font-bold ${formAcademia.frequenciaSemanal === num ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{num}</button>)) }</div></div>
              <div><label className="block text-white text-sm font-bold mb-2">Tipos de exercício</label><div className="flex flex-wrap gap-2">{exerciciosLista.map(ex => (<button key={ex} onClick={() => toggleExercicio(ex)} className={`px-3 py-2 rounded-full text-xs ${formAcademia.exercicios.includes(ex) ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{ex}</button>))}</div></div>
              <button onClick={salvarAcademia} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black">Salvar Academia</button>
            </div>
          </div>
        </div>
      )}

      {showModalEsporte && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">{editandoEsporte ? 'Editar Esporte' : 'Adicionar Esporte'}</h3>
              <button onClick={() => setShowModalEsporte(false)} className="p-1 hover:bg-zinc-800 rounded-lg"><Trash2 className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-white text-sm font-bold mb-1">Nome do esporte/atividade *</label><input type="text" value={formEsporte.nome} onChange={e => setFormEsporte({...formEsporte, nome: e.target.value})} placeholder="Ex: Futebol, Corrida, Natação" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-1">Nome do local *</label><input type="text" value={formEsporte.local} onChange={e => setFormEsporte({...formEsporte, local: e.target.value})} placeholder="Ex: Campo do bairro, Praia, Parque" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-white text-sm font-bold mb-1">Endereço completo *</label><input type="text" value={formEsporte.endereco} onChange={e => setFormEsporte({...formEsporte, endereco: e.target.value})} placeholder="Rua, número, bairro, cidade" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div>
              <button onClick={capturarLocalizacao} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Capturar Localização</button>
              {localizacao && <p className="text-xs text-green-400 text-center">✅ Localização capturada!</p>}
              <div className="grid grid-cols-2 gap-3"><div><label className="block text-white text-sm font-bold mb-1">Horário</label><input type="time" value={formEsporte.horario} onChange={e => setFormEsporte({...formEsporte, horario: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div><div><label className="block text-white text-sm font-bold mb-1">Duração (min)</label><input type="number" value={formEsporte.duracao} onChange={e => setFormEsporte({...formEsporte, duracao: Number(e.target.value)})} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white" /></div></div>
              <div><label className="block text-white text-sm font-bold mb-2">Dias da semana</label><div className="flex gap-2">{dias.map(dia => (<button key={dia.id} onClick={() => toggleDia(dia.id)} className={`w-10 h-10 rounded-full text-sm font-bold ${formEsporte.diasSemana.includes(dia.id) ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{dia.abreviado}</button>))}</div></div>
              <button onClick={salvarEsporte} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black">{editandoEsporte ? 'Atualizar' : 'Adicionar'} Esporte</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}