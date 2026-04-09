'use client'

import React, { useState } from 'react'
import { Award, Zap, ShieldCheck, Save, Edit3, Percent } from 'lucide-react'

export default function GestaoPlanos() {
  // DADOS DINÂMICOS (Simulando a edição em tempo real)
  const [planos, setPlanos] = useState([
    { id: 1, nome: "Premium Gold", taxa: 10, cor: "text-amber-500", border: "border-amber-500/30" },
    { id: 2, nome: "Master Black", taxa: 8, cor: "text-zinc-100", border: "border-zinc-500/30" },
    { id: 3, nome: "Basic Silver", taxa: 15, cor: "text-zinc-400", border: "border-zinc-700/30" }
  ])

  const atualizarTaxa = (id, novaTaxa) => {
    setPlanos(planos.map(p => p.id === id ? { ...p, taxa: Number(novaTaxa) } : p))
  }

  return (
    <div className="min-h-screen bg-black text-white p-12 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="mb-20 border-b-4 border-indigo-900 pb-10">
        <div className="flex items-center gap-6 text-indigo-500 mb-4">
          <Award size={72} strokeWidth={2.5} />
          <h1 className="text-8xl font-black uppercase tracking-tighter italic text-white">Gestão de Planos</h1>
        </div>
        <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Configure as Comissões do Valente Conecta</p>
      </header>

      {/* GRADE DE PLANOS EDITÁVEIS */}
      <div className="grid grid-cols-1 gap-10">
        {planos.map((plano) => (
          <div key={plano.id} className={`bg-zinc-900 border-2 ${plano.border} rounded-[50px] p-12 flex items-center justify-between group hover:border-indigo-500 transition-all`}>
            
            <div className="flex items-center gap-10">
              <div className={`p-8 rounded-[35px] bg-black border-2 ${plano.border}`}>
                <Zap size={60} className={plano.cor} fill="currentColor" />
              </div>
              
              <div>
                <h2 className={`text-6xl font-black uppercase italic tracking-tighter ${plano.cor}`}>
                  {plano.nome}
                </h2>
                <p className="text-xl text-zinc-500 font-black uppercase mt-2 tracking-widest">
                  Status: Ativo para Lojistas em Valente
                </p>
              </div>
            </div>

            {/* ÁREA DE EDIÇÃO DE TAXA */}
            <div className="flex items-center gap-8 bg-black/50 p-8 rounded-[40px] border-2 border-zinc-800">
              <div className="text-right">
                <label className="block text-zinc-500 font-black uppercase text-sm mb-2 tracking-tighter">Taxa de Comissão (%)</label>
                <div className="flex items-center gap-4">
                  <Percent className="text-indigo-500" size={40} />
                  <input 
                    type="number" 
                    value={plano.taxa}
                    onChange={(e) => atualizarTaxa(plano.id, e.target.value)}
                    className="bg-transparent text-7xl font-black text-white w-32 outline-none focus:text-indigo-500 transition-colors font-mono"
                  />
                </div>
              </div>
              
              <button className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white p-6 rounded-3xl transition-all active:scale-90 shadow-xl shadow-indigo-500/20">
                <Save size={40} strokeWidth={3} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* NOTA DE RODAPÉ */}
      <div className="mt-20 p-10 bg-zinc-950 border-2 border-zinc-900 rounded-[40px] flex items-center gap-6">
        <ShieldCheck className="text-emerald-500" size={48} />
        <p className="text-xl text-zinc-500 font-bold uppercase italic">
          Qualquer alteração nestes planos será aplicada imediatamente a todos os novos contratos gerados na plataforma <span className="text-white">Valente Conecta</span>.
        </p>
      </div>

    </div>
  )
}