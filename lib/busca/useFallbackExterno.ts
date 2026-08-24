"use client";

// Caminho: C:\valente_conecta\lib\busca\useFallbackExterno.ts
//
// Fallback pra quando a busca inteligente nao acha nada dentro da
// plataforma: procura na internet (Google, via /api/busca-externa) e
// oferece "avise-me quando aparecer" (/api/demandas-busca). Compartilhado
// entre a busca da home (app/busca/page.tsx) e as paginas de modulo
// (CatalogoModuloPage) -- as duas tem exatamente o mesmo comportamento
// nesse cenario, so' mudava o "modulo" enviado no registro da demanda.

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
  modulo?: string;
  localizacao?: { lat: number; lng: number } | null;
  loading: boolean;
  totalResultados: number;
}

export function useFallbackExterno({ termo, modulo, localizacao, loading, totalResultados }: UseFallbackExternoOpts) {
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
    if (loading || totalResultados > 0 || !termo.trim()) {
      setResultadosExternos([]);
      return;
    }
    // cidade_base existe na tabela usuarios mas nao esta no tipo Usuario
    // (campo adicionado depois, tipo nao foi atualizado).
    const usuario = getCurrentUser();
    const cidade = (usuario as any)?.cidade_base || undefined;
    setBuscandoExterno(true);
    const params = new URLSearchParams({ q: termo, usuarioId: usuario?.id || obterUsuarioLocalId() });
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
  }, [loading, totalResultados, termo, localizacao]);

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
