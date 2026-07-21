// app/admin/notificacoes/components/NotificacaoCard.tsx

import { Calendar, MessageCircle, Smartphone, Globe, CheckCircle, Edit2, Trash2, X } from "lucide-react";
import { Notificacao, Importancia, TipoNotificacao } from "../types/notificacao.types";

interface NotificacaoCardProps {
  notificacao: Notificacao;
  onToggleAtiva: (id: number | string) => void;
  onEditar: (notificacao: Notificacao) => void;
  onRemover: (id: number | string) => void;
  getAlvoLabel: (notif: Notificacao) => string;
}

export function NotificacaoCard({ 
  notificacao, 
  onToggleAtiva, 
  onEditar, 
  onRemover,
  getAlvoLabel 
}: NotificacaoCardProps) {
  const getImportanciaCor = (importancia: Importancia): string => {
    if (importancia === "alta") return "border-l-4 border-l-red-500 bg-red-50";
    if (importancia === "media") return "border-l-4 border-l-yellow-500 bg-yellow-50";
    return "border-l-4 border-l-blue-500 bg-blue-50";
  };

  const getImportanciaBadge = (importancia: Importancia): string => {
    if (importancia === "alta") return "bg-red-100 text-red-700";
    if (importancia === "media") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const getTipoIcone = (tipo: TipoNotificacao): string => {
    switch (tipo) {
      case "alerta": return "âš ï¸";
      case "sucesso": return "âœ…";
      case "promocao": return "ðŸŽ";
      case "info": return "â„¹ï¸";
      default: return "ðŸ“¢";
    }
  };

  return (
    <div className={`p-4 rounded-xl ${getImportanciaCor(notificacao.importancia)} border`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{getTipoIcone(notificacao.tipo)}</span>
            <h3 className="font-bold text-gray-800">{notificacao.titulo}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getImportanciaBadge(notificacao.importancia)}`}>
              {notificacao.importancia === "alta" ? "ðŸ”´ Urgente" : 
               notificacao.importancia === "media" ? "âš ï¸ Importante" : "ðŸ“˜ Informativo"}
            </span>
            {!notificacao.ativa && (
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Inativa</span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{notificacao.mensagem}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {notificacao.data}
            </p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              {getAlvoLabel(notificacao)}
            </span>
            {notificacao.enviar_telegram && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Telegram
              </span>
            )}
            {notificacao.enviar_push && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Push
              </span>
            )}
            {notificacao.exibida_uma_vez && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> Popup 1x
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleAtiva(notificacao.id)}
            className={`p-2 rounded-lg transition-all ${
              notificacao.ativa ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
            }`}
            title={notificacao.ativa ? "Desativar" : "Ativar"}
          >
            {notificacao.ativa ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEditar(notificacao)}
            className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemover(notificacao.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

