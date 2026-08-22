"use client";

// Caminho: C:\valente_conecta\app\agenda\[donoId]\page.tsx
//
// Interface do cliente (camada 1) do modulo Agenda + Fila de Espera Virtual.
// Escolhe o profissional, entra na fila (com nome+telefone, sem precisar de
// login) e acompanha a posicao em tempo real (atualiza sozinho a cada poucos
// segundos). O "ticket" (senha) fica salvo localmente pra reabrir a
// qualquer momento sem perder o lugar na fila.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Users, Clock, CheckCircle2, XCircle, Loader2, Ticket, Bell, User } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface Profissional { id: string; nome: string; especialidade: string | null; foto_url: string | null }
interface Agendamento {
  id: string;
  senha_fila: string;
  status: string;
  posicaoFila: number | null;
  profissional_id: string;
}

export default function AgendaClientePage() {
  const params = useParams();
  const donoId = params?.donoId as string;
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [meuTicket, setMeuTicket] = useState<Agendamento | null>(null);
  const [form, setForm] = useState({ profissionalId: "", nome: "", telefone: "" });
  const [entrando, setEntrando] = useState(false);
  const [pushAtivo, setPushAtivo] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushAtivo(!!sub))
      .catch(() => {});
  }, []);

  const chaveLocal = `agenda_ticket_${donoId}`;

  useEffect(() => {
    fetch(`/api/agenda/profissionais?donoId=${donoId}`)
      .then((r) => r.json())
      .then((res) => setProfissionais(res.success ? res.data : []))
      .finally(() => setLoading(false));

    const ticketSalvo = localStorage.getItem(chaveLocal);
    if (ticketSalvo) buscarMeuTicket(ticketSalvo);
  }, [donoId]);

  const buscarMeuTicket = async (id: string) => {
    const resp = await fetch(`/api/agenda/agendamentos?id=${id}`);
    const resultado = await resp.json();
    if (resultado.success && ["aguardando", "chamado", "em_atendimento"].includes(resultado.data.status)) {
      setMeuTicket(resultado.data);
    } else {
      localStorage.removeItem(chaveLocal);
    }
  };

  // Atualiza a posicao sozinho a cada 5s — "tempo real" sem depender de
  // infraestrutura extra de websocket.
  useEffect(() => {
    if (!meuTicket) return;
    const intervalo = setInterval(() => buscarMeuTicket(meuTicket.id), 5000);
    return () => clearInterval(intervalo);
  }, [meuTicket?.id]);

  const entrarNaFila = async () => {
    if (!form.profissionalId || !form.nome.trim() || !form.telefone.trim()) {
      toast.error("Escolha o profissional e preencha nome e telefone");
      return;
    }
    setEntrando(true);
    try {
      const resp = await fetch("/api/agenda/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donoId,
          profissionalId: form.profissionalId,
          clienteId: obterUsuarioLocalId(),
          clienteNome: form.nome,
          clienteTelefone: form.telefone,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      localStorage.setItem(chaveLocal, resultado.data.id);
      setMeuTicket({ ...resultado.data, posicaoFila: 1 });
      toast.success(`Você entrou na fila! Sua senha: ${resultado.data.senha_fila}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao entrar na fila");
    } finally {
      setEntrando(false);
    }
  };

  const sairDaFila = async () => {
    if (!meuTicket) return;
    await fetch(`/api/agenda/agendamentos?id=${meuTicket.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    });
    localStorage.removeItem(chaveLocal);
    setMeuTicket(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (meuTicket) {
    const statusLabel: Record<string, string> = {
      aguardando: "Aguardando",
      chamado: "É a sua vez! Dirija-se ao atendimento",
      em_atendimento: "Em atendimento",
    };
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-white rounded-2xl shadow p-8">
          <Ticket className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Sua senha</p>
          <p className="text-5xl font-bold text-blue-600 my-2">{meuTicket.senha_fila}</p>
          <p className={`text-sm font-medium mt-4 ${meuTicket.status === "chamado" ? "text-emerald-600 animate-pulse" : "text-gray-600"}`}>
            {statusLabel[meuTicket.status] || meuTicket.status}
          </p>
          {meuTicket.status === "aguardando" && meuTicket.posicaoFila !== null && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Pessoas na sua frente</p>
              <p className="text-3xl font-bold text-blue-700">{Math.max(0, meuTicket.posicaoFila - 1)}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Atualiza sozinho — pode deixar essa tela aberta.</p>
          {!pushAtivo && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 flex items-center justify-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Ative o sino no canto da tela para ser avisado na hora certa.
            </p>
          )}
          {meuTicket.status === "aguardando" && (
            <button onClick={sairDaFila} className="mt-6 text-sm text-red-600 hover:text-red-700">
              Sair da fila
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" /> Entrar na fila
      </h1>
      <p className="text-sm text-gray-500 mb-6">Escolha o profissional e acompanhe sua vez em tempo real, sem precisar esperar no local.</p>

      {profissionais.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhum profissional disponível no momento.</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Escolha o profissional</label>
            <div className="grid grid-cols-2 gap-2">
              {profissionais.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, profissionalId: p.id }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                    form.profissionalId === p.id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                  }`}
                >
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-800 text-center leading-tight">{p.nome}</p>
                  {p.especialidade && <p className="text-xs text-gray-500 text-center leading-tight">{p.especialidade}</p>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
            <input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="(75) 9xxxx-xxxx" />
          </div>
          <button
            onClick={entrarNaFila}
            disabled={entrando}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium flex items-center justify-center gap-2"
          >
            {entrando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            Entrar na fila
          </button>
        </div>
      )}
    </div>
  );
}
