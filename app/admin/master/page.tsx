'use client'

import React from 'react'
import { 
  BarChart3, Users, Building2, Wallet, Zap, 
  TrendingUp, ArrowUpRight, AlertTriangle, 
  Target, Download, FileSpreadsheet, CheckCircle2
} from 'lucide-react'

export default function DashboardMasterAtualizado() {
  // DADOS SINCRONIZADOS COM AS ÚLTIMAS TELAS
  const resumoFinanceiro = {
    receitaTotal: 12450.00, // Reflete os planos Academia/Consultas
    provisaoBonus: 4250.00, // Reflete o que vimos na tela de Bônus
    linksPendentes: 125     // Reflete a auditoria de indicações
  }

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      
      {/* 1. SIDEBAR VERTICAL GG - CONTROLE TOTAL */}
      <aside className="w-96 border-r-4 border-zinc-900 flex flex-col p-10 bg-zinc-950">
        <div className="mb-20">
          <h2 className="text-4xl font-black uppercase italic text-indigo-500 leading-none">Valente<br/>Conecta</h2>
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2 text-right italic">Master Admin v2.0</p>
        </div>

        <nav className="flex-1 space-y-6">
          {[
            { label: 'Visão Geral', icon: <Zap size={30} />, active: true },
            { label: 'Empresas', icon: <Building2 size={30} />, active: false },
            { label: 'Usuários', icon: <Users size={30} />, active: false },
            { label: 'Financeiro', icon: <Wallet size={30} />, active: false },
          ].map((item) => (
            <button key={item.label} className={`w-full flex items-center justify-between p-7 rounded-[35px] transition-all group ${item.active ? 'bg-indigo-600 text-white shadow-[0_0_40px_rgba(79,70,229,0.3)]' : 'hover:bg-zinc-900 text-zinc-500'}`}>
              <div className="flex items-center gap-6">
                {item.icon}
                <span className="text-2xl font-black uppercase italic">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto bg-zinc-900 p-8 rounded-[40px] border-2 border-zinc-800">
          <p className="text-zinc-500 font-black text-xs uppercase mb-4">Relatórios BI</p>
          <button className="w-full bg-emerald-600 hover:bg-white text-black font-black p-5 rounded-2xl transition-all flex items-center justify-center gap-3">
            <Download size={24} /> EXPORTAR HOJE
          </button>
        </div>
      </aside>

      {/* 2. CONTEÚDO PRINCIPAL (BI E INTELIGÊNCIA COMERCIAL) */}
      <main className="flex-1 p-16 overflow-y-auto">
        
        {/* HEADER DE RECEITA E SAÚDE DO SISTEMA */}
        <header className="mb-16 flex justify-between items-end">
          <div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none">Dashboard</h1>
            <p className="text-2xl text-zinc-600 font-black uppercase mt-4 tracking-widest italic flex items-center gap-4">
              <CheckCircle2 className="text-emerald-500" /> Sincronizado com Financeiro
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 font-black uppercase text-xl mb-2">Receita de Planos (Mês)</p>
            <p className="text-8xl font-black text-emerald-500 font-mono tracking-tighter leading-none italic">
              R$ {resumoFinanceiro.receitaTotal.toFixed(2)}
            </p>
          </div>
        </header>

        {/* GRADE DE INTELIGÊNCIA */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* GRÁFICO DE ATIVIDADE (A BARRA VERTICAL) */}
          <section className="col-span-8 bg-zinc-900/30 p-12 rounded-[60px] border-2 border-zinc-900 shadow-2xl">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black uppercase italic flex items-center gap-4">
                <BarChart3 className="text-indigo-500" size={40} /> Acessos em Valente
              </h3>
              <span className="text-zinc-500 font-black text-xl italic uppercase">Hoje: 08 Abr</span>
            </div>
            <div className="flex items-end gap-10 h-80 px-6">
              {[
                { h: '08h', v: 'h-[30%]', color: 'bg-zinc-800' },
                { h: '12h', v: 'h-[100%]', color: 'bg-indigo-600' },
                { h: '16h', v: 'h-[60%]', color: 'bg-indigo-500' },
                { h: '18h', v: 'h-[85%]', color: 'bg-indigo-400' },
                { h: '22h', v: 'h-[20%]', color: 'bg-zinc-800' }
              ].map((bar) => (
                <div key={bar.h} className="flex-1 flex flex-col items-center gap-6 group">
                  <div className={`w-full ${bar.color} rounded-2xl transition-all ${bar.v} group-hover:scale-110 shadow-lg`} />
                  <span className="text-xl font-black text-zinc-600 group-hover:text-white uppercase italic">{bar.h}</span>
                </div>
              ))}
            </div>
          </section>

          {/* MONITOR DE BÔNUS E ALERTAS (O QUE COMBINAMOS) */}
          <section className="col-span-4 space-y-10">
            <div className="bg-zinc-900/30 p-10 rounded-[60px] border-2 border-zinc-900">
              <div className="flex justify-between items-center mb-6">
                <Target size={48} className="text-amber-500" />
                <span className="bg-amber-500 text-black px-4 py-1 rounded-lg font-black text-xs uppercase">Atenção</span>
              </div>
              <p className="text-7xl font-black italic italic leading-none">{resumoFinanceiro.linksPendentes}</p>
              <p className="text-xl text-zinc-500 font-black uppercase mt-4 italic tracking-tighter">Links de Indicação Pendentes</p>
            </div>

            <div className="bg-emerald-600 p-10 rounded-[60px] text-black shadow-[0_30px_60px_rgba(16,185,129,0.3)]">
              <div className="flex justify-between items-center mb-6 text-black">
                <TrendingUp size={48} />
                <span className="bg-black text-white px-4 py-1 rounded-lg font-black text-xs uppercase italic tracking-widest">Saúde Mensal</span>
              </div>
              <p className="text-7xl font-black italic italic leading-none">+R$ {resumoFinanceiro.provisaoBonus.toFixed(0)}</p>
              <p className="text-xl font-black uppercase mt-4 italic italic tracking-tighter">Bônus Provisionados</p>
            </div>
          </section>

          {/* BOTÃO DE RELATÓRIO DE INTELIGÊNCIA COMERCIAL */}
          <section className="col-span-12">
            <button className="w-full bg-zinc-900 border-4 border-zinc-800 p-16 rounded-[70px] flex justify-between items-center group hover:border-indigo-500 transition-all shadow-2xl">
              <div className="flex items-center gap-10">
                <div className="bg-black p-8 rounded-[40px] border border-zinc-800 group-hover:bg-indigo-500/10 transition-all">
                  <FileSpreadsheet size={80} className="text-zinc-600 group-hover:text-emerald-500 transition-all" />
                </div>
                <div className="text-left">
                  <p className="text-6xl font-black uppercase italic tracking-tighter">Relatório de Inteligência Comercial</p>
                  <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">Cruzamento de Vendas, Estoque e Auditoria Fiscal</p>
                </div>
              </div>
              <div className="bg-white text-black p-8 rounded-full shadow-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ArrowUpRight size={50} />
              </div>
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}