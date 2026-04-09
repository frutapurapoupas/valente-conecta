'use client'

import React from 'react'
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  ArrowUpRight, FileSpreadsheet, Zap, Target
} from 'lucide-react'

export default function DashboardInteligenciaComercial() {
  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      
      {/* SIDEBAR JÁ CONSOLIDADA */}
      <aside className="w-96 border-r-4 border-zinc-900 flex flex-col p-10 bg-zinc-950">
        <h2 className="text-4xl font-black uppercase italic text-indigo-500 mb-20">Valente<br/>Conecta</h2>
        <nav className="flex-1 space-y-6">
           <button className="w-full flex items-center gap-6 p-7 rounded-[35px] bg-indigo-600 text-white shadow-2xl">
              <Zap size={30} /><span className="text-2xl font-black uppercase italic">Dashboard</span>
           </button>
           {/* Outros botões... */}
        </nav>
      </aside>

      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-20 border-b-8 border-zinc-900 pb-12">
          <h1 className="text-9xl font-black uppercase italic tracking-tighter leading-none">Inteligência<br/>Comercial</h1>
        </header>

        <div className="grid grid-cols-12 gap-10">
          
          {/* GRÁFICO 1: PERFORMANCE DE VENDAS POR CATEGORIA (DOS 2.000 ITENS) */}
          <section className="col-span-7 bg-zinc-900/30 p-12 rounded-[60px] border-2 border-zinc-900 shadow-2xl">
            <h3 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-4">
              <BarChart3 className="text-emerald-500" size={40} /> Giro de Categoria (Hoje)
            </h3>
            <div className="space-y-8">
              {[
                { cat: 'Mercearia (Cereais)', val: '85%', color: 'bg-emerald-500', money: 'R$ 4.200' },
                { cat: 'Hortifruti', val: '65%', color: 'bg-indigo-500', money: 'R$ 2.800' },
                { cat: 'Limpeza/Higiene', val: '40%', color: 'bg-amber-500', money: 'R$ 1.500' },
                { cat: 'Bebidas', val: '25%', color: 'bg-zinc-700', money: 'R$ 900' }
              ].map((item) => (
                <div key={item.cat} className="group">
                  <div className="flex justify-between mb-3 items-end">
                    <p className="text-2xl font-black uppercase italic">{item.cat}</p>
                    <p className="text-3xl font-mono font-black text-white">{item.money}</p>
                  </div>
                  <div className="w-full h-8 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div className={`${item.color} h-full transition-all duration-1000 group-hover:brightness-125`} style={{ width: item.val }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* GRÁFICO 2: FUNIL DE CONVERSÃO DE BÔNUS (MEMBER GET MEMBER) */}
          <section className="col-span-5 bg-zinc-900/30 p-12 rounded-[60px] border-2 border-zinc-900">
            <h3 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-4">
              <PieChart className="text-amber-500" size={40} /> Conversão de Indicações
            </h3>
            <div className="relative flex flex-col items-center justify-center">
              {/* Representação Visual do Funil de Dados */}
              <div className="w-full space-y-4">
                <div className="bg-zinc-800 p-6 rounded-3xl border-l-8 border-indigo-500">
                  <p className="text-zinc-500 font-black text-xs uppercase">Links Gerados</p>
                  <p className="text-5xl font-black italic">1.250</p>
                </div>
                <div className="bg-zinc-800/60 p-6 rounded-3xl border-l-8 border-amber-500 ml-8">
                  <p className="text-zinc-500 font-black text-xs uppercase">Cadastros Pendentes</p>
                  <p className="text-5xl font-black italic text-amber-500">312</p>
                </div>
                <div className="bg-emerald-500 p-6 rounded-3xl border-l-8 border-white ml-16 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <p className="text-black font-black text-xs uppercase">Usuários Validados</p>
                  <p className="text-5xl font-black italic text-black">840</p>
                </div>
              </div>
              <p className="mt-8 text-xl font-black uppercase text-zinc-500 italic">Taxa de Eficiência: <span className="text-emerald-500">67.2%</span></p>
            </div>
          </section>

          {/* BOTÃO DE RELATÓRIO DE INTELIGÊNCIA COMERCIAL (EXPORTAÇÃO) */}
          <section className="col-span-12">
            <button className="w-full bg-zinc-900 border-4 border-zinc-800 p-12 rounded-[60px] flex justify-between items-center group hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-10">
                <div className="bg-black p-8 rounded-[40px] border border-zinc-800">
                  <FileSpreadsheet size={80} className="text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="text-6xl font-black uppercase italic tracking-tighter">Exportar Inteligência Comercial</p>
                  <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">Dados de Consumo por Bairro e Plano Ativo</p>
                </div>
              </div>
              <div className="bg-white text-black p-10 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xl">
                <Download size={50} />
              </div>
            </button>
          </section>

        </div>
      </main>
    </div>
  )
}