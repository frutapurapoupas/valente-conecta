"use client";

// Caminho: C:\valente_conecta\app\cdl\login\page.tsx
// Login do representante do CDL — escolhe a cidade, escolhe o nome, digita
// o PIN. Mesmo padrao de acesso ja usado pelo funcionario da Agenda.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import toast from "react-hot-toast";

interface Rep {
  id: string;
  nome: string;
  cidade: string;
}

export default function CdlLoginPage() {
  const router = useRouter();
  const [reps, setReps] = useState<Rep[]>([]);
  const [cidade, setCidade] = useState("");
  const [representanteId, setRepresentanteId] = useState("");
  const [pin, setPin] = useState("");
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    fetch("/api/cdl/representantes")
      .then((r) => r.json())
      .then((res) => res.success && setReps(res.data));
  }, []);

  const cidades = useMemo(() => Array.from(new Set(reps.map((r) => r.cidade))).sort(), [reps]);
  const repsNaCidade = useMemo(() => reps.filter((r) => r.cidade === cidade), [reps, cidade]);

  const entrar = async () => {
    if (!representanteId || !pin) {
      toast.error("Escolha seu nome e digite o PIN");
      return;
    }
    setEntrando(true);
    try {
      const resp = await fetch("/api/cdl/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ representanteId, pin }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      localStorage.setItem("cdl_representante", JSON.stringify(resultado.data));
      router.push("/cdl/painel");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-white font-bold text-lg">Acesso CDL</h1>
        </div>

        <label className="block text-xs text-slate-400 mb-1">Cidade</label>
        <select
          value={cidade}
          onChange={(e) => {
            setCidade(e.target.value);
            setRepresentanteId("");
          }}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm mb-3"
        >
          <option value="">Selecione</option>
          {cidades.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="block text-xs text-slate-400 mb-1">Seu nome</label>
        <select
          value={representanteId}
          onChange={(e) => setRepresentanteId(e.target.value)}
          disabled={!cidade}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm mb-3 disabled:opacity-50"
        >
          <option value="">Selecione</option>
          {repsNaCidade.map((r) => (
            <option key={r.id} value={r.id}>{r.nome}</option>
          ))}
        </select>

        <label className="block text-xs text-slate-400 mb-1">PIN</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm mb-4"
        />

        <button
          onClick={entrar}
          disabled={entrando}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg font-medium text-sm"
        >
          {entrando ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
