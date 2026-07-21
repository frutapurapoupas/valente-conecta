// Arquivo: components/home/SecaoPlanos.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - SEÇÃO DE PLANOS
// ============================================

import { Crown, ChevronRight, Users, Store, Shield } from 'lucide-react';
import { homeConstants } from '@/constants/homeConstants';

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  Users,
  Store,
  Crown,
  Shield
};

export default function SecaoPlanos() {
  const { titulos, planos } = homeConstants;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-600" />
        {titulos.planos}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {planos.map((plano) => {
          const Icon = iconMap[plano.icon];
          return (
            <div key={plano.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className={`${plano.cor} w-12 h-12 rounded-full flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800">{plano.nome}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {plano.preco === 0 ? 'Grátis' : `R$ ${plano.preco.toFixed(2)}`}
                {plano.preco > 0 && <span className="text-sm font-normal text-gray-500">/mês</span>}
              </p>
              <p className="text-sm text-gray-500 mt-1">{plano.descricao}</p>
              <ul className="mt-3 space-y-1">
                {plano.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Assinar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

