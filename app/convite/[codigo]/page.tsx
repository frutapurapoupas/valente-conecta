"use client";

export const dynamic = 'force-dynamic';

// Caminho: C:\valente_conecta\app\convite\[codigo]\page.tsx
//
// Reescrita: antes o codigo do convite nunca era resolvido contra o banco
// (so' ficava guardado no localStorage) e o botao "Cadastrar Agora" mandava
// pra /register (fluxo de email+senha via Supabase Auth) em vez do cadastro
// minimo nome+whatsapp que ja existe e e' o que este fluxo pede
// (lib/auth.ts -> cadastroSimples, components/CadastroPopup.tsx). Agora
// resolve o convidador de verdade e mostra o cadastro na hora, sem redirecionar.

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isUserLoggedIn } from "@/lib/auth";
import toast from "react-hot-toast";
import { Gift, CheckCircle, Share2, Lock, TrendingUp, Smartphone } from "lucide-react";
import { CadastroPopup } from "@/components/CadastroPopup";

export default function ConvitePage() {
  const params = useParams();
  const codigo = (params?.codigo as string) || "";
  const [convidadoPor, setConvidadoPor] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [jaCadastrado, setJaCadastrado] = useState(false);
  const [beneficios, setBeneficios] = useState([
    { texto: "💰 Bônus na carteira digital ao indicar amigos", bloqueado: true, meta: "Ver campanha ativa" },
    { texto: "⏰ Dias de acesso gratuito", bloqueado: false },
    { texto: "🎯 Acesso a todos os serviços da plataforma", bloqueado: false },
    { texto: "📱 App instalável na tela inicial", bloqueado: false },
  ]);

  useEffect(() => {
    setBaseUrl(window.location.origin);
    setJaCadastrado(isUserLoggedIn());

    // Registra de onde veio (usado pelo InstallPrompt para dar prioridade)
    if (codigo) {
      localStorage.setItem("convite_codigo", codigo);
      localStorage.setItem("convite_origem", "link");
      localStorage.setItem("convite_timestamp", new Date().toISOString());
    }

    if (codigo) {
      supabase
        .from("usuarios")
        .select("nome")
        .eq("codigo_indicacao", codigo)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.nome) setConvidadoPor(data.nome);
        });
    }

    fetch("/api/beneficios")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.beneficios?.length > 0) {
          setBeneficios(
            data.beneficios.map((b: string) => (b.includes("R$") ? { texto: b, bloqueado: true, meta: "Ver campanha ativa" } : { texto: b, bloqueado: false }))
          );
        }
      })
      .catch(() => {});
  }, [codigo]);

  const handleCompartilhar = async () => {
    const link = `${baseUrl}/convite/${codigo}`;
    if (navigator.share) {
      await navigator.share({ title: "Convite Valente Conecta", text: "Use meu link e ganhe acesso ao Valente Conecta!", url: link });
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
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Você foi convidado!</h2>
          <p className="text-gray-400">
            {convidadoPor ? `${convidadoPor} te convidou para experimentar o Valente Conecta` : "Alguém te convidou para experimentar o Valente Conecta"}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-lg">🎁 Benefícios exclusivos:</h3>
          <div className="space-y-3">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-start gap-3">
                {beneficio.bloqueado ? <Lock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" /> : <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />}
                <div>
                  <span className={beneficio.bloqueado ? "text-yellow-400" : "text-white"}>{beneficio.texto}</span>
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

        {codigo && (
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-2">📋 Compartilhe este convite</p>
            <div className="flex gap-2">
              <input type="text" value={codigo} readOnly className="flex-1 bg-white/20 rounded-xl p-3 text-white text-sm font-mono text-center" />
              <button onClick={handleCompartilhar} className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {jaCadastrado ? (
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">Você já tem cadastro no Valente Conecta — aproveite!</p>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/40 rounded-2xl p-4 flex items-center gap-2 text-blue-200 text-sm">
            <Smartphone className="w-4 h-4 shrink-0" />
            Preencha nome e WhatsApp abaixo — leva 10 segundos.
          </div>
        )}
      </main>

      {!jaCadastrado && (
        <CadastroPopup
          forceShow
          codigoIndicacao={codigo}
          onSuccess={() => setJaCadastrado(true)}
        />
      )}
    </div>
  );
}
