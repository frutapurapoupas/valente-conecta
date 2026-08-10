// app/admin/notificacoes/components/NotificacaoList.tsx

import { Bell } from "lucide-react";
import { Notificacao } from "../types/notificacao.types";
import { NotificacaoCard } from "./NotificacaoCard";

interface NotificacaoListProps {
  notificacoes: Notificacao[];
  notificacoesAtivas: number;
  onToggleAtiva: (id: number | string) => void;
  onEditar: (notificacao: Notificacao) => void;
  onRemover: (id: number | string) => void;
  getAlvoLabel: (notif: Notificacao) => string;
}

export function NotificacaoList({
  notificacoes,
  notificacoesAtivas,
  onToggleAtiva,
  onEditar,
  onRemover,
  getAlvoLabel
}: NotificacaoListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-500" />
        Notificações Publicadas
        {notificacoesAtivas > 0 && (
          <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {notificacoesAtivas} ativas
          </span>
        )}
      </h2>
      
      <div className="space-y-3">
        {notificacoes.map((notif) => (
          <NotificacaoCard
            key={notif.id}
            notificacao={notif}
            onToggleAtiva={onToggleAtiva}
            onEditar={onEditar}
            onRemover={onRemover}
            getAlvoLabel={getAlvoLabel}
          />
        ))}
      </div>
      
      {notificacoes.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Nenhuma notificação cadastrada</p>
          <p className="text-sm text-gray-400">Clique em "Nova Notificação" para começar</p>
        </div>
      )}
    </div>
  );
}

