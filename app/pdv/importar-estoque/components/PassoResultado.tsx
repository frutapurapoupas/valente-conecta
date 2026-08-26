"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\components\PassoResultado.tsx

import Link from "next/link";
import { CheckCircle2, ImageOff, XCircle } from "lucide-react";
import type { ResultadoLinha } from "@/lib/pdv/importacaoEstoqueTypes";

interface Props {
  resultados: ResultadoLinha[];
  onNovaImportacao: () => void;
}

export function PassoResultado({ resultados, onNovaImportacao }: Props) {
  const publicados = resultados.filter((r) => r.status === "publicado");
  const comFotoReal = publicados.filter((r) => !r.foto_ficticia);
  const comPlaceholder = publicados.filter((r) => r.foto_ficticia);
  const comErro = resultados.filter((r) => r.status === "erro");

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h2 className="font-bold text-gray-800 text-lg">Importação concluída</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-2xl font-bold text-green-700">{comFotoReal.length}</p>
          <p className="text-sm text-green-700 mt-1">com foto real</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3">
          <p className="text-2xl font-bold text-amber-700">{comPlaceholder.length}</p>
          <p className="text-sm text-amber-700 mt-1">aguardando foto</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-2xl font-bold text-red-700">{comErro.length}</p>
          <p className="text-sm text-red-700 mt-1">com erro</p>
        </div>
      </div>

      {comPlaceholder.length > 0 && (
        <Link
          href="/pdv/importar-estoque/pendentes"
          className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
        >
          <ImageOff className="w-4 h-4" /> Atualizar fotos pendentes
        </Link>
      )}

      {comErro.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm font-medium text-red-800">Linhas com erro</p>
          </div>
          <ul className="text-sm text-red-700 space-y-0.5 pl-6">
            {comErro.slice(0, 20).map((r, i) => (
              <li key={i}>
                Linha {r.linha_index + 2}: {r.erro}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onNovaImportacao} className="w-full py-3 border rounded-xl font-medium text-gray-600 hover:bg-gray-50">
        Importar outra planilha
      </button>
    </div>
  );
}
