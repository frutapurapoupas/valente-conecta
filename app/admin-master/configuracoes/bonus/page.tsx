"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\bonus\page.tsx
//
// Bonus por indicacao agora e' por cidade (antes era um unico documento
// global) e pago automaticamente em Moeda Conecta assim que o usuario bate
// a meta de um lote — nao existe mais campo de PIX minimo aqui, porque o
// credito nao depende de solicitacao. Ver 036_bonus_indicacao_e_compensacao.sql
// e referral_processar_bonus_v1.

import { Briefcase, Building, Coins, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";

interface BonusConfig {
  categoria: string;
  nome: string;
  bonus: number;
  meta: number;
  ativo: boolean;
  descricao?: string;
}

const ICONES: Record<string, any> = {
  usuarios_gerais: Users,
  empresas_lojas: Building,
  profissionais_liberais: Briefcase,
};

export default function ConfiguracoesBonusPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [bonus, setBonus] = useState<BonusConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setAdmin(getCurrentUser());
    fetch("/api/admin-master/referrals/config-cidades", { cache: "no-store" })
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
    fetch(`/api/admin-master/referrals/config-cidades?cidade=${encodeURIComponent(cidadeSelecionada)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setBonus(res.data.rules))
      .finally(() => setLoading(false));
  }, [cidadeSelecionada]);

  const handleSave = async () => {
    if (!cidadeSelecionada) return;
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/referrals/config-cidades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade: cidadeSelecionada, rules: bonus, adminId: admin?.id }),
      });
      const result = await resp.json();
      if (!result?.success) throw new Error(result?.error);
      toast.success(`Configuração de bônus de ${cidadeSelecionada} salva!`);
    } catch (error: any) {
      toast.error(error.message || "Não foi possível salvar as configurações.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggle = (categoria: string) => {
    setBonus(bonus.map((b) => (b.categoria === categoria ? { ...b, ativo: !b.ativo } : b)));
  };

  const handleBonusChange = (categoria: string, valor: number) => {
    setBonus(bonus.map((b) => (b.categoria === categoria ? { ...b, bonus: valor } : b)));
  };

  const handleMetaChange = (categoria: string, valor: number) => {
    setBonus(bonus.map((b) => (b.categoria === categoria ? { ...b, meta: valor } : b)));
  };

  const totalPorLote = bonus.reduce((acc, b) => acc + (b.ativo ? b.bonus : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bônus por indicação</h1>
          <p className="text-sm text-gray-500">Critérios por cidade — pago automaticamente em Moeda Conecta ao bater a meta do lote.</p>
        </div>
        <button onClick={handleSave} disabled={salvando || !cidadeSelecionada} className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
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

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonus.map((b) => {
              const Icon = ICONES[b.categoria] || Users;
              return (
                <div key={b.categoria} className={`bg-white rounded-xl p-4 shadow-sm border ${b.ativo ? "border-gray-200" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-center gap-3 mb-3"><Icon size={24} className="text-indigo-600" /><h3 className="font-bold text-lg">{b.nome}</h3></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Valor do lote</span>
                    <input type="number" value={b.bonus} onChange={(e) => handleBonusChange(b.categoria, parseFloat(e.target.value) || 0)} className="w-24 p-1 border rounded text-right font-bold text-green-600" step="0.5" />
                    <span className="text-sm">Moeda Conecta</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Quantidade por lote</span>
                    <input type="number" value={b.meta} onChange={(e) => handleMetaChange(b.categoria, parseInt(e.target.value, 10) || 0)} className="w-24 p-1 border rounded text-right font-bold text-indigo-600" step="1" />
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{b.descricao}</p>
                  <button onClick={() => handleToggle(b.categoria)} className={`w-full py-1 rounded-lg text-sm font-semibold ${b.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    {b.ativo ? "Ativo" : "Inativo"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2"><Coins size={18} className="text-indigo-600" /> Total por lote fechado em {cidadeSelecionada || "—"} (todos ativos)</span>
            <span className="text-2xl font-bold text-indigo-600">{totalPorLote.toFixed(2)} MC</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Assim que o usuário completa um lote (quantidade indicada acima), o valor é creditado automaticamente na Moeda Conecta dele — utilizável em qualquer estabelecimento da cidade base. Não há mais solicitação manual de PIX para este bônus.
          </div>
        </>
      )}
    </div>
  );
}
