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
import { BotaoInstalarApp } from "@/components/BotaoInstalarApp";

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
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <header className="bg-gradient-to-r from-green-500 to-green-700 p-4 text-center sticky top-0 z-40 shadow-sm">
        <h1 className="text-white font-bold text-lg">Convite Valente Conecta</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Você foi convidado!</h2>
          <p className="text-slate-500">
            {convidadoPor ? `${convidadoPor} te convidou para experimentar o Valente Conecta` : "Alguém te convidou para experimentar o Valente Conecta"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">🎁 Benefícios exclusivos:</h3>
          <div className="space-y-3">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-start gap-3">
                {beneficio.bloqueado ? <Lock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /> : <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />}
                <div>
                  <span className={beneficio.bloqueado ? "text-amber-600 font-medium" : "text-slate-700"}>{beneficio.texto}</span>
                  {beneficio.bloqueado && beneficio.meta && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400 text-xs">{beneficio.meta}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {codigo && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-slate-500 text-sm mb-2">📋 Compartilhe este convite</p>
            <div className="flex gap-2">
              <input type="text" value={codigo} readOnly className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-sm font-mono text-center" />
              <button onClick={handleCompartilhar} className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {jaCadastrado ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <p className="text-emerald-800 text-sm">Você já tem cadastro no Valente Conecta — aproveite!</p>
            </div>
            <a
              href="/"
              className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              Entrar no Valente Conecta
            </a>
            {/* Icone pode ter sumido (nunca instalado, ou removido do
                celular) -- diferente do InstallPrompt.tsx global, este
                botao nao depende de nenhum flag de "ja mostrei antes",
                entao sempre da uma forma de reinstalar. */}
            <BotaoInstalarApp
              texto="Reinstalar ícone na tela inicial"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold py-3 rounded-xl transition"
            />
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-2 text-blue-800 text-sm">
            <Smartphone className="w-4 h-4 shrink-0 text-blue-500" />
            Preencha nome e WhatsApp abaixo — leva 10 segundos.
          </div>
        )}
      </main>

      {!jaCadastrado && (
        <CadastroPopup
          forceShow
          codigoIndicacao={codigo}
          onSuccess={() => {
            // Cadastro concluido: leva pra dentro do app de verdade em vez
            // de deixar a pessoa presa nesta pagina de convite (antes so'
            // recarregava a propria /convite/[codigo]). Redireciona na hora
            // (sem delay) porque o CadastroPopup tambem agenda o proprio
            // location.reload() 1.5s depois — um setTimeout aqui competiria
            // com aquele e as vezes perdia a corrida, voltando pro convite.
            window.location.href = "/";
          }}
        />
      )}
    </div>
  );
}
