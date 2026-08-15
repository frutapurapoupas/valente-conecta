"use client";

// Caminho: C:\valente_conecta\components\catalogo\HorarioSemanaEditor.tsx
//
// Editor do horario semanal de funcionamento, usado dentro do formulario
// de perfil do fornecedor (LojaAdminShell). Um dia so' entra no horario
// salvo se estiver marcado como ativo — dias desmarcados nao contam pro
// calculo de "aberto agora" (ver lib/catalogo/horarios.ts).

import { DIAS_SEMANA } from "@/lib/catalogo/horarios";
import type { HorarioDia } from "@/lib/catalogo/marketplaceTypes";

interface Props {
  horarios: HorarioDia[];
  onChange: (horarios: HorarioDia[]) => void;
}

export function HorarioSemanaEditor({ horarios, onChange }: Props) {
  const atualizarDia = (dia: number, patch: Partial<HorarioDia>) => {
    onChange(horarios.map((h) => (h.dia === dia ? { ...h, ...patch } : h)));
  };

  return (
    <div className="space-y-2">
      {horarios.map((h) => (
        <div key={h.dia} className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 w-28 shrink-0">
            <input
              type="checkbox"
              checked={h.ativo}
              onChange={(e) => atualizarDia(h.dia, { ativo: e.target.checked })}
              className="rounded"
            />
            <span className={h.ativo ? "text-gray-800" : "text-gray-400"}>{DIAS_SEMANA[h.dia]}</span>
          </label>
          <input
            type="time"
            value={h.abre}
            onChange={(e) => atualizarDia(h.dia, { abre: e.target.value })}
            disabled={!h.ativo}
            className="px-2 py-1 border rounded-lg disabled:opacity-40 disabled:bg-gray-50"
          />
          <span className="text-gray-400">às</span>
          <input
            type="time"
            value={h.fecha}
            onChange={(e) => atualizarDia(h.dia, { fecha: e.target.value })}
            disabled={!h.ativo}
            className="px-2 py-1 border rounded-lg disabled:opacity-40 disabled:bg-gray-50"
          />
        </div>
      ))}
    </div>
  );
}
