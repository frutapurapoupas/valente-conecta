// app/acesso-expirado/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AcessoExpiradoPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Seu acesso expirou';

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Expirado</h1>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <div className="space-y-3">
          <Link href="/indicar-usuarios" className="block w-full bg-yellow-500 text-black py-3 rounded-xl font-bold">
            👥 Indicar {50} Amigos e Ganhar 30 Dias Grátis
          </Link>
          <Link href="/planos" className="block w-full bg-green-500 text-white py-3 rounded-xl font-bold">
            💎 Assinar Plano Premium
          </Link>
          <Link href="/indicar-estabelecimento" className="block w-full bg-purple-500 text-white py-3 rounded-xl font-bold">
            💰 Indicar Estabelecimentos e Ganhar Dinheiro
          </Link>
        </div>
      </div>
    </div>
  );
}