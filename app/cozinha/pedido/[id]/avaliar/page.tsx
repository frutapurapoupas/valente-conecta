"use client";

// Caminho: C:\valente_conecta\app\cozinha\pedido\[id]\avaliar\page.tsx
//
// Pesquisa de satisfacao: 5 estrelas clicaveis. 1-4 abre modal simples
// pedindo o motivo antes de salvar; 5 salva direto. Acessivel tanto pelo
// botao "Avaliar pedido" (assim que entregue) quanto pelo link mandado no
// push do job de 1h depois (app/api/cozinha/cron/pesquisa-satisfacao).

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AvaliarPedidoPage() {
  const params = useParams();
  const router = useRouter();
  const pedidoId = String(params?.id || "");

  const [estrelaSelecionada, setEstrelaSelecionada] = useState(0);
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviarAvaliacao = async (estrelas: number, motivoTexto?: string) => {
    setEnviando(true);
    try {
      const resp = await fetch("/api/cozinha/pedidos/avaliar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId, estrelas, motivo: motivoTexto || undefined }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      setEnviado(true);
      setMostrarModalMotivo(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar avaliação");
    } finally {
      setEnviando(false);
    }
  };

  const clicarEstrela = (estrelas: number) => {
    setEstrelaSelecionada(estrelas);
    if (estrelas === 5) {
      enviarAvaliacao(5);
    } else {
      setMostrarModalMotivo(true);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <Toaster position="top-center" />
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={`w-8 h-8 ${n <= estrelaSelecionada ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
          ))}
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Obrigado pela avaliação!</h1>
        <p className="text-gray-500 text-sm mb-6">Isso ajuda a Chef Neide a melhorar cada vez mais.</p>
        <button onClick={() => router.push(`/cozinha/pedido/${pedidoId}`)} className="text-orange-600 font-medium text-sm">
          Voltar pro meu pedido
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <Toaster position="top-center" />
      <h1 className="text-xl font-bold text-gray-800 mb-2">Como foi seu pedido?</h1>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">Toque nas estrelas pra avaliar.</p>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => clicarEstrela(n)} disabled={enviando}>
            <Star className={`w-10 h-10 transition-colors ${n <= estrelaSelecionada ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
          </button>
        ))}
      </div>

      {mostrarModalMotivo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800">O que podemos melhorar?</h2>
              <button onClick={() => { setMostrarModalMotivo(false); setEstrelaSelecionada(0); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Conta pra gente o que não ficou legal — a Chef Neide lê pessoalmente cada avaliação.</p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escreva aqui..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
              autoFocus
            />
            <button
              onClick={() => enviarAvaliacao(estrelaSelecionada, motivo.trim())}
              disabled={enviando}
              className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
