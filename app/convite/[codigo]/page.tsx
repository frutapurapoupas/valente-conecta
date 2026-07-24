"use client";

export const dynamic = 'force-dynamic';

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { Gift, ArrowRight, CheckCircle, Smartphone, Download, Share2, Lock, TrendingUp } from "lucide-react";

export default function ConvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useApp();
  const [codigo, setCodigo] = useState<string>("");
  const [convidadoPor, setConvidadoPor] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [beneficios, setBeneficios] = useState([
    { texto: "💰 R$10 de bônus na carteira digital", bloqueado: true, meta: "Indique 50 usuários válidos" },
    { texto: "⏰ 2 dias de acesso gratuito", bloqueado: false },
    { texto: "🎯 Acesso a todos os serviços da plataforma", bloqueado: false },
    { texto: "📱 App instalável na tela inicial", bloqueado: false }
  ]);

  // Buscar benefícios dinâmicos do Admin
  useEffect(() => {
    const buscarBeneficios = async () => {
      try {
        const response = await fetch('/api/beneficios');
        if (response.ok) {
          const data = await response.json();
          if (data.beneficios && data.beneficios.length > 0) {
            // Converter benefícios do admin para o formato com bloqueio
            const beneficiosFormatados = data.beneficios.map((b: string) => {
              if (b.includes("R$")) {
                return { texto: b, bloqueado: true, meta: "Indique 50 usuários válidos" };
              }
              return { texto: b, bloqueado: false };
            });
            setBeneficios(beneficiosFormatados);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar benefícios:", error);
      }
    };
    buscarBeneficios();
  }, []);

  useEffect(() => {
    setIsClient(true);
    setBaseUrl(window.location.origin);
    
    const codigoExtraido = (params?.codigo as string) || "";
    setCodigo(codigoExtraido || "");
    
    if (codigoExtraido === "ADMIN_VALENTE_2026") {
      setConvidadoPor("Admin Master");
      localStorage.setItem("convite_admin", "true");
      toast.success("🎉 Você foi convidado pelo Admin Master!");
    }

    // Salvar código de convite para usar no cadastro
    if (codigoExtraido) {
      localStorage.setItem("convite_codigo", codigoExtraido);
      localStorage.setItem("convite_origem", "link");
      localStorage.setItem("convite_timestamp", new Date().toISOString());
    }

    // Evento de instalação PWA
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, [params?.codigo]);

  const handleInstalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("✅ App instalado na tela inicial!");
      }
      setDeferredPrompt(null);
    } else if (!user) {
      toast.success("📱 Vamos fazer cadastro rápido e instalar em seguida.");
      router.push("/register");
    } else {
      toast.success("📱 Toque em 'Adicionar à Tela Inicial' no menu do navegador");
    }
  };

  const handleCadastrar = () => {
    localStorage.setItem("convite_origem", "cadastro-direto");
    router.push("/register");
  };

  const handleCompartilhar = async () => {
    const link = `${baseUrl}/convite/${codigo}`;
    if (navigator.share) {
      await navigator.share({
        title: "Convite Valente Conecta",
        text: `Use meu código ${codigo} e ganhe R$10 de bônus!`,
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 text-center sticky top-0 z-40">
        <h1 className="text-white font-bold text-lg">Convite Valente Conecta</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
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
          <h3 className="font-bold text-white text-lg">🎁 Benefícios exclusivos:</h3>
          <div className="space-y-3">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-start gap-3">
                {beneficio.bloqueado ? (
                  <Lock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className={beneficio.bloqueado ? "text-yellow-400" : "text-white"}>
                    {beneficio.texto}
                  </span>
                  {beneficio.bloqueado && beneficio.meta && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-xs">{beneficio.meta}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4">
          <p className="text-yellow-400 text-sm font-medium mb-2">💡 Como desbloquear o bônus de R$10?</p>
          <p className="text-gray-300 text-sm">
            Indique 50 amigos que nunca tiveram o app instalado. Cada amigo válido conta como 1 indicação. 
            Ao atingir a meta, o bônus será liberado automaticamente na sua carteira!
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-2">📋 Seu código de convite</p>
          <div className="flex gap-2">
            <input type="text" value={codigo} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm font-mono text-center" />
            <button onClick={handleCompartilhar} className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button onClick={handleCadastrar} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition">
          Cadastrar Agora <ArrowRight className="w-5 h-5" />
        </button>

        <button onClick={handleInstalar} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition">
          <Download className="w-5 h-5" /> Instalar App na Tela Inicial
        </button>
      </main>
    </div>
  );
}