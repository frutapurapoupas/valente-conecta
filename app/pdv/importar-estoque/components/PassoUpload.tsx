"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\components\PassoUpload.tsx

import { useRef } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

interface Props {
  onArquivoSelecionado: (arquivo: File) => void;
  erro: string;
}

export function PassoUpload({ onArquivoSelecionado, erro }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">Envie sua planilha de estoque</h2>
        <p className="text-sm text-gray-500 mt-1">
          Aceita arquivos .xlsx ou .csv. Não precisa formatar nada antes — no próximo passo você escolhe qual coluna é qual.
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-[3/1.4] bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 transition flex flex-col items-center justify-center gap-2"
      >
        <Upload className="w-8 h-8 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Toque para escolher o arquivo</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) onArquivoSelecionado(arquivo);
        }}
      />

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div className="bg-blue-50 rounded-xl p-3 flex gap-2 text-xs text-blue-700">
        <FileSpreadsheet className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Produtos com código de barras (EAN) cadastrado ganham foto automática sempre que possível. Sem código de barras ou
          sem foto encontrada, o produto é publicado mesmo assim com uma foto provisória — você atualiza depois.
        </p>
      </div>
    </div>
  );
}
