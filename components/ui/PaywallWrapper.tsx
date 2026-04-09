'use client'
import React, { useState } from 'react';

export default function Paywall({ children, userConsultas }: { children: React.ReactNode, userConsultas: number }) {
  const [unlocked, setUnlocked] = useState(userConsultas < 5);

  return (
    <div className="relative">
      <div className={unlocked ? "" : "blur-[40px] pointer-events-none select-none"}>
        {children}
      </div>
      {!unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 bg-black/40 rounded-60">
          <p className="text-6xl font-black uppercase italic mb-10 text-center">Desbloquear por R$ 1,00</p>
          <button className="bg-valente p-12 rounded-60 text-5xl font-black uppercase italic">PAGAR AGORA</button>
        </div>
      )}
    </div>
  );
}