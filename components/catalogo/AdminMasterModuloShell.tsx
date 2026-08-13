"use client";

// Caminho: C:\valente_conecta\components\catalogo\AdminMasterModuloShell.tsx
//
// Painel do admin master para um modulo do catalogo (camada 3 — controle
// absoluto sobre todo o sistema). Modera qualquer item de qualquer dono e
// configura as taxas do modulo (taxas_config, escopo 'modulo:X'). Ver
// MODULO_MARKETPLACE_MONETIZACAO.md secao 2.3 e MASTER_SPEC secao 10.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Ban, CheckCircle2, DollarSign, Star } from "lucide-react";
import type { CatalogoItem } from "@/lib/catalogo/marketplaceTypes";

interface TaxaConfig {
  id?: string;
  escopo: string;
  tipo: "taxa_comprador" | "taxa_fornecedor" | "assinatura_unica";
  valor: number;
  ativo: boolean;
}

const TIPOS_TAXA: { tipo: TaxaConfig["tipo"]; label: string }[] = [
  { tipo: "taxa_comprador", label: "Taxa do comprador (liberar contato do fornecedor)" },
  { tipo: "taxa_fornecedor", label: "Taxa do fornecedor (liberar contato do comprador)" },
  { tipo: "assinatura_unica", label: "Assinatura única de acesso irrestrito" },
];

export function AdminMasterModuloShell({ modulo, labelModulo }: { modulo: string; labelModulo: string }) {
  const [itens, setItens] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const escopo = `modulo:${modulo}`;

  useEffect(() => {
    fetch(`/api/catalogo/itens?modulo=${modulo}`)
      .then((r) => r.json())
      .then((res) => setItens(res.success ? res.data : []))
      .finally(() => setLoading(false));
  }, [modulo]);

  const moderar = async (id: string, status: "ativo" | "pausado" | "removido") => {
    try {
      const resp = await fetch(`/api/admin-master/catalogo/itens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success("Item atualizado");
    } catch {
      toast.error("Erro ao moderar item");
    }
  };

  const destacar = async (id: string, destaque_posicao: number | null) => {
    try {
      const resp = await fetch(`/api/admin-master/catalogo/itens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destaque_posicao }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setItens((prev) =>
        prev.map((i) => {
          if (i.id === id) return { ...i, destaque_posicao };
          // so' um item por posicao dentro do modulo — solta quem estava la
          if (destaque_posicao !== null && i.destaque_posicao === destaque_posicao) return { ...i, destaque_posicao: null };
          return i;
        })
      );
      toast.success(destaque_posicao ? `Fixado em ${destaque_posicao}º lugar` : "Destaque removido");
    } catch (err: any) {
      toast.error(err.message || "Erro ao destacar item");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{labelModulo}</h1>
      <p className="text-sm text-gray-500 mb-6">Moderação de itens e configuração de taxas do módulo.</p>

      <TaxasModuloPanel escopo={escopo} />

      <h2 className="text-lg font-semibold mt-8 mb-1">Itens publicados ({itens.length})</h2>
      <p className="text-xs text-gray-400 mb-3">
        Fixe até 3 itens no topo da vitrine pública deste módulo (independente de busca ou distância).
      </p>
      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhum item publicado ainda.</div>
      ) : (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-3 flex items-center gap-3 flex-wrap">
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                {item.midia?.[0] && <img src={item.midia[0].thumb_url || item.midia[0].url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.titulo}</p>
                <p className="text-xs text-gray-500">
                  {item.categoria} · dono {item.dono_id.slice(0, 8)} · {item.status}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => destacar(item.id, item.destaque_posicao === pos ? null : pos)}
                    title={`Fixar em ${pos}º lugar`}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border ${
                      item.destaque_posicao === pos
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-white text-gray-400 border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    {item.destaque_posicao === pos ? <Star className="w-3.5 h-3.5" /> : pos}
                  </button>
                ))}
              </div>
              {item.status !== "removido" && (
                <button
                  onClick={() => moderar(item.id, item.status === "ativo" ? "pausado" : "ativo")}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium"
                >
                  {item.status === "ativo" ? "Pausar" : "Reativar"}
                </button>
              )}
              {item.status !== "removido" && (
                <button
                  onClick={() => moderar(item.id, "removido")}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" /> Remover
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaxasModuloPanel({ escopo }: { escopo: string }) {
  const [taxas, setTaxas] = useState<Record<string, TaxaConfig>>({});
  const [loading, setLoading] = useState(true);
  const [salvandoTipo, setSalvandoTipo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin-master/taxas-config?escopo=${escopo}`)
      .then((r) => r.json())
      .then((res) => {
        const mapa: Record<string, TaxaConfig> = {};
        if (res.success) {
          for (const t of res.data as TaxaConfig[]) mapa[t.tipo] = t;
        }
        setTaxas(mapa);
      })
      .finally(() => setLoading(false));
  }, [escopo]);

  const salvar = async (tipo: TaxaConfig["tipo"], patch: Partial<TaxaConfig>) => {
    const atual = taxas[tipo] || { escopo, tipo, valor: 0, ativo: false };
    const novo = { ...atual, ...patch };
    setTaxas((prev) => ({ ...prev, [tipo]: novo }));
    setSalvandoTipo(tipo);
    try {
      const resp = await fetch("/api/admin-master/taxas-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Taxa atualizada");
    } catch {
      toast.error("Erro ao salvar taxa");
    } finally {
      setSalvandoTipo(null);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Carregando taxas...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h2 className="flex items-center gap-2 font-semibold mb-4">
        <DollarSign className="w-4 h-4 text-blue-600" /> Taxas deste módulo
      </h2>
      <div className="space-y-3">
        {TIPOS_TAXA.map(({ tipo, label }) => {
          const taxa = taxas[tipo] || { escopo, tipo, valor: 0, ativo: false };
          return (
            <div key={tipo} className="flex flex-wrap items-center gap-3 border-b last:border-0 pb-3 last:pb-0">
              <label className="flex items-center gap-2 flex-1 min-w-[240px] text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={taxa.ativo}
                  onChange={(e) => salvar(tipo, { ativo: e.target.checked })}
                />
                {label}
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxa.valor}
                  onChange={(e) => setTaxas((prev) => ({ ...prev, [tipo]: { ...taxa, valor: Number(e.target.value) } }))}
                  onBlur={(e) => salvar(tipo, { valor: Number(e.target.value) })}
                  disabled={salvandoTipo === tipo}
                  className="w-24 px-2 py-1 border rounded text-sm"
                />
              </div>
              {taxa.ativo ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="text-xs text-gray-400">desligada — contato aberto</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
