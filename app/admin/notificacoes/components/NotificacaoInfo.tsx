// app/admin/notificacoes/components/NotificacaoInfo.tsx

import { Database } from "lucide-react";

interface NotificacaoInfoProps {
  modoTeste: boolean;
}

export function NotificacaoInfo({ modoTeste }: NotificacaoInfoProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
      <div className="flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-800">📡 Status dos canais de comunicação:</p>
          <ul className="text-xs text-gray-600 mt-2 space-y-1">
            <li>• <strong>Telegram</strong>: ✅ Bot @valenteconecta_bot ativo e funcionando</li>
            <li>• <strong>Push Notification</strong>: ⚠️ Necessário ativar permissão no navegador</li>
            <li>• <strong>Popup única vez</strong>: ✅ Cada usuário vê apenas uma vez</li>
            <li>• <strong>Segmentação</strong>: ✅ Envio para grupos específicos ou usuário individual</li>
            <li>• <strong>Modo Teste</strong>: {modoTeste ? '✅ ATIVADO - Notificações vão apenas para grupo de teste' : '❌ DESATIVADO - Notificações vão para todos'}</li>
            <li>• As notificações ativas aparecem no card abaixo do "Indique e Ganhe" na Home</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

