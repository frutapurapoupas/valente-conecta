"use client";

import {
  ArrowLeft,
  CheckCircle,
  Download,
  History,
  Loader2,
  Play,
  Sparkles,
  Upload,
  User,
  Video
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VideoRoteiro {
  id: string;
  titulo: string;
  tipo: "valentina" | "comercial" | "tutorial";
  roteiroPersonalizado: string;
  roteiroGerado: string;
  duracao: string;
  status: "processando" | "pronto" | "erro";
  criadoEm: string;
  videoUrl?: string;
}

export default function FabricaVideosPage() {
  const router = useRouter();

  const [modoEdicao, setModoEdicao] = useState<"valentina" | "comercial" | "tutorial">("valentina");
  const [gerando, setGerando] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoRoteiro[]>([]);
  const [videoGerado, setVideoGerado] = useState<VideoRoteiro | null>(null);

  const [valentinaMensagem, setValentinaMensagem] = useState<string>("");
  const [valentinaMovimento, setValentinaMovimento] = useState<string>("waves-gentle");
  const [valentinaImagem, setValentinaImagem] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string>("");

  useEffect(() => {
    const historicoSalvo = localStorage.getItem("videos_ia_fabrica");
    if (historicoSalvo) {
      try {
        setVideos(JSON.parse(historicoSalvo));
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValentinaImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGerarVideo = async () => {
    if (modoEdicao === "valentina") {
      if (!valentinaImagem) {
        alert("❌ Por favor, faça upload de uma imagem primeiro!");
        return;
      }
      if (!valentinaMensagem.trim()) {
        alert("❌ Digite o texto da ValenTina!");
        return;
      }

      setGerando(true);
      setVideoGerado(null);

      try {
        const resBlob = await fetch(valentinaImagem);
        const blob = await resBlob.blob();
        const file = new File([blob], "valentina_avatar.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("mensagem", valentinaMensagem);
        formData.append("movimento", valentinaMovimento);
        formData.append("imagem", file);

        const response = await fetch("http://localhost:8000/gerar-video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Erro no processamento do servidor.");

        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoResultUrl(videoUrl);

        const novoVideo: VideoRoteiro = {
          id: Date.now().toString(),
          titulo: `ValenTina - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          tipo: "valentina",
          roteiroPersonalizado: valentinaMensagem,
          roteiroGerado: `Texto Falado: "${valentinaMensagem}"`,
          duracao: "Ajustada",
          status: "pronto",
          criadoEm: new Date().toISOString(),
          videoUrl: videoUrl
        };

        const historicoAtualizado = [novoVideo, ...videos];
        setVideos(historicoAtualizado);
        localStorage.setItem("videos_ia_fabrica", JSON.stringify(historicoAtualizado));
        setVideoGerado(novoVideo);

      } catch (error) {
        console.error("Erro de conexão:", error);
        alert("❌ Verifique se rodou 'py main.py' na pasta back-valentina.");
      } finally {
        setGerando(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/admin-master/dashboard" className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
          <Sparkles size={14} /> Modo Vibe Coder Local
        </div>
      </div>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md">
                <Video size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Fábrica de Vídeos IA</h1>
                <p className="text-xs text-gray-500">Gere mídias locais diretamente no hardware do seu notebook</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              {(["valentina", "comercial", "tutorial"] as const).map((modo) => (
                <button
                  key={modo}
                  onClick={() => setModoEdicao(modo)}
                  className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all ${modoEdicao === modo ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
                    }`}
                >
                  {modo === "valentina" ? "ValenTina Avatar" : modo}
                </button>
              ))}
            </div>

            {modoEdicao === "valentina" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">1. Imagem de Referência (ValenTina)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                      {valentinaImagem ? (
                        <img src={valentinaImagem} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold shadow-sm cursor-pointer hover:bg-gray-50 text-gray-700">
                      <Upload size={14} /> Carregar Foto
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">2. Mensagem / O que ela vai falar?</label>
                  <textarea
                    value={valentinaMensagem}
                    onChange={(e) => setValentinaMensagem(e.target.value)}
                    placeholder="O que a ValenTina deve dizer..."
                    className="w-full h-28 p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">3. Postura / Expressão Corporal</label>
                  <select
                    value={valentinaMovimento}
                    onChange={(e) => setValentinaMovimento(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700"
                  >
                    <option value="waves-gentle">Movimentos Leves (Recomendado)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGerarVideo}
            disabled={gerando}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {gerando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Renderizando e Codificando MP4 Local...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Gerar Vídeo MP4 Comercial
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Play size={14} className="text-blue-600" /> Preview do Vídeo Real
            </h3>

            {videoResultUrl && modoEdicao === "valentina" ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200">
                  <video src={videoResultUrl} controls className="w-full h-full object-contain" />
                </div>

                <a
                  href={videoResultUrl}
                  download="valentina_comercial.mp4"
                  className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> Baixar Vídeo MP4 Comercial
                </a>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-4">
                {gerando ? (
                  <div className="flex flex-col items-center gap-2 text-blue-600">
                    <Loader2 size={24} className="animate-spin" />
                    <p className="text-xs font-semibold text-gray-600">Renderizando mídia...</p>
                  </div>
                ) : (
                  <>
                    <Video size={28} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">Nenhum vídeo gerado ainda</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <History size={14} className="text-gray-500" /> Histórico Recente
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {videos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Histórico vazio</p>
              ) : (
                videos.map((vid) => (
                  <div key={vid.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-left">
                    <div className="truncate max-w-[80%]">
                      <p className="text-xs font-bold text-gray-700 truncate">{vid.titulo}</p>
                    </div>
                    <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}