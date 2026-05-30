"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { User, Phone, ArrowRight, Download, Smartphone, X, Gift } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [codigoConvite, setCodigoConvite] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: ""
  });

  useEffect(() => {
    const codigo = localStorage.getItem("convite_codigo");
    if (codigo) {
      setCodigoConvite(codigo);
      localStorage.removeItem("convite_codigo");
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("✅ App instalado!");
        setShowInstallPopup(false);
        setTimeout(() => router.push("/"), 1500);
      }
      setDeferredPrompt(null);
    } else {
      toast.success("📱 Adicione à Tela Inicial");
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const handleInstallLater = () => {
    setShowInstallPopup(false);
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Digite seu nome");
      return;
    }
    
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 10) {
      toast.error("WhatsApp válido (com DDD)");
      return;
    }
    
    setLoading(true);
    
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + 2);
    
    // Gerar código de indicação único
    const codigoIndicacao = `VALENTE_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    try {
      // Verificar se usuário já existe
      const { data: existing } = await supabase
        .from('usuarios')
        .select('id')
        .eq('whatsapp', formData.whatsapp)
        .maybeSingle();
      
      if (existing) {
        toast.error("Este WhatsApp já está cadastrado!");
        setLoading(false);
        return;
      }
      
      // Buscar ID do usuário que indicou (se tiver código)
      let convidadoPorId = null;
      if (codigoConvite) {
        const { data: indicador } = await supabase
          .from('usuarios')
          .select('id')
          .eq('codigo_indicacao', codigoConvite)
          .maybeSingle();
        
        if (indicador) {
          convidadoPorId = indicador.id;
        }
      }
      
      // Salvar no Supabase
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert({
          nome: formData.nome,
          whatsapp: formData.whatsapp,
          wallet: codigoConvite ? 5 : 0,
          role: 'user',
          trial_end_at: trialEndAt.toISOString(),
          codigo_indicacao: codigoIndicacao,
          convidado_por_id: convidadoPorId,
          cidade: 'VALENTE',
          nivel: 'CLIENTE'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Registrar indicação na tabela indicacoes
      if (convidadoPorId && newUser) {
        await supabase
          .from('indicacoes')
          .insert({
            usuario_id: convidadoPorId,
            indicado_id: newUser.id
          });
      }
      
      // Salvar no localStorage e cookies
      localStorage.setItem("valente_user", JSON.stringify(newUser));
      document.cookie = `user_id=${newUser.id}; path=/; max-age=172800`;
      document.cookie = `user_logged_in=true; path=/; max-age=172800`;
      document.cookie = `user_role=${newUser.role}; path=/; max-age=172800`;
      
      login(newUser);
      
      toast.success(`✅ Acesso por 48h!${codigoConvite ? " + R$5!" : ""}`);
      setShowInstallPopup(true);
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao cadastrar. Tente novamente.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-green-500/30">
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
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">📱 Instale o App!</h3>
              <p className="text-gray-300 mb-4">Acesso rápido pela tela inicial</p>
              <button onClick={handleInstall} className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg mb-3">
                <Download className="w-5 h-5" /> Instalar Agora
              </button>
              <button onClick={handleInstallLater} className="w-full py-3 bg-white/10 text-gray-300 rounded-2xl font-medium text-sm">
                Pular
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <h1 className="text-white font-bold text-lg text-center">Cadastro Rápido</h1>
      </header>

      <main className="max-w-md mx-auto p-6">
        {codigoConvite && (
          <div className="bg-yellow-400/10 border border-yellow-500 rounded-2xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">Código de convite aplicado!</span>
            </div>
            <p className="text-gray-300 text-sm">Você ganhará <span className="text-yellow-400 font-bold">R$5 de bônus</span>!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Seu nome</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Digite seu nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">WhatsApp (com DDD)</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="(75) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">✅ Número real para notificações</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Começar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Ao continuar, você concorda com nossos termos
        </p>
      </main>
    </div>
  );
}