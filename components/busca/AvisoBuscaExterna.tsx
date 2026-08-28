"use client";

// Caminho: C:\valente_conecta\components\busca\AvisoBuscaExterna.tsx
//
// Bloco "avise-me quando aparecer" + resultados achados fora da plataforma
// (Google, via lib/busca/useFallbackExterno). Extraido de SemResultados.tsx
// pra poder ser reaproveitado tambem quando a busca TEM algum resultado
// (direto ou relacionado) mas nao acha nada realmente direto pro que a
// pessoa pediu -- ex: buscar "abastecer o carro" sem nenhum posto de
// combustivel cadastrado so' mostrava a tela de "nada encontrado" quando
// nao existia nem sequer um relacionado por coincidencia; com relacionado
// coincidindo, a pessoa ficava sem opcao nenhuma de achar um posto de
// verdade. Nessa fase do catalogo (ainda com poucos comercios cadastrados
// em varias categorias), mostrar o que existe de verdade no Google é o
// minimo pra nao devolver a pessoa de maos vazias.

import { BellRing, CheckCircle2, ExternalLink, Globe } from "lucide-react";
import type { ResultadoExterno } from "@/lib/busca/useFallbackExterno";

interface AvisoBuscaExternaProps {
  termoParaAvisar: string;
  demandaRegistrada: boolean;
  registrandoDemanda: boolean;
  onRegistrarDemanda: () => void;
  buscandoExterno: boolean;
  resultadosExternos: ResultadoExterno[];
}

export function AvisoBuscaExterna({
  termoParaAvisar,
  demandaRegistrada,
  registrandoDemanda,
  onRegistrarDemanda,
  buscandoExterno,
  resultadosExternos,
}: AvisoBuscaExternaProps) {
  return (
    <div>
      {demandaRegistrada ? (
        <p className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
          <CheckCircle2 className="w-4 h-4" /> Interesse registrado — vamos te avisar em até 24h se aparecer.
        </p>
      ) : (
        <button
          onClick={onRegistrarDemanda}
          disabled={registrandoDemanda}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium text-sm"
        >
          <BellRing className="w-4 h-4" />
          {registrandoDemanda ? "Registrando..." : `Avise-me quando "${termoParaAvisar}" aparecer`}
        </button>
      )}

      {buscandoExterno && <p className="text-sm text-gray-500 mt-4">Procurando na internet perto de você...</p>}

      {resultadosExternos.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            <Globe className="w-3.5 h-3.5" /> Encontrado na internet, fora da plataforma
          </p>
          <div className="space-y-2">
            {resultadosExternos.map((r, i) => (
              <a
                key={i}
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border rounded-lg p-3 hover:border-blue-400 transition-colors"
              >
                <p className="text-sm font-medium text-blue-700 flex items-center gap-1.5">
                  {r.titulo} <ExternalLink className="w-3 h-3 shrink-0" />
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.trecho}</p>
                <p className="text-[13px] text-gray-500 mt-1">{r.fonte}</p>
              </a>
            ))}
          </div>
          <p className="text-[13px] text-gray-500 mt-2">
            Resultado externo — o preço, se aparecer no texto, não é garantido pelo Valente Conecta.
          </p>
        </div>
      )}
    </div>
  );
}
