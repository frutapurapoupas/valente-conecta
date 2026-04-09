'use client'
import { TrendingUp, Map, Clock, AlertTriangle } from 'lucide-react';

export default function DashboardMaster() {
  return (
    <div className="min-h-screen bg-black text-white p-16">
      <h1 className="text-9xl font-black italic mb-20">COMMAND <span className="text-valente">CENTER</span></h1>
      
      <div className="grid grid-cols-2 gap-10">
        <div className="bg-zinc-900 p-16 rounded-60 border-4 border-zinc-800">
          <TrendingUp size={100} className="text-emerald-500 mb-6" />
          <h2 className="text-5xl font-black uppercase">Mais Vendidos / Bairro</h2>
          <p className="text-3xl text-zinc-500 mt-4 italic">Centro: Polpas Fruta Pura (Alta)</p>
        </div>
        
        <div className="bg-zinc-900 p-16 rounded-60 border-4 border-zinc-800">
          <AlertTriangle size={100} className="text-amber-500 mb-6" />
          <h2 className="text-5xl font-black uppercase">Ajuste de Preço</h2>
          <p className="text-3xl text-amber-500 mt-4 italic">Alta Demanda em Juazeiro: Sugerido +5%</p>
        </div>
      </div>
    </div>
  );
}