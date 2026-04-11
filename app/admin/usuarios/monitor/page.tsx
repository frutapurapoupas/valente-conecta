'use client'

import React from 'react'
import { Users, Wallet, Lock, Gift, Coins, ArrowUpRight, ShieldCheck, Search } from 'lucide-react'
import { useAdminMonitor } from '@/hooks/useAdminMonitor'

export default function GestaoFinanceiraUsuariosMaster() {
  const { usuarios } = useAdminMonitor()

  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      {/* HEADER MASTER */}
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-indigo-500 mb-4">
            <Coins size={72} strokeWidth={2.5} />
            <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white leading-none">Carteiras</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Gestão de Saldos e Bônus de Usuários</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={30} />
          <input 
            type="text" 
            placeholder="BUSCAR USUÁRIO..." 
            className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl py-6 pl-20 pr-10 text-xl font-black uppercase outline-none focus:border-indigo-500 w-[400px]"
          />
        </div>
      </header>

      {/* LISTAGEM COM AS 4 INFORMAÇÕES CHAVE POR USUÁRIO */}
      <div className="space-y-10">
        {usuarios.map((u) => (
          <div key={u.id} className="bg-zinc-950 rounded-[60px] border-4 border-zinc-900 p-10 group hover:border-indigo-500 transition-all shadow-2xl">
            <div className="grid grid-cols-12 gap-8 items-center">
              
              {/* PERFIL */}
              <div className="col-span-3 border-r-2 border-zinc-900 pr-8">
                <p className="text-4xl font-black uppercase italic group-hover:text-indigo-400 leading-tight">{u.nome}</p>
                <p className="text-zinc-500 font-bold uppercase text-xs mt-2 tracking-widest">{u.local}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase italic">
                  <ShieldCheck size={14} className="text-indigo-500" /> {u.status}
                </div>
              </div>

              {/* INFO 1: BÔNUS POR INDICAÇÃO */}
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-500">
                    <ArrowUpRight size={24} />
                  </div>
                  <p className="text-zinc-500 font-black text-[10px] uppercase tracking-tighter">Bônus Indicação</p>
                  <p className="text-3xl font-black font-mono">R$ {u.bonusIndicacao.toFixed(2)}</p>
                </div>
              </div>

              {/* INFO 2: OUTROS BÔNUS */}
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500">
                    <Gift size={24} />
                  </div>
                  <p className="text-zinc-500 font-black text-[10px] uppercase tracking-tighter">Outros Bônus</p>
                  <p className="text-3xl font-black font-mono">R$ {u.outrosBonus.toFixed(2)}</p>
                </div>
              </div>

              {/* INFO 3: SALDO EM CARTEIRA (DISPONÍVEL) */}
              <div className="col-span-2 text-center">
                <div className="bg-zinc-900 p-6 rounded-[35px] border-2 border-zinc-800 group-hover:border-emerald-500/50 transition-all">
                  <p className="text-emerald-500 font-black text-[10px] uppercase mb-1">Saldo Disponível</p>
                  <p className="text-4xl font-black font-mono text-white">R$ {u.saldoCarteira.toFixed(2)}</p>
                </div>
              </div>

              {/* INFO 4: SALDO BLOQUEADO */}
              <div className="col-span-3 text-right pr-4">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 text-red-500 font-black italic">
                    <Lock size={20} />
                    <span className="text-xs uppercase tracking-widest">Saldo Bloqueado</span>
                  </div>
                  <p className="text-5xl font-black font-mono text-zinc-600 italic">R$ {u.saldoBloqueado.toFixed(2)}</p>
                  <button className="mt-2 text-[10px] font-black uppercase text-indigo-500 underline hover:text-white">Detalhar Retenção</button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}