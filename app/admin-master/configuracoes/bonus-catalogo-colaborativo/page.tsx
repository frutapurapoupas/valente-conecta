"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\bonus-catalogo-colaborativo\page.tsx
//
// Bonus por cidade pra quem cadastra produto NOVO (EAN inedito ou SKU novo
// sem EAN) no catalogo colaborativo do PDV, pago automaticamente em Moeda
// Conecta ao bater a meta do lote — mas so' conta produtos APROVADOS na
// fila de moderacao (/admin-master/pdv-catalogo/moderacao), nao cadastros
// brutos. Ver 086_catalogo_colaborativo_bonus_moderacao.sql.

import { Coins, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface BonusConfig {
  cidade: string;
  bonus: number;
  meta: number;
  ativo: boolean;
  descricao?: string;
}

export default function BonusCatalogoColaborativoPage() {
  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [config, setConfig] = useState<BonusConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin-master/catalogo-colaborativo/bonus-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCidades(res.data);
          if (res.data.length > 0) setCidadeSelecionada(res.data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cidadeSelecionada) return;
    setLoading(true);
    fetch(`/api/admin-master/catalogo-colaborativo/bonus-config?cidade=${encodeURIComponent(cidadeSelecionada)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setConfig(res.data))
      .finally(() => setLoading(false));
  }, [cidadeSelecionada]);

  const handleSave = async () => {
    if (!cidadeSelecionada || !config) return;
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/catalogo-colaborativo/bonus-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, cidade: cidadeSelecionada }),
      });
      const result = await resp.json();
      if (!result?.success) throw new Error(result?.error);
      toast.success(`Configuração de ${cidadeSelecionada} salva!`);
    } catch (error: any) {
      toast.error(error.message || "Não foi possível salvar as configurações.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bônus catálogo colaborativo</h1>
          <p className="text-sm text-gray-500">Por produto novo (EAN ou SKU) aprovado, pago automaticamente em Moeda Conecta ao bater a meta do lote.</p>
        </div>
        <button onClick={handleSave} disabled={salvando || !cidadeSelecionada || !config} className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div>
        <label className="text-sm text-gray-600">Cidade</label>
        <select
          value={cidadeSelecionada}
          onChange={(e) => setCidadeSelecionada(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          {cidades.length === 0 && <option value="">Nenhuma cidade com usuários ainda</option>}
          {cidades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading || !config ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3"><Package size={24} className="text-indigo-600" /><h3 className="font-bold text-lg">Produto novo cadastrado</h3></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Valor do lote</span>
              <input type="number" value={config.bonus} onChange={(e) => setConfig({ ...config, bonus: parseFloat(e.target.value) || 0 })} className="w-24 p-1 border rounded text-right font-bold text-green-600" step="0.5" />
              <span className="text-sm">Moeda Conecta</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Produtos aprovados por lote</span>
              <input type="number" value={config.meta} onChange={(e) => setConfig({ ...config, meta: parseInt(e.target.value, 10) || 1 })} className="w-24 p-1 border rounded text-right font-bold text-indigo-600" step="1" />
            </div>
            <button onClick={() => setConfig({ ...config, ativo: !config.ativo })} className={`w-full py-1 rounded-lg text-sm font-semibold ${config.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
              {config.ativo ? "Ativo" : "Inativo"}
            </button>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2"><Coins size={18} className="text-indigo-600" /> Por lote fechado em {cidadeSelecionada || "—"}</span>
            <span className="text-2xl font-bold text-indigo-600">{config.ativo ? config.bonus.toFixed(2) : "0.00"} MC</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            A contagem é de produtos <strong>aprovados</strong> na fila de moderação (foto do código de barras), não de cadastros brutos — veja
            "Moderação — Catálogo Colaborativo" no menu PDV COLABORATIVO. Campanha sem prazo fixo: desative aqui quando a base da cidade estiver completa.
          </div>
        </>
      )}
    </div>
  );
}
