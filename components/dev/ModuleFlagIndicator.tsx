'use client';

// ============================================
// COMPONENTE - INDICADOR DE FEATURE FLAGS (DEV)
// ============================================
// Pequeno badge fixo no canto inferior direito
// que só aparece em desenvolvimento, mostrando
// quantos módulos estão ativos vs. total.

import { MODULE_FLAGS, CURRENT_ENV, getEnabledModules } from '@/config/modules';

export default function ModuleFlagIndicator() {
  // Só renderiza em desenvolvimento
  if (CURRENT_ENV !== "development") return null;

  const total = Object.keys(MODULE_FLAGS).length;
  const ativos = getEnabledModules().length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-gray-900 bg-opacity-90 text-xs text-green-400 px-3 py-1.5 rounded-full shadow-lg border border-green-500/30 font-mono backdrop-blur-sm">
        🚩 {ativos}/{total} módulos ativos
      </div>
    </div>
  );
}

