"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { PlayCircle, X } from "lucide-react";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

interface CardFuncionalidade {
  id: string;
  titulo: string;
  video_url: string | null;
  ordem: number;
}

export default function LancamentoPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cards, setCards] = useState<CardFuncionalidade[]>([]);
  const [videoEmTelaCheia, setVideoEmTelaCheia] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin-master/config-lancamento")
      .then((r) => r.json())
      .then((res) => setVideoUrl(res.success ? res.data?.url || null : null))
      .catch(() => setVideoUrl(null));

    fetch("/api/lancamento-funcionalidades")
      .then((r) => r.json())
      .then((res) => setCards(res.success ? res.data : []))
      .catch(() => setCards([]));
  }, []);

  const irParaIndicacao = () => {
    router.push("/qr-code");
  };

  const abrirVideoCard = (card: CardFuncionalidade) => {
    if (!card.video_url) {
      toast("Vídeo dessa funcionalidade ainda não foi publicado.", { icon: "🎬" });
      return;
    }
    setVideoEmTelaCheia(card.video_url);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-lg">🎉 Lançamento</h1>
      </header>

      <div className="p-6 pt-8">
        <h1 className="text-3xl font-bold text-center mb-8">🎉 Lançamento Valente Conecta</h1>

        <div className="bg-white/10 rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Vídeo de Apresentação</h2>
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full h-72 rounded-2xl bg-black object-contain"
            />
          ) : (
            <div className="bg-gray-800 h-72 rounded-2xl flex items-center justify-center">
              <i className="fas fa-play-circle text-6xl text-blue-400"></i>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-white mb-4">LANÇAMENTO</h2>
          <p className="text-green-300 text-lg font-semibold mb-3">
            Começa agora em Valente a revolução no comércio digital!
          </p>
          <p className="text-gray-300 text-md mb-2">
            A experiência que você esperava agora é real e já começou.
          </p>
          <p className="text-gray-300 text-md mb-4">
            A Valente Conecta uniu inovação e praticidade para conectar você ao melhor da cidade.
          </p>
          <p className="text-yellow-400 font-bold text-lg mb-6">
            Participe agora, dê o play e faça parte desta nova história!
          </p>

          <button
            onClick={irParaIndicacao}
            className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl w-full hover:scale-105 transition shadow-lg"
          >
            INDICAR AGORA E GANHAR
          </button>
        </div>

        {cards.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-white font-bold text-lg mb-1">Conheça as funcionalidades</h3>
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => abrirVideoCard(card)}
                className="w-full flex items-center justify-between gap-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl px-6 py-4 text-left transition-colors"
              >
                <span className="text-white font-semibold text-sm leading-snug">{card.titulo}</span>
                <span className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 text-white" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {videoEmTelaCheia && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setVideoEmTelaCheia(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <video
            src={videoEmTelaCheia}
            autoPlay
            controls
            playsInline
            className="w-full h-full object-contain"
            onEnded={() => setVideoEmTelaCheia(null)}
          />
        </div>
      )}
    </div>
  );
}
