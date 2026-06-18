// Arquivo: components/home/SecaoEstatisticas.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - SEÇÃO DE ESTATÍSTICAS
// ============================================

import { homeConstants } from '@/constants/homeConstants';

export default function SecaoEstatisticas() {
  const { cores, estatisticas } = homeConstants;

  return (
    <div className={`bg-gradient-to-r ${cores.estatisticasBg} rounded-2xl p-6 text-white`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {estatisticas.map((stat, index) => (
          <div key={index}>
            <div className="text-2xl font-bold">{stat.valor}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}