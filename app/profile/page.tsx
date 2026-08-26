"use client";

// Caminho: C:\valente_conecta\app\profile\page.tsx
//
// Reescrita sobre dados reais — useApp() do AppContext nunca e' preenchido
// (sem login real no projeto), entao esta tela sempre mostrava usuario
// vazio/Grátis/data de hoje. Agora usa getCurrentUser() (mesmo padrao ja
// aplicado em /carteira, /extrato e /qr-code), plano vigente real de
// assinaturas_planos (migration 028) e saldo real da Moeda Conecta. Nome e
// WhatsApp ficam somente leitura porque nao ha' RPC real pra edita-los
// ainda (so' email/pix/bairro/cidade via atualizar_meu_cadastro) — editar
// e' fingir persistencia que nao existe.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Wallet, Copy, LogOut, ArrowLeft, Edit2, Save, X, Calendar, Crown, Gift, History, MapPin, Tag, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser, logout as logoutAuth } from "@/lib/auth";
import type { Usuario } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [emailForm, setEmailForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [planoNome, setPlanoNome] = useState("Grátis");
  const [servicoNome, setServicoNome] = useState("");
  const [saldoMoeda, setSaldoMoeda] = useState(0);
  const [siglaMoeda, setSiglaMoeda] = useState("MC");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setEmailForm(u?.email || "");
    if (!u) {
      setLoading(false);
      return;
    }

    async function carregar() {
      try {
        const [assinaturasRes, configRes, saldoRes] = await Promise.all([
          fetch(`/api/planos/minhas-assinaturas?usuarioId=${u!.id}`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`/api/planos-config`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`/api/moeda-conecta/saldo?usuarioId=${u!.id}`, { cache: "no-store" }).then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        if (assinaturasRes.success && configRes.success) {
          const assinaturas = assinaturasRes.data || [];
          const vigente = assinaturas.find((a: any) => a.status === "ativo") || assinaturas.find((a: any) => a.status === "pago");
          if (vigente) {
            const plano = configRes.data.plans.find((p: any) => p.id === vigente.plano_id);
            const servico = configRes.data.services.find((s: any) => s.id === vigente.servico_id);
            setPlanoNome(plano?.nome || vigente.plano_id);
            setServicoNome(servico?.nome || "");
          }
        }

        if (saldoRes.success) {
          setSaldoMoeda(Number(saldoRes.data.saldo || 0));
          const cidade = saldoRes.data.cidade_base || u!.cidade_base;
          if (cidade) {
            fetch(`/api/moeda-conecta/cidade-config?cidade=${encodeURIComponent(cidade)}`)
              .then((r) => r.json())
              .then((res) => res.success && setSiglaMoeda(res.data.moeda_prefixo || "MC"));
          }
        }
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const salvarEmail = async () => {
    if (!user) return;
    setSalvando(true);
    try {
      const resp = await fetch("/api/usuarios/atualizar-cadastro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: user.id, email: emailForm.trim() || null }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      const atualizado = { ...user, email: emailForm.trim() };
      setUser(atualizado);
      localStorage.setItem("user_data", JSON.stringify(atualizado));
      setEditando(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar e-mail");
    } finally {
      setSalvando(false);
    }
  };

  const cancelarEdicao = () => {
    setEmailForm(user?.email || "");
    setEditando(false);
  };

  const handleLogout = () => {
    logoutAuth();
    toast.success("👋 Logout realizado com sucesso!");
    router.push("/login");
  };

  const copiarLink = () => {
    if (!user?.codigo_indicacao) return;
    const link = `${window.location.origin}/convite/${user.codigo_indicacao}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado! Compartilhe com seus amigos.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <User className="w-16 h-16 text-yellow-400 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
        <div>
          <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 mb-4">Complete seu cadastro para ver seu perfil.</p>
          <button onClick={() => router.push("/")} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">Voltar</button>
        </div>
      </div>
    );
  }

  const dataCadastro = user.trial_started_at ? new Date(user.trial_started_at).toLocaleDateString("pt-BR") : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.back()} className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>MEU PERFIL</span>
          </div>
          {!editando ? (
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => router.push("/admin")}
                  className="relative group bg-yellow-500/20 hover:bg-yellow-500/30 p-2 rounded-xl transition-all"
                  title="Admin Master"
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </button>
              )}
              <button onClick={() => setEditando(true)} className="relative group">
                <Edit2 className="w-6 h-6 text-yellow-400" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={salvarEmail} disabled={salvando} className="p-1 disabled:opacity-50">
                <Save className="w-5 h-5 text-green-400" />
              </button>
              <button onClick={cancelarEdicao} className="p-1">
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold text-white">{(user.nome || "U").charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{user.nome}</h2>
          <p className={`text-sm mt-1 ${isAdmin ? "text-yellow-400" : "text-green-400"}`}>
            Plano: {isAdmin ? "Admin Master" : planoNome}{servicoNome ? ` · ${servicoNome}` : ""}
          </p>
          {user.cidade_base && (
            <p className="text-sm text-blue-300 mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {user.cidade_base}
            </p>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Dados Pessoais
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Nome completo</label>
              <p className="mt-1 text-white font-medium">{user.nome}</p>
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> E-mail
              </label>
              {editando ? (
                <input
                  type="email"
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                />
              ) : (
                <p className="mt-1 text-white font-medium">{user.email || "Não informado"}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> WhatsApp
              </label>
              <p className="mt-1 text-white font-medium">{user.whatsapp || "Não informado"}</p>
            </div>

            {editando && (
              <p className="text-sm text-zinc-500">Nome e WhatsApp são os do seu cadastro e não podem ser trocados por aqui.</p>
            )}

            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Cadastrado em: {dataCadastro}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              Carteira Digital
            </h2>
          </div>
          <div className="p-5 text-center">
            <p className="text-3xl font-bold text-green-400">{saldoMoeda.toFixed(2)} {siglaMoeda}</p>
            <button
              onClick={() => router.push("/carteira")}
              className="mt-3 bg-green-500 text-black px-6 py-2 rounded-xl font-semibold text-sm hover:bg-green-400 transition"
            >
              Ir para a Carteira
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/extrato")}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
        >
          <History className="w-5 h-5" />
          Meu Extrato e Transações
        </button>

        <button
          onClick={() => router.push("/meu-fiado")}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
        >
          <Receipt className="w-5 h-5" />
          Meu Fiado
        </button>

        {user.codigo_indicacao && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-5 py-3 border-b border-white/10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                Indique amigos e ganhe!
              </h2>
            </div>
            <div className="p-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/convite/${user.codigo_indicacao}`}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/20 rounded-xl text-white text-sm"
                />
                <button
                  onClick={copiarLink}
                  className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-400 transition"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/qr-code")}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          <Gift className="w-5 h-5" />
          Minhas Indicações e Ganhos
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/30 border-2 border-red-500 text-red-400 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-500/50 hover:text-white transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          SAIR DA CONTA
        </button>

        {isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
            <p className="text-yellow-400 text-sm">
              Você está logado como Administrador Master
            </p>
            <p className="text-yellow-400/70 text-sm mt-1">
              Toque no ícone de coroa no topo da tela para acessar o painel administrativo
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
