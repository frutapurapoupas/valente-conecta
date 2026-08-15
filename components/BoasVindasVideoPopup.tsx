"use client";

// Caminho: C:\valente_conecta\components\BoasVindasVideoPopup.tsx
//
// Pop-up com o vídeo de boas-vindas, mostrado só pra quem já completou o
// cadastro (getCurrentUser() != null) e só nas primeiras 2 aberturas do
// app (contador por usuário no localStorage, incrementado uma vez por
// carregamento do layout raiz — a aproximação mais próxima de "abertura
// pelo ícone" disponível numa SPA). Fica em silêncio (não renderiza nada)
// enquanto o admin não subir vídeo e ativar em
// /admin-master/configuracoes/boas-vindas (ver
// app/api/admin-master/config-boas-vindas/route.ts).

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const CHAVE_CONTAGEM = "valente_conecta_boasvindas_contagem";
const LIMITE_ABERTURAS = 2;

export function BoasVindasVideoPopup() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const usuario = getCurrentUser();
    if (!usuario) return;

    fetch("/api/admin-master/config-boas-vindas", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data?.ativo || !res.data?.url) return;

        const chave = `${CHAVE_CONTAGEM}_${usuario.id}`;
        const contagemAtual = Number(localStorage.getItem(chave) || "0");
        if (contagemAtual >= LIMITE_ABERTURAS) return;

        localStorage.setItem(chave, String(contagemAtual + 1));
        setVideoUrl(res.data.url);
        setVisivel(true);
      })
      .catch(() => {});
  }, []);

  if (!visivel || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <button
          onClick={() => setVisivel(false)}
          className="absolute -top-10 right-0 text-white/90 hover:text-white p-1.5"
          aria-label="Fechar"
        >
          <X className="w-7 h-7" />
        </button>
        <video src={videoUrl} controls autoPlay className="w-full max-h-[75vh] rounded-xl bg-black" />
      </div>
    </div>
  );
}
