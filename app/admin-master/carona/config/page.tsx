"use client";

// Caminho: C:\valente_conecta\app\admin-master\carona\config\page.tsx
//
// Admin master define as duas taxas da Carona Solidaria: quanto o
// motorista paga pra ter a viagem exibida, e quanto o caronista paga pra
// desbloquear o contato de um motorista numa viagem.

import { useEffect, useState } from "react";
import { Car, Save, Unlock } from "lucide-react";
import toast from "react-hot-toast";

export default function CaronaConfigPage() {
  const [taxaMotorista, setTaxaMotorista] = useState(10);
  const [taxaPassageiro, setTaxaPassageiro] = useState(5);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin-master/carona/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setTaxaMotorista(Number(res.data.taxaMotorista || 0));
          setTaxaPassageiro(Number(res.data.taxaPassageiro || 0));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/carona/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxaMotorista, taxaPassageiro }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Taxas salvas!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Car className="w-6 h-6 text-orange-600" /> Carona Solidária — Taxas</h1>
          <p className="text-sm text-gray-500">Duas cobranças independentes, via Mercado Pago (PIX e demais métodos já configurados).</p>
        </div>
        <button onClick={salvar} disabled={salvando} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="font-semibold text-gray-800 flex items-center gap-2 mb-1"><Car size={16} className="text-orange-500" /> Taxa do motorista</p>
        <p className="text-xs text-gray-500 mb-3">Cobrada do motorista pra viagem aparecer na vitrine pública. Zero desliga a cobrança (viagem publica direto).</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">R$</span>
          <input type="number" step="0.5" min="0" value={taxaMotorista} onChange={(e) => setTaxaMotorista(parseFloat(e.target.value) || 0)} className="w-32 p-2 border rounded-lg text-right font-bold" />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="font-semibold text-gray-800 flex items-center gap-2 mb-1"><Unlock size={16} className="text-emerald-500" /> Taxa do passageiro</p>
        <p className="text-xs text-gray-500 mb-3">Cobrada do caronista pra desbloquear o contato do motorista numa viagem específica. Zero desliga a cobrança (desbloqueia direto).</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">R$</span>
          <input type="number" step="0.5" min="0" value={taxaPassageiro} onChange={(e) => setTaxaPassageiro(parseFloat(e.target.value) || 0)} className="w-32 p-2 border rounded-lg text-right font-bold" />
        </div>
      </div>
    </div>
  );
}
