"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\components\PassoRevisao.tsx

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { LinhaPlanilha } from "@/lib/pdv/importacaoEstoqueTypes";

interface Props {
  validas: LinhaPlanilha[];
  invalidas: { linha: number; motivo: string }[];
  enviando: boolean;
  progresso: { enviadas: number; total: number };
  onPublicar: () => void;
}

export function PassoRevisao({ validas, invalidas, enviando, progresso, onPublicar }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">Confirme antes de publicar</h2>
        <p className="text-sm text-gray-500 mt-1">Linhas com problema são puladas — o resto publica normalmente.</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800">
          <strong>{validas.length}</strong> {validas.length === 1 ? "produto pronto" : "produtos prontos"} para publicar.
        </p>
      </div>

      {invalidas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{invalidas.length}</strong> {invalidas.length === 1 ? "linha será pulada" : "linhas serão puladas"}
            </p>
          </div>
          <ul className="text-xs text-amber-700 space-y-0.5 pl-7 max-h-32 overflow-y-auto">
            {invalidas.slice(0, 20).map((item, i) => (
              <li key={i}>
                Linha {item.linha}: {item.motivo}
              </li>
            ))}
            {invalidas.length > 20 && <li>... e mais {invalidas.length - 20}</li>}
          </ul>
        </div>
      )}

      {enviando && (
        <div className="bg-white border rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Publicando {progresso.enviadas} de {progresso.total}...
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progresso.total ? (progresso.enviadas / progresso.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onPublicar}
        disabled={enviando || validas.length === 0}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium"
      >
        {enviando ? "Publicando..." : `Publicar ${validas.length} produtos`}
      </button>
    </div>
  );
}
