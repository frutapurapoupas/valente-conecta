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
const CHAVE_QUIZ_DISPENSADO = "valente_conecta_quiz_perfil_dispensado";
const LIMITE_ABERTURAS = 2;

export function BoasVindasVideoPopup() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const usuario = getCurrentUser();
    if (!usuario) return;

    // O quiz de perfil tem prioridade — se ainda nao foi respondido nem
    // dispensado, deixa ele aparecer primeiro (evita 2 pop-ups em cima um
    // do outro). Se o quiz ja foi resolvido, ou esta desligado, segue normal.
    Promise.all([
      localStorage.getItem(`${CHAVE_QUIZ_DISPENSADO}_${usuario.id}`)
        ? Promise.resolve({ resolvido: true })
        : Promise.all([
            fetch("/api/admin-master/config-quiz-perfil", { cache: "no-store" }).then((r) => r.json()),
            fetch(`/api/quiz-perfil?usuarioId=${usuario.id}`, { cache: "no-store" }).then((r) => r.json()),
          ]).then(([config, resposta]) => ({
            resolvido: !(config.success && config.data?.ativo && resposta.success && !resposta.data),
          })),
      fetch("/api/admin-master/config-boas-vindas", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([quiz, res]) => {
        if (!quiz.resolvido) return;
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
