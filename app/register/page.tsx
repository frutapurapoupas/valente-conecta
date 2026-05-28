"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle, Download, Smartphone, X, Gift } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [codigoConvite, setCodigoConvite] = useState("");
  const [installSupported, setInstallSupported] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: ""
  });

  // Detectar evento de instalação PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallSupported(true);
    };
    
    window.addEventListener("beforeinstallprompt", handler);
    
    // Verificar se o navegador suporta instalação
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      // Não está instalado ainda
      setInstallSupported(true);
    }
    
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Carregar código de convite do localStorage
  useEffect(() => {
    const codigo = localStorage.getItem("convite_codigo");
    if (codigo) {
      setCodigoConvite(codigo);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Mostrar o popup de instalação do navegador
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        toast.success("✅ App instalado com sucesso!");
        setShowInstallPopup(false);
        // Aguardar um pouco e redirecionar para home
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        toast.error("Instalação cancelada. Você pode instalar depois pelo menu.");
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: instruções manuais
      toast.success("📱 Para instalar, clique em 'Adicionar à Tela Inicial' no menu do navegador", { duration: 5000 });
    }
  };

  const handleInstallLater = () => {
    setShowInstallPopup(false);
    router.push("/");
    toast.success("Você pode instalar depois pelo menu 'Adicionar à Tela Inicial'", { duration: 4000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone || !formData.senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    
    // Simular cadastro
    setTimeout(() => {
      const novoUsuario = {
        id: Date.now().toString(),
        name: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        wallet: 15,
        isAdmin: false,
        plano: "Grátis"
      };
      
      localStorage.setItem("valente_user", JSON.stringify(novoUsuario));
      login(novoUsuario);
      
      toast.success("✅ Cadastro realizado com sucesso! +R$5 de bônus!");
      
      // Mostrar popup de instalação APÓS o cadastro
      setShowInstallPopup(true);
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      {/* Popup de Instalação */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-green-500/30 animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-white" />
                <span className="text-white font-bold">Instalar App</span>
              </div>
              <button onClick={handleInstallLater} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Download className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">🚀 Instale o App!</h3>
              <p className="text-gray-300 mb-4">
                Instale o Valente Conecta na tela inicial do seu celular para acessar mais rápido e receber notificações.
              </p>
              
              <div className="bg-white/10 rounded-xl p-3 mb-6">
                <p className="text-green-400 text-sm font-medium mb-2">✨ Vantagens:</p>
                <div className="text-left space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center gap-2">✅ Acesso direto pelo ícone na tela inicial</div>
                  <div className="flex items-center gap-2">✅ Funciona como um aplicativo nativo</div>
                  <div className="flex items-center gap-2">✅ Notificações push</div>
                  <div className="flex items-center gap-2">✅ Carregamento mais rápido</div>
                </div>
              </div>
              
              <button
                onClick={handleInstall}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition transform hover:scale-[1.02] mb-3"
              >
                <Download className="w-5 h-5" />
                Instalar Agora
              </button>
              
              <button
                onClick={handleInstallLater}
                className="w-full py-3 bg-white/10 text-gray-300 rounded-2xl font-medium text-sm hover:bg-white/20 transition"
              >
                Pular, instalar depois
              </button>
              
              <p className="text-gray-500 text-xs mt-4">
                ⚡ A instalação é rápida e gratuita. Toque em "Instalar" e confirme.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <h1 className="text-white font-bold text-lg text-center">Criar Conta</h1>
      </header>

      <main className="max-w-md mx-auto p-6">
        {/* Bônus de indicação */}
        {codigoConvite && (
          <div className="bg-yellow-400/10 border border-yellow-500 rounded-2xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">Código de convite aplicado!</span>
            </div>
            <p className="text-gray-300 text-sm">
              Você ganhará <span className="text-yellow-400 font-bold">R$5 de bônus</span> ao se cadastrar!
            </p>
            <p className="text-gray-500 text-xs mt-1">Código: {codigoConvite}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Nome completo</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-green-500 transition">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Digite seu nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">E-mail</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-green-500 transition">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">WhatsApp</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-green-500 transition">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="(75) 99999-9999"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Senha</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-green-500 transition">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Confirmar senha</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20 focus-within:border-green-500 transition">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Cadastrar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Já tem uma conta?{" "}
          <button onClick={() => router.push("/login")} className="text-green-400 font-medium hover:underline">
            Faça login
          </button>
        </p>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
      `}</style>
    </div>
  );
}