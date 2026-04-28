'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, MapPin, Navigation, Clock, Plus, X, ArrowLeft, Save, Edit, Bell, Trash2 } from 'lucide-react'

interface AtividadeEsportiva {
  id: string
  tipo: string
  nome: string
  local: string
  localizador: { lat: number; lng: number }
  localizadorCapturado: boolean
  diaSemana: string
  horario: string
  duracao: string
  alertaAtivo: boolean
}

const ESportes_PREDEFINIDOS = [
  'Futebol',
  'Caminhada',
  'Corrida',
  'Ciclismo',
  'Natação',
  'Vôlei',
  'Basquete',
  'Tênis',
  'Handebol',
  'Capoeira',
  'Crossfit',
  'Yoga',
  'Pilates',
  'Musculação',
  'Artes marciais',
]

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

export default function EsportesPage() {
  const [atividades, setAtividades] = useState<AtividadeEsportiva[]>([])
  const [novaAtividade, setNovaAtividade] = useState<Partial<AtividadeEsportiva>>({
    tipo: '',
    nome: '',
    local: '',
    localizador: { lat: 0, lng: 0 },
    localizadorCapturado: false,
    diaSemana: '',
    horario: '',
    duracao: '',
    alertaAtivo: true,
  })
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [capturandoLocal, setCapturandoLocal] = useState(false)
  const [buscaEsporte, setBuscaEsporte] = useState('')
  const [mostrarDropdown, setMostrarDropdown] = useState(false)

  useEffect(() => {
    const atividadesSalvas = localStorage.getItem('academia_esportes')
    if (atividadesSalvas) {
      setAtividades(JSON.parse(atividadesSalvas))
    }
  }, [])

  const esportesFiltrados = ESportes_PREDEFINIDOS.filter(esporte =>
    esporte.toLowerCase().includes(buscaEsporte.toLowerCase())
  )

  const capturarLocalizacao = () => {
    setCapturandoLocal(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNovaAtividade({
            ...novaAtividade,
            localizador: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            localizadorCapturado: true,
          })
          setCapturandoLocal(false)
          alert('Localização capturada com sucesso!')
        },
        (error) => {
          setCapturandoLocal(false)
          alert('Erro ao capturar localização. Verifique as permissões.')
        }
      )
    } else {
      setCapturandoLocal(false)
      alert('Geolocalização não suportada neste navegador.')
    }
  }

  const adicionarAtividade = () => {
    if (!novaAtividade.tipo || !novaAtividade.local || !novaAtividade.diaSemana || !novaAtividade.horario) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const atividade: AtividadeEsportiva = {
      id: Date.now().toString(),
      tipo: novaAtividade.tipo,
      nome: novaAtividade.nome || novaAtividade.tipo,
      local: novaAtividade.local,
      localizador: novaAtividade.localizador,
      localizadorCapturado: novaAtividade.localizadorCapturado || false,
      diaSemana: novaAtividade.diaSemana,
      horario: novaAtividade.horario,
      duracao: novaAtividade.duracao || '60 min',
      alertaAtivo: novaAtividade.alertaAtivo || true,
    }

    const novasAtividades = [...atividades, atividade]
    setAtividades(novasAtividades)
    localStorage.setItem('academia_esportes', JSON.stringify(novasAtividades))
    
    setNovaAtividade({
      tipo: '',
      nome: '',
      local: '',
      localizador: { lat: 0, lng: 0 },
      localizadorCapturado: false,
      diaSemana: '',
      horario: '',
      duracao: '',
      alertaAtivo: true,
    })
    setMostrarFormulario(false)
    setBuscaEsporte('')
    
    // Solicitar permissão para notificações
    if (atividade.alertaAtivo && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  const editarAtividade = (id: string) => {
    const atividade = atividades.find(a => a.id === id)
    if (atividade) {
      setNovaAtividade(atividade)
      setEditando(id)
      setMostrarFormulario(true)
    }
  }

  const salvarEdicao = () => {
    if (!novaAtividade.tipo || !novaAtividade.local || !novaAtividade.diaSemana || !novaAtividade.horario) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const atividadesAtualizadas = atividades.map(a =>
      a.id === editando
        ? {
            ...a,
            tipo: novaAtividade.tipo,
            nome: novaAtividade.nome || novaAtividade.tipo,
            local: novaAtividade.local,
            localizador: novaAtividade.localizador,
            localizadorCapturado: novaAtividade.localizadorCapturado || false,
            diaSemana: novaAtividade.diaSemana,
            horario: novaAtividade.horario,
            duracao: novaAtividade.duracao || '60 min',
            alertaAtivo: novaAtividade.alertaAtivo || true,
          }
        : a
    )

    setAtividades(atividadesAtualizadas)
    localStorage.setItem('academia_esportes', JSON.stringify(atividadesAtualizadas))
    
    setNovaAtividade({
      tipo: '',
      nome: '',
      local: '',
      localizador: { lat: 0, lng: 0 },
      localizadorCapturado: false,
      diaSemana: '',
      horario: '',
      duracao: '',
      alertaAtivo: true,
    })
    setMostrarFormulario(false)
    setBuscaEsporte('')
    setEditando(null)
  }

  const excluirAtividade = (id: string) => {
    if (confirm('Deseja excluir esta atividade?')) {
      const atividadesAtualizadas = atividades.filter(a => a.id !== id)
      setAtividades(atividadesAtualizadas)
      localStorage.setItem('academia_esportes', JSON.stringify(atividadesAtualizadas))
    }
  }

  const toggleAlerta = (id: string) => {
    const atividadesAtualizadas = atividades.map(a =>
      a.id === id ? { ...a, alertaAtivo: !a.alertaAtivo } : a
    )
    setAtividades(atividadesAtualizadas)
    localStorage.setItem('academia_esportes', JSON.stringify(atividadesAtualizadas))
  }

  const selecionarEsporte = (esporte: string) => {
    setNovaAtividade({ ...novaAtividade, tipo: esporte })
    setBuscaEsporte(esporte)
    setMostrarDropdown(false)
  }

  const tocarSirene = () => {
    // Tocar som de sirene
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sawtooth'
    gainNode.gain.value = 0.3
    
    oscillator.start()
    
    // Modulação para efeito de sirene
    const now = audioContext.currentTime
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.linearRampToValueAtTime(1200, now + 0.5)
    oscillator.frequency.linearRampToValueAtTime(800, now + 1)
    
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 2000)
  }

  const verificarAlertas = () => {
    const agora = new Date()
    const diaAtual = DIAS_SEMANA[agora.getDay()]
    const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0')
    
    atividades.forEach(atividade => {
      if (atividade.alertaAtivo && atividade.diaSemana === diaAtual && atividade.horario === horaAtual) {
        tocarSirene()
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚽ Hora do Esporte!', {
            body: `Hoje é dia de ${atividade.tipo} às ${atividade.horario}`,
            icon: '/icon.png',
          })
        }
      }
    })
  }

  useEffect(() => {
    const interval = setInterval(verificarAlertas, 60000) // Verificar a cada minuto
    return () => clearInterval(interval)
  }, [atividades])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/academia/selecao" className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </Link>
          
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>ESPORTES</span>
          </div>
          
          <button
            onClick={() => setMostrarFormulario(true)}
            className="relative group"
          >
            <Plus className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Atividades Esportivas</h1>
          <p className="text-zinc-400 text-sm">Cadastre seus esportes e receba alertas</p>
        </div>

        {mostrarFormulario && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">
                {editando ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              <button onClick={() => setMostrarFormulario(false)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Tipo de esporte</label>
              <input
                type="text"
                value={buscaEsporte}
                onChange={(e) => {
                  setBuscaEsporte(e.target.value)
                  setNovaAtividade({ ...novaAtividade, tipo: e.target.value })
                  setMostrarDropdown(true)
                }}
                onFocus={() => setMostrarDropdown(true)}
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                placeholder="Digite ou selecione um esporte"
              />
              {mostrarDropdown && esportesFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl max-h-48 overflow-y-auto">
                  {esportesFiltrados.map((esporte) => (
                    <button
                      key={esporte}
                      onClick={() => selecionarEsporte(esporte)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-zinc-700 transition-colors"
                    >
                      {esporte}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome personalizado (opcional)</label>
              <input
                type="text"
                value={novaAtividade.nome}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, nome: e.target.value })}
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                placeholder="Ex: Futebol do bairro"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Local</label>
              <input
                type="text"
                value={novaAtividade.local}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, local: e.target.value })}
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                placeholder="Ex: Campo do São José"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Localizador</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={novaAtividade.localizador.lat !== 0 ? `${novaAtividade.localizador.lat.toFixed(6)}, ${novaAtividade.localizador.lng.toFixed(6)}` : ''}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-zinc-400"
                  placeholder="Clique para capturar"
                />
                <button
                  onClick={capturarLocalizacao}
                  disabled={capturandoLocal}
                  className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
                >
                  <Navigation className="w-5 h-5" />
                  {capturandoLocal ? 'Capturando...' : novaAtividade.localizadorCapturado ? 'Refazer Captura' : 'Capturar'}
                </button>
              </div>
              {novaAtividade.localizadorCapturado && (
                <p className="text-xs text-orange-400 mt-1">Clique em "Refazer Captura" se estiver em outro local</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Dia da semana</label>
                <select
                  value={novaAtividade.diaSemana}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, diaSemana: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                >
                  <option value="">Selecione</option>
                  {DIAS_SEMANA.map((dia) => (
                    <option key={dia} value={dia} className="bg-zinc-800">
                      {dia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Horário</label>
                <input
                  type="time"
                  value={novaAtividade.horario}
                  onChange={(e) => setNovaAtividade({ ...novaAtividade, horario: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Duração planejada</label>
              <input
                type="text"
                value={novaAtividade.duracao}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, duracao: e.target.value })}
                className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                placeholder="Ex: 90 min"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="alerta"
                checked={novaAtividade.alertaAtivo}
                onChange={(e) => setNovaAtividade({ ...novaAtividade, alertaAtivo: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="alerta" className="text-sm text-white flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Ativar alerta com sirene
              </label>
            </div>

            <button
              onClick={editando ? salvarEdicao : adicionarAtividade}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl hover:shadow-orange-500/25 transition-all active:scale-95"
            >
              <Save className="w-5 h-5" />
              {editando ? 'Salvar Alterações' : 'Adicionar Atividade'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {atividades.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
              <Trophy className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-400">Nenhuma atividade cadastrada</p>
              <p className="text-zinc-500 text-sm mt-2">Clique no + para adicionar</p>
            </div>
          ) : (
            atividades.map((atividade) => (
              <div
                key={atividade.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{atividade.nome}</p>
                      <p className="text-zinc-400 text-sm">{atividade.tipo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editarAtividade(atividade.id)}
                      className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button
                      onClick={() => excluirAtividade(atividade.id)}
                      className="p-2 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Local</p>
                      <p className="text-sm text-white">{atividade.local}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Horário</p>
                      <p className="text-sm text-white">{atividade.diaSemana} às {atividade.horario}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-zinc-400">Duração: {atividade.duracao}</p>
                  </div>
                  <button
                    onClick={() => toggleAlerta(atividade.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      atividade.alertaAtivo
                        ? 'bg-orange-500/30 text-orange-300'
                        : 'bg-zinc-500/30 text-zinc-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    {atividade.alertaAtivo ? 'Alerta ativo' : 'Alerta inativo'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
