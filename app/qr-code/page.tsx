"use client";


export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Share2, Download, CheckCircle } from "lucide-react";

export default function QRCodePage() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [estatisticas, setEstatisticas] = useState({ total: 0, ativos: 0, pendentes: 0 });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const codigoIndicacao = isAdmin ? "ADMIN_VALENTE_2026" : (user?.id || "VALENTE2026");
  const linkIndicacao = `https://valente-conecta.clic.com.br/convite/${codigoIndicacao}`;

  useEffect(() => {
    setIsClient(true);
    
    // Gerar QR Code
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkIndicacao)}`;
    setQrCodeUrl(url);

    // Detectar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Carregar estatísticas
    const indicacoes = localStorage.getItem("indicacoes_convite");
    if (indicacoes) {
      const dados = JSON.parse(indicacoes);
      setEstatisticas({
        total: dados.length,
        ativos: dados.filter((i: any) => i.status === "ativo").length,
        pendentes: dados.filter((i: any) => i.status === "pendente").length
      });
    } else if (isAdmin) {
      setEstatisticas({ total: 15, ativos: 12, pendentes: 3 });
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isAdmin, linkIndicacao]);

  const handleCopy = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoIndicacao);
    setCopiedCode(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleShare = () => {
    const texto = isAdmin
      ? `Convite especial do Admin Master!\nCódigo: ${codigoIndicacao}\nLink: ${linkIndicacao}`
      : `Use meu código ${codigoIndicacao} e ganhe R$5 de bônus!`;

    if (navigator.share) {
      navigator.share({ title: "Valente Conecta", text: texto, url: linkIndicacao });
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `convite_${codigoIndicacao}.png`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("QR Code baixado!");
      });
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success("✅ App instalado na tela inicial!");
      }
      setDeferredPrompt(null);
    } else {
      toast.success("📱 Toque em 'Adicionar à Tela Inicial' no menu do navegador", { duration: 5000 });
    }
  };

  // Loading durante hidratação
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()} className="text-white text-xl">←</button>
        <h1 className="text-white font-bold text-lg">
          {isAdmin ? "Convite Exclusivo Admin" : "Indique e Ganhe"}
        </h1>
      </header>

      <div className="p-6 text-center">
        <div className="bg-gradient-to-br from-yellow-300 to-amber-500 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-8 border-yellow-200 text-5xl font-bold text-black mx-auto">
          {isAdmin ? "👑" : "R$"}
        </div>
        <h2 className="text-2xl font-bold text-white mt-6">
          {isAdmin ? "Convite Especial do Admin Master" : "Ganhe dinheiro indicando!"}
        </h2>
        <p className="text-gray-400 mt-2">
          {isAdmin
            ? "Compartilhe este código para novos usuários se cadastrarem"
            : "Para cada amigo que se cadastrar, você ganha R$5,00"}
        </p>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-gray-600 font-bold mb-3">QR CODE EXCLUSIVO</p>
          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />}
          <p className="text-gray-500 text-sm mt-3">Compartilhe o código abaixo</p>
        </div>
      </div>

      <div className="px-6 space-y-3">
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Seu código de indicação</p>
          <div className="flex gap-2">
            <input type="text" value={codigoIndicacao} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm font-mono" />
            <button onClick={handleCopyCode} className="bg-blue-500 text-white px-4 py-3 rounded-xl">{copiedCode ? "✅" : "📋"}</button>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">Seu link de indicação</p>
          <div className="flex gap-2">
            <input type="text" value={linkIndicacao} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm" />
            <button onClick={handleCopy} className="bg-blue-500 text-white px-4 py-3 rounded-xl">{copied ? "✅" : "📋"}</button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleShare} className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <button onClick={handleDownload} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Baixar QR
          </button>
        </div>

        <button onClick={handleInstall} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Instalar App na Tela Inicial
        </button>

        {isAdmin && (
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-4 mt-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><p className="text-2xl font-bold text-green-400">{estatisticas.ativos}</p><p className="text-xs text-gray-400">Cadastros ativos</p></div>
              <div><p className="text-2xl font-bold text-yellow-400">{estatisticas.pendentes}</p><p className="text-xs text-gray-400">Pendentes</p></div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 mt-6 mb-8">
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Como instalar o app?
          </h3>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Escaneie o QR Code acima</li>
            <li>2. Abra o link no navegador</li>
            <li>3. Toque em "Instalar App na Tela Inicial"</li>
            <li>4. O app será instalado na tela inicial</li>
          </ol>
        </div>
      </div>
    </div>
  );
}