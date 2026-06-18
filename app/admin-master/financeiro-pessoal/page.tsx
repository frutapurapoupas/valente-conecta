"use client";

import {
  CheckCircle,
  Clock,
  Copy,
  Download,
  Edit,
  Play,
  Settings,
  Share2, Sparkles,
  TrendingUp,
  Users,
  Video
} from "lucide-react";
import { useEffect, useState } from "react";

interface VideoRoteiro {
  id: string;
  titulo: string;
  tipo: string;
  roteiroPersonalizado: string;
  roteiroGerado: string;
  duracao: string;
  status: "rascunho" | "pronto" | "publicado";
  criadoEm: string;
  videoUrl?: string;
}

export default function FabricaVideosPage() {
  const [videos, setVideos] = useState<VideoRoteiro[]>([]);
  const [modoEdicao, setModoEdicao] = useState<"assistido" | "personalizado">("assistido");
  const [roteiroPersonalizado, setRoteiroPersonalizado] = useState("");
  const [tipoVideo, setTipoVideo] = useState("promocional");
  const [segmento, setSegmento] = useState("geral");
  const [produto, setProduto] = useState("");
  const [temporizador, setTemporizador] = useState(30);
  const [gerando, setGerando] = useState(false);
  const [videoGerado, setVideoGerado] = useState<VideoRoteiro | null>(null);
  const [copiado, setCopiado] = useState(false);

  const tiposVideo = [
    { id: "promocional", nome: "Promocional", descricao: "Divulgue produtos e ofertas", icon: TrendingUp },
    { id: "institucional", nome: "Institucional", descricao: "Apresente sua empresa", icon: Building },
    { id: "tutorial", nome: "Tutorial", descricao: "Ensine como usar algo", icon: Play },
    { id: "depoimento", nome: "Depoimento", descricao: "Histórias de clientes", icon: Users },
    { id: "evento", nome: "Evento", descricao: "Divulgue eventos", icon: Calendar }
  ];

  const segmentos = [
    "Alimentação", "Varejo", "Serviços", "Saúde", "Educação",
    "Beleza", "Automotivo", "Construção", "Tecnologia", "Moda"
  ];

  useEffect(() => {
    const stored = localStorage.getItem("videos_valentina");
    if (stored) {
      setVideos(JSON.parse(stored));
    }
  }, []);

  const gerarRoteiroAssistido = () => {
    let roteiro = "";
    const produtoNome = produto || "seu produto/serviço";

    switch (tipoVideo) {
      case "promocional":
        roteiro = `🎬 ROTEIRO PROMOCIONAL - ${segmento}\n\n` +
          `⏱️ Duração: ${temporizador} segundos\n\n` +
          `🎯 GANCHO (0-5s): Atenção! ${produtoNome} está com oferta imperdível!\n\n` +
          `📢 DESENVOLVIMENTO (5-${temporizador - 5}s): ` +
          `Venha conhecer ${produtoNome} em Valente, BA. Qualidade e preço baixo você encontra aqui!\n\n` +
          `🛒 CHAMADA (${temporizador - 5}-${temporizador}s): ` +
          `Corra! Visite nosso site ou Whatsapp. Compartilhe com os amigos!`;
        break;
      case "institucional":
        roteiro = `🎬 ROTEIRO INSTITUCIONAL\n\n` +
          `⏱️ Duração: ${temporizador} segundos\n\n` +
          `🎯 ABERTURA (0-5s): Conheça ${produtoNome}, orgulho de Valente!\n\n` +
          `📢 MISSÃO (5-${temporizador - 5}s): Trabalhamos com dedicação para oferecer o melhor.\n\n` +
          `🤝 ENCERRAMENTO (${temporizador - 5}-${temporizador}s): Faça parte dessa história!`;
        break;
      default:
        roteiro = `🎬 ROTEIRO PARA ${tipoVideo.toUpperCase()}\n\n` +
          `⏱️ Duração: ${temporizador} segundos\n\n` +
          `🎯 ABERTURA: Atenção Valente!\n\n` +
          `📢 CONTEÚDO: Conheça ${produtoNome} - a melhor opção da região.\n\n` +
          `🎬 FINAL: Acesse o app Valente Conecta e saiba mais!`;
    }

    return roteiro;
  };

  const gerarVideo = () => {
    if (modoEdicao === "personalizado" && !roteiroPersonalizado.trim()) {
      alert("Digite seu roteiro personalizado antes de gerar o vídeo!");
      return;
    }

    setGerando(true);

    setTimeout(() => {
      const roteiroFinal = modoEdicao === "personalizado"
        ? roteiroPersonalizado
        : gerarRoteiroAssistido();

      const novoVideo: VideoRoteiro = {
        id: Date.now().toString(),
        titulo: `${modoEdicao === "personalizado" ? "Personalizado" : tiposVideo.find(t => t.id === tipoVideo)?.nome || "Vídeo"} - ${new Date().toLocaleDateString()}`,
        tipo: modoEdicao === "personalizado" ? "personalizado" : tipoVideo,
        roteiroPersonalizado: modoEdicao === "personalizado" ? roteiroPersonalizado : "",
        roteiroGerado: roteiroFinal,
        duracao: `${temporizador}s`,
        status: "pronto",
        criadoEm: new Date().toISOString()
      };

      const updated = [novoVideo, ...videos];
      setVideos(updated);
      localStorage.setItem("videos_valentina", JSON.stringify(updated));
      setVideoGerado(novoVideo);
      setGerando(false);
    }, 2000);
  };

  const copiarRoteiro = (roteiro: string) => {
    navigator.clipboard.writeText(roteiro);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-6">
      {videoGerado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Video className="text-green-600" /> Vídeo Gerado com Sucesso!
              </h3>
              <button onClick={() => setVideoGerado(null)} className="text-gray-400">✕</button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-gray-800 mb-2">{videoGerado.titulo}</h4>
              <p className="text-sm text-gray-500">Duração: {videoGerado.duracao} | Tipo: {videoGerado.tipo}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">📝 ROTEIRO</h4>
                <button onClick={() => copiarRoteiro(videoGerado.roteiroGerado)} className="text-blue-600 text-sm flex items-center gap-1">
                  {copiado ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white p-3 rounded-lg border">
                {videoGerado.roteiroGerado}
              </pre>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Download size={16} /> Baixar Roteiro
              </button>
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Share2 size={16} /> Compartilhar
              </button>
              <button onClick={() => setVideoGerado(null)} className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Video className="text-purple-600" /> Fábrica de Vídeos IA
          </h1>
          <p className="text-sm text-gray-500">Crie vídeos profissionais com inteligência artificial</p>
        </div>
      </div>

      {/* Modo de Edição */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setModoEdicao("assistido")}
            className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${modoEdicao === "assistido"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Sparkles size={18} /> Modo Assistido (IA)
          </button>
          <button
            onClick={() => setModoEdicao("personalizado")}
            className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${modoEdicao === "personalizado"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <Edit size={18} /> Modo Personalizado
          </button>
        </div>

        <div className="bg-purple-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-purple-700">
            {modoEdicao === "assistido"
              ? "🤖 A IA cria o roteiro automaticamente baseado nas suas escolhas"
              : "✏️ Você digita seu próprio roteiro e a IA prepara o vídeo para publicação"}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings size={18} /> Configuração do Vídeo
        </h2>

        {modoEdicao === "assistido" ? (
          <>
            {/* Tipo de Vídeo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vídeo</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {tiposVideo.map(tipo => (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoVideo(tipo.id)}
                    className={`p-3 rounded-xl text-center transition ${tipoVideo === tipo.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <tipo.icon size={20} className="mx-auto mb-1" />
                    <p className="text-xs font-medium">{tipo.nome}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Segmento */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Segmento do Negócio</label>
              <select
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
              >
                {segmentos.map(seg => <option key={seg} value={seg}>{seg}</option>)}
              </select>
            </div>

            {/* Produto/Serviço */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Produto/Serviço</label>
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Marmita Fitness, Consultoria Jurídica..."
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
              />
            </div>

            {/* Duração */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração (segundos)</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map(seg => (
                  <button
                    key={seg}
                    onClick={() => setTemporizador(seg)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${temporizador === seg
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {seg}s
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Roteiro Personalizado */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Digite seu Roteiro Personalizado
              </label>
              <textarea
                value={roteiroPersonalizado}
                onChange={(e) => setRoteiroPersonalizado(e.target.value)}
                placeholder={`Exemplo:
🎬 ABERTURA: Ei, pessoal de Valente!
📢 DESENVOLVIMENTO: Hoje temos uma oferta especial...
🎬 FINAL: Corre no app Valente Conecta!`}
                className="w-full p-3 border rounded-lg h-48 bg-white text-gray-800 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dica: Inclua abertura, desenvolvimento e chamada final. Seu roteiro será usado para gerar o vídeo pronto para publicação.
              </p>
            </div>

            {/* Título Personalizado */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Título do Vídeo</label>
              <input
                type="text"
                placeholder="Ex: Oferta Imperdível - Valente Conecta"
                className="w-full p-2 border rounded-lg bg-white text-gray-800"
              />
            </div>
          </>
        )}

        {/* Botão Gerar */}
        <button
          onClick={gerarVideo}
          disabled={gerando}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
        >
          {gerando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Gerando vídeo...
            </>
          ) : (
            <>
              <Video size={18} /> Gerar Vídeo Pronto para Publicar
            </>
          )}
        </button>
      </div>

      {/* Vídeos Recentes */}
      {videos.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} /> Vídeos Recentes
          </h2>
          <div className="space-y-3">
            {videos.slice(0, 5).map(video => (
              <div key={video.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{video.titulo}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(video.criadoEm).toLocaleString()} • {video.duracao}
                    </p>
                    {video.roteiroPersonalizado && (
                      <p className="text-xs text-purple-600 mt-1">📝 Roteiro personalizado</p>
                    )}
                  </div>
                  <button
                    onClick={() => setVideoGerado(video)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Play size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 text-sm mb-2">🎬 Dicas para seu Roteiro Personalizado:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Comece com um gancho forte nos primeiros 5 segundos</li>
          <li>• Fale diretamente com o público de Valente, BA</li>
          <li>• Inclua uma chamada clara para ação (comprar, visitar, ligar)</li>
          <li>• Use linguagem simples e energética</li>
          <li>• Finalize com o logo do Valente Conecta</li>
        </ul>
      </div>
    </div>
  );
}

// Componente Building para o tipo institucional
function Building(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 12h6" /><path d="M9 16h6" /><path d="M9 8h6" /></svg>;
}

function Calendar(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}