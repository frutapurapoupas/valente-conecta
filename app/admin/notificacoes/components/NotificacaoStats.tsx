// app/admin/notificacoes/components/NotificacaoStats.tsx

import { Notificacao } from "../types/notificacao.types";

interface NotificacaoStatsProps {
  notificacoes: Notificacao[];
  notificacoesAtivas: number;
}

export function NotificacaoStats({ notificacoes, notificacoesAtivas }: NotificacaoStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white text-center">
        <p className="text-2xl font-bold">{notificacoes.length}</p>
        <p className="text-sm opacity-90">Total</p>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
        <p className="text-2xl font-bold">{notificacoesAtivas}</p>
        <p className="text-sm opacity-90">Ativas</p>
      </div>
      <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 text-white text-center">
        <p className="text-2xl font-bold">{notificacoes.filter(n => n.importancia === "alta").length}</p>
        <p className="text-sm opacity-90">Urgentes</p>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
        <p className="text-2xl font-bold">{notificacoes.filter(n => n.enviar_telegram).length}</p>
        <p className="text-sm opacity-90">Via Telegram</p>
      </div>
    </div>
  );
}

