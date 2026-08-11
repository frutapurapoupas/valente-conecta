"use client";

// Caminho: C:\valente_conecta\components\catalogo\InteresseButton.tsx
//
// CTA "Tenho interesse" — cria o registro em interesses e, se ja estiver
// liberado (taxa desligada ou assinatura ativa), mostra o contato na hora.
// Se a taxa estiver ativa e pendente, mostra o valor a pagar (o gateway de
// pagamento em si nao faz parte do escopo dos documentos de marketplace).

import { useState } from "react";
import { Phone, MessageCircle, Lock, Loader2 } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface InteresseButtonProps {
  itemId: string;
}

type Estado =
  | { fase: "inicial" }
  | { fase: "carregando" }
  | { fase: "aguardando_pagamento"; valor: number }
  | { fase: "liberado"; telefone: string; whatsapp: string | null; nome: string }
  | { fase: "erro"; mensagem: string };

export function InteresseButton({ itemId }: InteresseButtonProps) {
  const [estado, setEstado] = useState<Estado>({ fase: "inicial" });

  const manifestarInteresse = async () => {
    setEstado({ fase: "carregando" });
    try {
      const compradorId = obterUsuarioLocalId();
      const resposta = await fetch("/api/catalogo/interesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, comprador_id: compradorId }),
      });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error);

      const interesse = resultado.data;
      if (interesse.status_comprador === "liberado" || interesse.status_comprador === "isento_assinatura") {
        const contatoResp = await fetch(`/api/catalogo/interesses/${interesse.id}/contato`);
        const contatoResultado = await contatoResp.json();
        if (contatoResultado.success) {
          setEstado({
            fase: "liberado",
            telefone: contatoResultado.data.telefone,
            whatsapp: contatoResultado.data.whatsapp,
            nome: contatoResultado.data.nome_exibicao,
          });
          return;
        }
      }
      setEstado({ fase: "aguardando_pagamento", valor: interesse.valor_taxa_comprador });
    } catch (err: any) {
      setEstado({ fase: "erro", mensagem: err?.message || "Não foi possível registrar o interesse." });
    }
  };

  if (estado.fase === "liberado") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
        <p className="text-sm text-emerald-700 font-medium">Contato de {estado.nome}</p>
        <a href={`tel:${estado.telefone}`} className="flex items-center gap-2 text-emerald-800 font-semibold">
          <Phone className="w-4 h-4" /> {estado.telefone}
        </a>
        {estado.whatsapp && (
          <a
            href={`https://wa.me/55${estado.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-emerald-800 font-semibold"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        )}
      </div>
    );
  }

  if (estado.fase === "aguardando_pagamento") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-2">
        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Taxa de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(estado.valor)} para
          liberar o contato. Pagamento em breve.
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={manifestarInteresse}
        disabled={estado.fase === "carregando"}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
      >
        {estado.fase === "carregando" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Tenho interesse
      </button>
      {estado.fase === "erro" && <p className="text-sm text-red-600 mt-2">{estado.mensagem}</p>}
    </div>
  );
}
