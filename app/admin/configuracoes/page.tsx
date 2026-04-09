'use client'

import React from 'react'
import { Settings, Save, Image as ImageIcon, DollarSign, Bell, Smartphone } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      {/* CABEÇALHO GIGANTE */}
      <header className="mb-20 border-b-4 border-indigo-900 pb-10">
        <div className="flex items-center gap-6 text-indigo-500 mb-4">
          <Settings size={64} strokeWidth={2.5} />
          <h1 className="text-7xl font-black uppercase tracking-tighter italic">Configurações</h1>
        </div>
        <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">
          Parâmetros do Sistema Valente
        </p>
      </header>

      <div className="max-w-6xl space-y-12">
        
        {/* SEÇÃO: REGRAS DO MARKETPLACE - TAMANHO AMPLIADO */}
        <section className="bg-zinc-900 border-2 border-zinc-800 rounded-[40px] p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-12 border-b-2 border-zinc-800 pb-6">
            <Smartphone className="text-indigo-500" size={40} />
            <h2 className="text-4xl font-black uppercase italic tracking-tight">Regras do Marketplace</h2>
          </div>

          <div className="grid grid-cols-1 gap-12">
            
            {/* Máximo de fotos - INPUT GIGANTE */}
            <div className="space-y-4">
              <label className="text-2xl font-black uppercase text-zinc-400 flex items-center gap-3">
                <ImageIcon size={28} className="text-indigo-500" /> Máximo de fotos por produto
              </label>
              <input 
                type="number" 
                defaultValue="5"
                className="w-full bg-black border-4 border-zinc-800 rounded-3xl p-10 text-5xl font-black text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Valor da consulta - INPUT GIGANTE */}
            <div className="space-y-4">
              <label className="text-2xl font-black uppercase text-zinc-400 flex items-center gap-3">
                <DollarSign size={28} className="text-emerald-500" /> Valor da consulta extra (R$)
              </label>
              <input 
                type="text" 
                defaultValue="50,00"
                className="w-full bg-black border-4 border-zinc-800 rounded-3xl p-10 text-5xl font-black text-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
              />
            </div>
          </div>
        </section>

        {/* NOTIFICAÇÕES - ESTILO STATUS BAR */}
        <section className="bg-zinc-950 border-2 border-zinc-800 rounded-[40px] p-12 flex items-center justify-between group">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
              <Bell size={48} className="text-zinc-600 relative" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase text-zinc-400">Notificações Push</h2>
              <p className="text-xl text-zinc-600 font-bold italic uppercase tracking-widest">Módulo em fase de testes para Valente-BA</p>
            </div>
          </div>
          <div className="w-24 h-12 bg-zinc-800 rounded-full p-2 relative">
             <div className="w-8 h-8 bg-zinc-600 rounded-full"></div>
          </div>
        </section>

        {/* BOTÃO SALVAR - IMPACTO TOTAL */}
        <div className="pt-8">
          <button className="flex items-center justify-center gap-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-10 rounded-[35px] transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-500/30">
            <Save size={48} strokeWidth={3} />
            <span className="text-4xl uppercase tracking-tighter italic">Salvar Alterações</span>
          </button>
        </div>

      </div>
    </div>
  )
}