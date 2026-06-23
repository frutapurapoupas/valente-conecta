// app/admin-master/fabrica-videos/page.tsx
// 📄 Fábrica de Vídeos - IA

"use client";

import { useState } from 'react';
import { 
  Video, 
  Plus, 
  Play, 
  Download, 
  Sparkles,
  Film,
  Clock,
  Eye,
  TrendingUp,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface VideoItem {
  id: string;
  nome: string;
  status: 'pronto' | 'gerando' | 'erro';
  duracao: string;
  views: number;
  data: string;
  estilo: 'reels' | 'novela' | 'tutorial';
}

export default function FabricaVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([
    { id: '1', nome: 'Novo Cardápio da Semana', status: 'pronto', duracao: '0:45', views: 156, data: '19/06/2026', estilo: 'reels' },
    { id: '2', nome: 'Promoção de Fim de Semana', status: 'gerando', duracao: '0:30', views: 0, data: '19/06/2026', estilo: 'reels' },
    { id: '3', nome: 'Dica do Chef - Feijoada', status: 'pronto', duracao: '1:20', views: 89, data: '18/06/2026', estilo: 'tutorial' },
    { id: '4', nome: 'A História do Açaí', status: 'pronto', duracao: '2:15', views: 234, data: '17/06/2026', estilo: 'novela' },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newVideo: VideoItem = {
        id: Date.now().toString(),
        nome: `Vídeo - ${new Date().toLocaleDateString('pt-BR')}`,
        status: 'gerando',
        duracao: '0:00',
        views: 0,
        data: new Date().toLocaleDateString('pt-BR'),
        estilo: 'reels'
      };
      setVideos(prev => [newVideo, ...prev]);
      setIsGenerating(false);
    }, 2000);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pronto': return '✅ Pronto';
      case 'gerando': return '⏳ Gerando...';
      case 'erro': return '❌ Erro';
      default: return status;
    }
  };

  const getEstiloIcon = (estilo: string) => {
    switch (estilo) {
      case 'reels': return <Sparkles size={14} className="text-purple-400" />;
      case 'novela': return <Film size={14} className="text-pink-400" />;
      case 'tutorial': return <Video size={14} className="text-blue-400" />;
      default: return null;
    }
  };

  const getEstiloLabel = (estilo: string) => {
    switch (estilo) {
      case 'reels': return 'Reels';
      case 'novela': return 'Novela de Frutas';
      case 'tutorial': return 'Tutorial';
      default: return estilo;
    }
  };

  const stats = {
    total: videos.length,
    prontos: videos.filter(v => v.status === 'pronto').length,
    gerando: videos.filter(v => v.status === 'gerando').length,
    views: videos.reduce((acc, v) => acc + v.views, 0)
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin-master/ia" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Film className="text-purple-400" />
              Fábrica de Vídeos
            </h1>
            <p className="text-sm text-gray-400">Crie vídeos automáticos para marketing e engajamento</p>
          </div>
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isGenerating ? 'Gerando...' : 'Novo Vídeo'}
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Video} label="Total" value={stats.total} />
          <StatCard icon={Clock} label="Em Processo" value={stats.gerando} />
          <StatCard icon={Eye} label="Visualizações" value={stats.views} />
          <StatCard icon={TrendingUp} label="Prontos" value={stats.prontos} />
        </div>

        {/* Estilos de Vídeo */}
        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 mb-6">
          <h3 className="font-medium mb-3">🎬 Estilos de Vídeo</h3>
          <div className="grid grid-cols-3 gap-3">
            <StyleCard 
              name="Reels" 
              description="Vídeos rápidos para Instagram e TikTok" 
              icon={Sparkles}
              color="purple"
            />
            <StyleCard 
              name="Novela de Frutas" 
              description="Narrativas dramáticas com personificação" 
              icon={Film}
              color="pink"
            />
            <StyleCard 
              name="Tutorial" 
              description="Passo a passo de receitas e dicas" 
              icon={Video}
              color="blue"
            />
          </div>
        </div>

        {/* Lista de Vídeos */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">📹 Vídeos Gerados</h3>
          {videos.length === 0 ? (
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-8 text-center text-gray-400">
              <Video size={48} className="mx-auto opacity-30 mb-3" />
              <p>Nenhum vídeo gerado ainda</p>
              <button 
                onClick={handleGenerateVideo}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
              >
                Criar primeiro vídeo
              </button>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4 hover:border-purple-500/30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {video.status === 'pronto' ? (
                      <Play size={24} className="text-gray-400" />
                    ) : video.status === 'gerando' ? (
                      <Loader2 size={20} className="text-yellow-400 animate-spin" />
                    ) : (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{video.nome}</h3>
                      <span className="text-xs text-gray-500">{video.data}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{getStatusLabel(video.status)}</span>
                      <span>•</span>
                      <span>{video.duracao}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {getEstiloIcon(video.estilo)}
                        <span>{getEstiloLabel(video.estilo)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{video.views} visualizações</span>
                  {video.status === 'pronto' && (
                    <>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition" title="Visualizar">
                        <Play size={16} />
                      </button>
                      <button className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition text-green-400" title="Download">
                        <Download size={16} />
                      </button>
                    </>
                  )}
                  {video.status === 'gerando' && (
                    <span className="text-xs text-yellow-400">⏳ Processando...</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 text-center">
      <Icon size={20} className="text-purple-400 mx-auto mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function StyleCard({ 
  name, 
  description, 
  icon: Icon, 
  color 
}: { 
  name: string; 
  description: string; 
  icon: any; 
  color: 'purple' | 'pink' | 'blue';
}) {
  const colors = {
    purple: 'border-purple-500/30 hover:border-purple-500/50 text-purple-400',
    pink: 'border-pink-500/30 hover:border-pink-500/50 text-pink-400',
    blue: 'border-blue-500/30 hover:border-blue-500/50 text-blue-400'
  };

  return (
    <div className={`bg-gray-800/50 rounded-lg p-3 border ${colors[color]} transition cursor-pointer hover:bg-gray-800`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={colors[color]} />
        <span className="font-medium text-sm">{name}</span>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}