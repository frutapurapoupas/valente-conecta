'use client'
import React, { useState } from 'react';
import { Link2, Search, PlusCircle } from 'lucide-react';

interface Props {
  codigoDesconhecido: string;
  onVinculoConcluido: () => void;
}

export default function ModalVinculoManual({ codigoDesconhecido, onVinculoConcluido }: Props) {
  const [busca, setBusca] = useState('');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-10 font-mono">
      <div className="bg-zinc-900 border-8 border-valente rounded-60 w-full max-w-5xl p-16">
        <header className="mb-10 text-center">
          <div className="bg-valente inline-block p-4 rounded-full mb-6 text-black">
            <Link2 size={60} />
          </div>
          <h2 className="text-6xl font-black uppercase italic">Item não Identificado</h2>
          <p className="text-3xl text-zinc-500 font-bold mt-2">CÓDIGO LIDO: <span className="text-white">{codigoDesconhecido}</span></p>
        </header>

        <div className="space-y-8">
          {/* BUSCA NO BANCO MASTER */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="PESQUISAR NO CATÁLOGO MASTER..." 
              className="w-full bg-black p-12 rounded-60 border-4 border-zinc-700 text-4xl font-black uppercase italic outline-none focus:border-emerald-500"
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search size={50} className="absolute right-8 top-10 text-zinc-500" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* OPÇÃO 1: VINCULAR A UM EXISTENTE */}
            <button 
              onClick={() => console.log('Lógica de vincular na equivalencia_produtos')}
              className="bg-zinc-800 p-12 rounded-60 border-4 border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center group"
            >
              <Link2 size={80} className="text-zinc-600 group-hover:text-emerald-500 mb-4" />
              <span className="text-3xl font-black uppercase italic">Vincular ao Catálogo</span>
            </button>

            {/* OPÇÃO 2: CADASTRAR NOVO (EAN-V) */}
            <button 
              className="bg-zinc-800 p-12 rounded-60 border-4 border-zinc-700 hover:border-valente flex flex-col items-center justify-center group"
            >
              <PlusCircle size={80} className="text-zinc-600 group-hover:text-valente mb-4" />
              <span className="text-3xl font-black uppercase italic">Criar Novo Item</span>
            </button>
          </div>
        </div>

        <button 
          onClick={onVinculoConcluido}
          className="mt-12 w-full text-zinc-600 text-2xl font-black uppercase underline"
        >
          Cancelar Escaneamento
        </button>
      </div>
    </div>
  );
}