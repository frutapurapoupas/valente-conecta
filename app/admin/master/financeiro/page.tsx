'use client'

import React from 'react'
import { Landmark, ArrowUpCircle, ArrowDownCircle, Percent, FileSpreadsheet, ShieldCheck, Download } from 'lucide-react'

export default function FinanceiroMasterDefinitivo() {
  // DADOS QUE VOCÊ EXIGIU: PLANOS, TAXAS E TIPO DE OPERAÇÃO
  const faturamentos = [
    { 
      loja: "Valente Cereais", 
      plano: "Premium Gold", 
      taxa: "10%", 
      tipo: "Entrada", 
      valor: 1250.00, 
      status: "Concluído" 
    },
    { 
      loja: "Mercadinho Bom Preço", 
      plano: "Basic Silver", 
      taxa: "15%", 
      tipo: "Entrada", 
      valor: 450.20, 
      status: "Processando" 
    },
    { 
      loja: "Supermercado São Domingos", 
      plano: "Master Black", 
      taxa: "8%", 
      tipo: "Repasse", 
      valor: 3200.00, 
      status: "Pendente" 
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      {/* HEADER MASTER COM BOTÃO DE EXPORTAÇÃO QUE VOCÊ PEDIU */}
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-emerald-500 mb-4">
            <Landmark size={72} strokeWidth={2.5} />
            <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white leading-none">Faturamentos</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Gestão de Planos e Inteligência Financeira</p>
        </div>
        <button className="bg-emerald-600 text-black font-black px-12 py-6 rounded-[30px] text-xl flex items-center gap-4 hover:bg-white transition-all">
          <FileSpreadsheet size={32} /> EXPORTAR HOJE
        </button>
      </header>

      {/* LISTAGEM COM TODAS AS INFORMAÇÕES COMBINADAS */}
      <div className="space-y-10">
        {faturamentos.map((f, index) => (
          <div key={index} className="bg-zinc-950 rounded-[60px] border-4 border-zinc-900 p-12 group hover:border-indigo-500 transition-all shadow-2xl">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-10">
              
              {/* BLOCO 1: NOME E PLANO */}
              <div className="flex-1">
                <h2 className="text-6xl font-black uppercase italic mb-4 group-hover:text-indigo-400">{f.loja}</h2>
                <div className="flex flex-col gap-2">
                  <span className="text-indigo-500 font-black text-2xl uppercase italic">{f.plano}</span>
                  <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase text-lg italic">
                    <Percent size={20} className="text-zinc-700" />
                    Taxa do Contrato: <span className="text-white">{f.taxa}</span>
                    <span className="mx-4 text-zinc-800">•</span>
                    Tipo: <span className={f.tipo === 'Entrada' ? 'text-emerald-500' : 'text-red-500'}>{f.tipo}</span>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: VALOR BRUTO (GG) */}
              <div className="bg-zinc-900 p-8 rounded-[40px] border-2 border-zinc-800 min-w-[400px] text-center">
                <p className={`text-7xl font-black font-mono tracking-tighter ${f.tipo === 'Entrada' ? 'text-emerald-500' : 'text-red-500'}`}>
                  R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-zinc-600 font-black uppercase text-xs mt-2 tracking-widest italic">
                  Valor da Operação ({f.tipo})
                </p>
              </div>

              {/* BLOCO 3: STATUS DA TRANSAÇÃO */}
              <div className="flex flex-col items-end min-w-[250px]">
                <div className={`px-8 py-4 rounded-2xl font-black uppercase text-xl ${
                  f.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-500' : 
                  f.status === 'Processando' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {f.status}
                </div>
                <div className="mt-4 flex items-center gap-2 text-zinc-600 font-black text-xs uppercase italic">
                  <ShieldCheck size={16} /> Auditoria Sincronizada
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}