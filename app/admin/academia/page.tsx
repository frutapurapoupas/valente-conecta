'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Dumbbell, 
  MapPin, 
  Clock, 
  Users, 
  Activity, 
  Search, 
  ChevronRight,
  TrendingUp,
  Map
} from 'lucide-react'

export default function AcademiaAdminPage() {
  const [alunosAtivos, setAlunosAtivos] = useState<any[]>([])
  const [stats, setStats] = useState({ treinando: 0, mediaPermanencia: 0 })
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    fetchAlunos()
    
    // Escuta em tempo real (Realtime)
    // Sempre que um aluno fizer check-in ou out pelo telemóvel, esta lista atualiza sozinha
    const canal = supabase
      .channel('monitor_academia_master')
      .on('postgres_changes', { 
        event: '*', 
        table: 'academia_checkins' 
      }, () => fetchAlunos())
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  async function fetchAlunos() {
    // Busca alunos onde o checkout_at ainda é NULL (estão na academia agora)
    const { data, error } = await supabase
      .from('academia_checkins')
      .select(`
        id,
        checkin_at,
        lat,
        lng,
        usuarios (
          nome,
          bairro,
          foto_url
        )
      `)
      .is('checkout_at', null)
      .order('checkin_at', { ascending: false })

    if (data) {
      setAlunosAtivos(data)
      setStats(prev => ({ ...prev, treinando: data.length }))
    }
  }

  const listaFiltrada = alunosAtivos.filter(item => 
    item.usuarios?.nome?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 antialiased font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER INDUSTRIAL - DESIGN VALENTE CONECTA */}
        <header className="mb-10 border-b-4 border-zinc-900 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-yellow-400">
              <Dumbbell size={24} />
              <span className="font-black uppercase tracking-[0.4em] text-xs italic">Módulo de Monitorização</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Gym <span className="text-yellow-400">Control</span>
            </h1>
          </div>

          {/* BARRA DE PESQUISA ELEGANTE */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-400 transition-colors" />
            <input 
              type="text" 
              placeholder="PROCURAR ALUNO ATIVO..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full bg-zinc-900 border-2 border-zinc-800 p-5 pl-14 rounded-[25px] font-bold uppercase italic focus:border-yellow-400 outline-none transition-all shadow-2xl placeholder:text-zinc-700"
            />
          </div>
        </header>

        {/* CARDS DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Alunos no Recinto" 
            value={stats.treinando.toString()} 
            icon={<Users className="text-yellow-400" />} 
            color="border-yellow-400/20"
          />
          <StatCard 
            label="Tempo Médio" 
            value="42" 
            suffix="min"
            icon={<Clock className="text-blue-500" />} 
          />
          <StatCard 
            label="Pico de Hoje" 
            value="18" 
            icon={<TrendingUp className="text-green-500" />} 
          />
          <StatCard 
            label="Unidade" 
            value="Valente" 
            icon={<Map className="text-purple-500" />} 
          />
        </div>

        {/* LISTA DE PRESENÇA EM TEMPO REAL */}
        <div className="bg-zinc-900/30 border-2 border-zinc-800 rounded-[40px] overflow-hidden backdrop-blur-md">
          <div className="p-8 border-b-2 border-zinc-800 flex justify-between items-center bg-zinc-900/40">
            <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Activity className="text-red-600 animate-pulse" /> Live Tracker <span className="text-zinc-600 text-sm not-italic ml-2 font-bold tracking-widest">| GPS ATIVO</span>
            </h2>
          </div>

          <div className="divide-y-2 divide-zinc-800/50">
            {listaFiltrada.length > 0 ? listaFiltrada.map((aluno) => (
              <div key={aluno.id} className="p-8 flex items-center justify-between hover:bg-zinc-800/40 transition-all group">
                <div className="flex items-center gap-6">
                  {/* FOTO DO ALUNO */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-800 rounded-3xl border-2 border-zinc-700 overflow-hidden flex-shrink-0 relative">
                    {aluno.usuarios?.foto_url ? (
                      <img src={aluno.usuarios.foto_url} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-black text-2xl italic">VC</div>
                    )}
                    <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full border-4 border-zinc-900"></div>
                  </div>

                  {/* INFO DO ALUNO */}
                  <div>
                    <h3 className="text-xl md:text-3xl font-black uppercase italic group-hover:text-yellow-400 transition-colors leading-none mb-2">
                      {aluno.usuarios?.nome || "Sem Nome"}
                    </h3>
                    <div className="flex flex-wrap gap-4 items-center">
                      <span className="flex items-center gap-1.5 text-zinc-500 font-bold uppercase text-xs tracking-widest bg-black px-3 py-1 rounded-full">
                        <MapPin size={12} className="text-red-500" /> {aluno.usuarios?.bairro || "Centro"}
                      </span>
                      <span className="flex items-center gap-1.5 text-yellow-400/80 font-bold uppercase text-xs tracking-widest">
                        <Clock size={12} /> Entrada: {new Date(aluno.checkin_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÃO DE ACÇÃO/DETALHE */}
                <button className="hidden md:flex bg-zinc-800 hover:bg-yellow-400 hover:text-black p-4 rounded-2xl transition-all group-active:scale-95">
                  <ChevronRight size={28} />
                </button>
              </div>
            )) : (
              <div className="p-32 text-center">
                <Dumbbell size={60} className="mx-auto text-zinc-800 mb-6" />
                <p className="text-zinc-600 font-black uppercase italic tracking-[0.4em] text-xl">Aguardando Check-ins...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, suffix, color = "border-zinc-800" }: any) {
  return (
    <div className={`bg-zinc-900 border-2 ${color} p-8 rounded-[35px] hover:border-yellow-400/40 transition-all group overflow-hidden relative`}>
      <div className="flex items-center gap-3 mb-4 relative z-10">
        {icon}
        <span className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] italic">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-5xl font-black italic tracking-tighter group-hover:text-yellow-400 transition-colors">
          {value}
        </span>
        {suffix && <span className="text-zinc-600 font-bold uppercase italic text-sm">{suffix}</span>}
      </div>
      {/* Detalhe de fundo decorativo */}
      <div className="absolute -right-4 -bottom-4 opacity-5 text-white group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
    </div>
  )
}