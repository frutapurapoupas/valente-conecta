"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\ciclo-avaliacao\page.tsx
//
// Ciclo de bônus em Moeda Conecta por avaliação deixada (ver
// 102_avaliacao_bonus.sql) -- conta avaliações de Carona Solidária e da
// vitrine geral do catálogo somadas. Mesmo layout de
// /admin-master/configuracoes/ciclo-cadastro-consumidor, só que uma linha
// única em vez de uma por categoria.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Save } from "lucide-react";

interface CicloConfig {
  meta: number;
  bonus: number;
  ativo: boolean;
}

export default function CicloAvaliacaoPage() {
  const [config, setConfig] = useState<CicloConfig>({ meta: 1, bonus: 0, ativo: false });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin-master/ciclo-avaliacao", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && res.data && setConfig({ meta: res.data.meta, bonus: res.data.bonus, ativo: res.data.ativo }))
      .finally(() => setLoading(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/ciclo-avaliacao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Ciclo de avaliação salvo!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Star size={22} className="text-amber-500" /> Bônus por avaliação
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Conta avaliações deixadas em Carona Solidária e na vitrine geral do catálogo (somadas). Moto-Táxi fica de fora porque a avaliação lá pode ser feita sem cadastro completo.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800">Ciclo de bônus</p>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={config.ativo} onChange={(e) => setConfig((p) => ({ ...p, ativo: e.target.checked }))} />
              Ativo
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Avaliações por ciclo</label>
              <input
                type="number"
                min={1}
                value={config.meta}
                onChange={(e) => setConfig((p) => ({ ...p, meta: parseInt(e.target.value, 10) || 1 }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Bônus por ciclo (Moeda Conecta)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={config.bonus}
                onChange={(e) => setConfig((p) => ({ ...p, bonus: parseFloat(e.target.value) || 0 }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            onClick={salvar}
            disabled={salvando}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" /> {salvando ? "Salvando..." : "Salvar"}
          </button>
          {!config.ativo && (
            <p className="text-xs text-amber-600 mt-2">Ciclo desativado — avaliações continuam sendo salvas normalmente, mas ninguém recebe bônus até ativar.</p>
          )}
        </div>
      )}
    </div>
  );
}
