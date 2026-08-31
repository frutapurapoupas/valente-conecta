"use client";

// Caminho: C:\valente_conecta\components\cozinha\PagamentoMercadoPago.tsx
//
// Payment Brick do Mercado Pago embutido direto na tela de confirmacao do
// checkout da Cozinha (app/cozinha/checkout/page.tsx) -- cartao e Pix como
// abas visiveis, sem redirecionar pra fora do app (ver plano
// "Pagamento embutido no checkout da Cozinha Chef Neide"). Chama
// POST /api/cozinha/pedidos/[id]/pagamento, que recalcula o valor no
// servidor e cria o pagamento de verdade via API do Mercado Pago.

import { useEffect, useRef, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { CheckCircle2, Clock, Copy, Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface PagamentoMercadoPagoProps {
  pedidoId: string;
  total: number;
  onAprovado: () => void;
}

type Resultado =
  | { fase: "formulario" }
  | { fase: "pix_aguardando"; qrCodeBase64: string; copiaECola: string }
  | { fase: "aprovado" }
  | { fase: "recusado"; motivo: string };

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

export function PagamentoMercadoPago({ pedidoId, total, onAprovado }: PagamentoMercadoPagoProps) {
  const [resultado, setResultado] = useState<Resultado>({ fase: "formulario" });
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current || !PUBLIC_KEY) return;
    iniciado.current = true;
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
  }, []);

  // Enquanto aguarda pagamento por Pix, confirma sozinho quando o webhook
  // aprovar do outro lado -- mesmo padrao de polling ja usado em
  // app/cozinha/pedido/[id]/page.tsx.
  useEffect(() => {
    if (resultado.fase !== "pix_aguardando") return;
    const intervalo = setInterval(async () => {
      const resp = await fetch(`/api/cozinha/pedidos?id=${pedidoId}`).then((r) => r.json()).catch(() => null);
      if (resp?.success && resp.data?.status_pagamento === "pago_online") {
        clearInterval(intervalo);
        setResultado({ fase: "aprovado" });
        onAprovado();
      }
    }, 5000);
    return () => clearInterval(intervalo);
  }, [resultado.fase, pedidoId, onAprovado]);

  if (!PUBLIC_KEY) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Pagamento online em configuração no momento. Escolha outra forma de pagamento ou tente novamente em instantes.
      </div>
    );
  }

  if (resultado.fase === "aprovado") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">Pagamento aprovado!</span>
      </div>
    );
  }

  if (resultado.fase === "recusado") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Pagamento recusado</span>
        </div>
        <p className="text-xs text-red-600">{resultado.motivo}</p>
        <button
          onClick={() => setResultado({ fase: "formulario" })}
          className="text-sm font-semibold text-red-700 underline"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (resultado.fase === "pix_aguardando") {
    return (
      <div className="bg-white border rounded-xl p-4 space-y-3 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 animate-pulse" /> Aguardando pagamento do Pix...
        </div>
        {resultado.qrCodeBase64 && (
          <img
            src={`data:image/png;base64,${resultado.qrCodeBase64}`}
            alt="QR Code Pix"
            className="w-48 h-48 mx-auto"
          />
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(resultado.copiaECola);
            toast.success("Código Pix copiado!");
          }}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700"
        >
          <Copy className="w-4 h-4" /> Copiar código Pix
        </button>
        <p className="text-xs text-gray-400">Confirma sozinho assim que o pagamento cair.</p>
      </div>
    );
  }

  return (
    <Payment
      initialization={{ amount: total }}
      customization={{
        paymentMethods: { creditCard: "all", debitCard: "all", bankTransfer: "all" },
      }}
      onSubmit={async ({ formData }) => {
        try {
          const resp = await fetch(`/api/cozinha/pedidos/${pedidoId}/pagamento`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }).then((r) => r.json());

          if (!resp.success) {
            setResultado({ fase: "recusado", motivo: resp.error || "Não foi possível processar o pagamento." });
            return;
          }

          if (resp.status === "approved") {
            setResultado({ fase: "aprovado" });
            onAprovado();
          } else if (formData.payment_method_id === "pix" && resp.pixQrCodeBase64) {
            setResultado({ fase: "pix_aguardando", qrCodeBase64: resp.pixQrCodeBase64, copiaECola: resp.pixCopiaECola });
          } else if (resp.status === "rejected") {
            setResultado({ fase: "recusado", motivo: "Pagamento recusado pela operadora. Tente outro cartão." });
          } else {
            // pending por outro motivo (ex: analise) -- trata como aguardando.
            setResultado({ fase: "pix_aguardando", qrCodeBase64: "", copiaECola: "" });
          }
        } catch {
          setResultado({ fase: "recusado", motivo: "Erro de conexão. Tente de novo." });
        }
      }}
      onError={() => {
        toast.error("Erro ao carregar o formulário de pagamento.");
      }}
    />
  );
}
