"use client";

// Caminho: C:\valente_conecta\app\catalogo\avaliar\[interesseId]\page.tsx
//
// Comprador avalia (até 5 estrelas + comentário opcional) um interesse já
// concluído pelo lojista — aberta pelo link da notificação push disparada
// em app/api/catalogo/interesses/[id]/concluir. Mesmo padrão de
// app/cozinha/pedido/[id]/avaliar/page.tsx.

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AvaliarInteressePage() {
  const params = useParams();
  const router = useRouter();
  const interesseId = String(params?.interesseId || "");

  const [estrelaSelecionada, setEstrelaSelecionada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviarAvaliacao = async () => {
    if (estrelaSelecionada === 0) {
      toast.error("Toque numa estrela pra avaliar.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch(`/api/catalogo/interesses/${interesseId}/avaliar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estrelas: estrelaSelecionada, comentario: comentario.trim() || undefined }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      setEnviado(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar avaliação");
    } finally {
      setEnviando(false);
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
        <p className="text-gray-500 text-sm mb-6">Isso ajuda outras pessoas da região a escolher bem.</p>
        <button onClick={() => router.push("/")} className="text-blue-600 font-medium text-sm">Voltar pro início</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <Toaster position="top-center" />
      <h1 className="text-xl font-bold text-gray-800 mb-2">Como foi sua experiência?</h1>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">Toque nas estrelas pra avaliar a loja/serviço.</p>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setEstrelaSelecionada(n)} disabled={enviando}>
            <Star className={`w-10 h-10 transition-colors ${n <= estrelaSelecionada ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`} />
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Comentário (opcional)"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <button
          onClick={enviarAvaliacao}
          disabled={enviando}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </div>
  );
}
