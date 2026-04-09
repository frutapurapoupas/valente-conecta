'use client'
import { Smartphone, ShoppingCart, Zap } from 'lucide-react';

export default function PDVInterface() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-16 font-mono">
      <div className="flex justify-between items-end mb-20 border-b-8 border-zinc-800 pb-10">
        <h1 className="text-9xl font-black italic uppercase leading-none">CAIXA <span className="text-emerald-500">01</span></h1>
        <div className="text-right">
          <p className="text-4xl font-bold text-zinc-500 uppercase">Status: Online</p>
          <p className="text-6xl font-black text-emerald-500 italic">VALENTE CONECTA</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8">
          <button className="w-full bg-zinc-900 border-8 border-zinc-800 p-20 rounded-60 flex flex-col items-center justify-center hover:border-emerald-500 transition-all group">
            <Smartphone size={150} className="text-zinc-700 group-hover:text-emerald-500 mb-6" />
            <span className="text-7xl font-black uppercase italic text-zinc-500 group-hover:text-white">BIPAR AGORA</span>
          </button>
        </div>
        <div className="col-span-4 space-y-10">
          <div className="bg-zinc-900 p-12 rounded-60 border-4 border-zinc-800">
            <h2 className="text-4xl font-black uppercase text-zinc-500 mb-4">Total Venda</h2>
            <p className="text-8xl font-black italic">R$ 0,00</p>
          </div>
          <button className="w-full bg-emerald-600 p-12 rounded-60 text-5xl font-black uppercase italic hover:bg-white hover:text-black transition-all">
            FECHAR PIX
          </button>
        </div>
      </div>
    </div>
  );
}