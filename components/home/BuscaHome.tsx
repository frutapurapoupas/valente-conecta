// Arquivo: components/home/BuscaHome.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - BUSCA DA HOME
// ============================================

import BuscaInteligente from '@/components/busca/BuscaInteligente';

interface BuscaHomeProps {
  onSearchResult: (produto: any) => void;
}

export default function BuscaHome({ onSearchResult }: BuscaHomeProps) {
  return (
    <div className="bg-white shadow-md py-4 sticky top-[57px] z-40">
      <div className="container mx-auto px-4">
        <BuscaInteligente 
          onResultadoClick={onSearchResult}
          placeholder="🔍 Buscar produtos, serviços, profissionais..."
        />
      </div>
    </div>
  );
}

