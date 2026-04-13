'use client'

import { useState, useEffect, useRef } from 'react'
// --- Tipos e helpers para Esporte ---
type EsporteLocal = {
  nome: string
  esporte: string
  vezesSemana: string
  horasPrevistas: string
  lat: number
  lng: number
}

function getEsportesPadrao() {
  return [
    'Corrida',
    'Ciclismo',
    'Futebol',
    'Vôlei',
    'Natação',
    'Caminhada',
    'Outro',
  ]
}

function distMetros(a: {lat:number,lng:number}, b: {lat:number,lng:number}) {
  return calcDist(a.lat, a.lng, b.lat, b.lng)
}
import {
  CheckCircle, Flame, MapPin, Plus, Minus,
  TrendingUp, BookOpen, Target, Trophy, Star, Wifi, WifiOff, Pencil, X
} from 'lucide-react'
import AcademiaHeader from '@/components/academia/Header'
import BottomNav from '@/components/academia/BottomNav'
import AdminPanel from '@/components/academia/AdminPanel'
import NotificationPermission from '@/components/academia/NotificationPermission'
import {
  type PerfilAluno, salvarPerfil, carregarPerfil,
  notificarCheckIn, notificarEmAndamento, notificarCheckOut,
} from '@/hooks/useAcademiaNotificacoes'

const GYM_LAT = -23.5505
const GYM_LNG = -46.6333
const GYM_RADIUS = 5
const WARMUP_MS = 5 * 60 * 1000
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
  { emoji: '\uD83D\uDD25', txt: '5 treinos consecutivos \u2014 voc\u00ea est\u00e1 em chamas!', cor: 'amber' },
  { emoji: '\uD83C\uDFAF', txt: 'Supino a 75% da meta. Continue assim!', cor: 'violet' },
  { emoji: '\u2B50',        txt: '12 treinos esse m\u00eas \u2014 recorde pessoal!', cor: 'blue' },
]

