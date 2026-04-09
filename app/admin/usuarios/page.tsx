'use client'

import React, { useState } from 'react'
import { Users, Smartphone, Wallet, Eye, MapPin, Search, UserPlus, ShieldCheck } from 'lucide-react'

export default function GestaoUsuariosMaster() {
  // DADOS QUE O SISTEMA JÁ "SABE" SOBRE VALENTE
  const [usuarios] = useState([
    { 
      id: 1, nome: "João Silva", local: "Centro, Valente", 
      aparelho: "iPhone 15", saldoMoedas: 150, 
      desbloqueios: 12, status: "Online", ultimaAtividade: "Agora" 
    },
    { 
      id: 2, nome: "Maria Oliveira", local: "Bairro Manteiga, Valente", 
      aparelho: "Samsung S23", saldoMoedas: 25, 
      desbloqueios: 45, status: "Ausente", ultimaAtividade: "15min atrás" 
    },
    { 
      id: 3, nome: "Carlos Souza", local: "Zona Rural, Valente", 
      aparelho: "Xiaomi Note 12", saldoMoedas: 0, 
      desbloqueios: 2, status: "Offline", ultimaAtividade: "2 dias atrás" 
    }
  ])

  return (
    <div className="p-12 bg-black min-h-screen text-white font-sans">
      
      {/* HEADER MASTER USUÁRIOS */}
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-indigo-500 mb-4">
            <Users size={72} strokeWidth={2.5} />
            <h1 className="text-8xl font-black uppercase italic tracking-tighter italic text-white leading-none">Usuários</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Gestão de Acessos e Carteira de Créditos</p>
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500" size={30} />
            <input 
              type="text" 
              placeholder="BUSCAR POR NOME OU BAIRRO..." 
              className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl py-6 pl-20 pr-10 text-xl font-black uppercase outline-none focus:border-indigo-500 transition-all w-[400px]"
            />
          </div>
          <button className="bg-white text-black font-black px-10 py-6 rounded-3xl text-xl hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-4">
            <UserPlus size={30} /> CADASTRAR
          </button>
        </div>
      </header>

      {/* MÉTRICAS RÁPIDAS (RESUMO DA BASE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-zinc-900/50 p-8 rounded-[40px] border-2 border-zinc-800">
          <p className="text-zinc-500 font-black uppercase text-sm tracking-widest mb-2">Total na Base</p>
          <p className="text-6xl font-black italic">1.240 <span className="text-indigo-500 text-2xl">Ativos</span></p>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[40px] border-2 border-zinc-800">
          <p className="text-zinc-500 font-black uppercase text-sm tracking-widest mb-2">Moedas em Circulação</p>
          <p className="text-6xl font-black italic text-emerald-500">8.450 <span className="text-white text-2xl">₵</span></p>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[40px] border-2 border-zinc-800">
          <p className="text-zinc-500 font-black uppercase text-sm tracking-widest mb-2">Contatos Desbloqueados</p>
          <p className="text-6xl font-black italic text-amber-500">312 <span className="text-white text-2xl text-right font-sans">Hoje</span></p>
        </div>
      </div>

      {/* LISTAGEM GG DE USUÁRIOS */}
      <div className="bg-zinc-950 rounded-[60px] border-4 border-zinc-900 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-zinc-500 font-black uppercase text-xl tracking-widest">
            <tr>
              <th className="p-10">Perfil / Localização</th>
              <th className="p-10">Tecnologia</th>
              <th className="p-10 text-center">Carteira (Moedas)</th>
              <th className="p-10 text-center">Uso do App</th>
              <th className="p-10 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-900">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-900/60 transition-all group">
                {/* IDENTIFICAÇÃO DO USUÁRIO */}
                <td className="p-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-black text-3xl font-black">
                      {user.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-4xl font-black uppercase italic leading-none group-hover:text-indigo-400 transition-colors">{user.nome}</p>
                      <p className="text-zinc-500 font-bold uppercase mt-2 flex items-center gap-2 tracking-tighter">
                        <MapPin size={18} /> {user.local}
                      </p>
                    </div>
                  </div>
                </td>

                {/* DISPOSITIVO USADO */}
                <td className="p-10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Smartphone size={24} />
                      <span className="text-2xl font-black uppercase tracking-tighter">{user.aparelho}</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase">Valente Conecta App v2.4</span>
                  </div>
                </td>

                {/* CARTEIRA / MOEDAS (MONETIZAÇÃO) */}
                <td className="p-10 text-center">
                  <div className="bg-black inline-flex flex-col items-center p-6 rounded-[30px] border border-zinc-800 min-w-[150px]">
                    <div className="flex items-center gap-3 text-emerald-500 mb-1">
                      <Wallet size={32} />
                      <p className="text-5xl font-black font-mono tracking-tighter">{user.saldoMoedas}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-zinc-500">Saldo Atual</span>
                  </div>
                </td>

                {/* HISTÓRICO DE DESBLOQUEIOS (CONSUMO) */}
                <td className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-amber-500">
                      <Eye size={32} />
                      <p className="text-5xl font-black font-mono">{user.desbloqueios}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-zinc-600 italic">Contatos Borrados Vistos</span>
                  </div>
                </td>

                {/* STATUS DE ATIVIDADE */}
                <td className="p-10 text-right">
                   <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-3 px-6 py-2 rounded-full font-black uppercase text-xs ${
                        user.status === 'Online' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${user.status === 'Online' ? 'bg-black animate-pulse' : 'bg-zinc-600'}`} />
                        {user.status}
                      </div>
                      <span className="text-sm font-bold text-zinc-600 uppercase italic italic">{user.ultimaAtividade}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}