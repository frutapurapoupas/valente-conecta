"use client";

// Caminho: C:\valente_conecta\components\construcao\AgendaConstrucaoTab.tsx
//
// Aba "Agenda" do profissional de construcao civil dentro do LojaAdminShell:
// marca dias ocupados nos proximos 60 dias + aceita/recusa pedidos de
// agendamento recebidos (ver app/api/construcao/agenda/*).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, Check, X, Clock } from "lucide-react";
import { AgendaCalendario } from "./AgendaCalendario";

interface Solicitacao {
  id: string;
  solicitante_nome: string;
  solicitante_telefone: string;
  data: string;
  observacoes: string | null;
  status: "pendente" | "aceito" | "recusado";
  created_at: string;
}

export function AgendaConstrucaoTab({ donoId }: { donoId: string }) {
  const [diasOcupados, setDiasOcupados] = useState<Set<string>>(new Set());
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [diasResp, solResp] = await Promise.all([
      fetch(`/api/construcao/agenda/dias?donoId=${donoId}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/construcao/agenda/solicitacoes?donoId=${donoId}`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    if (diasResp.success) setDiasOcupados(new Set(diasResp.data));
    if (solResp.success) setSolicitacoes(solResp.data);
    setLoading(false);
  };

  useEffect(() => {
    if (donoId) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donoId]);

  const alternarDia = async (data: string) => {
    const ocupado = diasOcupados.has(data);
    const novos = new Set(diasOcupados);
    if (ocupado) {
      novos.delete(data);
      await fetch(`/api/construcao/agenda/dias?donoId=${donoId}&data=${data}`, { method: "DELETE" });
    } else {
      novos.add(data);
      await fetch("/api/construcao/agenda/dias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId, data }),
      });
    }
    setDiasOcupados(novos);
  };

  const responder = async (id: string, status: "aceito" | "recusado") => {
    try {
      const resp = await fetch(`/api/construcao/agenda/solicitacoes?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(status === "aceito" ? "Agendamento aceito!" : "Agendamento recusado.");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao responder");
    }
  };

  const pendentes = solicitacoes.filter((s) => s.status === "pendente");
  const respondidas = solicitacoes.filter((s) => s.status !== "pendente");

  if (loading) return <p className="text-gray-400 text-sm">Carregando...</p>;

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Pedidos pendentes ({pendentes.length})
          </h3>
          <div className="space-y-2">
            {pendentes.map((s) => (
              <div key={s.id} className="bg-white border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{s.solicitante_nome}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(s.data + "T00:00:00").toLocaleDateString("pt-BR")} · {s.solicitante_telefone}
                    </p>
                    {s.observacoes && <p className="text-xs text-gray-400 mt-1">{s.observacoes}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => responder(s.id, "aceito")} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Aceitar">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => responder(s.id, "recusado")} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Recusar">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-500" /> Sua agenda (próximos 60 dias)
        </h3>
        <p className="text-xs text-gray-400 mb-3">Clique num dia pra marcar como ocupado, ou de novo pra liberar.</p>
        <AgendaCalendario diasOcupados={diasOcupados} modo="editar" onToggleDia={alternarDia} />
      </div>

      {respondidas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Histórico</h3>
          <div className="space-y-1.5">
            {respondidas.slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b pb-1.5">
                <span className="text-gray-600">{s.solicitante_nome} · {new Date(s.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                <span className={s.status === "aceito" ? "text-emerald-600 text-xs font-medium" : "text-red-500 text-xs font-medium"}>
                  {s.status === "aceito" ? "Aceito" : "Recusado"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
