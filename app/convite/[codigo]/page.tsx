"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { Gift, ArrowRight, CheckCircle, Smartphone, Download, Share2, Wifi, WifiOff } from "lucide-react";

export default function ConvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const [codigo, setCodigo] = useState<string>("");
  const [convidadoPor, setConvidadoPor] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [ipLocal, setIpLocal] = useState("");
  const [mesmaRede, setMesmaRede] = useState(false);

  useEffect(() => {
    const codigoExtraido = params.codigo as string;
    setCodigo(codigoExtraido || "");
    
    if (codigoExtraido === "ADMIN_VALENTE_2026") {
      setConvidadoPor("Admin Master");
      localStorage.setItem("convite_admin", "true");
      toast.success("🎉 Você foi convidado pelo Admin Master!");
    }

    // Detectar IP local para verificar mesma rede
    async function detectarIp() {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
            const match = event.candidate.candidate.match(ipRegex);
            if (match && match[0] !== window.location.hostname) {
              setIpLocal(match[0]);
              setMesmaRede(true);
              pc.close();
            }
          }
        };
      } catch (error) {
        console.log("Não foi possível detectar rede local");
      }
    }
    detectarIp();

    // Evento de instalação PWA
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, [params.codigo]);

  const handleInstalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("✅ App instalado na tela inicial!");
      }
      setDeferredPrompt(null);
    } else if (!user) {
      toast.success("📱 Após o cadastro, instale o app pelo menu do navegador!");
      router.push("/register");
    } else {
      toast.success("📱 Toque em 'Adicionar à Tela Inicial' no menu do navegador");
    }
  };

  const handleCadastrar = () => {
    if (codigo) {
      localStorage.setItem("convite_codigo", codigo);
    }
    router.push("/register");
  };

  const handleCompartilhar = async () => {
    const baseUrl = mesmaRede && ipLocal ? `http://${ipLocal}:3000` : window.location.origin;
    const link = `${baseUrl}/convite/${codigo}`;
    if (navigator.share) {
      await navigator.share({
        title: "Convite Valente Conecta",
        text: `Use meu código ${codigo} e ganhe R$5 de bônus!`,
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 text-center sticky top-0 z-40">
        <h1 className="text-white font-bold text-lg">Convite Valente Conecta</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Status da Rede */}
        {mesmaRede && (
          <div className="bg-green-500/20 border border-green-500 rounded-2xl p-3 text-center flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">✅ Você está na mesma rede WiFi que o convidante!</span>
          </div>
        )}

        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Você foi convidado!</h2>
          <p className="text-gray-400">
            {convidadoPor
              ? `${convidadoPor} te convidou para experimentar o Valente Conecta`
              : "Alguém te convidou para experimentar o Valente Conecta"}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-lg">🎁 O que você ganha ao se cadastrar?</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>R$5 de bônus na carteira digital</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Acesso completo a todos os serviços</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Academia, Cozinha, Moto Táxi e muito mais</span>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span>App instalável na tela inicial</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">📋 Seu código de convite</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              readOnly
              className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm font-mono text-center"
            />
            <button onClick={handleCompartilhar} className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={handleCadastrar}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          Cadastrar Agora
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleInstalar}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <Download className="w-5 h-5" />
          Instalar App na Tela Inicial
        </button>

        {mesmaRede && (
          <p className="text-center text-green-400 text-sm">
            🔗 Link local detectado! A instalação será mais rápida na mesma rede WiFi.
          </p>
        )}
      </main>
    </div>
  );
}