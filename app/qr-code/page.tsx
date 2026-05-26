"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function QRCodePage() {
  const router = useRouter();
  const { user } = useApp();
  const [copied, setCopied] = useState(false);

  const codigoIndicacao = user?.id || "VALENTE2026";
  const linkIndicacao = `https://valente-conecta.clic.com.br/convite/${codigoIndicacao}`;

  // Gerar QR Code (simulado)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkIndicacao)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setCopied(true);
    toast.success("Link copiado! Compartilhe com seus amigos.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Valente Conecta",
        text: "Use meu código e ganhe R$5 de bônus!",
        url: linkIndicacao,
      });
    } else {
      handleCopy();
    }
  };

  const handleInstall = () => {
    toast.success("📱 Adicione à tela inicial: Menu → Adicionar à tela inicial", { duration: 5000 });
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-lg">🎁 Indique e Ganhe</h1>
      </header>

      <div className="p-6 text-center">
        <div className="coin bg-gradient-to-br from-yellow-300 to-amber-500 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-8 border-yellow-200 text-5xl font-bold text-black mx-auto animate-spin-slow">
          R$
        </div>
        <h2 className="text-2xl font-bold text-white mt-6">Ganhe dinheiro indicando!</h2>
        <p className="text-gray-400 mt-2">Para cada amigo que se cadastrar, você ganha <span className="text-green-400 font-bold">R$5,00</span></p>
      </div>

      {/* QR Code */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-gray-600 font-bold mb-3">📱 ESCANEIE O QR CODE</p>
          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
          <p className="text-gray-500 text-sm mt-3">Ou compartilhe o link abaixo</p>
        </div>
      </div>

      {/* Link e Botões */}
      <div className="px-6 space-y-3">
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Seu link de indicação</p>
          <div className="flex gap-2">
            <input type="text" value={linkIndicacao} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm" />
            <button onClick={handleCopy} className="bg-blue-500 text-white px-4 py-3 rounded-xl">
              <i className={`fas ${copied ? "fa-check" : "fa-copy"}`}></i>
            </button>
          </div>
        </div>

        <button onClick={handleShare} className="w-full bg-green-500 text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
          <i className="fab fa-whatsapp text-xl"></i> Compartilhar no WhatsApp
        </button>

        <button onClick={handleInstall} className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
          <i className="fas fa-download text-xl"></i> Instalar App na Tela Inicial
        </button>

        <div className="bg-yellow-400/10 border border-yellow-400 rounded-2xl p-4 text-center mt-4">
          <p className="text-yellow-400 font-bold mb-2">📊 Seus ganhos</p>
          <p className="text-3xl font-bold text-white">R$ {user?.wallet || 10}</p>
          <p className="text-gray-400 text-sm mt-1">Saldo disponível na carteira</p>
        </div>
      </div>
    </div>
  );
}
