'use client'

import React from 'react'
import { Award, Zap, ShieldCheck, Save, Percent, Loader2 } from 'lucide-react'
import { useAdminPlanos } from '@/hooks/useAdminPlanos'

export default function GestaoPlanos() {
  const { planos, atualizarTaxa, salvarTaxa, salvando } = useAdminPlanos()

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3 mb-6">
        <Award className="w-5 h-5 text-yellow-400" />
        <div>
          <h1 className="text-base font-black uppercase italic text-white leading-none">Gestão de Planos</h1>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Configure as comissões da plataforma</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-20">

      {/* GRADE DE PLANOS EDITÁVEIS */}
      <div className="space-y-3">
        {planos.map((plano) => (
          <div key={plano.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Zap className={`w-5 h-5 ${plano.cor}`} />
            </div>
            <div className="flex-1">
              <p className={`font-black text-sm ${plano.cor}`}>{plano.nome}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase">Ativo para lojistas</p>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <input
                type="number"
                value={plano.taxa}
                onChange={(e) => atualizarTaxa(plano.id, e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xl font-black text-white w-20 outline-none focus:border-indigo-500 transition-colors text-center"
              />
              <span className="text-xs text-zinc-600 font-bold">%</span>
            </div>
            <button onClick={() => salvarTaxa(plano.id)} disabled={salvando === plano.id} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all">
              {salvando === plano.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-500">
          Alterações refletem imediatamente em todos os novos contratos da plataforma <span className="text-white font-bold">Valente Conecta</span>.
        </p>
      </div>

      </div>
    </div>
  )
}