"use client";

// Caminho: C:\valente_conecta\components\catalogo\InteresseButton.tsx
//
// CTA "Tenho interesse" — cria o registro em interesses. Fornecedor em
// plano pago libera na hora; fornecedor grátis depende da cota diária do
// comprador (lib/catalogo/catalogoService.ts::criarInteresse) — dentro da
// cota libera igual, estourada mostra o contato borrado + botão real de
// pagamento via Mercado Pago (mesmo fluxo já usado pela carona).

import { useState } from "react";
import { Phone, MessageCircle, Lock, Loader2 } from "lucide-react";
import { obterUsuarioLocalId } from "@/lib/usuarioLocal";

interface InteresseButtonProps {
  itemId: string;
}

type Estado =
  | { fase: "inicial" }
  | { fase: "carregando" }
  | { fase: "aguardando_pagamento"; interesseId: string; valor: number }
  | { fase: "redirecionando" }
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
      setEstado({ fase: "aguardando_pagamento", interesseId: interesse.id, valor: interesse.valor_taxa_comprador });
    } catch (err: any) {
      setEstado({ fase: "erro", mensagem: err?.message || "Não foi possível registrar o interesse." });
    }
  };

  const pagarEDesbloquear = async (interesseId: string) => {
    setEstado({ fase: "redirecionando" });
    try {
      const resposta = await fetch(`/api/catalogo/interesses/${interesseId}/pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error);
      if (resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
        return;
      }
      // Já liberado (ex: sem valor a cobrar) — recarrega pra puxar o contato.
      manifestarInteresse();
    } catch (err: any) {
      setEstado({ fase: "erro", mensagem: err?.message || "Não foi possível iniciar o pagamento." });
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

  if (estado.fase === "aguardando_pagamento" || estado.fase === "redirecionando") {
    const valor = estado.fase === "aguardando_pagamento" ? estado.valor : 0;
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
          <Lock className="w-4 h-4 shrink-0" /> Contato bloqueado
        </div>
        <div className="space-y-1.5 select-none" aria-hidden>
          <p className="flex items-center gap-2 text-gray-700 font-semibold blur-sm">
            <Phone className="w-4 h-4" /> (75) 9****-**21
          </p>
          <p className="flex items-center gap-2 text-gray-700 font-semibold blur-sm">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </p>
        </div>
        <p className="text-xs text-amber-700">
          Você já usou seus desbloqueios grátis de hoje. Pague{" "}
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)} pra ver esse contato.
        </p>
        {estado.fase === "aguardando_pagamento" && (
          <button
            onClick={() => pagarEDesbloquear(estado.interesseId)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm"
          >
            Pagar {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)} e desbloquear
          </button>
        )}
        {estado.fase === "redirecionando" && (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-amber-700 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Abrindo pagamento...
          </div>
        )}
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
