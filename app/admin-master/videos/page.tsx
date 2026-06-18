"use client";

import { Sparkles } from "lucide-react";
import VideoProducer from "./components/VideoProducer";

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Fábrica de Vídeos - Valentinha
          </h1>
          <p className="text-sm text-gray-500">Crie roteiros e thumbnails com IA do Google (grátis)</p>
        </div>
      </div>
      <VideoProducer />
    </div>
  );
}