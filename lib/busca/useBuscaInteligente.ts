"use client";

// Caminho: C:\valente_conecta\lib\busca\useBuscaInteligente.ts
//
// Hook único de busca, consumido por toda tela que antes tinha seu próprio
// mecanismo (app/busca/page.tsx, CatalogoModuloPage, DiretorioComercios,
// saúde, imóveis) — chama /api/busca-inteligente. Debounce de 600ms
// enquanto digita; buscarImediato() pula o debounce (Enter/clique na lupa).
// Sem termo (troca de categoria/módulo só), refaz a busca na hora — é
// navegação, não digitação, não faz sentido esperar.

import { useCallback, useEffect, useRef, useState } from "react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import type { ResultadoVitrine } from "@/lib/catalogo/marketplaceTypes";

export interface ResultadoAgrupado extends ResultadoVitrine {
  grupo: "direto" | "relacionado";
}

interface FiltrosBuscaInteligente {
  modulo?: string;
  categoria?: string;
  lat?: number;
  lng?: number;
}

export function useBuscaInteligente(filtros: FiltrosBuscaInteligente = {}) {
  const [termo, setTermo] = useState("");
  const [diretos, setDiretos] = useState<ResultadoAgrupado[]>([]);
  const [relacionados, setRelacionados] = useState<ResultadoAgrupado[]>([]);
  const [mensagemHumanizada, setMensagemHumanizada] = useState<string | undefined>(undefined);
  // Primeiro termo direto que a IA sugeriu pra essa busca (ex: "oficina
  // mecanica" pra "preciso de consertar meu carro") -- usado no lugar do
  // termo digitado inteiro no botao "avise-me", que ficava repetindo a
  // frase digitada por extenso de forma estranha.
  const [assuntoBusca, setAssuntoBusca] = useState<string | undefined>(undefined);
  const [carregando, setCarregando] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executar = useCallback(async (termoBusca: string) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ q: termoBusca, usuarioId: obterUsuarioLocalId() });
      if (filtros.modulo) params.set("modulo", filtros.modulo);
      if (filtros.categoria) params.set("categoria", filtros.categoria);
      if (filtros.lat != null) params.set("lat", String(filtros.lat));
      if (filtros.lng != null) params.set("lng", String(filtros.lng));
      const resp = await fetch(`/api/busca-inteligente?${params.toString()}`);
      const resultado = await resp.json();
      if (resultado.success) {
        setDiretos(resultado.data.diretos);
        setRelacionados(resultado.data.relacionados);
        setMensagemHumanizada(resultado.data.mensagemHumanizada);
        setAssuntoBusca(resultado.data.termosUsados?.diretos?.[0]);
      } else {
        setDiretos([]);
        setRelacionados([]);
        setMensagemHumanizada(undefined);
        setAssuntoBusca(undefined);
      }
    } catch {
      setDiretos([]);
      setRelacionados([]);
      setMensagemHumanizada(undefined);
      setAssuntoBusca(undefined);
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.modulo, filtros.categoria, filtros.lat, filtros.lng]);

  const buscar = useCallback((novoTermo: string) => {
    setTermo(novoTermo);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => executar(novoTermo), 600);
  }, [executar]);

  const buscarImediato = useCallback((novoTermo: string) => {
    setTermo(novoTermo);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    executar(novoTermo);
  }, [executar]);

  // Troca de modulo/categoria (navegacao, nao digitacao) refaz a busca na
  // hora, mantendo o termo atual -- mesmo comportamento que useCatalogoPublico
  // ja tinha.
  useEffect(() => {
    executar(termo);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.modulo, filtros.categoria]);

  return { termo, diretos, relacionados, mensagemHumanizada, assuntoBusca, carregando, buscar, buscarImediato };
}
