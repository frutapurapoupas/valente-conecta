'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle, Flame, MapPin, Plus, Minus,
  TrendingUp, BookOpen, Target, Trophy, Star, Wifi, WifiOff, Edit, Dumbbell, Brain,
  Activity, Heart, Zap, BarChart3, Calendar, Clock, User, Settings, Bell, Smartphone, MessageCircle, Scale, Ruler
} from 'lucide-react'
import AcademiaHeader from '@/components/academia/Header'
import BottomNav from '@/components/academia/BottomNav'
import AdminPanel from '@/components/academia/AdminPanel'
import NotificationPermission from '@/components/academia/NotificationPermission'
import PlanoAdminCard from '@/components/PlanoAdminCard'
import Link from 'next/link'
import {
  type PerfilAluno, salvarPerfil, carregarPerfil,
  notificarCheckIn, notificarEmAndamento, notificarCheckOut,
} from '@/hooks/useAcademiaNotificacoes'

// Coordenadas da academia — configuradas pelo admin
const GYM_LAT = -23.5505
const GYM_LNG = -46.6333
const GYM_RADIUS = 5   // metros — aluno precisa estar a 5m da academia
const WARMUP_MS = 5 * 60 * 1000 // 5 min após entrar no raio para iniciar contagem
const GEO_PERMISSION_KEY = 'academia_geo_granted'
const CHECKIN_KEY = 'academia_checkin'

