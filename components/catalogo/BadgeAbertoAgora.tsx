"use client";

// Caminho: C:\valente_conecta\components\catalogo\BadgeAbertoAgora.tsx
//
// Pilula verde "Aberto agora" / cinza "Fechado agora", calculada a partir
// do horario publico do fornecedor (ver lib/catalogo/horarios.ts). Nao
// renderiza nada se o fornecedor nunca preencheu horario — nao inventa um
// horario padrao pra quem nao configurou.

import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { estaAbertoAgora } from "@/lib/catalogo/horarios";
import type { HorarioDia } from "@/lib/catalogo/marketplaceTypes";

export function BadgeAbertoAgora({ usuarioId }: { usuarioId: string }) {
  const [horarios, setHorarios] = useState<HorarioDia[] | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    if (!usuarioId) return;
    fetch(`/api/catalogo/horario-publico?usuario_id=${usuarioId}`)
      .then((r) => r.json())
      .then((res) => setHorarios(res.success ? res.data : null))
      .finally(() => setCarregado(true));
  }, [usuarioId]);

  if (!carregado || !horarios || horarios.length === 0) return null;

  const aberto = estaAbertoAgora(horarios);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        aberto ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <Circle className={`w-2 h-2 ${aberto ? "fill-emerald-500 text-emerald-500" : "fill-gray-400 text-gray-400"}`} />
      {aberto ? "Aberto agora" : "Fechado agora"}
    </span>
  );
}
