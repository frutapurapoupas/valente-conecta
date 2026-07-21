// components/home/CardIndicacao.tsx
// ?? UI - Card de Indicação com rotação de abas

"use client";

import { useState, useEffect } from 'react';

interface CardIndicacaoProps {
  titulo?: string;
  descricao?: string;
  cor?: string;
  onClique?: () => void;
  abas?: Array<{ texto: string; cor: string }>;
  children?: React.ReactNode;
}

export default function CardIndicacao({ 
  titulo, 
  descricao, 
  cor = 'bg-gradient-to-r from-emerald-500 to-green-600',
  onClique,
  abas = [],
  children 
}: CardIndicacaoProps) {
  const [abaAtual, setAbaAtual] = useState(0);

  // Rotação automática de abas
  useEffect(() => {
    if (!abas || abas.length <= 1) return;

    const interval = setInterval(() => {
      setAbaAtual((prev) => (prev + 1) % abas.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [abas]);

  // Se não houver abas, renderiza versão simples
  if (!abas || abas.length === 0) {
    return (
      <div 
        className={`${cor} rounded-2xl p-4 mb-4 text-white shadow-lg cursor-pointer hover:opacity-90 transition`}
        onClick={onClique}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{titulo || '?? Indique e Ganhe'}</h2>
            <p className="text-sm opacity-90">{descricao || 'Indique amigos e ganhe benefícios!'}</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
            Indicar
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Versão com abas
  const aba = abas[abaAtual] || abas[0];

  return (
    <div 
      className={`${cor} rounded-2xl p-4 mb-4 text-white shadow-lg cursor-pointer hover:opacity-90 transition`}
      onClick={onClique}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">{titulo || '?? Indique e Ganhe'}</h2>
          <p className="text-sm opacity-90">{descricao || 'Indique amigos e ganhe benefícios!'}</p>
        </div>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
          Indicar
        </button>
      </div>
      {aba && (
        <div className="mt-3 h-12 flex items-center">
          <p className={`text-sm font-medium ${aba.cor || 'bg-white/20'} px-3 py-1 rounded-full inline-block transition-all duration-500`}>
            {aba.texto || '?? Indique agora!'}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}

