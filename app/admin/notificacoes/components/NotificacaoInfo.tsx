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
          <p className="text-sm font-medium text-gray-800">ðŸ“¡ Status dos canais de comunicaÃ§Ã£o:</p>
          <ul className="text-xs text-gray-600 mt-2 space-y-1">
            <li>â€¢ <strong>Telegram</strong>: âœ… Bot @valenteconecta_bot ativo e funcionando</li>
            <li>â€¢ <strong>Push Notification</strong>: âš ï¸ NecessÃ¡rio ativar permissÃ£o no navegador</li>
            <li>â€¢ <strong>Popup Ãºnica vez</strong>: âœ… Cada usuÃ¡rio vÃª apenas uma vez</li>
            <li>â€¢ <strong>SegmentaÃ§Ã£o</strong>: âœ… Envio para grupos especÃ­ficos ou usuÃ¡rio individual</li>
            <li>â€¢ <strong>Modo Teste</strong>: {modoTeste ? 'âœ… ATIVADO - NotificaÃ§Ãµes vÃ£o apenas para grupo de teste' : 'âŒ DESATIVADO - NotificaÃ§Ãµes vÃ£o para todos'}</li>
            <li>â€¢ As notificaÃ§Ãµes ativas aparecem no card abaixo do "Indique e Ganhe" na Home</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

