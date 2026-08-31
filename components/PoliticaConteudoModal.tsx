"use client";

// Caminho: C:\valente_conecta\components\PoliticaConteudoModal.tsx
//
// Popup de aceite da politica de protecao de conteudo (lib/politicaConteudo.ts).
// Componente burro -- toda a logica de quando abrir/o que fazer depois de
// aceitar mora em lib/hooks/useExigirAceitePolitica.ts.

import { useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { POLITICA_CONTEUDO_TITULO, POLITICA_CONTEUDO_TEXTO } from "@/lib/politicaConteudo";

interface PoliticaConteudoModalProps {
  aberto: boolean;
  enviando: boolean;
  onAceitar: () => void;
  onCancelar: () => void;
}

export function PoliticaConteudoModal({ aberto, enviando, onAceitar, onCancelar }: PoliticaConteudoModalProps) {
  const [marcado, setMarcado] = useState(false);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-lg font-bold text-gray-800">{POLITICA_CONTEUDO_TITULO}</h2>
        </div>

        <div className="p-5 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
          {POLITICA_CONTEUDO_TEXTO}
        </div>

        <div className="p-5 border-t border-gray-100 space-y-3">
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={marcado}
              onChange={(e) => setMarcado(e.target.checked)}
              className="mt-0.5"
            />
            Li e aceito a política de proteção de conteúdo.
          </label>

          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              disabled={enviando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={onAceitar}
              disabled={!marcado || enviando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Aceitar e continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
