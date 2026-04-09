'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isLogged = localStorage.getItem('admin_logged')
    if (!isLogged) {
      router.push('/admin/login')
    }
  }, [router])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Container Principal com largura limitada e escala interna */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
        
        {/* HEADER DO DASHBOARD */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase">
              Dashboard <span className="text-yellow-400">Master</span>
            </h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Sincronizado com Supabase Real-Time</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all">
              Exportar BI
            </button>
            <button 
              onClick={() => { localStorage.removeItem('admin_logged'); router.push('/admin/login'); }}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border border-red-500/20"
            >
              Sair
            </button>
          </div>
        </header>

        {/* GRID DE KPIS (CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Receita de Planos" value="R$ 12.450,00" trend="+12%" color="text-green-400" />
          <StatCard title="Acessos Hoje" value="1.254" trend="Valente-BA" color="text-yellow-400" />
          <StatCard title="Indicações Pendentes" value="125" trend="Urgente" color="text-red-500" />
          <StatCard title="Saúde Mensal" value="+R$ 4.250" trend="Bônus" color="text-blue-400" />
        </div>

        {/* ÁREA DE INTELIGÊNCIA COMERCIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900 border-2 border-zinc-800 rounded-40 p-6 shadow-xl">
            <h3 className="text-lg font-black uppercase italic mb-6">Cruzamento de Vendas e Estoque</h3>
            <div className="h-[300px] bg-zinc-800/30 rounded-3xl flex items-center justify-center border border-zinc-800 border-dashed">
              <p className="text-zinc-600 font-bold uppercase text-xs">Gráfico de Inteligência Comercial (Carregando...)</p>
            </div>
          </div>

          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-40 p-6 shadow-xl">
            <h3 className="text-lg font-black uppercase italic mb-6">Radar de Bairros</h3>
            <div className="space-y-4">
              <BairroRow nome="Centro" porcentagem={85} />
              <BairroRow nome="Araci" porcentagem={62} />
              <BairroRow nome="Monsenhor" porcentagem={45} />
              <BairroRow nome="Santa Rita" porcentagem={30} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, trend, color }: any) {
  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-30 hover:border-zinc-700 transition-all group">
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 group-hover:text-yellow-400 transition-colors">{title}</p>
      <h2 className="text-2xl font-black text-white mb-1">{value}</h2>
      <p className={`text-[10px] font-bold uppercase ${color}`}>{trend}</p>
    </div>
  )
}

function BairroRow({ nome, porcentagem }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase italic">
        <span>{nome}</span>
        <span className="text-yellow-400">{porcentagem}%</span>
      </div>
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${porcentagem}%` }}></div>
      </div>
    </div>
  )
}