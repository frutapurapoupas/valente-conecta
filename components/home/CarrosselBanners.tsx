// Arquivo: components/home/CarrosselBanners.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - CARROSSEL DE BANNERS
// ============================================

import Link from 'next/link';
import { homeConstants } from '@/constants/homeConstants';

interface CarrosselBannersProps {
  bannerAtual: number;
}

export default function CarrosselBanners({ bannerAtual }: CarrosselBannersProps) {
  const { banners } = homeConstants;

  return (
    <div className="mb-8">
      <div className="relative rounded-2xl overflow-hidden h-32 md:h-40">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === bannerAtual ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Link href={banner.link} className={`bg-gradient-to-r ${banner.cor} w-full h-full flex items-center justify-center p-6`}>
              <div className="text-center text-white">
                <h3 className="text-xl md:text-2xl font-bold">{banner.titulo}</h3>
                <p className="text-sm md:text-base opacity-90">{banner.descricao}</p>
                <span className="inline-block mt-2 text-sm underline">Saiba mais</span>
              </div>
            </Link>
          </div>
        ))}
        
        {/* Indicadores de navegação */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === bannerAtual ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

