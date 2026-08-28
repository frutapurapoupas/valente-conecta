"use client";

// Caminho: C:\valente_conecta\lib\busca\useFallbackExterno.ts
//
// Fallback pra quando a busca inteligente nao acha nenhum resultado DIRETO
// dentro da plataforma: procura na internet (Google, via /api/busca-externa)
// e oferece "avise-me quando aparecer" (/api/demandas-busca). Compartilhado
// entre a busca da home (app/busca/page.tsx) e as paginas de modulo
// (CatalogoModuloPage) -- as duas tem exatamente o mesmo comportamento
// nesse cenario, so' mudava o "modulo" enviado no registro da demanda.
//
// Dispara com base em resultados DIRETOS, nao no total (diretos +
// relacionados): um "tambem pode te interessar" pode bater por coincidencia
// de termo (ex: buscar "abastecer o carro" batendo com uma padaria que tem
// "Conveniencias" no nome) sem responder de verdade o que a pessoa pediu —
// nessa fase, com o catalogo ainda com poucas categorias cadastradas, isso
// nao pode deixar a pessoa sem opcao nenhuma de achar o que precisa de
// verdade (ex: um posto de combustivel de fato, via Google).

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser, isUserLoggedIn } from "@/lib/auth";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

export interface ResultadoExterno {
  titulo: string;
  trecho: string;
  link: string;
  fonte: string;
}

interface UseFallbackExternoOpts {
  termo: string;
  /** Termo direto que a IA identificou pra essa busca (ex: "posto de
   *  combustivel" pra "preciso abastecer meu carro") -- usado na consulta ao
   *  Google no lugar da frase inteira digitada, que devolve resultados bem
   *  piores numa Text Search. Sem IA disponivel, cai no proprio `termo`. */
  termoBusca?: string;
  modulo?: string;
  localizacao?: { lat: number; lng: number } | null;
  loading: boolean;
  /** Quantidade de resultados DIRETOS (nao conta "tambem pode te
   *  interessar") -- so' com isso em 0 faz sentido gastar cota buscando
   *  fora da plataforma. */
  totalResultadosDiretos: number;
}

export function useFallbackExterno({ termo, termoBusca, modulo, localizacao, loading, totalResultadosDiretos }: UseFallbackExternoOpts) {
  const termoParaGoogle = termoBusca?.trim() || termo;
  const [demandaRegistrada, setDemandaRegistrada] = useState(false);
  const [registrandoDemanda, setRegistrandoDemanda] = useState(false);
  const [pedirCadastro, setPedirCadastro] = useState(false);
  const [resultadosExternos, setResultadosExternos] = useState<ResultadoExterno[]>([]);
  const [buscandoExterno, setBuscandoExterno] = useState(false);

  // Termo novo = busca nova, o "ja registrei" de uma busca anterior nao
  // vale mais.
  useEffect(() => {
    setDemandaRegistrada(false);
  }, [termo]);

  // O CadastroPopup recarrega a pagina inteira ~1.5s depois do cadastro
  // (pra atualizar o estado de login em todo o app) — o que interromperia
  // um fetch de registrarDemanda() em andamento. Por isso guardamos a
  // intencao no localStorage antes de abrir o popup e retomamos aqui, ja
  // logado, depois do reload.
  useEffect(() => {
    const pendente = localStorage.getItem("busca_demanda_pendente");
    if (!pendente || !isUserLoggedIn()) return;
    localStorage.removeItem("busca_demanda_pendente");
    try {
      const { termo: termoPendente, modulo: moduloPendente } = JSON.parse(pendente);
      if (!termoPendente) return;
      const usuario = getCurrentUser();
      fetch("/api/demandas-busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termo: termoPendente,
          modulo: moduloPendente,
          usuarioId: obterUsuarioLocalId(),
          usuarioNome: usuario?.nome,
          usuarioTelefone: usuario?.whatsapp,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            toast.success("Prontinho! Vamos te avisar assim que aparecer.");
            if (termoPendente === termo) setDemandaRegistrada(true);
          }
        })
        .catch((err) => console.error("Erro ao registrar demanda pendente:", err));
    } catch {
      // ignora JSON invalido
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // So busca fora da plataforma quando a busca interna terminou e nao achou
  // nada — evita gastar cota da API em toda letra digitada.
  useEffect(() => {
    if (loading || totalResultadosDiretos > 0 || !termo.trim()) {
      setResultadosExternos([]);
      return;
    }
    // cidade_base existe na tabela usuarios mas nao esta no tipo Usuario
    // (campo adicionado depois, tipo nao foi atualizado).
    const usuario = getCurrentUser();
    const cidade = (usuario as any)?.cidade_base || undefined;
    setBuscandoExterno(true);
    const params = new URLSearchParams({ q: termoParaGoogle, usuarioId: usuario?.id || obterUsuarioLocalId() });
    if (cidade) params.set("cidade", cidade);
    if (localizacao) {
      params.set("lat", String(localizacao.lat));
      params.set("lng", String(localizacao.lng));
    }
    fetch(`/api/busca-externa?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setResultadosExternos(res.success ? res.data : []))
      .catch(() => setResultadosExternos([]))
      .finally(() => setBuscandoExterno(false));
  }, [loading, totalResultadosDiretos, termo, termoParaGoogle, localizacao]);

  const registrarDemanda = useCallback(async () => {
    if (!isUserLoggedIn()) {
      localStorage.setItem("busca_demanda_pendente", JSON.stringify({ termo, modulo }));
      setPedirCadastro(true);
      return;
    }
    const usuario = getCurrentUser();
    setRegistrandoDemanda(true);
    try {
      const resp = await fetch("/api/demandas-busca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termo,
          modulo,
          usuarioId: obterUsuarioLocalId(),
          usuarioNome: usuario?.nome,
          usuarioTelefone: usuario?.whatsapp,
          latitude: localizacao?.lat,
          longitude: localizacao?.lng,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setDemandaRegistrada(true);
      toast.success("Prontinho! Vamos te avisar assim que aparecer.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar seu interesse");
    } finally {
      setRegistrandoDemanda(false);
    }
  }, [termo, modulo, localizacao]);

  return {
    demandaRegistrada,
    registrandoDemanda,
    pedirCadastro,
    setPedirCadastro,
    resultadosExternos,
    buscandoExterno,
    registrarDemanda,
  };
}
