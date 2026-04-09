'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardMaster() {
  const [totalSaidas, setTotalSaidas] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [checkinsAtivos, setCheckinsAtivos] = useState(0)

  useEffect(() => {
    async function loadStats() {
      const { data: fin } = await supabase.from('financeiro').select('valor')
      if (fin) setTotalSaidas(fin.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0))
      
      const { count } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
      if (count) setTotalUsuarios(count || 0)

      // Nova métrica: Alunos treinando agora
      const { count: gymCount } = await supabase
        .from('academia_checkins')
        .select('*', { count: 'exact', head: true })
        .is('checkout_at', null)
      if (gymCount) setCheckinsAtivos(gymCount)
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 antialiased overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 border-b-2 border-zinc-900 pb-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter">
            Dashboard <span className="text-yellow-400">Master</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-xl font-bold uppercase tracking-widest mt-1 italic opacity-50">Valente Conecta Official</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard title="Receita Planos" value="R$ 12.450" color="text-white" origin="VALENTE-BA" />
          <StatCard title="Usuários Ativos" value={totalUsuarios.toLocaleString()} color="text-white" origin="SUPABASE AUTH" />
          <StatCard title="Saídas Mensais" value={`R$ ${totalSaidas.toLocaleString('pt-BR')}`} color="text-red-500" origin="FINANCEIRO" />
          <StatCard title="Treinando Agora" value={checkinsAtivos.toString()} color="text-purple-400" origin="MÓDULO ACADEMIA" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-zinc-600 font-black uppercase italic text-xl md:text-3xl animate-pulse z-10 text-center">Cruzamento de Vendas e Estoque</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-black uppercase italic mb-6 border-b-2 border-yellow-400 pb-2 inline-block">Radar Bairros</h3>
            <div className="space-y-6">
              <BarraProgresso bairro="CENTRO" perc={45} />
              <BarraProgresso bairro="ARACI" perc={82} />
              <BarraProgresso bairro="BRASILÂNDIA" perc={63} />
              <BarraProgresso bairro="SANTA RITA" perc={30} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color, origin }: any) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-yellow-400/50 transition-all group">
      <p className="text-zinc-500 font-bold uppercase text-xs mb-1 tracking-widest italic">{title}</p>
      <p className={`text-3xl md:text-4xl font-black ${color} italic tracking-tighter mb-4`}>{value}</p>
      <p className="text-zinc-700 font-black text-[10px] uppercase tracking-widest border-t border-zinc-800 pt-3 group-hover:text-zinc-500">{origin}</p>
    </div>
  )
}

function BarraProgresso({ bairro, perc }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm font-bold uppercase italic mb-1">
        <span className="text-zinc-400">{bairro}</span>
        <span className="text-yellow-400">{perc}%</span>
      </div>
      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-zinc-800">
        <div className="bg-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)]" style={{ width: `${perc}%` }}></div>
      </div>
    </div>
  )
}