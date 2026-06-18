// Arquivo: components/home/VideoLancamento.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - VÍDEO LANÇAMENTO
// ============================================

import { Play, X } from 'lucide-react';
import { useState } from 'react';
import { homeConstants } from '@/constants/homeConstants';

export default function VideoLancamento() {
  const [showVideo, setShowVideo] = useState(false);
  const { cores, titulos } = homeConstants;

  return (
    <>
      <div className="mb-8">
        <button
          onClick={() => setShowVideo(true)}
          className={`w-full bg-gradient-to-r ${cores.videoBg} rounded-2xl p-6 text-center hover:from-gray-800 hover:to-gray-700 transition-colors`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">{titulos.video}</p>
              <p className="text-gray-300 text-sm">{titulos.videoDesc}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Modal do Vídeo */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="bg-black rounded-xl overflow-hidden aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Vídeo Valente Conecta"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}