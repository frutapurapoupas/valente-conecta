'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardMaster() {
  const [totalSaidas, setTotalSaidas] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)

  useEffect(() => {
    async function loadStats() {
      // Soma saídas reais do banco
      const { data: fin } = await supabase.from('financeiro').select('valor')
      if (fin) setTotalSaidas(fin.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0))
      
      // Conta usuários reais do banco
      const { count } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
      if (count) setTotalUsuarios(count || 0)
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-10 antialiased font-sans overflow-x-hidden">
      <div className="origin-top-left scale-[0.55] w-[181.8%]">
        <header className="mb-12 border-b-4 border-zinc-900 pb-10">
          <h1 className="text-9xl font-black uppercase italic tracking-tighter leading-none">
            Dashboard <span className="text-yellow-400">Master</span>
          </h1>
          <p className="text-zinc-500 text-4xl font-bold uppercase tracking-[0.4em] mt-2 italic">Valente Conecta Official</p>
        </header>

        {/* CARDS COM ORIGEM DOS VALORES */}
        <div className="grid grid-cols-4 gap-8 mb-16">
          <StatCard title="Receita de Planos" value="R$ 12.450" color="text-white" origin="VALENTE-BA" />
          <StatCard title="Usuários Ativos" value={totalUsuarios.toLocaleString()} color="text-white" origin="SUPABASE AUTH" />
          <StatCard title="Saídas Mensais" value={`R$ ${totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} color="text-red-500" origin="BANCO REAL" />
          <StatCard title="Saldo em Conta" value="R$ 4.250" color="text-green-500" origin="SICOOB" />
        </div>

        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 bg-zinc-900 border-4 border-zinc-800 rounded-60 p-12 h-[600px] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             <p className="text-zinc-500 font-black uppercase italic text-5xl animate-pulse">Cruzamento de Vendas e Estoque</p>
          </div>
          
          <div className="bg-zinc-900 border-4 border-zinc-800 rounded-60 p-10">
            <h3 className="text-5xl font-black uppercase italic mb-10 border-b-4 border-yellow-400 pb-4 inline-block">Radar Bairros</h3>
            <div className="space-y-10 mt-6">
              <BarraProgresso bairro="CENTRO" perc={45} color="bg-yellow-400" />
              <BarraProgresso bairro="ARACI" perc={82} color="bg-yellow-400" />
              <BarraProgresso bairro="BRASILÂNDIA" perc={63} color="bg-yellow-400" />
              <BarraProgresso bairro="SANTA RITA" perc={30} color="bg-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color, origin }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-50 hover:border-yellow-400 transition-all">
      <p className="text-zinc-500 font-black uppercase text-2xl mb-2 tracking-widest italic">{title}</p>
      <p className={`text-7xl font-black ${color} italic tracking-tighter leading-none mb-6`}>{value}</p>
      <p className="text-zinc-700 font-black text-xl uppercase tracking-[0.3em] border-t border-zinc-800 pt-4">{origin}</p>
    </div>
  )
}

function BarraProgresso({ bairro, perc, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-2xl font-black uppercase italic mb-3">
        <span>{bairro}</span>
        <span className="text-yellow-400">{perc}%</span>
      </div>
      <div className="w-full bg-black h-6 rounded-full border-2 border-zinc-800 p-1">
        <div className={`${color} h-full rounded-full`} style={{ width: `${perc}%` }}></div>
      </div>
    </div>
  )
}