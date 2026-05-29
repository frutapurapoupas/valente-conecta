"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Youtube, Info, HelpCircle, Video } from "lucide-react";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

interface VideoTutorial {
  id: number;
  titulo: string;
  descricao: string;
  videoId: string;
  duracao: string;
  categoria: string;
}

const videos: VideoTutorial[] = [
  { id: 1, titulo: "Como fazer seu cadastro", descricao: "Aprenda a criar sua conta no Valente Conecta e começar a usar todos os recursos.", videoId: "dQw4w9WgXcQ", duracao: "2:30", categoria: "Primeiros Passos" },
  { id: 2, titulo: "Como indicar amigos e ganhar bônus", descricao: "Saiba como compartilhar seu código e ganhar R$5 por cada amigo que se cadastrar.", videoId: "dQw4w9WgXcQ", duracao: "3:15", categoria: "Indicação" },
  { id: 3, titulo: "Usando a Cozinha - Cardápio e Pedidos", descricao: "Veja como fazer pedidos, personalizar seu prato e acompanhar o status.", videoId: "dQw4w9WgXcQ", duracao: "4:00", categoria: "Cozinha" },
  { id: 4, titulo: "Academia - Registrando seus treinos", descricao: "Aprenda a usar a geolocalização e registrar seus treinos na academia.", videoId: "dQw4w9WgXcQ", duracao: "3:45", categoria: "Academia" },
  { id: 5, titulo: "Moto Táxi - Solicitando corridas", descricao: "Como solicitar uma corrida, calcular preço e encontrar motoristas próximos.", videoId: "dQw4w9WgXcQ", duracao: "2:50", categoria: "Transporte" },
  { id: 6, titulo: "Comércio - Comprando produtos", descricao: "Navegue pelas lojas, adicione produtos ao carrinho e finalize sua compra.", videoId: "dQw4w9WgXcQ", duracao: "3:30", categoria: "Comércio" },
  { id: 7, titulo: "Carteira Digital e Pagamentos", descricao: "Entenda como funciona sua carteira, recebimentos e pagamentos via PIX.", videoId: "dQw4w9WgXcQ", duracao: "4:15", categoria: "Financeiro" },
  { id: 8, titulo: "IA Fitness - Planos personalizados", descricao: "Como a IA analisa seus dados e gera treinos personalizados para você.", videoId: "dQw4w9WgXcQ", duracao: "3:20", categoria: "Academia" },
  { id: 9, titulo: "Histórico de Cargas - Acompanhe evolução", descricao: "Registre e acompanhe sua evolução de pesos nos exercícios.", videoId: "dQw4w9WgXcQ", duracao: "2:40", categoria: "Academia" },
  { id: 10, titulo: "Administrador Master - Controle total", descricao: "Para admins: gerenciar usuários, planos e configurações do sistema.", videoId: "dQw4w9WgXcQ", duracao: "5:00", categoria: "Admin" }
];

export default function AjudaPage() {
  const router = useRouter();
  const [videoSelecionado, setVideoSelecionado] = useState<VideoTutorial | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");

  const categorias = ["Todos", "Primeiros Passos", "Indicação", "Cozinha", "Academia", "Transporte", "Comércio", "Financeiro", "Admin"];

  const videosFiltrados = categoriaFiltro === "Todos" 
    ? videos 
    : videos.filter(v => v.categoria === categoriaFiltro);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">📹 Central de Ajuda e Vídeos</h1>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoriaFiltro === cat 
                  ? "bg-yellow-500 text-black" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout com vídeos à esquerda e detalhes à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Lista de vídeos */}
          <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {videosFiltrados.map((video) => (
              <div
                key={video.id}
                onClick={() => setVideoSelecionado(video)}
                className={`bg-gray-800 rounded-2xl p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                  videoSelecionado?.id === video.id ? "ring-2 ring-yellow-500 bg-gray-700" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm line-clamp-1">{video.titulo}</h3>
                      <span className="text-[10px] bg-gray-600 px-2 py-0.5 rounded-full text-gray-300">{video.duracao}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{video.descricao}</p>
                    <p className="text-[10px] text-yellow-500 mt-1">{video.categoria}</p>
                  </div>
                  <Play className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Coluna da direita - Player e informações */}
          <div className="lg:col-span-2">
            {videoSelecionado ? (
              <div className="bg-gray-800 rounded-2xl overflow-hidden sticky top-20">
                {/* Player de vídeo */}
                <div className="aspect-video bg-black flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Youtube className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">🎥 Vídeo demonstrativo</p>
                    <p className="text-xs text-gray-500 mt-2">(Em produção - versão demo)</p>
                  </div>
                </div>
                
                {/* Informações do vídeo */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-bold text-white">{videoSelecionado.titulo}</h2>
                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                      {videoSelecionado.duracao}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-400">{videoSelecionado.categoria}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{videoSelecionado.descricao}</p>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Dica importante
                    </h3>
                    <p className="text-sm text-gray-300">
                      Para aproveitar ao máximo esta funcionalidade, certifique-se de ter seu cadastro completo 
                      e as permissões necessárias no app.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl p-12 text-center">
                <HelpCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Selecione um vídeo</h3>
                <p className="text-gray-400">Escolha um tutorial na lista ao lado para assistir</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}