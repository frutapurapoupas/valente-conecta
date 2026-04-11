'use client'

import { useState, useEffect, useRef } from 'react'
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
    const p = carregarPerfil()
    if (p) setPerfil(p)
    else setShowCadastro(true)
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
    amber:  'bg-amber-50 border-amber-200 text-amber-800',
    violet: 'bg-violet-50 border-violet-200 text-violet-800',
    blue:   'bg-blue-50 border-blue-200 text-blue-800',
  }

  // --- Banner de geo ---
  const geoBanner = geoState === 'dentro' && isCheckIn
    ? { txt: '\uD83D\uDCCD Voc\u00ea est\u00e1 na academia \u2014 treino em andamento', cls: 'bg-emerald-100 text-emerald-700' }
    : geoState === 'dentro' && !isCheckIn
    ? { txt: '\uD83D\uDCCD Voc\u00ea est\u00e1 no local \u2014 contagem inicia em 5 min',  cls: 'bg-blue-100 text-blue-700' }
    : geoState === 'fora'
    ? { txt: '\uD83D\uDCCD Voc\u00ea saiu da academia',              cls: 'bg-orange-100 text-orange-700' }
    : geoState === 'watching'
    ? { txt: '\uD83D\uDCCD Detectando localiza\u00e7\u00e3o...',     cls: 'bg-slate-100 text-slate-500' }
    : geoState === 'negado'
    ? { txt: '\uD83D\uDCCD Localiza\u00e7\u00e3o negada pelo dispositivo', cls: 'bg-red-100 text-red-600' }
    : null

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <NotificationPermission />
      <AcademiaHeader isAdmin={isAdmin} isCheckIn={isCheckIn} elapsedTime={elapsedTime} onActionClick={() => {}} />

      {/* Banner de localização ativo */}
      {geoBanner && (
        <div className={`mx-4 mt-3 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-semibold ${geoBanner.cls}`}>
          {geoState === 'watching' ? <Wifi className="w-4 h-4 flex-shrink-0" /> : geoState === 'negado' ? <WifiOff className="w-4 h-4 flex-shrink-0" /> : <MapPin className="w-4 h-4 flex-shrink-0" />}
          <span>{geoBanner.txt}</span>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Botão de entrada — só aparece se ainda não deu permissão */}
        {geoState === 'idle' && (
          <button
            onClick={iniciarGeo}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <MapPin className="w-6 h-6" />
            ESTOU NA ACADEMIA
          </button>
        )}

        {/* Incentivo rotativo */}
        <div className={`border rounded-2xl px-4 py-3 flex items-center gap-3 transition-all ${corMap[incent.cor]}`}>
          <span className="text-2xl">{incent.emoji}</span>
          <p className="text-sm font-bold">{incent.txt}</p>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Flame className="w-5 h-5 text-amber-500" />, val: '5',          label: 'dias seguidos' },
            { icon: <Trophy className="w-5 h-5 text-yellow-500" />, val: '12',        label: 'treinos/m\u00eas' },
            { icon: <Star className="w-5 h-5 text-indigo-500" />,   val: `${pctFeitos}%`, label: 'treino hoje' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-black text-xl text-gray-800">{s.val}</p>
              <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Treino do dia */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-800">TREINO DO DIA</h3>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">S\u00c9RIE A</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 font-semibold">
              <span>{totalFeitos}/{exercicios.length} exerc\u00edcios</span>
              <span>{pctFeitos}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pctFeitos}%` }} />
            </div>
          </div>
          {exercicios.map(ex => (
            <div key={ex.id} className={`rounded-2xl border p-4 space-y-3 transition-all ${ex.feito ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${ex.feito ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    {ex.feito ? <CheckCircle className="w-5 h-5" /> : ex.id}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{ex.nome}</p>
                    <p className="text-xs text-slate-400">{ex.series} s\u00e9ries \u00d7 {ex.reps} reps</p>
                  </div>
                </div>
                <button onClick={() => toggleExercicio(ex.id)} className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all active:scale-95 ${ex.feito ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {ex.feito ? 'FEITO' : 'MARCAR'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-semibold w-12">Carga:</span>
                <button onClick={() => alterarCarga(ex.id, -2.5)} className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-black text-base text-gray-800 w-16 text-center">{ex.carga} kg</span>
                <button onClick={() => alterarCarga(ex.id, 2.5)} className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((ex.carga / ex.metaCarga) * 100))}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">meta: {ex.metaCarga} kg</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metas */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-500" /> Minhas Metas
            </h3>
            {perfil && (
              <button onClick={abrirEdicao} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold active:scale-95 transition-all border border-indigo-100">
                <Pencil className="w-3.5 h-3.5" /> Editar perfil
              </button>
            )}
          </div>
          {METAS_ALUNO.map(m => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">{m.label}</span>
                <span className="font-black text-gray-800">{m.valor} <span className="text-xs text-gray-400 font-normal">\u2192 {m.meta}</span></span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${m.cor}`} style={{ width: `${m.pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 text-right">{m.pct}% da meta</p>
            </div>
          ))}
        </div>

        {/* Histórico + Biblioteca */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            <p className="font-bold text-sm text-gray-700">Hist\u00f3rico de Cargas</p>
            <p className="text-xs text-gray-400 text-center">Veja sua evolu\u00e7\u00e3o</p>
          </button>
          <button className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-all">
            <BookOpen className="w-6 h-6 text-violet-500" />
            <p className="font-bold text-sm text-gray-700">Biblioteca</p>
            <p className="text-xs text-gray-400 text-center">Exerc\u00edcios e t\u00e9cnicas</p>
          </button>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-black text-base text-gray-800 flex items-center gap-2 mb-3">
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
              <div key={c.nome} className={`flex-shrink-0 flex flex-col items-center gap-1 w-16 p-2 rounded-2xl border ${c.ok ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200 opacity-40'}`}>
                <span className="text-2xl">{c.emoji}</span>
                <p className="text-[9px] font-bold text-center text-gray-600 leading-tight">{c.nome}</p>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && <AdminPanel />}
      </main>

      <BottomNav isAdmin={isAdmin} />

      {/* Modal de cadastro de perfil — aparece só se não tiver perfil */}
      {showCadastro && (
        <div className="fixed inset-0 z-50 bg-indigo-950/90 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="text-center relative">
              {perfil && (
                <button
                  onClick={() => setShowCadastro(false)}
                  className="absolute right-0 top-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition active:scale-90"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <span className="text-4xl">🏋️</span>
              <h2 className="text-xl font-black text-gray-800 mt-2">
                {perfil ? 'Editar Perfil de Treino' : 'Seu Perfil de Treino'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">As notificações de incentivo serão personalizadas para você</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Seu nome</label>
                <input value={formPerfil.nome} onChange={e => setFormPerfil(f => ({ ...f, nome: e.target.value }))} placeholder="Como quer ser chamado?" className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Objetivo principal</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: 'emagrecer',       emoji: '\uD83D\uDD25', label: 'Emagrecer' },
                    { val: 'hipertrofia',     emoji: '\uD83D\uDCAA', label: 'Hipertrofia' },
                    { val: 'condicionamento', emoji: '\u26A1',        label: 'Condicionamento' },
                    { val: 'saude',           emoji: '\uD83D\uDC9A', label: 'Sa\u00fade geral' },
                  ].map(o => (
                    <button key={o.val} onClick={() => setFormPerfil(f => ({ ...f, objetivo: o.val }))} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all ${formPerfil.objetivo === o.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>
                      <span>{o.emoji}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Peso atual (kg)</label>
                  <input type="number" value={formPerfil.pesoAtual} onChange={e => setFormPerfil(f => ({ ...f, pesoAtual: e.target.value }))} placeholder="Ex: 82" className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Meta de peso (kg)</label>
                  <input type="number" value={formPerfil.pesoMeta} onChange={e => setFormPerfil(f => ({ ...f, pesoMeta: e.target.value }))} placeholder="Ex: 72" className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Frequ\u00eancia desejada por semana</label>
                <div className="flex gap-2 mt-1">
                  {['2','3','4','5','6'].map(n => (
                    <button key={n} onClick={() => setFormPerfil(f => ({ ...f, freqSemanal: n }))} className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${formPerfil.freqSemanal === n ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{n}x</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">N\u00edvel</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { val: 'iniciante', label: 'Iniciante' },
                    { val: 'intermediario', label: 'Interm.' },
                    { val: 'avancado', label: 'Avan\u00e7ado' },
                  ].map(n => (
                    <button key={n.val} onClick={() => setFormPerfil(f => ({ ...f, nivel: n.val }))} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formPerfil.nivel === n.val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'}`}>{n.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={salvarFormPerfil} disabled={!formPerfil.nome || !formPerfil.pesoAtual || !formPerfil.pesoMeta} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40">
              {perfil ? 'Salvar altera\u00e7\u00f5es \u2705' : 'Salvar e Come\u00e7ar \uD83D\uDE80'}
            </button>
            {perfil && (
              <button onClick={() => setShowCadastro(false)} className="w-full py-3 text-sm font-bold text-gray-400 active:scale-95 transition-all">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}