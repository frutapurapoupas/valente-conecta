'use client';

import { useState, useEffect } from 'react';
import { Construction, ArrowLeft, Crown } from 'lucide-react';

export default function EmConstrucao() {
  const [contador, setContador] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/cozinha';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-full p-8 inline-flex mb-6 shadow-xl">
          <Crown size={80} className="text-yellow-400" />
        </div>
        <div className="bg-yellow-500/20 rounded-full p-4 inline-flex mb-4">
          <Construction size={48} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">🚧 Programa Assinante</h1>
        <h2 className="text-xl text-purple-400 mb-4">Em desenvolvimento</h2>
        <p className="text-gray-400 mb-6">
          O programa de Cliente Assinante está sendo desenvolvido.
          <br />
          Em breve você terá benefícios exclusivos!
        </p>
        <div className="bg-zinc-800 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-yellow-400 font-semibold mb-2">📋 Regras em definição:</p>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• 🎁 Plano mensal com benefícios progressivos</li>
            <li>• 💰 Descontos exclusivos em todo cardápio</li>
            <li>• 🚚 Entrega prioritária e sem taxa adicional</li>
            <li>• 🎂 Brinde de aniversário mensal</li>
            <li>• ⭐ Atendimento VIP com suporte dedicado</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.href = '/cozinha'}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto transition w-full"
        >
          <ArrowLeft size={18} />
          Voltar e escolher outro perfil
        </button>
        <p className="text-xs text-gray-600 mt-4">Redirecionando em {contador} segundos...</p>
      </div>
    </div>
  );
}