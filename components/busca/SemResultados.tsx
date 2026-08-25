"use client";

// Caminho: C:\valente_conecta\components\busca\SemResultados.tsx
//
// Estado vazio compartilhado da busca inteligente: nada encontrado na
// plataforma -> oferece "avise-me quando aparecer" e mostra o que achou
// na internet (fora da plataforma). Usado pela busca da home
// (app/busca/page.tsx) e pelas paginas de modulo (CatalogoModuloPage) —
// mesmo comportamento nas duas, alimentado por lib/busca/useFallbackExterno.

import { BellRing, CheckCircle2, ExternalLink, Globe } from "lucide-react";
import { CadastroPopup } from "@/components/CadastroPopup";
import type { ResultadoExterno } from "@/lib/busca/useFallbackExterno";

interface SemResultadosProps {
  termo: string;
  demandaRegistrada: boolean;
  registrandoDemanda: boolean;
  onRegistrarDemanda: () => void;
  buscandoExterno: boolean;
  resultadosExternos: ResultadoExterno[];
  pedirCadastro: boolean;
  onFecharCadastro: () => void;
  /** Conteudo extra mostrado so' quando nao ha termo digitado (navegacao por categoria vazia). */
  semTermoExtra?: React.ReactNode;
}

export function SemResultados({
  termo,
  demandaRegistrada,
  registrandoDemanda,
  onRegistrarDemanda,
  buscandoExterno,
  resultadosExternos,
  pedirCadastro,
  onFecharCadastro,
  semTermoExtra,
}: SemResultadosProps) {
  const temTermo = Boolean(termo.trim());

  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg px-6">
      <p className="text-gray-500 text-lg">
        {temTermo ? `Ainda não achamos ninguém oferecendo "${termo}" em Valente` : "Nenhum item por aqui ainda"}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        {temTermo ? "Mas podemos te avisar assim que alguém publicar isso por aqui." : "Assim que alguém publicar, aparece aqui."}
      </p>

      {temTermo &&
        (demandaRegistrada ? (
          <p className="mt-5 flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm">
            <CheckCircle2 className="w-4 h-4" /> Interesse registrado — vamos te avisar em até 24h se aparecer.
          </p>
        ) : (
          <button
            onClick={onRegistrarDemanda}
            disabled={registrandoDemanda}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium"
          >
            <BellRing className="w-4 h-4" />
            {registrandoDemanda ? "Registrando..." : `Avise-me quando "${termo}" aparecer`}
          </button>
        ))}

      {!temTermo && semTermoExtra}

      {buscandoExterno && <p className="text-xs text-gray-400 mt-6">Procurando na internet perto de você...</p>}

      {resultadosExternos.length > 0 && (
        <div className="mt-8 text-left max-w-lg mx-auto">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.trecho}</p>
                <p className="text-[11px] text-gray-400 mt-1">{r.fonte}</p>
              </a>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Resultado externo — o preço, se aparecer no texto, não é garantido pelo Valente Conecta.
          </p>
        </div>
      )}

      {pedirCadastro && (
        <CadastroPopup
          forceShow
          codigoIndicacao={typeof window !== "undefined" ? localStorage.getItem("convite_codigo") || undefined : undefined}
          onSuccess={onFecharCadastro}
        />
      )}
    </div>
  );
}
