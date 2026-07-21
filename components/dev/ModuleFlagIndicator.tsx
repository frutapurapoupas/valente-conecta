'use client';

// ============================================
// COMPONENTE - INDICADOR DE FEATURE FLAGS (DEV)
// ============================================
// Pequeno badge fixo no canto inferior direito
// que sÃ³ aparece em desenvolvimento, mostrando
// quantos mÃ³dulos estÃ£o ativos vs. total.

import { MODULE_FLAGS, CURRENT_ENV, getEnabledModules } from '@/config/modules';

export default function ModuleFlagIndicator() {
  // SÃ³ renderiza em desenvolvimento
  if (CURRENT_ENV !== "development") return null;

  const total = Object.keys(MODULE_FLAGS).length;
  const ativos = getEnabledModules().length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-gray-900 bg-opacity-90 text-xs text-green-400 px-3 py-1.5 rounded-full shadow-lg border border-green-500/30 font-mono backdrop-blur-sm">
        ðŸš© {ativos}/{total} mÃ³dulos ativos
      </div>
    </div>
  );
}

