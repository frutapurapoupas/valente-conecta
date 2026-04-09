'use client'

import React from 'react'
import { CheckCircle2, Users, EyeOff, Camera, Phone, Tag, ShieldCheck } from 'lucide-react'

const TODAS_OFERTAS = [
  // TIPO 1: AUTOMÁTICA / VERIFICADA (Vem do catálogo da loja)
  { 
    id: 1, 
    origem: "LOJA VERIFICADA", 
    loja: "Valente Cereais", 
    produto: "Carne na Tica 1kg", 
    preco: "6,49", 
    verificado: true 
  },
  // TIPO 2: PÚBLICO GERAL (Usuário comum / Contato Borrado)
  { 
    id: 2, 
    origem: "ANÚNCIO PÚBLICO", 
    loja: "Vendedor Particular", 
    produto: "Botijão de Gás (Usado)", 
    preco: "85,00", 
    verificado: false,
    contato: "(75) 9****-**44" 
  }
]

export default function GestaoOfertas() {
  return (
    <div className="min-h-screen bg-black text-white p-12">
      
      <header className="mb-16 border-b-4 border-zinc-900 pb-10">
        <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white mb-4">
          Moderação de Ofertas
        </h1>
        <p className="text-2xl text-zinc-500 font-bold uppercase tracking-[0.2em]">
          Diferenciação: <span className="text-emerald-500">Catálogo Oficial</span> vs <span className="text-amber-500">Público Geral</span>
        </p>
      </header>

      <div className="space-y-12">
        {TODAS_OFERTAS.map((oferta) => (
          <div key={oferta.id} className={`relative overflow-hidden bg-zinc-900 border-4 rounded-[50px] p-12 flex items-center justify-between transition-all ${oferta.verificado ? 'border-emerald-500/30' : 'border-amber-500/20'}`}>
            
            {/* TAG DE IDENTIFICAÇÃO NO TOPO DO CARD */}
            <div className={`absolute top-0 right-0 px-10 py-3 font-black uppercase italic text-sm tracking-widest ${oferta.verificado ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
              {oferta.origem}
            </div>

            <div className="flex items-center gap-10 flex-1">
              {/* ÁREA DA FOTO */}
              <div className="w-56 h-56 bg-black border-2 border-zinc-800 rounded-[35px] flex items-center justify-center relative overflow-hidden">
                {oferta.verificado ? (
                  <ShieldCheck size={60} className="text-emerald-500 opacity-20 absolute" />
                ) : (
                  <Users size={60} className="text-amber-500 opacity-20 absolute" />
                )}
                <Camera size={48} className="text-zinc-700" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                    {oferta.produto}
                  </h2>
                  {oferta.verificado && <CheckCircle2 className="text-emerald-500" size={32} />}
                </div>
                <p className="text-2xl text-zinc-500 font-black uppercase tracking-widest">
                  Postado por: <span className="text-white">{oferta.loja}</span>
                </p>

                {/* LOGICA DO CONTATO BORRADO */}
                {!oferta.verificado && (
                  <div className="flex items-center gap-4 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 w-fit">
                    <EyeOff className="text-amber-500" size={24} />
                    <p className="text-xl font-mono font-black text-amber-500 tracking-widest">
                      CONTATO: {oferta.contato}
                    </p>
                    <span className="text-[10px] text-amber-700 uppercase font-black font-sans ml-4 underline cursor-help">
                      Desbloquear via Moeda Conecta
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PREÇO E AÇÕES */}
            <div className="text-right space-y-6">
              <p className={`text-7xl font-black font-mono tracking-tighter ${oferta.verificado ? 'text-emerald-500' : 'text-white'}`}>
                R$ {oferta.preco}
              </p>
              <button className={`w-full py-6 rounded-2xl font-black uppercase italic text-xl transition-all ${oferta.verificado ? 'bg-zinc-800 text-white hover:bg-emerald-600' : 'bg-amber-600 text-black hover:bg-white'}`}>
                {oferta.verificado ? 'Sincronizar Catálogo' : 'Aprovar Anúncio'}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}