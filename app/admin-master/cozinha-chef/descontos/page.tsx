"use client";

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\descontos\page.tsx
// Admin da cozinha define os percentuais de desconto de cada perfil de
// cliente (Assinatura/Revendedor) — Cliente Geral sempre paga o preco
// cheio (0%, nao editavel). Ver app/api/cozinha/descontos/route.ts.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Percent, Save, Star, Handshake, ChefHat } from "lucide-react";

export default function DescontosCozinhaPage() {
  const [descontoAssinante, setDescontoAssinante] = useState("15");
  const [descontoRevendedor, setDescontoRevendedor] = useState("19");
  const [minimoPorcoes, setMinimoPorcoes] = useState("5");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/cozinha/descontos")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setDescontoAssinante(String(res.data.descontoAssinante));
          setDescontoRevendedor(String(res.data.descontoRevendedor));
          setMinimoPorcoes(String(res.data.minimoPorcoesAssinante));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/cozinha/descontos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descontoAssinante: Number(descontoAssinante),
          descontoRevendedor: Number(descontoRevendedor),
          minimoPorcoesAssinante: Number(minimoPorcoes),
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Descontos atualizados! Já valem para novos pedidos.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-400 text-sm">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Percent className="w-6 h-6 text-emerald-600" /> Descontos por Perfil de Cliente
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Cliente Geral sempre paga o preço cheio (cota cheia). Defina aqui o desconto dos outros dois perfis.
      </p>

      <div className="bg-white border rounded-lg p-5 space-y-5">
        <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
          <ChefHat className="w-4 h-4" /> Cliente Geral — preço cheio (0% de desconto, fixo)
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Star className="w-4 h-4 text-amber-500" /> Desconto Cliente Assinatura (%)
          </label>
          <input
            type="number"
            min="0"
            max="90"
            value={descontoAssinante}
            onChange={(e) => setDescontoAssinante(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo de porções (Assinatura)</label>
          <input
            type="number"
            min="1"
            value={minimoPorcoes}
            onChange={(e) => setMinimoPorcoes(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Handshake className="w-4 h-4 text-purple-500" /> Desconto Cliente Revendedor (%)
          </label>
          <input
            type="number"
            min="0"
            max="90"
            value={descontoRevendedor}
            onChange={(e) => setDescontoRevendedor(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-medium"
        >
          <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
