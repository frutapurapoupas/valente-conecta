'use client';

// ============================================
// COMPONENTE - CARD INDICAÇÃO PREMIADA
// ============================================

import { useRouter } from 'next/navigation';
import { Handshake } from 'lucide-react';
import { homeConstants } from '@/constants/homeConstants';

interface CardIndicacaoProps {
  abaAtual: number;
}

export default function CardIndicacao({ abaAtual }: CardIndicacaoProps) {
  const router = useRouter();

  const handleIndicarClick = () => {
    router.push('/indicacoes');
  };

  const { cores, titulos, abasIndique } = homeConstants;
  const aba = abasIndique[abaAtual];

  return (
    <div 
      className={`bg-gradient-to-r ${cores.cardIndicacao} rounded-2xl p-4 mb-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow`} 
      onClick={handleIndicarClick}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Handshake className="w-6 h-6" />
          <h2 className="font-bold text-lg">{titulos.indicacaoPremiada}</h2>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleIndicarClick();
          }}
          className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors"
        >
          Indicar Agora
        </button>
      </div>
      <div className="mt-3 h-12 flex items-center">
        <p className={`text-sm font-medium ${aba.cor} bg-white/20 px-3 py-1 rounded-full inline-block transition-all duration-500`}>
          {aba.texto}
        </p>
      </div>
    </div>
  );
}