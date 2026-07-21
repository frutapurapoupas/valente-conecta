'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { homeConstants } from '@/constants/homeConstants';
import NotificacaoSininho from '@/components/NotificacaoSininho';

interface HeaderHomeProps {
  isAdmin: boolean;
}

export default function HeaderHome({ isAdmin }: HeaderHomeProps) {
  return (
    <header className={`bg-gradient-to-r ${homeConstants.cores.header} text-white sticky top-0 z-50 shadow-lg`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">??</span>
            <span className="font-bold text-lg hidden sm:block">Valente Conecta</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">?? Valente, BA</div>
            <NotificacaoSininho />
            {isAdmin && (
              <Link href="/admin" className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                <Shield className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

