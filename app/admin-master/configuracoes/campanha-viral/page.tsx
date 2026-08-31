"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\campanha-viral\page.tsx
//
// Meta de população que define ate quando a campanha de lancamento de uma
// cidade fica ativa: enquanto o numero de usuarios cadastrados na cidade
// nao bater essa meta, todo cadastro novo ganha acesso gratuito indefinido
// (ver cadastroSimples em lib/auth.ts e 089_campanha_viral_populacao.sql).
// Conceito separado do bonus por indicação (configuracoes/bonus) — aqui
// nao ha pagamento, so' controla quando o teste grátis deixa de expirar.

import { Rocket, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface StatusCidade {
  cidade: string;
  metaPopulacao: number | null;
  populacaoAtual: number;
  ativa: boolean;
}

export default function ConfiguracoesCampanhaViralPage() {
  const [cidades, setCidades] = useState<StatusCidade[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [metaInput, setMetaInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = () => {
    setLoading(true);
    fetch("/api/admin-master/campanha-viral", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCidades(res.data);
          setCidadeSelecionada((atual) => atual || res.data[0]?.cidade || "");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(carregar, []);

  const cidadeAtual = cidades.find((c) => c.cidade === cidadeSelecionada) || null;

  useEffect(() => {
    setMetaInput(cidadeAtual?.metaPopulacao ? String(cidadeAtual.metaPopulacao) : "");
  }, [cidadeSelecionada]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    const metaPopulacao = parseInt(metaInput, 10);
    if (!cidadeSelecionada || !metaPopulacao || metaPopulacao <= 0) {
      toast.error("Informe uma meta de população válida.");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/admin-master/campanha-viral", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade: cidadeSelecionada, metaPopulacao }),
      });
      const result = await resp.json();
      if (!result?.success) throw new Error(result?.error);
      toast.success(`Meta de população de ${cidadeSelecionada} salva!`);
      carregar();
    } catch (error: any) {
      toast.error(error.message || "Não foi possível salvar a meta.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Rocket size={22} className="text-indigo-600" /> Campanha viral por cidade</h1>
          <p className="text-sm text-gray-500">
            Enquanto a cidade não atinge a meta de população, ninguém tem o acesso cortado por teste vencido. Depois de bater a meta, só novos cadastros voltam a valer a regra normal — aumente a meta pra reabrir a campanha.
          </p>
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
            <option key={c.cidade} value={c.cidade}>{c.cidade}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : cidadeAtual ? (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">População atual cadastrada</p>
              <p className="text-2xl font-bold">{cidadeAtual.populacaoAtual}</p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Meta de população (usuários)</label>
            <input
              type="number"
              min={1}
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              placeholder="Ex: 500"
              className="w-full mt-1 p-2 border rounded-lg font-bold text-indigo-600"
            />
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${cidadeAtual.ativa ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
            {cidadeAtual.metaPopulacao == null ? "Sem meta configurada" : cidadeAtual.ativa ? "Campanha ativa" : "Campanha encerrada"}
          </span>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Selecione uma cidade.</p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        A meta vale só pra novos cadastros: quem já ganhou acesso gratuito enquanto a campanha estava ativa mantém esse acesso mesmo depois que a cidade bater a meta.
      </div>
    </div>
  );
}
