'use client'
import { useState } from 'react'

export default function DashboardMaster() {
  const [periodo, setPeriodo] = useState('semanal')

  const dadosSemanais = [
    { dia: 'SEG', valor: 1200 }, { dia: 'TER', valor: 2100 },
    { dia: 'QUA', valor: 1800 }, { dia: 'QUI', valor: 2400 },
    { dia: 'SEX', valor: 3200 }, { dia: 'SAB', valor: 4100 },
    { dia: 'DOM', valor: 1500 }
  ]

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-yellow-400 font-sans">
      <div className="origin-top-left scale-[0.6] w-[166.6%] p-10">
        <header className="flex justify-between items-end mb-12 border-b-4 border-zinc-900 pb-10">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Dashboard <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-3xl font-bold uppercase tracking-[0.4em] mt-2 italic">Sincronização: <span className="text-green-500 font-black">Tempo Semanal</span></p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setPeriodo('semanal')} className={`px-10 py-4 rounded-full text-2xl font-black uppercase border-4 transition-all ${periodo === 'semanal' ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-zinc-800 text-zinc-500'}`}>Semanal</button>
            <button onClick={() => setPeriodo('mensal')} className={`px-10 py-4 rounded-full text-2xl font-black uppercase border-4 transition-all ${periodo === 'mensal' ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500'}`}>Mensal</button>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-8 mb-16">
          <StatCard title="Receita (Semana)" value="R$ 16.300,00" color="text-white" trend="+12%" />
          <StatCard title="Acessos Hoje" value="1.254" color="text-yellow-400" trend="VALENTE-BA" />
          <StatCard title="Indicações" value="125" color="text-white" trend="RECENTES" />
          <StatCard title="Saldo Semanal" value="+R$ 4.250" color="text-green-500" trend="BÔNUS" />
        </div>

        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 bg-zinc-900/50 border-4 border-zinc-800 p-10 rounded-60 relative overflow-hidden">
            <h3 className="text-3xl font-black uppercase italic mb-10 text-zinc-400 text-center tracking-widest">Cruzamento de Vendas e Estoque (7 Dias)</h3>
            <div className="h-[400px] flex items-end justify-between gap-6 px-4 border-b-4 border-zinc-800">
              {dadosSemanais.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="w-full bg-yellow-400 rounded-t-15 transition-all group-hover:bg-white relative shadow-[0_0_20px_rgba(250,204,21,0.2)]" style={{ height: `${(d.valor / 4100) * 100}%` }}></div>
                  <span className="mt-4 text-xl font-black text-zinc-600 uppercase italic">{d.dia}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <h3 className="text-3xl font-black uppercase italic mb-8 border-b-2 border-zinc-800 pb-4 text-center">Radar de Bairros</h3>
            <div className="space-y-8">
              <BairroProgress label="Centro" percent="87%" />
              <BairroProgress label="Araci" percent="62%" />
              <BairroProgress label="Brasilandia" percent="45%" />
              <BairroProgress label="Santa Rita" percent="30%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color, trend }: any) {
  return (
    <div className="bg-zinc-900 border-4 border-zinc-800 p-8 rounded-40 hover:border-zinc-600 transition-all group">
      <p className="text-zinc-500 font-black uppercase text-xl mb-2 tracking-widest italic">{title}</p>
      <p className={`text-6xl font-black ${color} italic tracking-tighter leading-none mb-4`}>{value}</p>
      <span className="text-zinc-600 font-black text-lg uppercase bg-black/40 px-3 py-1 rounded-10 border border-zinc-800 group-hover:text-white transition-colors">{trend}</span>
    </div>
  )
}

function BairroProgress({ label, percent }: any) {
  return (
    <div>
      <div className="flex justify-between text-xl font-black uppercase mb-2 italic">
        <span>{label}</span>
        <span className="text-yellow-400 font-black">{percent}</span>
      </div>
      <div className="w-full bg-black h-4 rounded-full border border-zinc-800 overflow-hidden">
        <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: percent }}></div>
      </div>
    </div>
  )
}