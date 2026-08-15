"use client";

// Caminho: C:\valente_conecta\components\construcao\SolicitarAgendaItem.tsx
//
// Na pagina publica de um item de construcao civil: usuario ve a agenda de
// 60 dias do profissional e solicita um dia livre (ver
// app/api/construcao/agenda/*). Usa obterUsuarioLocalId() como identidade
// do solicitante, mesmo padrao do resto do arquetipo "anuncio-contato".

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, Send, CheckCircle2 } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";
import { AgendaCalendario } from "./AgendaCalendario";

export function SolicitarAgendaItem({ donoId }: { donoId: string }) {
  const [diasOcupados, setDiasOcupados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch(`/api/construcao/agenda/dias?donoId=${donoId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setDiasOcupados(new Set(res.data)); })
      .finally(() => setLoading(false));
  }, [donoId]);

  const enviar = async () => {
    if (!diaSelecionado) return;
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Preencha nome e telefone pra combinar com o profissional.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/construcao/agenda/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donoId,
          solicitanteId: obterUsuarioLocalId(),
          solicitanteNome: nome.trim(),
          solicitanteTelefone: telefone.trim(),
          data: diaSelecionado,
          observacoes: observacoes.trim() || null,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      setEnviado(true);
      toast.success("Pedido enviado! O profissional vai avisar se aceitar.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar pedido");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return null;

  if (enviado) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-800">
            Pedido enviado pra {new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">Você recebe um aviso quando o profissional responder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-blue-600" /> Agendar um dia
      </h3>
      <p className="text-xs text-gray-400 mb-3">Escolha um dia livre nos próximos 60 dias pra solicitar.</p>

      <AgendaCalendario diasOcupados={diasOcupados} modo="escolher" diaSelecionado={diaSelecionado} onSelecionarDia={setDiaSelecionado} />

      {diaSelecionado && (
        <div className="mt-4 space-y-2 bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700">
            Dia escolhido: {new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Seu telefone (75) 9xxxx-xxxx" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Detalhes do serviço (opcional)"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {enviando ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      )}
    </div>
  );
}
