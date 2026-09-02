"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\ciclo-cadastro-consumidor\page.tsx
//
// Ciclo de bonus do cadastro colaborativo de produto feito por consumidor
// (ver 093_cadastro_consumidor_produto.sql). Diferente da campanha viral
// (meta por CIDADE), aqui a meta e' por CATEGORIA de produto: o admin
// master informa quantos cadastros aprovados numa categoria fecham um
// ciclo e o valor do bônus em Moeda Conecta pago em cada lote fechado.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Gift, Save } from "lucide-react";

interface ConfigCategoria {
  categoria: string;
  meta: number;
  bonus: number;
  ativo: boolean;
}

const LABELS: Record<string, string> = {
  mercado: "Mercado / Mercearia",
  farmacia: "Farmácia",
  auto_pecas: "Auto Peças",
  acougue: "Açougue",
  moda: "Moda / Roupas",
  papelaria: "Papelaria",
  geral: "Outro / Geral",
};

export default function CicloCadastroConsumidorPage() {
  const [configs, setConfigs] = useState<ConfigCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoCategoria, setSalvandoCategoria] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    fetch("/api/admin-master/ciclo-cadastro-consumidor", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setConfigs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  const atualizarCampo = (categoria: string, campo: "meta" | "bonus" | "ativo", valor: number | boolean) => {
    setConfigs((prev) => prev.map((c) => (c.categoria === categoria ? { ...c, [campo]: valor } : c)));
  };

  const salvar = async (categoria: string) => {
    const cfg = configs.find((c) => c.categoria === categoria);
    if (!cfg) return;
    setSalvandoCategoria(categoria);
    try {
      const resp = await fetch("/api/admin-master/ciclo-cadastro-consumidor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`Ciclo de "${LABELS[categoria]}" salvo!`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvandoCategoria(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Gift size={22} className="text-purple-600" /> Ciclo de cadastro colaborativo (consumidor)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Por categoria de produto: quantos cadastros aprovados (com nota fiscal) fecham um ciclo, e o valor do bônus em Moeda Conecta pago a cada ciclo fechado.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {configs.map((cfg) => (
            <div key={cfg.categoria} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">{LABELS[cfg.categoria] || cfg.categoria}</p>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={cfg.ativo}
                    onChange={(e) => atualizarCampo(cfg.categoria, "ativo", e.target.checked)}
                  />
                  Ativo
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Produtos por ciclo</label>
                  <input
                    type="number"
                    min={1}
                    value={cfg.meta}
                    onChange={(e) => atualizarCampo(cfg.categoria, "meta", parseInt(e.target.value, 10) || 1)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Bônus por ciclo (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={cfg.bonus}
                    onChange={(e) => atualizarCampo(cfg.categoria, "bonus", parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => salvar(cfg.categoria)}
                disabled={salvandoCategoria === cfg.categoria}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" /> {salvandoCategoria === cfg.categoria ? "Salvando..." : "Salvar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