function calcDist(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type GeoState = 'idle' | 'watching' | 'dentro' | 'fora' | 'negado'

interface Exercicio {
  id: number; nome: string; series: number; reps: number
  carga: number; metaCarga: number; feito: boolean
}

const TREINO_INICIAL: Exercicio[] = [
  { id: 1, nome: 'Supino Reto',     series: 4, reps: 12, carga: 60, metaCarga: 80,  feito: false },
  { id: 2, nome: 'Puxada Frontal',  series: 3, reps: 15, carga: 55, metaCarga: 70,  feito: false },
  { id: 3, nome: 'Desenvolvimento', series: 3, reps: 12, carga: 40, metaCarga: 60,  feito: false },
  { id: 4, nome: 'Rosca Direta',    series: 3, reps: 15, carga: 25, metaCarga: 35,  feito: false },
  { id: 5, nome: 'Agachamento',     series: 4, reps: 10, carga: 80, metaCarga: 100, feito: false },
]

const METAS_ALUNO = [
  { label: 'Peso corporal',   valor: '78 kg', meta: '72 kg', pct: 40, cor: 'bg-blue-500' },
  { label: 'Treinos/semana',  valor: '3x',    meta: '5x',    pct: 60, cor: 'bg-violet-500' },
  { label: 'Carga no supino', valor: '60 kg', meta: '80 kg', pct: 75, cor: 'bg-emerald-500' },
]

const INCENTIVOS = [
  { emoji: '🔥', txt: '5 treinos consecutivos — você está em chamas!', cor: 'amber' },
  { emoji: '🎯', txt: 'Supino a 75% da meta. Continue assim!', cor: 'violet' },
  { emoji: '⭐',        txt: '12 treinos esse mês — recorde pessoal!', cor: 'blue' },
]

// Dados mockados da IA
const mockIAData = {
  scoreRecuperacao: 75,
  passosHoje: 8500,
  frequenciaCardiaca: 72,
  nivelEnergia: 'Ótimo',
  recomendacaoIA: 'Treino de peito hoje - seu corpo está pronto!',
  proximoTreino: 'Peito e Tríceps',
  tempoDescanso: '48h',
  alertasAtivos: [
    { tipo: 'hidratacao', mensagem: 'Beba 500ml de água', urgencia: 'media' },
    { tipo: 'descanso', mensagem: 'Descanso de 90s entre séries', urgencia: 'baixa' }
  ]
}

export default function AcademiaPage() {
  const [isAdmin] = useState(false)
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null)
  const [showCadastro, setShowCadastro] = useState(false)
  const [showEditarPerfil, setShowEditarPerfil] = useState(false)
  const [showCadastrarAtividade, setShowCadastrarAtividade] = useState(false)
  const [formPerfil, setFormPerfil] = useState({ nome: '', objetivo: 'emagrecer', pesoAtual: '', pesoMeta: '', altura: '', periodoMeta: '', freqSemanal: '3', nivel: 'iniciante' })
  const [geoState, setGeoState] = useState<GeoState>('idle')
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [exercicios, setExercicios] = useState<Exercicio[]>(TREINO_INICIAL)
  const [incentIdx, setIncentIdx] = useState(0)
  const [alertasAtivos, setAlertasAtivos] = useState(mockIAData.alertasAtivos)
  const [notificacoesPush, setNotificacoesPush] = useState(true)
  const [notificacoesWhatsApp, setNotificacoesWhatsApp] = useState(false)
  const [perfilIA, setPerfilIA] = useState<any>(null)
  const [academiaDados, setAcademiaDados] = useState<any>(null)
  const watchRef    = useRef<number | null>(null)
  const timerRef    = useRef<NodeJS.Timeout | null>(null)
  const warmupRef   = useRef<NodeJS.Timeout | null>(null) // timer dos 5 min de espera
  const dentroRef   = useRef(false) // evita disparos duplicados

  function pararTudo() {
    // Para imediatamente ao sair do raio
    dentroRef.current = false
    if (warmupRef.current) { clearTimeout(warmupRef.current); warmupRef.current = null }
    setIsCheckIn(false)
    setElapsedTime(0)
    localStorage.removeItem(CHECKIN_KEY)
  }

  // --- Inicia monitoramento de localização ---
  function iniciarGeo() {
    if (!navigator.geolocation) { setGeoState('negado'); return }
    setGeoState('watching')
    localStorage.setItem(GEO_PERMISSION_KEY, '1')

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const dist = calcDist(pos.coords.latitude, pos.coords.longitude, GYM_LAT, GYM_LNG)
        const dentro = dist <= GYM_RADIUS
        setGeoState(dentro ? 'dentro' : 'fora')

        if (dentro) {
          if (!dentroRef.current) {
            // Primeira vez dentro do raio — aguarda 5 min para iniciar
            dentroRef.current = true
            warmupRef.current = setTimeout(() => {
              if (dentroRef.current) {
                const start = Date.now()
                setIsCheckIn(true)
                localStorage.setItem(CHECKIN_KEY, JSON.stringify({ start }))
                // Notifica check-in
                const p = carregarPerfil()
                if (p) notificarCheckIn(p)
              }
            }, WARMUP_MS)
          }
        } else {
          // Saíu do raio — para tudo imediatamente
          if (dentroRef.current) {
            // Notifica check-out com tempo acumulado
            const saved = localStorage.getItem(CHECKIN_KEY)
            if (saved) {
              const { start } = JSON.parse(saved)
              const mins = Math.floor((Date.now() - start) / 60000)
              const p = carregarPerfil()
              if (p && mins > 0) notificarCheckOut(p, mins)
            }
            pararTudo()
          }
          setGeoState('fora')
        }
      },
      () => setGeoState('negado'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
  }

  // Carrega perfil ao iniciar
  useEffect(() => {
    // Tenta carregar perfil do cadastro inicial da IA primeiro
    const perfilIA = localStorage.getItem('academia_perfil_ia')
    if (perfilIA) {
      const perfilIAData = JSON.parse(perfilIA)
      setPerfilIA(perfilIAData)
      // Converte para formato da página principal
      const perfilConvertido = {
        nome: perfilIAData.nome,
        objetivo: perfilIAData.objetivo,
        pesoAtual: perfilIAData.peso_atual.toString(),
        pesoMeta: perfilIAData.peso_meta.toString(),
        altura: perfilIAData.altura.toString(),
        periodoMeta: '3 meses',
        freqSemanal: perfilIAData.freq_semanal.toString(),
        nivel: perfilIAData.nivel
      }
      setFormPerfil(perfilConvertido)
      setPerfil(perfilIAData)
    } else {
      // Se não tem perfil IA, tenta carregar perfil antigo
      const p = carregarPerfil()
      if (p) setPerfil(p)
      else setShowCadastro(true)
    }

    // Carrega dados da academia
    const academiaSalva = localStorage.getItem('academia_dados')
    if (academiaSalva) {
      setAcademiaDados(JSON.parse(academiaSalva))
    }
  }, [])

  // Retoma monitoramento se já deu permissão antes
  useEffect(() => {
    const granted = localStorage.getItem(GEO_PERMISSION_KEY)
    const saved = localStorage.getItem(CHECKIN_KEY)
    if (saved) {
      const { start } = JSON.parse(saved)
      dentroRef.current = true
      setIsCheckIn(true)
      setElapsedTime(Math.floor((Date.now() - start) / 60000))
    }
    if (granted) iniciarGeo()
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
      if (warmupRef.current) clearTimeout(warmupRef.current)
    }
  }, []) // eslint-disable-line

  // Timer de treino — atualiza a cada minuto
  useEffect(() => {
    if (isCheckIn) {
      timerRef.current = setInterval(() => {
        setElapsedTime(t => {
          const novo = t + 1
          const saved = localStorage.getItem(CHECKIN_KEY)
          if (saved) {
            const data = JSON.parse(saved)
            localStorage.setItem(CHECKIN_KEY, JSON.stringify({ ...data, elapsed: novo }))
          }
          // Notifica a cada 30 min
          const p = carregarPerfil()
          if (p) notificarEmAndamento(p, novo)
          return novo
        })
      }, 60000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isCheckIn])

  // Rotação de incentivos
  useEffect(() => {
    const t = setInterval(() => setIncentIdx(i => (i + 1) % INCENTIVOS.length), 4000)
    return () => clearInterval(t)
  }, [])

  // Simulação de alertas IA
  useEffect(() => {
    if (isCheckIn) {
      const interval = setInterval(() => {
        const novosAlertas = [
          { tipo: 'hidratacao', mensagem: 'Beba 500ml de água', urgencia: 'media' },
          { tipo: 'descanso', mensagem: 'Descanso de 90s entre séries', urgencia: 'baixa' },
          { tipo: 'postura', mensagem: 'Corrija sua postura no supino', urgencia: 'alta' },
          { tipo: 'energia', mensagem: 'Nível de energia ótimo! Continue!', urgencia: 'baixa' }
        ]
        setAlertasAtivos(novosAlertas.slice(0, 2))
      }, 30000) // A cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [isCheckIn])

  function toggleExercicio(id: number) {
    setExercicios(ex => ex.map(e => e.id === id ? { ...e, feito: !e.feito } : e))
  }
  function alterarCarga(id: number, delta: number) {
    setExercicios(ex => ex.map(e => e.id === id ? { ...e, carga: Math.max(0, e.carga + delta) } : e))
  }

  function salvarFormPerfil() {
    if (!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta || !formPerfil.altura) return
    const novo: PerfilAluno = {
      nome: formPerfil.nome,
      objetivo: formPerfil.objetivo as PerfilAluno['objetivo'],
      pesoAtual: parseFloat(formPerfil.pesoAtual),
      pesoMeta: parseFloat(formPerfil.pesoMeta),
      altura: parseFloat(formPerfil.altura),
      periodoMeta: formPerfil.periodoMeta,
      freqSemanal: parseInt(formPerfil.freqSemanal),
      nivel: formPerfil.nivel as PerfilAluno['nivel'],
    }
    salvarPerfil(novo)
    setPerfil(novo)
    setShowCadastro(false)
    setShowEditarPerfil(false)

    // Sincroniza com o perfil da IA
    const perfilIA = {
      id: 1,
      user_id: 'demo-user',
      nome: formPerfil.nome,
      peso_atual: parseFloat(formPerfil.pesoAtual),
      peso_meta: parseFloat(formPerfil.pesoMeta),
      altura: parseFloat(formPerfil.altura),
      idade: 30, // valor padrão, pode ser ajustado
      sexo: 'masculino', // valor padrão, pode ser ajustado
      objetivo: formPerfil.objetivo,
      nivel: formPerfil.nivel,
      freq_semanal: parseInt(formPerfil.freqSemanal),
      condicoes_fisicas: [],
      tipo_exercicio: [],
      ativo: true
    }
    localStorage.setItem('academia_perfil_ia', JSON.stringify(perfilIA))
  }

  function abrirEditarPerfil() {
    if (perfil) {
      setFormPerfil({
        nome: perfil.nome,
        objetivo: perfil.objetivo,
        pesoAtual: perfil.pesoAtual.toString(),
        pesoMeta: perfil.pesoMeta.toString(),
        altura: perfil.altura?.toString() || '',
        periodoMeta: perfil.periodoMeta || '',
        freqSemanal: perfil.freqSemanal.toString(),
        nivel: perfil.nivel
      })
      setShowEditarPerfil(true)
    }
  }

  function formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h${m}m`
  }

  const totalFeitos = exercicios.filter(e => e.feito).length
  const pctFeitos = Math.round((totalFeitos / exercicios.length) * 100)
  const incent = INCENTIVOS[incentIdx]
  const corMap: Record<string, string> = {
    amber:  'bg-amber-50 border-amber-200 text-amber-800',
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
  }

  // --- Banner de geo ---
  const geoBanner = geoState === 'dentro' && isCheckIn
    ? { txt: '📍 Você está na academia — treino em andamento', cls: 'bg-emerald-100 text-emerald-700' }
    : geoState === 'dentro' && !isCheckIn
    ? { txt: '📍 Você está no local — contagem inicia em 5 min',  cls: 'bg-blue-100 text-blue-700' }
    : geoState === 'fora'
    ? { txt: '📍 Você saiu da academia',              cls: 'bg-orange-100 text-orange-700' }
    : geoState === 'watching'
    ? { txt: '📍 Detectando localização...',     cls: 'bg-slate-100 text-slate-500' }
    : geoState === 'negado'
    ? { txt: '📍 Localização negada pelo dispositivo', cls: 'bg-red-100 text-red-600' }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <NotificationPermission />
      <AcademiaHeader isAdmin={isAdmin} isCheckIn={isCheckIn} elapsedTime={elapsedTime} onActionClick={() => {}} />

      {/* Banner de localização ativo */}
      {geoBanner && (
        <div className={`mx-4 mt-3 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-semibold ${geoBanner.cls}`}>
          {geoState === 'watching' ? <Wifi className="w-4 h-4 flex-shrink-0" /> : geoState === 'negado' ? <WifiOff className="w-4 h-4 flex-shrink-0" /> : <MapPin className="w-4 h-4 flex-shrink-0" />}
          <span>{geoBanner.txt}</span>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Alertas IA em Tempo Real */}
        {alertasAtivos.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Alertas IA Ativos</h3>
                  <p className="text-xs text-zinc-400">Notificações inteligentes em tempo real</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {alertasAtivos.map((alerta, idx) => (
                <div key={idx} className={`rounded-2xl p-4 border transition-all ${
                  alerta.urgencia === 'alta' ? 'bg-red-500/20 border-red-500/30' :
                  alerta.urgencia === 'media' ? 'bg-orange-500/20 border-orange-500/30' :
                  'bg-yellow-500/20 border-yellow-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {alerta.urgencia === 'alta' ? <Bell className="w-4 h-4 text-red-400" /> :
                       alerta.urgencia === 'media' ? <Bell className="w-4 h-4 text-orange-400" /> :
                       <Bell className="w-4 h-4 text-yellow-400" />}
                      <p className="text-sm font-bold text-white">{alerta.mensagem}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alerta.urgencia === 'alta' ? 'bg-red-500/30 text-red-300' :
                      alerta.urgencia === 'media' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {alerta.urgencia.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configurações de Notificações */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Configurações de Alertas</h3>
              <p className="text-xs text-zinc-400">Personalize suas notificações</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-white">Notificações Push</p>
                  <p className="text-xs text-zinc-400">Alertas no seu celular</p>
                </div>
              </div>
              <button
                onClick={() => setNotificacoesPush(!notificacoesPush)}
                className={`w-12 h-6 rounded-full transition-all ${notificacoesPush ? 'bg-blue-500' : 'bg-zinc-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${notificacoesPush ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-bold text-white">Alertas WhatsApp</p>
                  <p className="text-xs text-zinc-400">Receba mensagens no WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setNotificacoesWhatsApp(!notificacoesWhatsApp)}
                className={`w-12 h-6 rounded-full transition-all ${notificacoesWhatsApp ? 'bg-green-500' : 'bg-zinc-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${notificacoesWhatsApp ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Card de Check-in Modernizado */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Check-in Academia</h3>
                <p className="text-xs text-zinc-400">{geoBanner ? geoBanner.txt : 'Localização não iniciada'}</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${geoState === 'dentro' ? 'bg-emerald-500' : geoState === 'watching' ? 'bg-yellow-500' : 'bg-zinc-500'} animate-pulse`} />
          </div>

          {/* Botão de entrada */}
          {geoState === 'idle' && (
            <button
              onClick={iniciarGeo}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
            >
              <MapPin className="w-5 h-5" />
              ESTOU NA ACADEMIA
            </button>
          )}

          {/* Status do Check-in */}
          {geoState !== 'idle' && (
            <div className="flex items-center justify-between py-3 px-4 bg-white/10 rounded-2xl border border-white/20">
              <div className="flex items-center gap-2">
                {geoState === 'watching' ? <Wifi className="w-4 h-4 text-yellow-400" /> : geoState === 'dentro' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-zinc-400" />}
                <span className="text-sm font-semibold text-white">
                  {geoState === 'watching' ? 'Procurando academia...' : geoState === 'dentro' ? 'Dentro da academia' : 'Fora da área'}
                </span>
              </div>
              {isCheckIn && (
                <span className="text-xs text-zinc-400">{formatTime(elapsedTime)}</span>
              )}
            </div>
          )}
        </div>

        {/* Card ACADEMIA - Tabela Editável */}
        {academiaDados && (
          <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30 rounded-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">ACADEMIA</h2>
                  <p className="text-xs text-zinc-400">Dados da sua academia</p>
                </div>
              </div>
              <Link href="/academia/configurar-academia" className="text-xs text-emerald-400">Editar Completo</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Nome</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.nome}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Endereço</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.endereco}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Telefone</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.telefone}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Email</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.email}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Mensalidade</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.mensalidade}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-2 text-zinc-400 font-medium">Responsável</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.responsavel}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-zinc-400 font-medium">Tel. Responsável</td>
                    <td className="py-3 px-2 text-white font-bold">{academiaDados.responsavelTelefone}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card PERFIL - Dados da IA */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-[32px] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">PERFIL</h2>
                <p className="text-xs text-zinc-400">Condições e resultados da IA</p>
              </div>
            </div>
            <Link href="/academia/cadastro-inicial" className="text-xs text-yellow-400">Editar</Link>
          </div>
          {perfilIA ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-white">{perfilIA.peso_atual} kg</p>
                  <p className="text-[10px] text-zinc-400">Peso</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-white">{perfilIA.peso_meta} kg</p>
                  <p className="text-[10px] text-zinc-400">Meta</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-white">{perfilIA.altura} m</p>
                  <p className="text-[10px] text-zinc-400">Altura</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-zinc-400">Objetivo</p>
                  <p className="text-sm font-bold text-white capitalize">{perfilIA.objetivo}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-zinc-400">Nível</p>
                  <p className="text-sm font-bold text-white capitalize">{perfilIA.nivel}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-zinc-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-zinc-400">Frequência</p>
                  <p className="text-sm font-bold text-white">{perfilIA.freq_semanal}x/semana</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-zinc-400">Idade</p>
                  <p className="text-sm font-bold text-white">{perfilIA.idade} anos</p>
                </div>
              </div>
              {(perfilIA.condicoes_fisicas?.length > 0 || perfilIA.tipo_exercicio?.length > 0) && (
                <div className="space-y-2">
                  {perfilIA.condicoes_fisicas?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase mb-1">Condições</p>
                      <div className="flex flex-wrap gap-1">
                        {perfilIA.condicoes_fisicas.map((cond: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-red-500/30 text-red-300 rounded-full text-[10px]">{cond}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {perfilIA.tipo_exercicio?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase mb-1">Exercícios</p>
                      <div className="flex flex-wrap gap-1">
                        {perfilIA.tipo_exercicio.map((tipo: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-full text-[10px] capitalize">{tipo}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-400">Nenhum perfil cadastrado</p>
              <Link href="/academia/cadastro-inicial" className="text-xs text-yellow-400 hover:text-yellow-300">Cadastrar perfil</Link>
            </div>
          )}
        </div>

        {/* Perfil e Configurações */}
        <div className="grid grid-cols-2 gap-4">
          {/* Editar Perfil */}
          {perfil ? (
            <button
              onClick={abrirEditarPerfil}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-24 hover:bg-white/15 transition-all group"
            >
              <User className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-white text-center">Meu Perfil</span>
            </button>
          ) : (
            <Link 
              href="/academia/cadastro-inicial"
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-24 hover:bg-white/15 transition-all group"
            >
              <User className="w-6 h-6 text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-white text-center">Cadastrar Perfil</span>
            </Link>
          )}

          {/* Configurações IA */}
          <Link 
            href="/academia/cadastro-inicial"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-24 hover:bg-white/15 transition-all group"
          >
            <Settings className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-xs font-bold text-white text-center">Configurar IA</span>
          </Link>
        </div>

        <PlanoAdminCard />

        {/* Incentivo rotativo Modernizado */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-4 flex items-center gap-3 shadow-2xl">
          <span className="text-2xl">{incent.emoji}</span>
          <p className="text-sm font-bold text-white">{incent.txt}</p>
        </div>

        {/* Treino do Dia Modernizado */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-white">TREINO DO DIA</h3>
            <span className="bg-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-black">SÉRIE A</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400 font-semibold">
              <span>{totalFeitos}/{exercicios.length} exercícios</span>
              <span>{pctFeitos}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pctFeitos}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            {exercicios.slice(0, 3).map(ex => (
              <div key={ex.id} className={`rounded-2xl border p-4 space-y-3 transition-all ${ex.feito ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/10 border-white/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${ex.feito ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
                      {ex.feito ? <CheckCircle className="w-4 h-4" /> : ex.id}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{ex.nome}</p>
                      <p className="text-xs text-zinc-400">{ex.series} séries × {ex.reps} reps</p>
                    </div>
                  </div>
                  <button onClick={() => toggleExercicio(ex.id)} className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all active:scale-95 ${ex.feito ? 'bg-emerald-500 text-white' : 'bg-white/20 text-zinc-300'}`}>
                    {ex.feito ? 'FEITO' : 'MARCAR'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {exercicios.length > 3 && (
            <div className="text-center">
              <span className="text-xs text-zinc-400">+{exercicios.length - 3} exercícios</span>
            </div>
          )}
        </div>

        {/* Minhas Metas Modernizadas */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-4">
          <h3 className="font-black text-lg text-white">MINHAS METAS</h3>
          <div className="space-y-3">
            {METAS_ALUNO.slice(0, 2).map((meta, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${meta.cor}`}>
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{meta.label}</p>
                    <p className="text-xs text-zinc-400">{meta.valor} → {meta.meta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-white">{meta.pct}%</p>
                  <p className="text-xs text-zinc-400">concluído</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações rápidas Modernizadas */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/academia/historico" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-24 hover:bg-white/15 transition-all">
            <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-white text-center">Histórico</span>
          </Link>
          <Link href="/academia/biblioteca" className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 flex flex-col items-center justify-center h-24 hover:bg-white/15 transition-all">
            <BookOpen className="w-6 h-6 text-indigo-400 mb-2" />
            <span className="text-xs font-bold text-white text-center">Biblioteca</span>
          </Link>
        </div>
      </main>

      <BottomNav isAdmin={isAdmin} />

      {/* Modal de cadastro de perfil — aparece só se não tiver perfil */}
      {showCadastro && (
        <div className="fixed inset-0 z-50 bg-indigo-950/90 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="text-center">
              <span className="text-4xl">🏋️</span>
              <h2 className="text-xl font-black text-gray-800 mt-2">Seu Perfil de Treino</h2>
              <p className="text-sm text-gray-500 mt-1">As notificações de incentivo serão personalizadas para você</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Seu nome</label>
                <input value={formPerfil.nome} onChange={e => setFormPerfil(f => ({ ...f, nome: e.target.value }))} placeholder="Como quer ser chamado?" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Objetivo principal</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: 'emagrecer',       emoji: '🔥', label: 'Emagrecer' },
                    { val: 'hipertrofia',     emoji: '💪', label: 'Hipertrofia' },
                    { val: 'condicionamento', emoji: '⚡',        label: 'Condicionamento' },
                    { val: 'saude',           emoji: '❤️', label: 'Saúde geral' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setFormPerfil(f => ({ ...f, objetivo: o.val }))} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all ${formPerfil.objetivo === o.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                      <span>{o.emoji}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Peso atual (kg)</label>
                  <input type="number" value={formPerfil.pesoAtual} onChange={e => setFormPerfil(f => ({ ...f, pesoAtual: e.target.value }))} placeholder="Ex: 82" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Meta de peso (kg)</label>
                  <input type="number" value={formPerfil.pesoMeta} onChange={e => setFormPerfil(f => ({ ...f, pesoMeta: e.target.value }))} placeholder="Ex: 72" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Altura (m)</label>
                  <input type="number" step="0.01" value={formPerfil.altura} onChange={e => setFormPerfil(f => ({ ...f, altura: e.target.value }))} placeholder="Ex: 1.75" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Período para meta</label>
                  <input type="text" value={formPerfil.periodoMeta} onChange={e => setFormPerfil(f => ({ ...f, periodoMeta: e.target.value }))} placeholder="Ex: 3 meses" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Frequência desejada por semana</label>
                <div className="flex gap-2 mt-1">
                  {['1','2','3','4','5','6','7'].map(n => (
                    <button key={n} onClick={() => setFormPerfil(f => ({ ...f, freqSemanal: n }))} className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${formPerfil.freqSemanal === n ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}>{n}x</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Nível</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { val: 'iniciante', label: 'Iniciante' },
                    { val: 'intermediario', label: 'Interm.' },
                    { val: 'avancado', label: 'Avançado' },
                  ].map(n => (
                    <button key={n.val} onClick={() => setFormPerfil(f => ({ ...f, nivel: n.val }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formPerfil.nivel === n.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{n.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={salvarFormPerfil} disabled={!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta || !formPerfil.altura} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40">
              Salvar e Começar 🚀
            </button>
          </div>
        </div>
      )}

      {/* Modal de edição de perfil — aparece quando clicar em Editar Meus Dados */}
      {showEditarPerfil && (
        <div className="fixed inset-0 z-50 bg-indigo-950/90 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="text-center">
              <span className="text-4xl">✏️</span>
              <h2 className="text-xl font-black text-gray-800 mt-2">Editar Meus Dados</h2>
              <p className="text-sm text-gray-500 mt-1">Atualize suas informações de treino</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Seu nome</label>
                <input value={formPerfil.nome} onChange={e => setFormPerfil(f => ({ ...f, nome: e.target.value }))} placeholder="Como quer ser chamado?" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Objetivo principal</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: 'emagrecer',       emoji: '🔥', label: 'Emagrecer' },
                    { val: 'hipertrofia',     emoji: '💪', label: 'Hipertrofia' },
                    { val: 'condicionamento', emoji: '⚡',        label: 'Condicionamento' },
                    { val: 'saude',           emoji: '❤️', label: 'Saúde geral' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setFormPerfil(f => ({ ...f, objetivo: o.val }))} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all ${formPerfil.objetivo === o.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                      <span>{o.emoji}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Peso atual (kg)</label>
                  <input type="number" value={formPerfil.pesoAtual} onChange={e => setFormPerfil(f => ({ ...f, pesoAtual: e.target.value }))} placeholder="Ex: 82" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Meta de peso (kg)</label>
                  <input type="number" value={formPerfil.pesoMeta} onChange={e => setFormPerfil(f => ({ ...f, pesoMeta: e.target.value }))} placeholder="Ex: 72" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Altura (m)</label>
                  <input type="number" step="0.01" value={formPerfil.altura} onChange={e => setFormPerfil(f => ({ ...f, altura: e.target.value }))} placeholder="Ex: 1.75" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Período para meta</label>
                  <input type="text" value={formPerfil.periodoMeta} onChange={e => setFormPerfil(f => ({ ...f, periodoMeta: e.target.value }))} placeholder="Ex: 3 meses" className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Frequência desejada por semana</label>
                <div className="flex gap-2 mt-1">
                  {['1','2','3','4','5','6','7'].map(n => (
                    <button key={n} onClick={() => setFormPerfil(f => ({ ...f, freqSemanal: n }))} className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${formPerfil.freqSemanal === n ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700'}`}>{n}x</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Nível</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { val: 'iniciante', label: 'Iniciante' },
                    { val: 'intermediario', label: 'Interm.' },
                    { val: 'avancado', label: 'Avançado' },
                  ].map(n => (
                    <button key={n.val} onClick={() => setFormPerfil(f => ({ ...f, nivel: n.val }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formPerfil.nivel === n.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{n.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditarPerfil(false)} className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-black text-lg active:scale-95 transition-all">
                Cancelar
              </button>
              <button onClick={salvarFormPerfil} disabled={!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta || !formPerfil.altura} className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
