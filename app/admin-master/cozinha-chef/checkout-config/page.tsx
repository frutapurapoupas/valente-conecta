"use client";

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\checkout-config\page.tsx
//
// Formas de pagamento aceitas no checkout publico + taxa de entrega
// avulsa. Duas configs separadas (cozinha_checkout_config e
// entrega_avulsa_config) reunidas numa tela so' porque sao editadas juntas
// na pratica.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreditCard, Save, Truck } from "lucide-react";

const FORMAS: { id: string; label: string }[] = [
  { id: "mercado_pago", label: "Cartão / Pix (Mercado Pago)" },
  { id: "pix_manual", label: "Pix direto (chave da cozinha)" },
];

export default function CheckoutConfigPage() {
  const [formasAceitas, setFormasAceitas] = useState<string[]>([]);
  const [pixManualChave, setPixManualChave] = useState("");
  const [pixManualNome, setPixManualNome] = useState("");
  const [taxaEntrega, setTaxaEntrega] = useState(5);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/cozinha/checkout-config").then((r) => r.json()),
      fetch("/api/entrega-avulsa/config").then((r) => r.json()),
    ]).then(([checkout, entrega]) => {
      if (checkout.success) {
        setFormasAceitas(checkout.data.formasPagamentoAceitas || []);
        setPixManualChave(checkout.data.pixManualChave || "");
        setPixManualNome(checkout.data.pixManualNome || "");
      }
      if (entrega.success) setTaxaEntrega(Number(entrega.data.taxaEntregaPadrao) || 5);
    }).finally(() => setLoading(false));
  }, []);

  const alternarForma = (id: string) => {
    setFormasAceitas((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/cozinha/checkout-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formasPagamentoAceitas: formasAceitas, pixManualChave, pixManualNome }),
        }).then((r) => r.json()),
        fetch("/api/entrega-avulsa/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxaEntregaPadrao: taxaEntrega }),
        }).then((r) => r.json()),
      ]);
      if (!r1.success || !r2.success) throw new Error(r1.error || r2.error);
      toast.success("Configurações salvas!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Carregando...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Checkout da Cozinha</h1>
        <button onClick={salvar} disabled={salvando} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
          <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Formas de pagamento</h2>
        <div className="space-y-2">
          {FORMAS.map((forma) => (
            <label key={forma.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formasAceitas.includes(forma.id)} onChange={() => alternarForma(forma.id)} />
              {forma.label}
            </label>
          ))}
        </div>
        {formasAceitas.includes("pix_manual") && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <input value={pixManualNome} onChange={(e) => setPixManualNome(e.target.value)} placeholder="Nome do titular da chave Pix" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input value={pixManualChave} onChange={(e) => setPixManualChave(e.target.value)} placeholder="Chave Pix" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Entrega avulsa</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Taxa de entrega</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-400">R$</span>
            <input type="number" step="0.5" min={0} value={taxaEntrega} onChange={(e) => setTaxaEntrega(parseFloat(e.target.value) || 0)} className="w-24 p-1.5 border rounded text-right font-bold text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
