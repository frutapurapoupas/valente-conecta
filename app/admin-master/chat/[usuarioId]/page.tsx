"use client";

// Caminho: C:\valente_conecta\app\admin-master\chat\[usuarioId]\page.tsx
// Conversa individual do admin master com um usuario. Ao responder, o
// usuario recebe push avisando.

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

interface Mensagem {
  id: string;
  remetente: "admin" | "usuario";
  texto: string;
  created_at: string;
}

export default function AdminChatConversaPage() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params?.usuarioId as string;
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  const carregar = () =>
    fetch(`/api/admin-master/chat/${usuarioId}`)
      .then((r) => r.json())
      .then((res) => res.success && setMensagens(res.data));

  useEffect(() => {
    carregar().finally(() => setCarregando(false));
    const intervalo = setInterval(carregar, 8000);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const textoEnviado = texto.trim();
    setTexto("");
    try {
      const resp = await fetch(`/api/admin-master/chat/${usuarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoEnviado }),
      });
      const resultado = await resp.json();
      if (resultado.success) setMensagens((prev) => [...prev, resultado.data]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <button onClick={() => router.push("/admin-master/chat")} className="text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-gray-800">Usuário {usuarioId.slice(0, 8)}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {carregando ? (
          <p className="text-gray-400 text-sm text-center mt-8">Carregando...</p>
        ) : (
          <div className="space-y-2 max-w-2xl mx-auto">
            {mensagens.map((m) => (
              <div key={m.id} className={`flex ${m.remetente === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.remetente === "admin"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {m.texto}
                  <p className={`text-[10px] mt-1 ${m.remetente === "admin" ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(m.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={fimRef} />
          </div>
        )}
      </main>

      <div className="border-t bg-white p-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Responder..."
            className="flex-1 border px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
