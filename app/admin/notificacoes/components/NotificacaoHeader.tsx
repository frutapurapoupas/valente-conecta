// app/admin/notificacoes/components/NotificacaoHeader.tsx

import { Bell, Plus, ArrowLeft, TestTube } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificacaoHeaderProps {
  modoTeste: boolean;
  onNovaNotificacao: () => void;
}

export function NotificacaoHeader({ modoTeste, onNovaNotificacao }: NotificacaoHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Bell className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">ðŸ“¢ Comunicados Oficiais</h1>
      </div>
      <div className="flex items-center gap-2">
        {modoTeste && (
          <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <TestTube className="w-3 h-3" /> MODO TESTE
          </span>
        )}
        <button 
          onClick={onNovaNotificacao}
          className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova NotificaÃ§Ã£o
        </button>
      </div>
    </header>
  );
}

