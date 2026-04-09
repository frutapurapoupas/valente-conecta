'use client'
import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

export default function BuscaGeografica() {
  const [query, setQuery] = useState('');
  return (
    <div className="min-h-screen bg-black text-white p-16 font-mono">
      <h1 className="text-8xl font-black italic uppercase mb-10">Buscar em <span className="text-valente">Valente</span></h1>
      <div className="relative mb-20">
        <input 
          type="text" 
          placeholder="O QUE VOCÊ PROCURA?" 
          className="w-full bg-zinc-900 p-16 rounded-60 border-8 border-zinc-800 text-5xl font-black uppercase italic outline-none focus:border-valente"
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search size={80} className="absolute right-10 top-12 text-zinc-700" />
      </div>
      <div className="grid gap-10">
        <p className="text-3xl text-zinc-500 font-bold uppercase italic">Resultados próximos a você...</p>
        {/* Lista de lojas retornada pela API geo-search apareceria aqui */}
      </div>
    </div>
  );
}