"use client";

import {
  ArrowLeft,
  CheckCircle,
  Download,
  History,
  Loader2,
  Play,
  Sparkles,
  Star,
  Upload,
  User,
  Video
} from "lucide-react";
import Link from "next/link";
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
  modo?: "local" | "premium";
}

export default function FabricaVideosPage() {
  const [modoEdicao, setModoEdicao] = useState<"valentina" | "comercial" | "tutorial">("valentina");
  const [gerando, setGerando] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoRoteiro[]>([]);
  const [videoGerado, setVideoGerado] = useState<VideoRoteiro | null>(null);
  const [valentinaMensagem, setValentinaMensagem] = useState<string>("");
  const [valentinaMovimento, setValentinaMovimento] = useState<string>("waves-gentle");
  const [valentinaImagem, setValentinaImagem] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string>("");
  const [usarPremium, setUsarPremium] = useState<boolean>(false);
  const [modoBackend, setModoBackend] = useState<string>("local");

  useEffect(() => {
    const historicoSalvo = localStorage.getItem("videos_ia_fabrica");
    if (historicoSalvo) {
      try {
        setVideos(JSON.parse(historicoSalvo));
      } catch (e) {
        console.error("Erro ao carregar historico", e);
      }
    }
    verificarModoBackend();
  }, []);

  const verificarModoBackend = async () => {
    try {
      const response = await fetch("http://localhost:8000/");
      const data = await response.json();
      setModoBackend(data.modo || "local");
    } catch (e) {
      console.log("Backend nao disponivel");
    }
  };

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
        alert("Por favor, faca upload de uma imagem primeiro!");
        return;
      }
      if (!valentinaMensagem.trim()) {
        alert("Digite o texto da ValenTina!");
        return;
      }

      setGerando(true);
      setVideoGerado(null);

      try {
        const responseImg = await fetch(valentinaImagem);
        const blob = await responseImg.blob();
        const file = new File([blob], "valentina_avatar.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("mensagem", valentinaMensagem);
        formData.append("movimento", valentinaMovimento);
        formData.append("imagem", file);
        formData.append("usar_ia", String(usarPremium));

        const response = await fetch("http://localhost:8000/gerar-video", {
          method: "POST",
          body: formData,
        });

        if (response.status === 402) {
          const errorData = await response.json();
          alert(`Aviso: ${errorData.message}\n\nLink: ${errorData.payment_link}`);
          setGerando(false);
          return;
        }

        if (!response.ok) throw new Error("Erro ao gerar video");

        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoResultUrl(videoUrl);

        const novoVideo: VideoRoteiro = {
          id: Date.now().toString(),
          titulo: `ValenTina - ${new Date().toLocaleDateString()}`,
          tipo: "valentina",
          roteiroPersonalizado: valentinaMensagem,
          roteiroGerado: `Texto Falado: "${valentinaMensagem}"`,
          duracao: "Ajustada",
          status: "pronto",
          criadoEm: new Date().toISOString(),
          videoUrl: videoUrl,
          modo: usarPremium ? "premium" : "local"
        };

        const historicoAtualizado = [novoVideo, ...videos];
        setVideos(historicoAtualizado);
        localStorage.setItem("videos_ia_fabrica", JSON.stringify(historicoAtualizado));
        setVideoGerado(novoVideo);

      } catch (error) {
        console.error("Erro de conexao:", error);
        alert("Verifique se o backend esta rodando: py main.py");
      } finally {
        setGerando(false);
      }
    }
  };

  const handleDownload = (url: string, titulo: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `valentina_${titulo.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/admin-master/dashboard" className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
            <Sparkles size={14} className="inline mr-1" /> Modo Local
          </div>
          {modoBackend === "kling" && (
            <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Star size={12} /> Premium Ativo
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-md">
              <Video size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fabrica de Videos IA</h1>
              <p className="text-xs text-gray-500">Crie videos profissionais para seu negocio com inteligencia artificial</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
            {(["valentina", "comercial", "tutorial"] as const).map((modo) => (
              <button
                key={modo}
                onClick={() => setModoEdicao(modo)}
                className={`py-2.5 text-xs font-semibold rounded-lg capitalize transition-all ${modoEdicao === modo
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-100"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {modo === "valentina" ? "ValenTina Avatar" : modo === "comercial" ? "Comercial" : "Tutorial"}
              </button>
            ))}
          </div>

          {modoEdicao === "valentina" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">
                  1. Imagem de Referencia (ValenTina)
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                    {valentinaImagem ? (
                      <img src={valentinaImagem} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={28} className="text-gray-400" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-gray-700">
                    <Upload size={14} /> Carregar Foto
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-400">PNG, JPG ate 10MB</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">
                  2. Mensagem / O que ela vai falar?
                </label>
                <textarea
                  value={valentinaMensagem}
                  onChange={(e) => setValentinaMensagem(e.target.value)}
                  placeholder="Ex: Ola! Seja bem-vindo ao Valente Conecta!"
                  className="w-full h-28 p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-gray-800 resize-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">{valentinaMensagem.length}/500 caracteres</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 tracking-wide">
                  3. Postura / Expressao Corporal
                </label>
                <select
                  value={valentinaMovimento}
                  onChange={(e) => setValentinaMovimento(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="waves-gentle">Movimentos Leves (Recomendado)</option>
                  <option value="excited">Animado / Empolgado</option>
                  <option value="serious">Serio / Profissional</option>
                  <option value="friendly">Amigavel / Simpatico</option>
                </select>
              </div>

              {/* BOTAO PREMIUM */}
              <div className="pt-2 pb-1">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-600" />
                      <p className="text-sm font-bold text-gray-800">Modo IA Premium</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {usarPremium
                        ? "Movimento real de boca, olhos e expressoes"
                        : "Apenas movimento de zoom na imagem"}
                    </p>
                    {usarPremium && modoBackend !== "kling" && (
                      <p className="text-xs text-blue-600 mt-1">
                        Teste gratuito por 5 minutos
                      </p>
                    )}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={usarPremium}
                      onChange={(e) => setUsarPremium(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {modoEdicao !== "valentina" && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">Em breve!</div>
              <p className="text-gray-500 font-medium">Em desenvolvimento</p>
            </div>
          )}

          <button
            onClick={handleGerarVideo}
            disabled={gerando}
            className={`w-full mt-6 font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all text-sm ${usarPremium
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
              }`}
          >
            {gerando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {usarPremium ? "Renderizando com IA Premium..." : "Renderizando video..."}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {usarPremium ? "Gerar Video com IA Premium" : "Gerar Video MP4"}
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Play size={14} className="text-blue-600" /> Preview do Video
            </h3>

            {videoResultUrl && modoEdicao === "valentina" ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200 shadow-sm">
                  <video src={videoResultUrl} controls className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={() => handleDownload(videoResultUrl, videoGerado?.titulo || "video")}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download size={14} /> Baixar Video MP4
                </button>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-4">
                {gerando ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <p className="text-xs font-semibold text-gray-600">Processando sua midia...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-200/50 p-4 rounded-full mb-3">
                      <Video size={32} className="text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Nenhum video gerado ainda</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <History size={14} className="text-gray-500" /> Historico Recente
              {videos.length > 0 && (
                <span className="ml-auto text-xs text-gray-400">{videos.length} videos</span>
              )}
            </h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {videos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400">Seu historico esta vazio</p>
                </div>
              ) : (
                videos.map((vid) => (
                  <div key={vid.id} className="group p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-700 truncate">{vid.titulo}</p>
                          {vid.modo === "premium" && (
                            <span className="text-xs text-purple-600 font-semibold">Premium</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{vid.roteiroPersonalizado.substring(0, 50)}...</p>
                      </div>
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-900 mb-2">Dicas para melhores videos:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>â€¢ Use imagens nitidas e bem iluminadas</li>
              <li>â€¢ Mensagens curtas (ate 200 caracteres)</li>
              <li>â€¢ Ative o modo Premium para movimento real</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

