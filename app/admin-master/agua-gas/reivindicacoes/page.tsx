"use client";

// Caminho: C:\valente_conecta\app\admin-master\agua-gas\reivindicacoes\page.tsx
//
// Fila de "Sou proprietário" pendentes do diretório de Água e Gás. Usa a
// MESMA config de moderação de app/admin-master/comercios/reivindicacoes
// (admin_configuracoes.chave='comercios_moderacao') — mesma decisão de
// negócio (auto/manual), não faz sentido ter dois toggles separados.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, UserCheck, ToggleLeft, ToggleRight } from "lucide-react";

interface Reivindicacao {
  id: string;
  fornecedor: { id: string; nome: string; telefone: string } | null;
  nome_solicitante: string | null;
  telefone_solicitante: string;
  dados_novos: { nome: string; responsavel: string; telefone: string; whatsapp: string; endereco: string; horario: string };
  created_at: string;
}

export default function AguaGasReivindicacoesPage() {
  const [lista, setLista] = useState<Reivindicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(false);
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin-master/agua-gas-reivindicacoes?status=pendente").then((r) => r.json()),
      fetch("/api/admin-master/comercios-moderacao").then((r) => r.json()),
    ]).then(([reivRes, modRes]) => {
      setLista(reivRes.success ? reivRes.data : []);
      if (modRes.success) setAuto(modRes.data.auto);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const alternarAuto = async () => {
    const novo = !auto;
    setAuto(novo);
    await fetch("/api/admin-master/comercios-moderacao", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auto: novo }),
    });
    toast.success(novo ? "Aprovação automática ligada" : "Aprovação automática desligada");
  };

  const processar = async (id: string, acao: "aprovar" | "recusar") => {
    setProcessando(id);
    try {
      const resp = await fetch(`/api/admin-master/agua-gas-reivindicacoes?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Reivindicação aprovada!" : "Reivindicação recusada");
      setLista((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    } finally {
      setProcessando(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <UserCheck className="w-6 h-6 text-blue-600" /> Reivindicações de Água e Gás
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Quando alguém clica "Sou proprietário" num fornecedor importado, a solicitação cai aqui.
      </p>

      <button
        onClick={alternarAuto}
        className={`flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg text-sm font-medium border ${
          auto ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-600"
        }`}
      >
        {auto ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        Aprovação automática: {auto ? "Ligada (aprova na hora)" : "Desligada (revisão manual)"}
      </button>
      <p className="text-xs text-gray-400 -mt-4 mb-6">Esse controle é o mesmo usado em Diretório de Comércios e Saúde.</p>

      {loading ? (
        <p className="text-sm text-gray-400">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhuma reivindicação pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2">
                Solicitado por {r.nome_solicitante || "—"} ({r.telefone_solicitante})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                <p><span className="text-gray-400">Nome:</span> {r.dados_novos.nome}</p>
                <p><span className="text-gray-400">Responsável:</span> {r.dados_novos.responsavel || "—"}</p>
                <p><span className="text-gray-400">Telefone:</span> {r.dados_novos.telefone}</p>
                <p><span className="text-gray-400">WhatsApp:</span> {r.dados_novos.whatsapp}</p>
                <p className="sm:col-span-2"><span className="text-gray-400">Endereço:</span> {r.dados_novos.endereco || "—"}</p>
                <p className="sm:col-span-2"><span className="text-gray-400">Horário:</span> {r.dados_novos.horario || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => processar(r.id, "aprovar")}
                  disabled={processando === r.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(r.id, "recusar")}
                  disabled={processando === r.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
