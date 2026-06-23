// components/home/VideoLancamento.tsx
// 🎨 UI PURA - Vídeo de Lançamento

"use client";

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoLancamentoProps {
  videoId?: string;
  titulo?: string;
}

export default function VideoLancamento({ 
  videoId = 'dQw4w9WgXcQ',
  titulo = '🚀 Conheça o Valente Conecta' 
}: VideoLancamentoProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <section className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition">
        <div 
          className="flex items-center justify-between"
          onClick={() => setModalAberto(true)}
        >
          <div>
            <h3 className="text-white font-semibold">{titulo}</h3>
            <p className="text-white/70 text-sm">Clique para assistir ao vídeo de apresentação</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
      </section>

      {/* Modal do Vídeo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-3xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <span className="text-white font-semibold">{titulo}</span>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={titulo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}