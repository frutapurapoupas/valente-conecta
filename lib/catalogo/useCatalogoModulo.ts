"use client";

// Caminho: C:\valente_conecta\lib\catalogo\useCatalogoModulo.ts
//
// Hook generico reaproveitado por todos os modulos verticais do catalogo
// (agua-gas, servicos, mercados, imoveis, emprego, construcao, saude, pet)
// pro lado do DONO (admin da loja) — evita reescrever a mesma logica de
// CRUD em cada modulo (ver MASTER_SPEC secao 2: "interface unica
// reutilizavel"). O lado publico (busca/listagem) usa
// lib/busca/useBuscaInteligente.ts.

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import type { CatalogoItem, NovoCatalogoItem } from "./marketplaceTypes";

/** Lado do dono (admin da loja): CRUD dos itens do proprio catalogo. */
export function useMeuCatalogo(modulo: string) {
  const [itens, setItens] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [donoId, setDonoId] = useState("");

  useEffect(() => {
    setDonoId(obterUsuarioLocalId());
  }, []);

  const carregar = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const resp = await fetch(`/api/catalogo/itens?modulo=${modulo}&dono_id=${id}`);
      const resultado = await resp.json();
      setItens(resultado.success ? resultado.data : []);
    } catch (error) {
      console.error(`Erro ao carregar meu catálogo (${modulo}):`, error);
    } finally {
      setLoading(false);
    }
  }, [modulo]);

  useEffect(() => {
    if (donoId) carregar(donoId);
  }, [donoId, carregar]);

  const criar = useCallback(async (dados: Omit<NovoCatalogoItem, "dono_id" | "modulo">) => {
    try {
      const resp = await fetch("/api/catalogo/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, dono_id: donoId, modulo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) => [resultado.data, ...prev]);
      toast.success("Item publicado!");
      return resultado.data as CatalogoItem;
    } catch (error) {
      toast.error("Erro ao publicar item");
      return null;
    }
  }, [donoId, modulo]);

  const atualizar = useCallback(async (id: string, patch: Partial<NovoCatalogoItem>) => {
    try {
      const resp = await fetch(`/api/catalogo/itens/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, dono_id: donoId }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) => prev.map((i) => (i.id === id ? resultado.data : i)));
      toast.success("Item atualizado!");
      return resultado.data as CatalogoItem;
    } catch (error) {
      toast.error("Erro ao atualizar item");
      return null;
    }
  }, [donoId]);

  const remover = useCallback(async (id: string) => {
    try {
      const resp = await fetch(`/api/catalogo/itens/${id}?dono_id=${donoId}`, { method: "DELETE" });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido!");
      return true;
    } catch (error) {
      toast.error("Erro ao remover item");
      return false;
    }
  }, [donoId]);

  return { itens, loading, donoId, criar, atualizar, remover, recarregar: () => carregar(donoId) };
}
