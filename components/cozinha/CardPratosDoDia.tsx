// Arquivo: components/home/CardPratosDoDia.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - CARD PRATOS DO DIA
// ============================================

import Link from 'next/link';
import { Utensils } from 'lucide-react';
import { homeConstants } from '@/constants/homeConstants';

export default function CardPratosDoDia() {
  const { cores, titulos, pratos } = homeConstants;

  return (
    <div className={`bg-gradient-to-r ${cores.cardPratos} rounded-2xl p-4 mb-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          <h2 className="font-bold text-lg">{titulos.pratosDoDia}</h2>
        </div>
        <Link href="/cozinha" className="text-sm underline">
          Ver cardápio completo
        </Link>
      </div>

      <div className="overflow-x-auto mt-3 pb-2">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {pratos.map((prato) => (
            <Link href={prato.link} key={prato.id}>
              <div className="bg-white/10 rounded-xl p-3 min-w-[160px] backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                    {prato.emoji}
                  </div>
                  {prato.badge && (
                    <span className="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                      {prato.badge}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm">{prato.titulo}</p>
                <p className="text-xs opacity-90 line-clamp-2">{prato.descricao}</p>
                <div className="mt-2">
                  {prato.preco > 0 ? (
                    <>
                      <span className="text-lg font-bold">R$ {prato.preco.toFixed(2)}</span>
                      <span className="text-xs line-through opacity-70 ml-2">R$ {prato.original.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold">🎁 Grátis!</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}