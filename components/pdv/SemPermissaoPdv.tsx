"use client";

// Caminho: C:\valente_conecta\components\pdv\SemPermissaoPdv.tsx
//
// Tela mostrada quando o operador logado (funcionário) não tem permissão
// pra aba atual — mesmo padrão visual da tela "Complete seu cadastro" que
// já existe em app/pdv/page.tsx e nas outras páginas do PDV.

import { Lock } from "lucide-react";

export function SemPermissaoPdv() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">Você não tem permissão pra acessar essa área.</p>
        <p className="text-sm text-gray-400 mt-1">Fale com o dono da loja se precisar de acesso.</p>
      </div>
    </div>
  );
}
