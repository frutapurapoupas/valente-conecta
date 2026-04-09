'use client'

import React, { useState } from 'react'
import { Gift, Link as LinkIcon, CheckCircle2, Timer, Wallet, ArrowDownCircle } from 'lucide-react'

export default function RelatorioBonusUsuarios() {
  // DADOS TÉCNICOS DO MÊS DE EXERCÍCIO (ABRIL 2026)
  const [metricasGerais] = useState({
    usuariosValidados: 840,
    linksPendentes: 125,
    totalProvisãoResgate: 4250.00
  })

  const [relatorioBonus] = useState([
    { 
      id: 1, usuario: "João Silva", 
      bonusIndicacao: 50.00, outrosBonus: 15.00, 
      linksEnviados: 12, linksValidados: 10,
      statusResgate: "Disponível" 
    },
    { 
      id: 2, usuario: "Maria Oliveira", 
      bonusIndicacao: 120.00, outrosBonus: 40.00, 
      linksEnviados: 35, linksValidados: 24,
      statusResgate: "Processando" 
    },
    { 
      id: 3, usuario: "Carlos Souza", 
      bonusIndicacao: 10.00, outrosBonus: 0.00, 
      linksEnviados: 5, linksValidados: 2,
      statusResgate: "Abaixo do Mínimo" 
    }
  ])

  return (
    <div className="p-12 bg-black min-h-screen text-white">
      
      {/* HEADER ESTATÉGICO DE CRESCIMENTO */}
      <header className="mb-16 border-b-4 border-zinc-900 pb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-6 text-emerald-500 mb-4">
            <Gift size={72} strokeWidth={2.5} />
            <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white leading-none">Bônus & Resgates</h1>
          </div>
          <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Exercício: <span className="text-white">Abril / 2026</span></p>
        </div>

        <div className="text-right">
          <p className="text-zinc-500 font-black uppercase text-xl mb-2">Total de Provisão Master</p>
          <p className="text-7xl font-black text-emerald-500 font-mono tracking-tighter">
            R$ {metricasGerais.totalProvisãoResgate.toFixed(2)}
          </p>
        </div>
      </header>

      {/* CARDS DE VALIDAÇÃO DE CRESCIMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-zinc-900/50 p-10 rounded-[45px] border-2 border-emerald-500/20 flex justify-between items-center">
          <div>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-2">Usuários Validados (Indicação)</p>
            <p className="text-7xl font-black italic">{metricasGerais.usuariosValidados}</p>
          </div>
          <CheckCircle2 size={80} className="text-emerald-500 opacity-20" />
        </div>

        <div className="bg-zinc-900/50 p-10 rounded-[45px] border-2 border-amber-500/20 flex justify-between items-center">
          <div>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-sm mb-2">Links em Espera (Não Validados)</p>
            <p className="text-7xl font-black italic text-amber-500">{metricasGerais.linksPendentes}</p>
          </div>
          <Timer size={80} className="text-amber-500 opacity-20 animate-pulse" />
        </div>
      </div>

      {/* RELATÓRIO INDIVIDUALIZADO */}
      <div className="bg-zinc-950 rounded-[60px] border-4 border-zinc-900 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-zinc-500 font-black uppercase text-xl tracking-widest">
            <tr>
              <th className="p-10">Usuário Afiliado</th>
              <th className="p-10 text-center">Performance de Links</th>
              <th className="p-10 text-center">Bônus (Indicação + Outros)</th>
              <th className="p-10 text-right">Sub-total Resgate</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-900">
            {relatorioBonus.map((rel) => {
              const subTotal = rel.bonusIndicacao + rel.outrosBonus;
              return (
                <tr key={rel.id} className="hover:bg-zinc-900/60 transition-all group">
                  <td className="p-10">
                    <p className="text-4xl font-black uppercase italic group-hover:text-emerald-400 transition-colors">{rel.usuario}</p>
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">ID: 00{rel.id}VALENTE</span>
                  </td>

                  <td className="p-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-4">
                         <div className="text-center">
                           <p className="text-3xl font-black text-white">{rel.linksValidados}</p>
                           <p className="text-[10px] text-emerald-500 font-black uppercase">Validados</p>
                         </div>
                         <div className="h-10 w-[2px] bg-zinc-800"></div>
                         <div className="text-center text-zinc-600">
                           <p className="text-3xl font-black">{rel.linksEnviados - rel.linksValidados}</p>
                           <p className="text-[10px] font-black uppercase text-amber-700">Pendentes</p>
                         </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-10 text-center">
                    <div className="flex justify-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-black text-zinc-400 font-mono">R$ {rel.bonusIndicacao.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-600 font-black uppercase">Indicação</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-black text-zinc-400 font-mono">R$ {rel.outrosBonus.toFixed(2)}</p>
                        <p className="text-[10px] text-zinc-600 font-black uppercase">Outros</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-10 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4 text-emerald-500">
                        <Wallet size={32} />
                        <p className="text-6xl font-black font-mono tracking-tighter">R$ {subTotal.toFixed(2)}</p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                        rel.statusResgate === 'Disponível' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {rel.statusResgate}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          {/* RODAPÉ COM TOTAL GERAL DO EXERCÍCIO */}
          <tfoot className="bg-emerald-500 text-black">
            <tr>
              <td colSpan={3} className="p-10 text-4xl font-black uppercase italic">Total Consolidado para Pagamento</td>
              <td className="p-10 text-right">
                <p className="text-7xl font-black font-mono tracking-tighter">
                  R$ {relatorioBonus.reduce((acc, curr) => acc + curr.bonusIndicacao + curr.outrosBonus, 0).toFixed(2)}
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}