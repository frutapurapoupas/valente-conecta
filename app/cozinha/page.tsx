"use client";

// Caminho: C:\valente_conecta\app\cozinha\page.tsx
//
// Antes redirecionava direto pro catalogo publico. Agora mostra os 3
// perfis de cliente primeiro (Geral / Assinatura / Revendedor) — a logica
// de selecao e os modais de confirmacao ja existiam prontos em
// usePerfilCozinha, so nunca tinham sido renderizados em lugar nenhum.
// Os percentuais de desconto vem da config do admin da cozinha (ver
// app/api/cozinha/descontos/route.ts), nao mais fixos no codigo.

import { useEffect, useState } from "react";
import { ChefHat, Star, Handshake, ArrowRight, X } from "lucide-react";
import { usePerfilCozinha } from "@/app/admin-master/cozinha-chef/hooks/usePerfilCozinha";

interface DescontosConfig {
  descontoAssinante: number;
  descontoRevendedor: number;
  minimoPorcoesAssinante: number;
}

export default function CozinhaPage() {
  const {
    selecionarPerfil,
    modalAssinaturaAberto,
    modalRevendedorAberto,
    confirmarAssinatura,
    cancelarAssinatura,
    confirmarRevendedor,
    cancelarRevendedor,
  } = usePerfilCozinha();

  const [descontos, setDescontos] = useState<DescontosConfig | null>(null);

  useEffect(() => {
    fetch("/api/cozinha/descontos")
      .then((r) => r.json())
      .then((res) => setDescontos(res.success ? res.data : null))
      .catch(() => setDescontos(null));
  }, []);

  const cards = [
    {
      id: "publico" as const,
      titulo: "Cliente Geral",
      descricao: "Preço cheio, sem compromisso — peça quando quiser.",
      icone: ChefHat,
      cor: "from-blue-500 to-blue-700",
    },
    {
      id: "assinante" as const,
      titulo: "Cliente Assinatura",
      descricao: descontos
        ? `${descontos.descontoAssinante}% de desconto, mínimo ${descontos.minimoPorcoesAssinante} porções.`
        : "Desconto especial para pedidos recorrentes.",
      icone: Star,
      cor: "from-amber-500 to-amber-700",
    },
    {
      id: "revendedor" as const,
      titulo: "Cliente Revendedor",
      descricao: descontos
        ? `${descontos.descontoRevendedor}% de desconto para quem revende.`
        : "Desconto especial para parceiros revendedores.",
      icone: Handshake,
      cor: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 text-center">
        <h1 className="font-bold text-lg flex items-center justify-center gap-2">
          <ChefHat className="w-5 h-5" /> Cozinha Chef Neide
        </h1>
      </header>

      <div className="max-w-lg mx-auto p-6">
        <h2 className="text-xl font-bold text-center mb-1">Como você quer comprar?</h2>
        <p className="text-gray-400 text-center text-sm mb-6">Escolha o perfil que melhor combina com você.</p>

        <div className="space-y-3">
          {cards.map((card) => {
            const Icone = card.icone;
            return (
              <button
                key={card.id}
                onClick={() => selecionarPerfil(card.id)}
                className={`w-full text-left bg-gradient-to-r ${card.cor} rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-lg`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{card.titulo}</p>
                  <p className="text-white/80 text-xs mt-0.5">{card.descricao}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {modalAssinaturaAberto && (
        <ModalConfirmacao
          titulo="Cliente Assinatura"
          texto={
            descontos
              ? `Você terá ${descontos.descontoAssinante}% de desconto em pedidos com no mínimo ${descontos.minimoPorcoesAssinante} porções. Confirma esse perfil?`
              : "Confirma o perfil de Cliente Assinatura?"
          }
          onConfirmar={confirmarAssinatura}
          onCancelar={cancelarAssinatura}
        />
      )}

      {modalRevendedorAberto && (
        <ModalConfirmacao
          titulo="Cliente Revendedor"
          texto={
            descontos
              ? `Você terá ${descontos.descontoRevendedor}% de desconto para revenda. Confirma esse perfil?`
              : "Confirma o perfil de Cliente Revendedor?"
          }
          onConfirmar={confirmarRevendedor}
          onCancelar={cancelarRevendedor}
        />
      )}
    </div>
  );
}

function ModalConfirmacao({
  titulo,
  texto,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  texto: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-sm w-full p-6 relative">
        <button onClick={onCancelar} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-lg mb-2">{titulo}</h3>
        <p className="text-gray-300 text-sm mb-6">{texto}</p>
        <div className="flex gap-3">
          <button onClick={onCancelar} className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl py-2.5 text-sm font-medium">
            Cancelar
          </button>
          <button onClick={onConfirmar} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5 text-sm font-bold">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
