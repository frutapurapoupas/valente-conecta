"use client";

// Caminho: C:\valente_conecta\app\admin-master\chat\page.tsx
// Lista de conversas: uma por usuario_id, ordenada pela mais recente.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MessagesSquare } from "lucide-react";

interface Conversa {
  usuarioId: string;
  ultimaMensagem: string;
  ultimoRemetente: "admin" | "usuario";
  ultimaData: string;
  naoLidas: number;
}

export default function AdminChatListaPage() {
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = () =>
      fetch("/api/admin-master/chat")
        .then((r) => r.json())
        .then((res) => res.success && setConversas(res.data))
        .finally(() => setCarregando(false));
    carregar();
    const intervalo = setInterval(carregar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <MessagesSquare className="w-6 h-6 text-blue-600" /> Chat com usuários
      </h1>
      <p className="text-sm text-gray-500 mb-6">Conversas iniciadas pelos usuários pela Central de Ajuda.</p>

      <div className="bg-white border rounded-lg divide-y">
        {carregando ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : conversas.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhuma conversa ainda.</p>
        ) : (
          conversas.map((c) => (
            <button
              key={c.usuarioId}
              onClick={() => router.push(`/admin-master/chat/${c.usuarioId}`)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Usuário {c.usuarioId.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {c.ultimoRemetente === "admin" ? "Você: " : ""}
                  {c.ultimaMensagem}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-gray-400">
                  {new Date(c.ultimaData).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </span>
                {c.naoLidas > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {c.naoLidas}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
