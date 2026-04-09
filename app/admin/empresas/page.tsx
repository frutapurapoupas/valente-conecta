'use client'

import React from 'react'
import { Building2, MapPin, FileText, CreditCard, AlertCircle, ArrowUpRight } from 'lucide-react'

export default function GestaoEmpresasMaster() {
  const empresas = [
    { 
      nome: "Valente Cereais", 
      cnpj: "12.345.678/0001-90", 
      local: "Centro - Valente", 
      plano: "Gold", 
      taxa: "10%", 
      status: "Pendente" 
    },
    { 
      nome: "APAEB Posto de Vendas", 
      cnpj: "98.765.432/0001-21", 
      local: "Centro - Valente", 
      plano: "Black", 
      taxa: "8%", 
      status: "Pendente" 
    },
    { 
      nome: "Supermercado São Domingos", 
      cnpj: "45.678.912/0001-33", 
      local: "Centro - Valente", 
      plano: "Silver", 
      taxa: "15%", 
      status: "Pendente" 
    },
    { 
      nome: "Mercadinho Bom Preço", 
      cnpj: "11.222.333/0001-44", 
      local: "Centro - Valente", 
      plano: "Gold", 
      taxa: "10%", 
      status: "Pendente" 
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-12">
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-indigo-500 mb-4">
            <Building2 size={64} />
            <h1 className="text-8xl font-black uppercase italic tracking-tighter">Empresas</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Auditoria de Contratos e Planos de Comissão</p>
        </div>
        <button className="bg-white text-black font-black px-12 py-6 rounded-3xl text-2xl hover:bg-indigo-500 hover:text-white transition-all italic">
          + Cadastrar Empresa
        </button>
      </header>

      <div className="space-y-12">
        {empresas.map((emp) => (
          <div key={emp.cnpj} className="bg-zinc-900/40 rounded-[60px] border-4 border-zinc-900 p-12 flex flex-col xl:flex-row justify-between items-center group hover:border-indigo-500 transition-all">
            
            {/* LADO ESQUERDO: IDENTIDADE E FISCAL */}
            <div className="flex-1 space-y-6">
              <h2 className="text-6xl font-black uppercase italic group-hover:text-indigo-400 leading-none">{emp.nome}</h2>
              
              <div className="flex flex-wrap gap-6">
                <div className="bg-black px-6 py-4 rounded-2xl border border-zinc-800 flex items-center gap-4">
                  <FileText className="text-zinc-600" size={24} />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase">Registro CNPJ</p>
                    <p className="text-3xl font-mono font-black">{emp.cnpj}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-zinc-400 px-6 py-4">
                  <MapPin size={32} className="text-indigo-500" />
                  <span className="text-3xl font-black uppercase italic tracking-tighter">{emp.local}</span>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: O CARD DE PLANO (ESTRATÉGICO) */}
            <div className="flex items-center gap-10 mt-12 xl:mt-0">
              
              {/* CARD DE PLANO INTEGRADO */}
              <div className="bg-black p-8 rounded-[40px] border-2 border-zinc-800 flex items-center gap-8 min-w-[380px] shadow-2xl">
                <div className="bg-indigo-600 p-6 rounded-[30px] shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                  <CreditCard size={48} className="text-white" />
                </div>
                <div>
                  <p className="text-zinc-500 font-black text-xs uppercase mb-1">Contrato Vigente</p>
                  <p className="text-5xl font-black uppercase italic text-white tracking-tighter">
                    {emp.plano} <span className="text-emerald-500 text-3xl">({emp.taxa})</span>
                  </p>
                </div>
              </div>

              {/* STATUS DE VALIDAÇÃO MASTER */}
              <div className="flex flex-col items-center gap-4">
                <div className={`px-10 py-6 rounded-[30px] font-black uppercase text-2xl flex items-center gap-4 shadow-xl ${
                  emp.status === 'Pendente' ? 'bg-amber-500 text-black animate-pulse' : 'bg-emerald-500 text-black'
                }`}>
                  <AlertCircle size={32} />
                  {emp.status}
                </div>
                <button className="bg-zinc-800 hover:bg-indigo-600 p-6 rounded-full transition-all group/btn">
                  <ArrowUpRight size={40} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}