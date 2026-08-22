"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\components\PassoMapeamento.tsx
//
// Planilha de lojista nenhum tem cabeçalho padronizado — aqui ele diz qual
// coluna da planilha dele é qual campo do sistema. Sugestão automática por
// aproximação de nome já vem pronta (useImportacaoEstoque.sugerirMapeamento),
// sempre editável.

import { CAMPOS_MAPEAVEIS, type MapeamentoColunas } from "@/lib/pdv/importacaoEstoqueTypes";
import { LABEL_MODULO, type ModuloId } from "@/lib/catalogo/marketplaceTypes";

interface Props {
  cabecalho: string[];
  linhasBrutas: string[][];
  mapeamento: MapeamentoColunas;
  onChangeMapeamento: (mapeamento: MapeamentoColunas) => void;
  modulo: string;
  onChangeModulo: (modulo: string) => void;
}

export function PassoMapeamento({ cabecalho, linhasBrutas, mapeamento, onChangeMapeamento, modulo, onChangeModulo }: Props) {
  const amostra = linhasBrutas.slice(0, 2);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">De onde vem cada coisa?</h2>
        <p className="text-sm text-gray-500 mt-1">Confirma qual coluna da sua planilha é cada campo. Já tentamos adivinhar.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Onde publicar</label>
        <select
          value={modulo}
          onChange={(e) => onChangeModulo(e.target.value)}
          className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
        >
          {(Object.keys(LABEL_MODULO) as ModuloId[]).map((id) => (
            <option key={id} value={id}>
              {LABEL_MODULO[id]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {CAMPOS_MAPEAVEIS.map((campo) => (
          <div key={campo.campo}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {campo.label}
              {campo.obrigatorio && <span className="text-red-500"> *</span>}
            </label>
            <select
              value={mapeamento[campo.campo] ?? ""}
              onChange={(e) =>
                onChangeMapeamento({ ...mapeamento, [campo.campo]: e.target.value === "" ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
            >
              <option value="">Nenhuma coluna</option>
              {cabecalho.map((coluna, indice) => (
                <option key={indice} value={indice}>
                  {coluna || `Coluna ${indice + 1}`}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {amostra.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Prévia das 2 primeiras linhas</p>
          <div className="overflow-x-auto rounded-xl border">
            <table className="text-xs w-full">
              <thead className="bg-gray-50">
                <tr>
                  {cabecalho.map((coluna, i) => (
                    <th key={i} className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap">
                      {coluna || `Coluna ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amostra.map((linha, i) => (
                  <tr key={i} className="border-t">
                    {linha.map((valor, j) => (
                      <td key={j} className="px-2 py-1.5 text-gray-500 whitespace-nowrap">
                        {valor || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
