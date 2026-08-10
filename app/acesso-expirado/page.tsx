// Caminho: app/convite-expirado/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { Clock, Users, Crown, ArrowRight, Gift } from 'lucide-react';
import Link from 'next/link';

export default function ConviteExpiradoPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-yellow-500/20">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-yellow-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Desbloqueie 30 dias!</h1>
          <p className="text-gray-400 mb-6">
            Convide 50 amigos e ganhe acesso total premium por 30 dias gratuitamente.
          </p>
          
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-white text-3xl font-bold">0 / 50</p>
            <p className="text-gray-400 text-sm">usuários indicados</p>
          </div>

          <Link href="/convite" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition block">
            Gerar Meu Código de Convite
          </Link>
        </div>
      </div>
    </div>
  );
}

