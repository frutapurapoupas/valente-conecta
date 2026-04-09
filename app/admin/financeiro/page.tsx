'use client'
import { useState } from 'react'

export default function Financeiro() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Container com 50% de escala e área compensada (w-[200%]) */}
      <div className="origin-top-left scale-50 w-[200%] p-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter">Financeiro <span className="text-yellow-400">Master</span></h1>
            <p className="text-zinc-500 text-xl font-bold uppercase tracking-[0.5em]">Gestão de Fluxo Valente Conecta</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 font-bold uppercase text-lg">Saldo em Conta</p>
            <h2 className="text-7xl font-black text-green-400">R$ 45.280,00</h2>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <p className="text-zinc-500 font-black uppercase mb-4 text-xl">Entradas (Mês)</p>
            <p className="text-5xl font-black text-white">R$ 12.450,00</p>
          </div>
          <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <p className="text-zinc-500 font-black uppercase mb-4 text-xl">Saídas (Mês)</p>
            <p className="text-5xl font-black text-white text-red-500">R$ 2.100,00</p>
          </div>
          <div className="bg-zinc-900 border-4 border-zinc-800 p-10 rounded-60">
            <p className="text-zinc-500 font-black uppercase mb-4 text-xl">Projeção Próximo Mês</p>
            <p className="text-5xl font-black text-yellow-400">R$ 18.000,00</p>
          </div>
        </div>

        <div className="bg-zinc-900 border-4 border-zinc-800 rounded-60 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800 text-zinc-400 uppercase font-black text-xl">
              <tr>
                <th className="p-8">Data</th>
                <th className="p-8">Descrição</th>
                <th className="p-8">Categoria</th>
                <th className="p-8">Valor</th>
              </tr>
            </thead>
            <tbody className="text-2xl font-bold">
              <tr className="border-b border-zinc-800">
                <td className="p-8 italic">08/04/2026</td>
                <td className="p-8">Assinatura Plano Premium - Fruta Pura</td>
                <td className="p-8 uppercase text-sm font-black text-zinc-500">Assinaturas</td>
                <td className="p-8 text-green-400">+ R$ 150,00</td>
              </tr>
              {/* Mais linhas aqui... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}