"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

export default function LancamentoPage() {
  const router = useRouter();

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const irParaIndicacao = () => {
    router.push("/qr-code");
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
          <div className="bg-gray-800 h-72 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <i className="fas fa-play-circle text-6xl text-blue-400"></i>
          </div>
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
            💰 INDICAR AGORA E GANHAR
          </button>
        </div>
      </div>
    </div>
  );
}