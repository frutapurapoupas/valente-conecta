'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, MapPin, CheckCircle, Settings, LayoutDashboard, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AcademiaPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckIn, setIsCheckIn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)

  useEffect(() => {
    // 1. Validar se é você (Admin Master)
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === 'seu-email-admin@valente.com') setIsAdmin(true)
    }
    checkAdmin()

    // 2. Recuperar Check-in ativo
    const saved = localStorage.getItem('academia_checkin')
    if (saved) {
      const { startTime } = JSON.parse(saved)
      setCheckInTime(new Date(startTime))
      setIsCheckIn(true)
    }
  }, [])

  useEffect(() => {
    let interval: any
    if (isCheckIn && checkInTime) {
      interval = setInterval(() => {
        const diff = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000 / 60)
        setElapsedTime(diff)
      }, 60000)
    }
    return () => clearInterval(interval)
  }, [isCheckIn, checkInTime])

  const handleAction = () => {
    if (!isCheckIn) {
      const now = new Date()
      localStorage.setItem('academia_checkin', JSON.stringify({ startTime: now.toISOString() }))
      setCheckInTime(now)
      setIsCheckIn(true)
    } else {
      localStorage.removeItem('academia_checkin')
      setIsCheckIn(false)
      alert(`Treino de ${elapsedTime}min registrado no Financeiro!`)
    }
  }

  return (
    <div className="min-h-screen pb-24 text-slate-900">
      {/* Header com degradê profissional */}
      <header className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-6 rounded-b-[3rem] shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="font-black text-xl tracking-tighter italic">VALENTE FITNESS</h1>
          {isAdmin && <Settings className="text-yellow-400 w-6 h-6" />}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
          <p className="text-xs uppercase tracking-widest mb-1 opacity-70 font-bold">Status do Treino</p>
          <div className="text-4xl font-black mb-4">
            {isCheckIn ? `${elapsedTime} MIN` : "OFFLINE"}
          </div>
          <button 
            onClick={handleAction}
            className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
              isCheckIn ? 'bg-red-500 text-white' : 'bg-white text-indigo-700'
            }`}
          >
            {isCheckIn ? 'FINALIZAR TREINO' : 'COMEÇAR AGORA'}
          </button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Bloco Admin Master (Apenas para você) */}
        {isAdmin && (
          <section className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h2 className="font-bold text-sm uppercase tracking-widest">Painel Admin Master</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/financeiro" className="bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20">
                <TrendingUp className="text-green-400" />
                <span className="text-[10px] font-bold">FINANCEIRO</span>
              </Link>
              <Link href="/admin/usuarios" className="bg-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/20">
                <LayoutDashboard className="text-blue-400" />
                <span className="text-[10px] font-bold">USUÁRIOS</span>
              </Link>
            </div>
          </section>
        )}

        {/* Ficha de Treino Estilizada */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg">TREINO DO DIA</h3>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">SÉRIE A</span>
          </div>
          <div className="space-y-4">
            {['Supino Reto', 'Puxada Frontal', 'Leg Press 45'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                    {i+1}
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase">{item}</p>
                    <p className="text-xs text-slate-400 font-medium">4 séries x 12 reps</p>
                  </div>
                </div>
                <CheckCircle className="text-slate-200 w-6 h-6" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Navegação Inferior para Admin e User */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center text-slate-400">
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-bold mt-1">HOME</span>
        </Link>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-xl -mt-10 border-4 border-white">
          <Dumbbell className="text-white" size={24} />
        </div>
        <Link href={isAdmin ? "/admin" : "/perfil"} className={`flex flex-col items-center ${isAdmin ? 'text-red-500' : 'text-slate-400'}`}>
          <Settings size={20} />
          <span className="text-[8px] font-bold mt-1 uppercase">{isAdmin ? 'ADMIN' : 'PERFIL'}</span>
        </Link>
      </nav>
    </div>
  )
}