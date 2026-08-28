"use client";

// Caminho: C:\valente_conecta\components\busca\SemResultados.tsx
//
// Estado vazio compartilhado da busca inteligente: nada encontrado na
// plataforma -> oferece "avise-me quando aparecer" e mostra o que achou
// na internet (fora da plataforma). Usado pela busca da home
// (app/busca/page.tsx) e pelas paginas de modulo (CatalogoModuloPage) —
// mesmo comportamento nas duas, alimentado por lib/busca/useFallbackExterno.

import { CadastroPopup } from "@/components/CadastroPopup";
import { AvisoBuscaExterna } from "@/components/busca/AvisoBuscaExterna";
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
  /** Frase da IA (lib/busca/interpretarIntencao.ts) pra essa busca — quando
   *  existe, substitui o texto fixo "Ainda nao achamos..." pela versao
   *  humanizada; sem IA disponivel (sem chave, cota estourada, erro), cai no
   *  texto fixo de sempre. */
  mensagemHumanizada?: string;
  /** Primeiro termo direto que a IA sugeriu (ex: "oficina mecanica"), usado
   *  no botao "avise-me" no lugar do termo digitado inteiro — sem isso o
   *  botao repetia a frase digitada por extenso ("Avise-me quando 'preciso
   *  de consertar meu carro' aparecer"), que soa estranho/repetitivo. Sem
   *  IA disponivel, cai no proprio termo digitado. */
  assuntoBusca?: string;
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
  mensagemHumanizada,
  assuntoBusca,
}: SemResultadosProps) {
  const temTermo = Boolean(termo.trim());
  const termoParaAvisar = assuntoBusca || termo;

  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg px-6">
      <p className="text-gray-500 text-lg">
        {temTermo
          ? mensagemHumanizada || `Ainda não achamos ninguém oferecendo "${termoParaAvisar}" em Valente`
          : "Nenhum item por aqui ainda"}
      </p>
      <p className="text-gray-500 text-sm mt-1">
        {temTermo ? "Mas podemos te avisar assim que alguém publicar isso por aqui." : "Assim que alguém publicar, aparece aqui."}
      </p>

      {temTermo && (
        <div className="mt-5 max-w-lg mx-auto text-left">
          <AvisoBuscaExterna
            termoParaAvisar={termoParaAvisar}
            demandaRegistrada={demandaRegistrada}
            registrandoDemanda={registrandoDemanda}
            onRegistrarDemanda={onRegistrarDemanda}
            buscandoExterno={buscandoExterno}
            resultadosExternos={resultadosExternos}
          />
        </div>
      )}

      {!temTermo && semTermoExtra}

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
