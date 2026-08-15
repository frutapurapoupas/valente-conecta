"use client";

// Caminho: C:\valente_conecta\components\InteressesPopup.tsx
//
// Pop-up periódico com itens já publicados que batem com o interesse que
// o usuário declarou no quiz de perfil (ver app/api/interesses-popup/route.ts).
// Só verifica de novo depois do intervalo configurado pelo admin master
// (padrão 24h) — e só aparece de fato se houver item novo desde a última
// checagem. Espera o quiz e o vídeo de boas-vindas serem resolvidos
// primeiro, pra não empilhar pop-ups na cara do usuário.

import { useEffect, useState } from "react";
import { X, Sparkles, Car, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const CHAVE_ULTIMA_CHECAGEM = "valente_conecta_interesses_ultima_checagem";
const CHAVE_QUIZ_DISPENSADO = "valente_conecta_quiz_perfil_dispensado";

interface ItemInteresse {
  tipo: "catalogo" | "carona";
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
  criadoEm: string;
}

export function InteressesPopup() {
  const [itens, setItens] = useState<ItemInteresse[]>([]);
  const [visivel, setVisivel] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    const usuario = getCurrentUser();
    if (!usuario) return;

    // So' verifica depois que o quiz e o video de boas-vindas ja tiverem
    // sido resolvidos pra esse usuario nesse navegador — evita 3 pop-ups
    // brigando pela tela no mesmo carregamento.
    const quizResolvido = !!localStorage.getItem(`${CHAVE_QUIZ_DISPENSADO}_${usuario.id}`);
    if (!quizResolvido) return;

    fetch("/api/admin-master/config-interesses-popup", { cache: "no-store" })
      .then((r) => r.json())
      .then((config) => {
        if (!config.success || !config.data?.ativo) return;

        const chaveChecagem = `${CHAVE_ULTIMA_CHECAGEM}_${usuario.id}`;
        const ultimaChecagem = localStorage.getItem(chaveChecagem);
        const intervaloMs = (config.data.intervaloHoras || 24) * 60 * 60 * 1000;

        if (ultimaChecagem && Date.now() - new Date(ultimaChecagem).getTime() < intervaloMs) return;

        const desde = ultimaChecagem || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        fetch(`/api/interesses-popup?usuarioId=${usuario.id}&desde=${encodeURIComponent(desde)}`, { cache: "no-store" })
          .then((r) => r.json())
          .then((res) => {
            localStorage.setItem(chaveChecagem, new Date().toISOString());
            if (res.success && res.data.length > 0) {
              setItens(res.data);
              setUsuarioId(usuario.id);
              setVisivel(true);
            }
          });
      })
      .catch(() => {});
  }, []);

  if (!visivel || itens.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-5">
        <button onClick={() => setVisivel(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-blue-500" /> Novidades pra você
        </h2>
        <p className="text-sm text-gray-500 mb-4">Coisas novas que combinam com o que você disse ter interesse.</p>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {itens.map((item) => (
            <a
              key={`${item.tipo}_${item.id}`}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2.5 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              {item.tipo === "carona" ? <Car className="w-4 h-4 text-orange-500 shrink-0" /> : <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.titulo}</p>
                <p className="text-xs text-gray-400 truncate">{item.subtitulo}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
