"use client";

import { useState } from "react";
import { Plus, Save, X, Wallet } from "lucide-react";
import type { Cobranca, Empresa } from "../hooks/useAcademiaMaster";

const STATUS_OPCOES = ["pendente", "pago", "atrasado"];
const STATUS_ESTILO: Record<string, string> = {
  pago: "bg-green-100 text-green-700",
  pendente: "bg-yellow-100 text-yellow-700",
  atrasado: "bg-red-100 text-red-700",
};

const NOVA_VAZIA = { gym_unit_id: "", referencia_mes: new Date().toISOString().slice(0, 7), valor: "", vencimento: "" };

export default function CobrancasTab({
  cobrancas, empresas, marcarCobrancaStatus, criarCobranca,
}: {
  cobrancas: Cobranca[];
  empresas: Empresa[];
  marcarCobrancaStatus: (cobrancaId: string, status: string) => Promise<void>;
  criarCobranca: (payload: { gym_unit_id: string; referencia_mes: string; valor: number; vencimento: string }) => Promise<void>;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [nova, setNova] = useState(NOVA_VAZIA);

  const nomeEmpresa = (id: string) => empresas.find((e) => e.id === id)?.nome || id;

  const handleCriar = async () => {
    if (!nova.gym_unit_id || !nova.referencia_mes || !nova.valor || !nova.vencimento) return;
    setSalvando(true);
    try {
      await criarCobranca({ gym_unit_id: nova.gym_unit_id, referencia_mes: nova.referencia_mes, valor: Number(nova.valor), vencimento: nova.vencimento });
      setNova(NOVA_VAZIA);
      setMostrarForm(false);
    } finally {
      setSalvando(false);
    }
  };

  const handleStatus = async (cobrancaId: string, status: string) => {
    setBusy(cobrancaId);
    try { await marcarCobrancaStatus(cobrancaId, status); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Cobranças das academias</h2>
        <button onClick={() => setMostrarForm((v) => !v)} className="text-sm px-3 py-1.5 rounded bg-slate-800 text-white flex items-center gap-1">
          {mostrarForm ? <X size={13} /> : <Plus size={13} />} {mostrarForm ? "Cancelar" : "Gerar cobrança"}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <select value={nova.gym_unit_id} onChange={(e) => setNova({ ...nova, gym_unit_id: e.target.value })} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Selecione a academia *</option>
            {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <input type="month" value={nova.referencia_mes} onChange={(e) => setNova({ ...nova, referencia_mes: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <input type="number" step="0.01" placeholder="Valor (R$) *" value={nova.valor} onChange={(e) => setNova({ ...nova, valor: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <input type="date" value={nova.vencimento} onChange={(e) => setNova({ ...nova, vencimento: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
          <button onClick={handleCriar} disabled={salvando} className="md:col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Save size={14} /> {salvando ? "Gerando..." : "Gerar cobrança"}
          </button>
        </div>
      )}

      {cobrancas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Wallet className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma cobrança gerada ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cobrancas.map((c) => (
            <div key={c.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-3 md:justify-between bg-white">
              <div>
                <p className="text-sm font-semibold text-gray-800">{nomeEmpresa(c.gym_unit_id)} — {c.referencia_mes}</p>
                <p className="text-sm text-gray-600">R$ {Number(c.valor).toFixed(2)} · vencimento {new Date(c.vencimento).toLocaleDateString()}</p>
              </div>
              <select
                value={c.status}
                onChange={(e) => handleStatus(c.id, e.target.value)}
                disabled={busy === c.id}
                className={`text-sm px-2 py-1 rounded border ${STATUS_ESTILO[c.status] || ""}`}
              >
                {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
