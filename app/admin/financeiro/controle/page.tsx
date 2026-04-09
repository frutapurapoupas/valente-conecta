'use client'

import React, { useState } from 'react'
import { Percent, ShieldCheck, EyeOff, Wallet } from 'lucide-react'

export default function ControleFaturasPlanos() {
  // 1. ESTADO DOS PLANOS (O QUE VOCÊ EDITA)
  const [taxas, setTaxas] = useState({ Gold: 10, Black: 8, Silver: 15 })

  // 2. DADOS DAS FATURAS
  const faturas = [
    { id: 1, loja: "Valente Cereais", valor: 1250, plano: "Gold", verificado: true },
    { id: 2, loja: "Mercadinho Bom Preço", valor: 450, plano: "Silver", verificado: true },
    { id: 3, loja: "Vendedor Particular", valor: 85, plano: "Público", verificado: false }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-12">
      {/* SEÇÃO DE EDIÇÃO DE PLANOS */}
      <section className="mb-16 bg-zinc-900 p-10 rounded-[40px] border-2 border-indigo-500/30">
        <h2 className="text-4xl font-black uppercase italic mb-8 text-indigo-400 flex items-center gap-4">
          <Percent size={40} /> Taxas de Comissão
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(taxas).map(([nome, valor]) => (
            <div key={nome} className="bg-black p-8 rounded-3xl border border-zinc-800">
              <p className="text-zinc-500 font-black uppercase mb-4 tracking-widest">Plano {nome}</p>
              <input 
                type="number" 
                value={valor} 
                onChange={(e) => setTaxas({...taxas, [nome]: Number(e.target.value)})}
                className="bg-transparent text-6xl font-black text-white w-full outline-none focus:text-indigo-500 font-mono"
              />
            </div>
          ))}
        </div>
      </section>

      {/* LISTAGEM COM CÁLCULO DINÂMICO */}
      <div className="space-y-8">
        {faturas.map((f) => {
          // A mágica: busca a taxa atual no estado e calcula o líquido
          const taxaAtual = taxas[f.plano as keyof typeof taxas] || 0
          const comissao = (f.valor * taxaAtual) / 100
          const liquido = f.valor - comissao

          return (
            <div key={f.id} className="bg-zinc-900 p-10 rounded-[45px] border-2 border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <div className={`p-6 rounded-3xl ${f.verificado ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {f.verificado ? <ShieldCheck size={50} /> : <EyeOff size={50} />}
                  </div>
                  <div>
                    <h3 className="text-5xl font-black uppercase italic">{f.loja}</h3>
                    <p className="text-zinc-500 font-black uppercase tracking-widest mt-2">
                      Plano: {f.plano} {!f.verificado && "• CONTATO BORRADO: (75) 9****-**44"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl text-red-500 font-black uppercase mb-2">Comissão App ({taxaAtual}%): - R$ {comissao.toFixed(2)}</p>
                  <p className="text-7xl font-black text-emerald-500 font-mono tracking-tighter">R$ {liquido.toFixed(2)}</p>
                  <p className="text-zinc-500 font-bold uppercase text-xs mt-2">Valor Líquido p/ Lojista</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}