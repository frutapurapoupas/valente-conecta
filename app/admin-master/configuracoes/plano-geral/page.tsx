"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\plano-geral\page.tsx
//
// Admin master configura preço de cada nível (básico/ilimitado) e o limite
// mensal (diário pra busca no Google) de cada serviço por nível — ver
// 055_plano_geral.sql. O nível grátis também tem limite editável aqui.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Sparkles } from "lucide-react";

interface TierConfig {
  tier: string;
  nome: string;
  preco: number;
  limites: Record<string, number | null>;
}

const SERVICOS: { chave: string; label: string; periodo: string }[] = [
  { chave: "carona_desbloqueio", label: "Carona Solidária — desbloqueios", periodo: "/mês" },
  { chave: "fila_hospital", label: "Fila de Hospital/Clínica — entradas", periodo: "/mês" },
  { chave: "mototaxi", label: "Moto Táxi/Encomendas — corridas", periodo: "/mês" },
  { chave: "agua_gas", label: "Água e Gás — pedidos", periodo: "/mês" },
  { chave: "academia", label: "Academia — check-ins", periodo: "/mês" },
  { chave: "busca_google", label: "Buscas no Google", periodo: "/dia" },
];

export default function PlanoGeralAdminPage() {
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/plano-geral/config")
      .then((r) => r.json())
      .then((res) => { if (res.success) setTiers(res.data.tiers); })
      .finally(() => setLoading(false));
  }, []);

  const setPreco = (tier: string, preco: number) => {
    setTiers((prev) => prev.map((t) => (t.tier === tier ? { ...t, preco } : t)));
  };

  const setLimite = (tier: string, servico: string, valor: string) => {
    setTiers((prev) => prev.map((t) => {
      if (t.tier !== tier) return t;
      const limites = { ...t.limites };
      limites[servico] = valor === "" ? null : Math.max(0, parseInt(valor, 10) || 0);
      return { ...t, limites };
    }));
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/plano-geral/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Configuração salva!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" /> Plano Geral
        </h1>
        <button onClick={salvar} disabled={salvando} className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Preço mensal e limite de uso de cada serviço, por nível. Deixe o campo de limite vazio pra "sem limite" (ilimitado nesse serviço).
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-3">Serviço</th>
              {tiers.map((t) => (
                <th key={t.tier} className="text-center py-2 px-3 min-w-[140px]">{t.nome}</th>
              ))}
            </tr>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 pr-3 font-normal text-gray-500">Preço/mês (R$)</th>
              {tiers.map((t) => (
                <th key={t.tier} className="py-2 px-3">
                  {t.tier === "gratis" ? (
                    <span className="text-gray-400 text-center block">—</span>
                  ) : (
                    <input
                      type="number" step="0.5" min="0"
                      value={t.preco}
                      onChange={(e) => setPreco(t.tier, parseFloat(e.target.value) || 0)}
                      className="w-full text-center border rounded-lg px-2 py-1"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERVICOS.map((s) => (
              <tr key={s.chave} className="border-b">
                <td className="py-2 pr-3 text-gray-700">{s.label} <span className="text-gray-400 text-xs">{s.periodo}</span></td>
                {tiers.map((t) => (
                  <td key={t.tier} className="py-2 px-3">
                    <input
                      type="number" min="0"
                      value={t.limites[s.chave] ?? ""}
                      placeholder="sem limite"
                      onChange={(e) => setLimite(t.tier, s.chave, e.target.value)}
                      className="w-full text-center border rounded-lg px-2 py-1 placeholder:text-xs"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
