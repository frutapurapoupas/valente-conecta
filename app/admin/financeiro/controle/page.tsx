'use client'

import React from 'react'
import Link from 'next/link'
import { Percent, ShieldCheck, EyeOff, ChevronRight } from 'lucide-react'
import { useAdminControle } from '@/hooks/useAdminControle'

export default function ControleFaturasPlanos() {
  const { taxas, setTaxas, faturas } = useAdminControle()

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-2">
        <Percent className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-base font-black uppercase italic text-white leading-none">Controle de Faturas</h1>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Taxas e repasses</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-20">

        {/* TAXAS */}
        <section className="bg-zinc-900 border border-indigo-500/20 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> Taxas de Comissão</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(taxas).map(([nome, valor]) => (
              <div key={nome} className="bg-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Plano {nome}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setTaxas({...taxas, [nome]: Number(e.target.value)})}
                    className="bg-transparent text-xl font-black text-white w-full outline-none focus:text-indigo-400 transition-colors"
                  />
                  <span className="text-xs text-zinc-600 font-bold">%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FATURAS */}
        <section className="space-y-2">
          <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">{faturas.length} faturas</p>
          {faturas.map((f) => {
            const taxaAtual = taxas[f.plano as keyof typeof taxas] || 0
            const comissao = (f.valor * taxaAtual) / 100
            const liquido = f.valor - comissao
            return (
              <Link key={f.id} href={`/admin/financeiro/${f.id}`} className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.verificado ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    {f.verificado ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white">{f.loja}</p>
                    <p className="text-[10px] text-zinc-500">Plano {f.plano} · Comissão {taxaAtual}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-emerald-400">R$ {liquido.toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-600">líquido</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                </div>
              </Link>
            )
          })}
        </section>

      </main>
    </div>
  )
}