export default function AcademiaPage() {
  const [isAdmin] = useState(false)
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null)
  const [showCadastro, setShowCadastro] = useState(false)
  const [formPerfil, setFormPerfil] = useState({ nome: '', objetivo: 'emagrecer', pesoAtual: '', pesoMeta: '', freqSemanal: '3', nivel: 'iniciante' })
  const [geoState, setGeoState] = useState<GeoState>('idle')
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [exercicios, setExercicios] = useState<Exercicio[]>(TREINO_INICIAL)
  const [incentIdx, setIncentIdx] = useState(0)
  const [atividade, setAtividade] = useState<'academia' | 'esporte' | null>(null)
  const [showEsporteModal, setShowEsporteModal] = useState(false)
  const [formEsporte, setFormEsporte] = useState<EsporteLocal>({ nome: '', esporte: '', vezesSemana: '', horasPrevistas: '', lat: 0, lng: 0 })
  const [esportesCadastrados, setEsportesCadastrados] = useState<EsporteLocal[]>([])
  const [esporteEditIdx, setEsporteEditIdx] = useState<number | null>(null)
  const watchRef    = useRef<number | null>(null)
  const timerRef    = useRef<NodeJS.Timeout | null>(null)
  const warmupRef   = useRef<NodeJS.Timeout | null>(null)
  const dentroRef   = useRef(false)

  function pararTudo() {
    dentroRef.current = false
    if (warmupRef.current) { clearTimeout(warmupRef.current); warmupRef.current = null }
    setIsCheckIn(false)
    setElapsedTime(0)
    setAtividade(null)
    localStorage.removeItem(CHECKIN_KEY)
  }

  // --- Esporte: fluxo de cadastro/edição ---
  function abrirModalEsporte(editarIdx: number | null = null, pos?: {lat:number,lng:number}) {
    setEsporteEditIdx(editarIdx)
    if (editarIdx !== null && esportesCadastrados[editarIdx]) {
      setFormEsporte(esportesCadastrados[editarIdx])
    } else {
      setFormEsporte({ nome: '', esporte: '', vezesSemana: '', horasPrevistas: '', lat: pos?.lat || 0, lng: pos?.lng || 0 })
    }
    setShowEsporteModal(true)
  }

  function salvarEsporte() {
    if (!formEsporte.nome || !formEsporte.esporte || !formEsporte.vezesSemana || !formEsporte.horasPrevistas) return
    let novos = [...esportesCadastrados]
    if (esporteEditIdx !== null) {
      novos[esporteEditIdx] = formEsporte
    } else {
      novos.push(formEsporte)
    }
    setEsportesCadastrados(novos)
    localStorage.setItem('esportes_cadastrados', JSON.stringify(novos))
    setShowEsporteModal(false)
    setEsporteEditIdx(null)
    // Aqui pode disparar notificação/meta
  }

  function checarLocalEsporte(pos: {lat:number,lng:number}) {
    const idx = esportesCadastrados.findIndex(e => distMetros(e, pos) < 50)
    return idx
  }

  function iniciarGeo(tipo: 'academia' | 'esporte') {
    if (tipo === 'esporte') {
      if (!navigator.geolocation) { setGeoState('negado'); return }
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const idx = checarLocalEsporte({lat, lng})
        if (idx !== -1) {
          alert('Este local já está cadastrado. O app já está contando automaticamente.');
          abrirModalEsporte(idx)
          return
        }
        abrirModalEsporte(null, {lat, lng})
      }, () => setGeoState('negado'), { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 })
      return
    }
    // Academia segue fluxo normal
    setAtividade(tipo)
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
            dentroRef.current = true
            warmupRef.current = setTimeout(() => {
              if (dentroRef.current) {
                const start = Date.now()
                setIsCheckIn(true)
                localStorage.setItem(CHECKIN_KEY, JSON.stringify({ start }))
                const p = carregarPerfil()
                if (p) notificarCheckIn(p)
              }
            }, WARMUP_MS)
          }
        } else {
          if (dentroRef.current) {
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

  // Carregar esportes cadastrados do localStorage ao iniciar
  useEffect(() => {
    const esportes = localStorage.getItem('esportes_cadastrados')
    if (esportes) setEsportesCadastrados(JSON.parse(esportes))
  }, [])

  useEffect(() => {
    const p = carregarPerfil()
    if (p) setPerfil(p)
    else setShowCadastro(true)
  }, [])

  useEffect(() => {
    const granted = localStorage.getItem(GEO_PERMISSION_KEY)
    const saved = localStorage.getItem(CHECKIN_KEY)
    if (saved) {
      const { start, atividade: savedAtividade } = JSON.parse(saved)
      dentroRef.current = true
      setIsCheckIn(true)
      setElapsedTime(Math.floor((Date.now() - start) / 60000))
      setAtividade(savedAtividade || 'academia')
    }
    // Não reinicia geo automaticamente, exige escolha do usuário
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
      if (warmupRef.current) clearTimeout(warmupRef.current)
    }
  }, [])

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

  useEffect(() => {
    const t = setInterval(() => setIncentIdx(i => (i + 1) % INCENTIVOS.length), 4000)
    return () => clearInterval(t)
  }, [])

  function toggleExercicio(id: number) {
    setExercicios(ex => ex.map(e => e.id === id ? { ...e, feito: !e.feito } : e))
  }
  function alterarCarga(id: number, delta: number) {
    setExercicios(ex => ex.map(e => e.id === id ? { ...e, carga: Math.max(0, e.carga + delta) } : e))
  }

  function abrirEdicao() {
    if (perfil) {
      setFormPerfil({
        nome: perfil.nome,
        objetivo: perfil.objetivo,
        pesoAtual: String(perfil.pesoAtual),
        pesoMeta: String(perfil.pesoMeta),
        freqSemanal: String(perfil.freqSemanal),
        nivel: perfil.nivel,
      })
    }
    setShowCadastro(true)
  }

  function salvarFormPerfil() {
    if (!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta) return
    const novo: PerfilAluno = {
      nome: formPerfil.nome,
      objetivo: formPerfil.objetivo as PerfilAluno['objetivo'],
      pesoAtual: parseFloat(formPerfil.pesoAtual),
      pesoMeta: parseFloat(formPerfil.pesoMeta),
      freqSemanal: parseInt(formPerfil.freqSemanal),
      nivel: formPerfil.nivel as PerfilAluno['nivel'],
    }
    salvarPerfil(novo)
    setPerfil(novo)
    setShowCadastro(false)
  }

  const totalFeitos = exercicios.filter(e => e.feito).length
  const pctFeitos = Math.round((totalFeitos / exercicios.length) * 100)
  const incent = INCENTIVOS[incentIdx]
  const corMap: Record<string, string> = {
    amber:  'bg-amber-500/10 border-amber-500/20 text-amber-300',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-300',
  }

  const geoBanner = geoState === 'dentro' && isCheckIn
    ? { txt: `\uD83D\uDCCD Você está em ${atividade === 'esporte' ? 'atividade esportiva' : 'academia'} — sessão em andamento`, cls: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' }
    : geoState === 'dentro' && !isCheckIn
    ? { txt: `\uD83D\uDCCD Você está no local — contagem inicia em 5 min`, cls: 'bg-blue-500/10 border border-blue-500/20 text-blue-300' }
    : geoState === 'fora'
    ? { txt: `\uD83D\uDCCD Você saiu do local`, cls: 'bg-orange-500/10 border border-orange-500/20 text-orange-300' }
    : geoState === 'watching'
    ? { txt: '\uD83D\uDCCD Detectando localização...', cls: 'bg-zinc-800 border border-zinc-700 text-zinc-400' }
    : geoState === 'negado'
    ? { txt: '\uD83D\uDCCD Localização negada pelo dispositivo', cls: 'bg-red-500/10 border border-red-500/20 text-red-400' }
    : null

  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      <NotificationPermission />
      <AcademiaHeader isAdmin={isAdmin} isCheckIn={isCheckIn} elapsedTime={elapsedTime} onActionClick={() => {}} isCounting={isCheckIn} />

      {geoBanner && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          {geoState === 'watching' ? <Wifi className="w-4 h-4 flex-shrink-0" /> : geoState === 'negado' ? <WifiOff className="w-4 h-4 flex-shrink-0" /> : <MapPin className="w-4 h-4 flex-shrink-0" />}
          <span>{geoBanner.txt}</span>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {geoState === 'idle' && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button
                onClick={() => iniciarGeo('academia')}
                className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
              >
                <MapPin className="w-6 h-6" />
                Academia
              </button>
              <button
                onClick={() => iniciarGeo('esporte')}
                className="flex-1 py-5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
              >
                <Flame className="w-6 h-6" />
                Esporte
              </button>
            </div>
            <div className="mt-1 text-xs text-zinc-400 text-center">
              <b>Academia:</b> registre treinos convencionais.<br />
              <b>Esporte:</b> registre atividades ao ar livre, informando o local, esporte praticado, frequência semanal e tempo previsto. O sistema irá reconhecer o local automaticamente nas próximas vezes, enviar notificações de incentivo e acompanhar suas metas.
            </div>
                {/* Modal de cadastro/edição de esporte */}
                {showEsporteModal && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
                    <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-screen min-h-screen md:min-h-0 md:max-h-[90vh] flex flex-col justify-center mx-auto" style={{minHeight: '100dvh'}}>
                      <div className="text-center relative">
                        <button
                          onClick={() => { setShowEsporteModal(false); setEsporteEditIdx(null) }}
                          className="absolute right-0 top-0 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition active:scale-90"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                        <span className="text-4xl">🏟️</span>
                        <h2 className="text-xl font-black text-white mt-2">
                          {esporteEditIdx !== null ? 'Editar Local de Esporte' : 'Novo Local de Esporte'}
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1">Cadastre o local, esporte praticado, frequência semanal e tempo previsto por sessão.</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome do local</label>
                          <input
                            value={formEsporte.nome}
                            onChange={e => setFormEsporte(f => ({ ...f, nome: e.target.value }))}
                            placeholder="Ex: Praça Central, Parque, Quadra..."
                            className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                            style={{color: 'white'}}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Esporte praticado</label>
                          <select
                            value={formEsporte.esporte}
                            onChange={e => setFormEsporte(f => ({ ...f, esporte: e.target.value }))}
                            className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                            style={{color: 'white'}}>
                            <option value="">Selecione...</option>
                            {getEsportesPadrao().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Vezes por semana</label>
                            <input
                              type="number"
                              value={formEsporte.vezesSemana}
                              onChange={e => setFormEsporte(f => ({ ...f, vezesSemana: e.target.value }))}
                              placeholder="Ex: 3"
                              className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                              style={{color: 'white'}}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Horas previstas/sessão</label>
                            <input
                              type="number"
                              value={formEsporte.horasPrevistas}
                              onChange={e => setFormEsporte(f => ({ ...f, horasPrevistas: e.target.value }))}
                              placeholder="Ex: 1.5"
                              className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                              style={{color: 'white'}}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={salvarEsporte}
                        disabled={!formEsporte.nome || !formEsporte.esporte || !formEsporte.vezesSemana || !formEsporte.horasPrevistas}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40 mt-2"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
          </div>
        )}

        {/* Incentivo rotativo */}
        <div className="border rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
          <span className="text-2xl">{incent.emoji}</span>
          <p className="text-sm font-bold">{incent.txt}</p>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame className="w-5 h-5 text-amber-500" />, val: '5', label: 'dias seguidos' },
            { icon: <Trophy className="w-5 h-5 text-yellow-500" />, val: '12', label: 'treinos/mês' },
            { icon: <Star className="w-5 h-5 text-indigo-400" />, val: `${pctFeitos}%`, label: 'treino hoje' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-black text-xl text-white">{s.val}</p>
              <p className="text-xs text-zinc-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Treino do dia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-white">TREINO DO DIA</h3>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-black">S\u00c9RIE A</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500 font-semibold">
              <span>{totalFeitos}/{exercicios.length} exerc\u00edcios</span>
              <span>{pctFeitos}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pctFeitos}%` }} />
            </div>
          </div>
        </div>

        {/* Metas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" /> Minhas Metas
            </h3>
            {perfil && (
              <button onClick={abrirEdicao} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold active:scale-95 transition-all">
                <Pencil className="w-3.5 h-3.5" /> Editar perfil
              </button>
            )}
          </div>
          {METAS_ALUNO.map(m => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">{m.label}</span>
                <span className="font-black text-white">{m.valor} <span className="text-xs text-zinc-500 font-normal">→ {m.meta}</span></span>
              </div>
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all bg-violet-500" style={{ width: `${m.pct}%` }} />
              </div>
              <p className="text-xs text-zinc-500 text-right">{m.pct}% da meta</p>
            </div>
          ))}
        </div>

        {/* Histórico + Biblioteca */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-zinc-700">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <p className="font-bold text-sm text-white">Hist\u00f3rico de Cargas</p>
            <p className="text-xs text-zinc-500 text-center">Veja sua evolu\u00e7\u00e3o</p>
          </button>
          <button className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-all hover:border-zinc-700">
            <BookOpen className="w-6 h-6 text-violet-400" />
            <p className="font-bold text-sm text-white">Biblioteca</p>
            <p className="text-xs text-zinc-500 text-center">Exerc\u00edcios e t\u00e9cnicas</p>
          </button>
        </div>

        {/* Conquistas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <h3 className="font-black text-base text-white flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-400" /> Conquistas
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              { emoji: '\uD83C\uDFC6', nome: 'Primeiro Treino', ok: true },
              { emoji: '\uD83D\uDD25', nome: '5 dias seguidos', ok: true },
              { emoji: '\uD83D\uDCAA', nome: '10 treinos',      ok: true },
              { emoji: '\u2B50',        nome: '20 treinos',      ok: false },
              { emoji: '\uD83C\uDFC5', nome: '30 treinos',      ok: false },
            ].map(c => (
              <div key={c.nome} className="flex-shrink-0 flex flex-col items-center gap-1 w-16 p-2 rounded-2xl border">
                <span className="text-2xl">{c.emoji}</span>
                <p className="text-[9px] font-bold text-center text-zinc-400 leading-tight">{c.nome}</p>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && <AdminPanel />}
      </main>

      <BottomNav isAdmin={isAdmin} />

      {/* Modal de cadastro de perfil */}
      {showCadastro && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="text-center relative">
              {perfil && (
                <button
                  onClick={() => setShowCadastro(false)}
                  className="absolute right-0 top-0 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition active:scale-90"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
              <span className="text-4xl">🏋️</span>
              <h2 className="text-xl font-black text-white mt-2">
                {perfil ? 'Editar Perfil de Treino' : 'Seu Perfil de Treino'}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">As notificações de incentivo serão personalizadas para você</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Seu nome</label>
                <input
                  value={formPerfil.nome}
                  onChange={e => setFormPerfil(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Como quer ser chamado?"
                  className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Objetivo principal</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: 'emagrecer',       emoji: '\uD83D\uDD25', label: 'Emagrecer' },
                    { val: 'hipertrofia',     emoji: '\uD83D\uDCAA', label: 'Hipertrofia' },
                    { val: 'condicionamento', emoji: '\u26A1',        label: 'Condicionamento' },
                    { val: 'saude',           emoji: '\uD83D\uDC9A', label: 'Sa\u00fade geral' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setFormPerfil(f => ({ ...f, objetivo: o.val }))} className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all">
                      <span>{o.emoji}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Peso atual (kg)</label>
                  <input type="number" value={formPerfil.pesoAtual} onChange={e => setFormPerfil(f => ({ ...f, pesoAtual: e.target.value }))} placeholder="Ex: 82" className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Meta de peso (kg)</label>
                  <input type="number" value={formPerfil.pesoMeta} onChange={e => setFormPerfil(f => ({ ...f, pesoMeta: e.target.value }))} placeholder="Ex: 72" className="mt-1 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Frequ\u00eancia desejada por semana</label>
                <div className="flex gap-2 mt-1">
                  {['2','3','4','5','6'].map(n => (
                    <button key={n} onClick={() => setFormPerfil(f => ({ ...f, freqSemanal: n }))} className="flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all">{n}x</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">N\u00edvel</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { val: 'iniciante', label: 'Iniciante' },
                    { val: 'intermediario', label: 'Interm.' },
                    { val: 'avancado', label: 'Avan\u00e7ado' },
                  ].map(n => (
                    <button key={n.val} onClick={() => setFormPerfil(f => ({ ...f, nivel: n.val }))} className="flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all">{n.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={salvarFormPerfil} disabled={!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40">
              {perfil ? 'Salvar altera\u00e7\u00f5es \u2705' : 'Salvar e Come\u00e7ar \uD83D\uDE80'}
            </button>
            {perfil && (
              <button onClick={() => setShowCadastro(false)} className="w-full py-3 text-sm font-bold text-zinc-500 active:scale-95 transition-all">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
