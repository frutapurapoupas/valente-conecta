// Caminho: C:\valente_conecta\components\avaliacao\SeloValidado.tsx
//
// Selo "Validado pelo Valente Conecta" — só aparece quando `validado` é
// realmente true, refletindo uma aprovação de verdade do admin master
// (perfis_fornecedor.validacao_status / mototaxi_motoristas.validacao_status /
// carona_motoristas.validacao_status, ver 094 e 097). Sem selo negativo:
// ausência de validação simplesmente não renderiza nada.

import { ShieldCheck } from "lucide-react";

interface Props {
  validado: boolean;
}

export function SeloValidado({ validado }: Props) {
  if (!validado) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <ShieldCheck className="w-3.5 h-3.5" /> Validado pelo Valente Conecta
    </span>
  );
}
