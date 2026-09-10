// Caminho: C:\valente_conecta\components\ui\ConfirmacaoForte.tsx
//
// Confirmacao visual forte (ver proposta "Modo Valente Facil", kit visual):
// cor cheia + icone grande + frase curta, em vez de um texto pequeno cinza
// tipo "Pedido enviado com sucesso". Generico o bastante pra qualquer tela
// (pedido, cadastro, pagamento...) reaproveitar em vez de reinventar o
// proprio banner de sucesso.

import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmacaoForteProps {
  titulo: string;
  children?: ReactNode;
}

export function ConfirmacaoForte({ titulo, children }: ConfirmacaoForteProps) {
  return (
    <div className="bg-emerald-500 text-white rounded-2xl p-5 flex items-start gap-3 shadow-lg">
      <CheckCircle2 className="w-8 h-8 shrink-0" />
      <div>
        <p className="font-bold text-lg leading-snug">{titulo}</p>
        {children && <div className="text-sm text-white/90 mt-1">{children}</div>}
      </div>
    </div>
  );
}
