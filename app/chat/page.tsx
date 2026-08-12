"use client";

// Caminho: C:\valente_conecta\app\chat\page.tsx
// Chat do usuario com o suporte (admin master). Usa o id anonimo por
// dispositivo — nao exige cadastro completo pra conversar.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface Mensagem {
  id: string;
  remetente: "admin" | "usuario";
  texto: string;
  created_at: string;
}

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const usuarioIdRef = useRef<string>("");

  const carregar = async () => {
    const resp = await fetch(`/api/chat?usuarioId=${usuarioIdRef.current}`);
    const resultado = await resp.json();
    if (resultado.success) setMensagens(resultado.data);
  };

  useEffect(() => {
    usuarioIdRef.current = obterUsuarioLocalId();
    carregar().finally(() => setCarregando(false));
    const intervalo = setInterval(carregar, 8000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const textoEnviado = texto.trim();
    setTexto("");
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuarioIdRef.current, texto: textoEnviado }),
      });
      const resultado = await resp.json();
      if (resultado.success) setMensagens((prev) => [...prev, resultado.data]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/ajuda")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg flex-1">💬 Fale com o suporte</h1>
        <button onClick={() => router.push("/minhas-cidades")} className="text-white/90" title="Minhas cidades">
          <MapPin className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col overflow-y-auto">
        {carregando ? (
          <p className="text-gray-500 text-sm text-center mt-8">Carregando conversa...</p>
        ) : mensagens.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">
            Nenhuma mensagem ainda. Manda sua dúvida que a gente responde por aqui.
          </p>
        ) : (
          <div className="space-y-2 flex-1">
            {mensagens.map((m) => (
              <div key={m.id} className={`flex ${m.remetente === "usuario" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.remetente === "usuario"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-800 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {m.texto}
                  <p className={`text-[10px] mt-1 ${m.remetente === "usuario" ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(m.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={fimRef} />
          </div>
        )}
      </main>

      <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
