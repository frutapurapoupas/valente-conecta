'use client';

// Caminho: C:\valente_conecta\components\ui\DicaValentinha.tsx
//
// Dica da Valentinha nos pontos de maior duvida (ver proposta "Modo
// Valente Facil", kit visual): pra quem le devagar, um vídeo curto dela
// falando alcanca mais que um texto. Os vídeos ainda nao existem (producao
// via Gravyx, fora do que da pra fazer em código) -- por isso o
// componente aceita videoUrl opcional: sem ele, cai num balaozinho de
// texto normal, sem quebrar a tela nem fingir que ha' vídeo.

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface DicaValentinhaProps {
  texto: string;
  videoUrl?: string;
  duracaoSegundos?: number;
}

export function DicaValentinha({ texto, videoUrl, duracaoSegundos }: DicaValentinhaProps) {
  const [tocando, setTocando] = useState(false);

  if (!videoUrl) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-base shrink-0">🌻</div>
        <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600 leading-snug">{texto}</div>
      </div>
    );
  }

  if (tocando) {
    return (
      <video src={videoUrl} controls autoPlay className="w-full rounded-xl bg-black" onEnded={() => setTocando(false)} />
    );
  }

  return (
    <button onClick={() => setTocando(true)} className="w-full flex items-center gap-2.5 text-left">
      <div className="relative w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
        🌻
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl text-white">
          <PlayCircle className="w-5 h-5" />
        </span>
      </div>
      <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600 leading-snug">
        Vídeo da Valentinha{duracaoSegundos ? ` · 0:${String(duracaoSegundos).padStart(2, '0')}` : ''} — {texto}
      </div>
    </button>
  );
}
