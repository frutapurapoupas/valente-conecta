"use client";

// Caminho: C:\valente_conecta\components\pdv\StatusPlanoFisco.tsx
//
// Banner de status do plano Fisco/Contabilidade em /pdv/notas-fiscais --
// unico pre-requisito pra emissao automatica de nota fiscal no futuro (ver
// lib/pdv/planoFisco.ts). Sem plano ativo, manda pro mesmo fluxo de
// negociacao que /planos ja usa (botao "Falar com o suporte").

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Building2 } from "lucide-react";

interface StatusPlanoFiscoProps {
  usuarioId: string;
}

export function StatusPlanoFisco({ usuarioId }: StatusPlanoFiscoProps) {
  const [ativo, setAtivo] = useState<boolean | null>(null);
  const [categoriaNegocio, setCategoriaNegocio] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/pdv/plano-fisco?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/pdv/dados-fiscais?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
    ]).then(([respPlano, respPerfil]) => {
      setAtivo(!!respPlano?.data?.ativo);
      setCategoriaNegocio(respPerfil?.data?.categoria_negocio || null);
    });
  }, [usuarioId]);

  if (ativo === null) return null;

  if (ativo) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">Plano Fisco/Contabilidade ativo — pronto pra quando a emissão automática for ligada.</span>
      </div>
    );
  }

  const linkPlanos = categoriaNegocio ? `/planos?servico=${categoriaNegocio}` : "/planos";

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-purple-800">
        <Building2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">Emissão automática de nota fiscal exige o plano Fisco/Contabilidade.</span>
      </div>
      <Link href={linkPlanos} className="inline-block text-sm font-semibold text-purple-700 underline">
        Ver plano
      </Link>
    </div>
  );
}
