'use client'
import { Radio } from 'lucide-react';

export default function RadarInstalacao() {
  return (
    <div className="p-16 bg-zinc-900 rounded-60 border-8 border-zinc-800 text-center">
      <Radio size={120} className="mx-auto text-valente animate-ping mb-10" />
      <h2 className="text-6xl font-black uppercase italic mb-6">Buscando PDVs na Rede</h2>
      <div className="space-y-4">
        <button className="w-full bg-zinc-800 p-10 rounded-60 text-4xl font-black uppercase hover:bg-valente">Instalar Modo Espião</button>
        <button className="w-full bg-zinc-800 p-10 rounded-60 text-4xl font-black uppercase hover:bg-emerald-600">Instalar PDV Padrão</button>
      </div>
    </div>
  );
}