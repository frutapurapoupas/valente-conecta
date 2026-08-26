"use client";

// Caminho: C:\valente_conecta\app\admin-master\configuracoes\lancamento\page.tsx
// Admin master troca o video de apresentacao mostrado em /lancamento sem
// precisar de deploy novo — sobe pro Supabase Storage e salva a URL em
// admin_configuracoes (ver app/api/admin-master/config-lancamento/route.ts).

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PlayCircle, Upload, Save, Film } from "lucide-react";

interface CardFuncionalidade {
  id: string;
  titulo: string;
  video_url: string | null;
  ordem: number;
}

export default function ConfigLancamentoPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    fetch("/api/admin-master/config-lancamento")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setVideoUrl(res.data?.url || null);
          setAtualizadoEm(res.data?.atualizadoEm || null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("video/")) {
      toast.error("Envie um arquivo de vídeo (mp4, webm...)");
      return;
    }
    if (arquivo.size > 4 * 1024 * 1024) {
      toast.error("Vídeo maior que 4MB — comprima antes de enviar (limite do upload direto).");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resp = await fetch("/api/upload/institucional", { method: "POST", body: formData });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      const respConfig = await fetch("/api/admin-master/config-lancamento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: resultado.url }),
      });
      const resultadoConfig = await respConfig.json();
      if (!resultadoConfig.success) throw new Error(resultadoConfig.error);

      toast.success("Vídeo atualizado! Já está valendo em /lancamento.");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar vídeo");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <PlayCircle className="w-6 h-6 text-blue-600" /> Vídeo de Lançamento
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Esse vídeo aparece na página <code className="bg-gray-100 px-1 rounded">/lancamento</code>, acessada
        pelo card "Lançamento" da home. Trocar aqui atualiza pra todo mundo na hora, sem precisar de deploy.
      </p>

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <p className="text-sm font-medium text-gray-700">Vídeo atual</p>
          {videoUrl ? (
            <>
              <video src={videoUrl} controls className="w-full max-h-80 rounded-lg bg-black" />
              {atualizadoEm && (
                <p className="text-sm text-gray-500">Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}</p>
              )}
            </>
          ) : (
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 text-sm">
              Nenhum vídeo configurado ainda.
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Enviar novo vídeo (até 4MB)</span>
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                {enviando ? "Enviando..." : "Escolher arquivo de vídeo"}
                <input type="file" accept="video/*" className="hidden" onChange={handleArquivo} disabled={enviando} />
              </label>
            </div>
          </label>
        </div>
      )}

      <CardsFuncionalidades />
    </div>
  );
}

function CardsFuncionalidades() {
  const [cards, setCards] = useState<CardFuncionalidade[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    fetch("/api/lancamento-funcionalidades")
      .then((r) => r.json())
      .then((res) => setCards(res.success ? res.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        <Film className="w-5 h-5 text-blue-600" /> Cards de Funcionalidades
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Aparecem embaixo do botão "Indicar agora" em <code className="bg-gray-100 px-1 rounded">/lancamento</code>.
        Cada um abre o vídeo em tela cheia quando tocado.
      </p>

      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <CardFuncionalidadeItem key={card.id} card={card} onAtualizado={carregar} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardFuncionalidadeItem({ card, onAtualizado }: { card: CardFuncionalidade; onAtualizado: () => void }) {
  const [titulo, setTitulo] = useState(card.titulo);
  const [salvandoTitulo, setSalvandoTitulo] = useState(false);
  const [enviandoVideo, setEnviandoVideo] = useState(false);

  const salvarTitulo = async () => {
    if (!titulo.trim() || titulo === card.titulo) return;
    setSalvandoTitulo(true);
    try {
      const resp = await fetch(`/api/lancamento-funcionalidades?id=${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo.trim() }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Título atualizado!");
      onAtualizado();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar título");
    } finally {
      setSalvandoTitulo(false);
    }
  };

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("video/")) {
      toast.error("Envie um arquivo de vídeo (mp4, webm...)");
      return;
    }
    if (arquivo.size > 4 * 1024 * 1024) {
      toast.error("Vídeo maior que 4MB — comprima antes de enviar.");
      return;
    }
    setEnviandoVideo(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);
      const resp = await fetch("/api/upload/institucional", { method: "POST", body: formData });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      const respPatch = await fetch(`/api/lancamento-funcionalidades?id=${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: resultado.url }),
      });
      const resultadoPatch = await respPatch.json();
      if (!resultadoPatch.success) throw new Error(resultadoPatch.error);

      toast.success("Vídeo do card atualizado!");
      onAtualizado();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar vídeo");
    } finally {
      setEnviandoVideo(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={salvarTitulo}
          disabled={salvandoTitulo || titulo === card.titulo}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium"
        >
          <Save className="w-3.5 h-3.5" /> Salvar
        </button>
      </div>

      <div className="flex items-center gap-3">
        {card.video_url ? (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <Film className="w-3.5 h-3.5" /> Vídeo publicado
          </span>
        ) : (
          <span className="text-sm text-gray-500">Nenhum vídeo publicado ainda</span>
        )}
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer ml-auto">
          <Upload className="w-3.5 h-3.5" />
          {enviandoVideo ? "Enviando..." : card.video_url ? "Trocar vídeo" : "Enviar vídeo"}
          <input type="file" accept="video/*" className="hidden" onChange={handleArquivo} disabled={enviandoVideo} />
        </label>
      </div>
    </div>
  );
}
