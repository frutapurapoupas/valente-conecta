'use client'

import React from 'react'
import { ArrowLeft, Building2, Calendar, ShieldCheck, Download, Award, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DetalheFinanceiro() {
  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      {/* VOLTAR */}
      <Link href="/admin/financeiro" className="flex items-center gap-4 text-zinc-500 hover:text-emerald-500 mb-12 transition-all group">
        <ArrowLeft size={40} className="group-hover:-translate-x-2 transition-transform" />
        <span className="text-2xl font-black uppercase italic tracking-widest">Voltar ao Fluxo</span>
      </Link>

      {/* HEADER: VALOR + STATUS */}
      <div className="flex justify-between items-end mb-16 border-b-4 border-zinc-900 pb-12">
        <div>
          <p className="text-emerald-500 font-black text-2xl uppercase tracking-[0.4em] mb-4">Detalhamento Financeiro</p>
          <h1 className="text-9xl font-black uppercase italic tracking-tighter leading-none">
            R$ 1.250,00
          </h1>
        </div>
        <div className="flex flex-col items-end gap-4">
           {/* DESTAQUE DO PLANO (O QUE FALTAVA) */}
           <div className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xl font-black uppercase flex items-center gap-3 animate-pulse">
              <Zap size={24} fill="currentColor" /> Plano Premium Gold
           </div>
           <div className="bg-emerald-500 text-black px-12 py-6 rounded-3xl text-4xl font-black uppercase italic">
              CONCLUÍDO
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        
        {/* INFO DA LOJA E CONTRATO */}
        <div className="bg-zinc-900 p-12 rounded-[50px] border-2 border-zinc-800 space-y-10">
          <div className="flex items-center gap-8">
            <Building2 size={56} className="text-indigo-500" />
            <div>
              <p className="text-zinc-500 font-black uppercase text-xl tracking-widest">Parceiro</p>
              <p className="text-5xl font-black uppercase italic text-white">Valente Cereais</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 border-t border-zinc-800 pt-8">
            <Award size={56} className="text-amber-500" />
            <div>
              <p className="text-zinc-500 font-black uppercase text-xl tracking-widest">Modalidade do Plano</p>
              <p className="text-4xl font-black uppercase text-white">Premium (10% de Taxa)</p>
              <p className="text-lg text-amber-500 font-bold uppercase mt-2">Benefício: Entrega Prioritária Ativada</p>
            </div>
          </div>
        </div>

        {/* DIVISÃO FINANCEIRA */}
        <div className="bg-zinc-900 p-12 rounded-[50px] border-2 border-zinc-800 space-y-8">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
            <span className="text-2xl font-bold text-zinc-400 uppercase">Venda Bruta</span>
            <span className="text-4xl font-black text-white">R$ 1.250,00</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-zinc-800 pb-6 text-red-500">
            <span className="text-2xl font-black uppercase italic">Comissão do App ({/* Plano Gold */} 10%)</span>
            <span className="text-4xl font-black">- R$ 125,00</span>
          </div>

          <div className="flex justify-between items-center pt-6">
            <span className="text-3xl font-black text-emerald-500 uppercase italic">Líquido para Loja</span>
            <span className="text-7xl font-black text-emerald-500 tracking-tighter font-mono">R$ 1.125,00</span>
          </div>
        </div>
      </div>

      {/* BOTÃO PDF */}
      <button className="w-full bg-white text-black font-black py-10 rounded-[40px] text-4xl uppercase italic hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-6">
        <Download size={48} strokeWidth={3} /> Gerar Relatório de Repasse
      </button>
    </div>
  )
}