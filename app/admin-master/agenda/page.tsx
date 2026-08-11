"use client";

// Caminho: C:\valente_conecta\app\admin-master\agenda\page.tsx
// Admin master libera/revoga o módulo Agenda + Fila de Espera por loja —
// gratuito ou pago, a critério dele.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, CheckCircle2, Clock, Gift, DollarSign, ShieldCheck, ChevronDown, ChevronUp, XCircle, Loader2 } from "lucide-react";

interface Habilitacao {
  id: string;
  dono_id: string;
  ativo: boolean;
  gratuito: boolean;
  exige_cadastro_previo: boolean;
  solicitado_em: string;
  liberado_em: string | null;
}

interface Agendamento {
  id: string;
  senha_fila: string;
  cliente_nome: string;
  cliente_telefone: string;
  status: string;
  data: string;
}

export default function AdminAgendaPage() {
  const [itens, setItens] = useState<Habilitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  const carregar = () => {
    fetch("/api/admin-master/agenda")
      .then((r) => r.json())
      .then((res) => setItens(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const atualizar = async (id: string, patch: Partial<Habilitacao>) => {
    const resp = await fetch(`/api/admin-master/agenda?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const resultado = await resp.json();
    if (!resultado.success) {
      toast.error("Erro ao atualizar");
      return;
    }
    toast.success("Atualizado!");
    carregar();
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <CalendarClock className="w-6 h-6 text-blue-600" /> Módulo Agenda + Fila de Espera
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Fila virtual com posição em tempo real e equipe com PIN próprio. Opcional por loja — libere grátis ou cobrando.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : itens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhuma solicitação ainda.</div>
      ) : (
        <div className="space-y-2">
          {itens.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">Loja {item.dono_id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">
                  Solicitado em {new Date(item.solicitado_em).toLocaleString("pt-BR")}
                  {item.liberado_em && ` · Liberado em ${new Date(item.liberado_em).toLocaleString("pt-BR")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {item.ativo && (
                  <>
                    <button
                      onClick={() => atualizar(item.id, { gratuito: !item.gratuito })}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium ${item.gratuito ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {item.gratuito ? <Gift className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                      {item.gratuito ? "Gratuito" : "Pago"}
                    </button>
                    <button
                      onClick={() => atualizar(item.id, { exige_cadastro_previo: !item.exige_cadastro_previo })}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium ${item.exige_cadastro_previo ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                      title="Exige que o paciente já tenha sido cadastrado presencialmente na loja"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {item.exige_cadastro_previo ? "Exige cadastro presencial" : "Sem exigência de cadastro"}
                    </button>
                  </>
                )}
                {item.ativo ? (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Liberado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Pendente
                  </span>
                )}
                <button
                  onClick={() => atualizar(item.id, { ativo: !item.ativo })}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${item.ativo ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {item.ativo ? "Revogar" : "Liberar"}
                </button>
                {item.ativo && (
                  <button
                    onClick={() => setExpandido(expandido === item.dono_id ? null : item.dono_id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700"
                  >
                    {expandido === item.dono_id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Fila de hoje
                  </button>
                )}
              </div>
              {expandido === item.dono_id && <FilaDaLoja donoId={item.dono_id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilaDaLoja({ donoId }: { donoId: string }) {
  const [fila, setFila] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    fetch(`/api/agenda/agendamentos?donoId=${donoId}`)
      .then((r) => r.json())
      .then((res) => setFila(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [donoId]);

  const cancelar = async (id: string) => {
    await fetch(`/api/agenda/agendamentos?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    });
    carregar();
  };

  if (loading) return <div className="mt-3 flex justify-center py-6"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;

  const ativos = fila.filter((f) => !["cancelado", "faltou"].includes(f.status));

  return (
    <div className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
      {ativos.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-3">Nenhum atendimento hoje.</p>
      ) : (
        <div className="space-y-1.5">
          {ativos.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100">
              <div className="text-xs">
                <span className="font-bold">{f.senha_fila}</span> · {f.cliente_nome}
                <span className="ml-2 text-gray-400">{f.status}</span>
              </div>
              <button onClick={() => cancelar(f.id)} className="text-red-500 hover:text-red-700" title="Cancelar atendimento">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
