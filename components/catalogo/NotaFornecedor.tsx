"use client";

// Caminho: C:\valente_conecta\components\catalogo\NotaFornecedor.tsx
//
// Mostra a nota média (estrelas) de um fornecedor/loja, agregada de
// catalogo_avaliacoes (ver 096_avaliacoes.sql). Só renderiza se já existe
// pelo menos 1 avaliação — usado em app/item/[id]/page.tsx.

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Props {
  donoId: string;
}

export function NotaFornecedor({ donoId }: Props) {
  const [dados, setDados] = useState<{ media: number; total: number } | null>(null);

  useEffect(() => {
    fetch(`/api/catalogo/avaliacoes?fornecedorId=${donoId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => resp.success && setDados(resp.data));
  }, [donoId]);

  if (!dados || dados.total === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`w-4 h-4 ${n <= Math.round(dados.media) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
        ))}
      </div>
      <span>{dados.media.toFixed(1)} ({dados.total} avaliação{dados.total === 1 ? "" : "ões"})</span>
    </div>
  );
}
