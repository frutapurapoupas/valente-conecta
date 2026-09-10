'use client';

// Caminho: C:\valente_conecta\app\saude\fila\[unidadeId]\painel-tv\page.tsx
//
// Painel publico pra tela da sala de espera (ver proposta "Modo Valente
// Facil", item 5) -- sem login, feito pra ficar aberto numa Smart TV ou
// tablet fixo na recepcao. O "aviso sonoro" usa a Web Speech API do
// proprio navegador (fala em portugues) sempre que uma nova senha e'
// chamada -- nao depende de nenhum arquivo de audio.

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Volume2 } from 'lucide-react';

export default function PainelTvSaudePage() {
  const { unidadeId } = useParams<{ unidadeId: string }>();
  const [dados, setDados] = useState<any>(null);
  const ultimoAnunciado = useRef<number | null>(null);

  const anunciar = useCallback((numero: number, sala: string | null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const texto = `Senha ${numero}. ${sala ? `Dirija-se ao ${sala}.` : 'Dirija-se à recepção.'}`;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    window.speechSynthesis.speak(fala);
  }, []);

  const carregar = useCallback(async () => {
    const resp = await fetch(`/api/saude-fila/${unidadeId}/painel-publico`);
    const d = await resp.json();
    if (!d.success) return;
    setDados(d.data);
    const numeroChamando = d.data.chamando?.numero;
    if (numeroChamando && numeroChamando !== ultimoAnunciado.current) {
      ultimoAnunciado.current = numeroChamando;
      anunciar(numeroChamando, d.data.chamando.sala);
    }
  }, [unidadeId, anunciar]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 6000);
    return () => clearInterval(t);
  }, [carregar]);

  if (!dados) return <div className="min-h-screen bg-slate-950" />;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-8 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold text-white/80">{dados.unidadeNome}</h1>
          <div className="flex items-center gap-2 text-amber-400"><Volume2 size={24} /><span className="text-sm">Aviso sonoro ativo</span></div>
        </div>

        <div className="bg-white/5 rounded-3xl py-16 text-center mb-8">
          <p className="text-amber-400 uppercase tracking-[0.2em] font-bold text-lg mb-4">Chamando agora</p>
          {dados.chamando ? (
            <>
              <p className="text-8xl font-black tabular-nums">{String(dados.chamando.numero).padStart(3, '0')}</p>
              {dados.chamando.sala && <p className="text-2xl text-white/60 mt-4">{dados.chamando.sala}</p>}
            </>
          ) : (
            <p className="text-4xl text-white/30">—</p>
          )}
        </div>

        <p className="text-white/40 uppercase tracking-widest text-sm mb-4">Em seguida</p>
        <div className="flex gap-3 flex-wrap">
          {dados.proximos.length === 0 && <p className="text-white/30">Fila vazia</p>}
          {dados.proximos.map((p: any, i: number) => (
            <div key={i} className={`px-6 py-3 rounded-full text-xl font-bold tabular-nums ${p.prioridade_tier <= 2 ? 'bg-red-500' : 'bg-white/10'}`}>
              {String(p.numero).padStart(3, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
