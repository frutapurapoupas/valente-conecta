'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Calendar, Clock, MapPin, Target, Heart, TrendingUp, Camera, CheckCircle, AlertCircle, Zap, Users, Activity } from 'lucide-react'

export default function AcademiaPage() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [treinoHoje, setTreinoHoje] = useState<any>(null)
  const [evolucaoSemanal, setEvolucaoSemanal] = useState({
    peso: -1.2,
    cintura: -2,
    gordura: -1.5
  })

  useEffect(() => {
    // Verificar se usuário já tem cadastro
    const saved = localStorage.getItem('academia_cadastro')
    if (saved) {
      setIsRegistered(true)
    }

    // Verificar se está em check-in
    const savedCheckIn = localStorage.getItem('academia_checkin')
    if (savedCheckIn) {
      const checkInData = JSON.parse(savedCheckIn)
      const startTime = new Date(checkInData.startTime)
      const now = new Date()
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60)
      if (diff < 240) { // 4 horas máximo
        setIsCheckIn(true)
        setCheckInTime(startTime)
        setElapsedTime(diff)
      } else {
        localStorage.removeItem('academia_checkin')
      }
    }

    // Timer para atualizar tempo
    const interval = setInterval(() => {
      if (isCheckIn && checkInTime) {
        const now = new Date()
        const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000 / 60)
        setElapsedTime(diff)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [isCheckIn, checkInTime])

  const fazerCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const now = new Date()
          localStorage.setItem('academia_checkin', JSON.stringify({
            startTime: now.toISOString(),
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }))
          setIsCheckIn(true)
          setCheckInTime(now)
          setElapsedTime(0)
          alert('✅ Check-in realizado! Seu treino começou agora.')
        },
        (error) => {
          alert('❌ Ative sua localização para fazer check-in')
        }
      )
    } else {
      alert('❌ Seu navegador não suporta geolocalização')
    }
  }

  const fazerCheckOut = () => {
    if (checkInTime && elapsedTime >= 5) {
      localStorage.removeItem('academia_checkin')
      setIsCheckIn(false)
      setCheckInTime(null)
      
      // Registrar tempo no histórico
      const historico = localStorage.getItem('academia_historico')
      const novoRegistro = {
        data: new Date().toISOString(),
        tempoMinutos: elapsedTime,
        calorias: Math.round(elapsedTime * 7)
      }
      const historicoArray = historico ? JSON.parse(historico) : []
      historicoArray.push(novoRegistro)
      localStorage.setItem('academia_historico', JSON.stringify(historicoArray))
      
      alert(`✅ Check-out realizado! Você treinou por ${elapsedTime} minutos.`)
    } else if (elapsedTime < 5) {
      alert('⏳ Tempo mínimo de treino é 5 minutos')
    }
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Academia Valente</span>
          </div>
        </header>
        <main className="p-4">
          <div className="bg-white rounded-2xl p-6 text-center mb-6">
            <Dumbbell className="w-20 h-20 text-purple-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Bem-vindo à Academia!</h1>
            <p className="text-gray-500 mb-6">Complete seu cadastro para começar</p>
            <Link href="/academia/cadastro">
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold">
                Iniciar Cadastro
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-lg">Academia</span>
          </div>
          <Link href="/academia/evolucao">
            <button className="bg-white/20 px-3 py-1 rounded-full text-sm">
              📊 Evolução
            </button>
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Check-in/Check-out */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {!isCheckIn ? (
            <button
              onClick={fazerCheckIn}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Fazer Check-in
            </button>
          ) : (
            <div className="text-center">
              <div className="inline-block bg-green-100 rounded-full p-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-bold text-lg">Você está treinando!</p>
              <p className="text-3xl font-bold text-purple-600 my-2">
                {Math.floor(elapsedTime / 60)}h {elapsedTime % 60}min
              </p>
              <button
                onClick={fazerCheckOut}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg"
              >
                Finalizar Treino
              </button>
            </div>
          )}
        </div>

        {/* Treino de Hoje */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">🏋️ Treino de Hoje</h2>
            <Link href="/academia/treino">
              <button className="text-purple-500 text-sm">Ver todos →</button>
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <div>
                <p className="font-semibold">Supino Reto</p>
                <p className="text-xs text-gray-500">4 séries x 12 repetições</p>
              </div>
              <span className="text-purple-600 font-bold">30kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <div>
                <p className="font-semibold">Puxada Frontal</p>
                <p className="text-xs text-gray-500">4 séries x 12 repetições</p>
              </div>
              <span className="text-purple-600 font-bold">40kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <div>
                <p className="font-semibold">Agachamento</p>
                <p className="text-xs text-gray-500">4 séries x 10 repetições</p>
              </div>
              <span className="text-purple-600 font-bold">50kg</span>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-gray-500">Treinos este mês</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">320</p>
            <p className="text-xs text-gray-500">Minutos totais</p>
          </div>
        </div>

        {/* Evolução Semanal */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">📈 Evolução da Semana</h2>
            <Link href="/academia/evolucao">
              <button className="text-purple-500 text-sm">Ver detalhes →</button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peso</span>
              <span className="text-green-600 font-semibold">
                {evolucaoSemanal.peso > 0 ? '+' : ''}{evolucaoSemanal.peso}kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cintura</span>
              <span className="text-green-600 font-semibold">
                {evolucaoSemanal.cintura > 0 ? '+' : ''}{evolucaoSemanal.cintura}cm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">% Gordura</span>
              <span className="text-green-600 font-semibold">
                {evolucaoSemanal.gordura > 0 ? '+' : ''}{evolucaoSemanal.gordura}%
              </span>
            </div>
          </div>
        </div>

        {/* Banner de 30 dias grátis */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl text-center">
          <p className="font-bold">🎁 Você está no período grátis!</p>
          <p className="text-sm opacity-90">Após 30 dias: R$ 9,90/mês</p>
        </div>
      </main>
    </div>
  )
}