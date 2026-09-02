"use client";

// Caminho: C:\valente_conecta\components\catalogo\SeloFornecedorValidado.tsx
//
// Busca o status de validação do dono do item (lojista/prestador de
// serviço) e renderiza o selo — reaproveita o endpoint que já existe desde
// a validação de proprietário de loja (094_validacao_proprietario_loja.sql),
// sem precisar de nada novo no backend.

import { useEffect, useState } from "react";
import { SeloValidado } from "@/components/avaliacao/SeloValidado";

interface Props {
  donoId: string;
}

export function SeloFornecedorValidado({ donoId }: Props) {
  const [validado, setValidado] = useState(false);

  useEffect(() => {
    fetch(`/api/pdv/validacao-proprietario?usuarioId=${donoId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => setValidado(resp.success && resp.data?.status === "aprovado"));
  }, [donoId]);

  return <SeloValidado validado={validado} />;
}
