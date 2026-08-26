"use client";

// Caminho: C:\valente_conecta\app\admin-master\comercios\reivindicacoes\page.tsx
//
// Fila de "Sou proprietário" pendentes de revisão + liga/desliga aprovação
// automática (056_comercios_diretorio.sql).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, UserCheck, ToggleLeft, ToggleRight } from "lucide-react";

interface Reivindicacao {
  id: string;
  comercio: { id: string; nome: string; modulo: string; categoria: string; telefone: string } | null;
  nome_solicitante: string | null;
  telefone_solicitante: string;
  dados_novos: { nome: string; telefone: string; whatsapp: string; endereco: string; horario: string; categoria: string };
  created_at: string;
}

export default function ComerciosReivindicacoesPage() {
  const [lista, setLista] = useState<Reivindicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(false);
  const [processando, setProcessando] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin-master/comercios-reivindicacoes?status=pendente").then((r) => r.json()),
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
      const resp = await fetch(`/api/admin-master/comercios-reivindicacoes?id=${id}`, {
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
        <UserCheck className="w-6 h-6 text-blue-600" /> Reivindicações de Comércio
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Quando alguém clica "Sou proprietário" num comércio importado, a solicitação cai aqui pra revisão.
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

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhuma reivindicação pendente.</div>
      ) : (
        <div className="space-y-3">
          {lista.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">
                {r.comercio?.modulo} · {r.comercio?.categoria} · solicitado por {r.nome_solicitante || "—"} ({r.telefone_solicitante})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                <p><span className="text-gray-500">Nome:</span> {r.dados_novos.nome}</p>
                <p><span className="text-gray-500">Categoria:</span> {r.dados_novos.categoria}</p>
                <p><span className="text-gray-500">Telefone:</span> {r.dados_novos.telefone}</p>
                <p><span className="text-gray-500">WhatsApp:</span> {r.dados_novos.whatsapp}</p>
                <p className="sm:col-span-2"><span className="text-gray-500">Endereço:</span> {r.dados_novos.endereco || "—"}</p>
                <p className="sm:col-span-2"><span className="text-gray-500">Horário:</span> {r.dados_novos.horario || "—"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => processar(r.id, "aprovar")}
                  disabled={processando === r.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => processar(r.id, "recusar")}
                  disabled={processando === r.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium disabled:opacity-60"
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
