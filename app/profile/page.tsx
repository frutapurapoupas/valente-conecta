"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { User, Mail, Phone, Wallet, Copy, LogOut, ArrowLeft, CheckCircle, Edit2, Save, X, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateWallet, isAdmin } = useApp();
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  
  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    plano: "Grátis",
    wallet: 0,
    dataCadastro: ""
  });
  
  const [formData, setFormData] = useState(perfil);

  useEffect(() => {
    carregarDadosPerfil();
  }, []);

  const carregarDadosPerfil = () => {
    let nome = "";
    let email = "";
    let telefone = "";
    let wallet = 0;
    
    if (user) {
      nome = user.name || "";
      email = user.email || "";
      wallet = user.wallet || 0;
    }
    
    const userSalvo = localStorage.getItem("valente_user");
    if (userSalvo) {
      const userData = JSON.parse(userSalvo);
      nome = userData.name || nome;
      email = userData.email || email;
      telefone = userData.telefone || telefone;
      wallet = userData.wallet || wallet;
    }
    
    const perfilIA = localStorage.getItem("academia_perfil_ia");
    if (perfilIA) {
      const perfilData = JSON.parse(perfilIA);
      nome = perfilData.nome || nome;
      telefone = perfilData.telefone || telefone;
    }
    
    const perfilInicial = localStorage.getItem("academia_perfil_inicial");
    if (perfilInicial) {
      const perfilData = JSON.parse(perfilInicial);
      nome = perfilData.nome || nome;
      telefone = perfilData.telefone || telefone;
    }
    
    setPerfil({
      nome: nome || "Usuário",
      email: email || "nao.informado@email.com",
      telefone: telefone || "Não informado",
      plano: isAdmin ? "Admin Master" : "Grátis",
      wallet: wallet,
      dataCadastro: new Date().toLocaleDateString()
    });
    
    setFormData({
      nome: nome || "Usuário",
      email: email || "nao.informado@email.com",
      telefone: telefone || "Não informado",
      plano: isAdmin ? "Admin Master" : "Grátis",
      wallet: wallet,
      dataCadastro: new Date().toLocaleDateString()
    });
    
    setLoading(false);
  };

  const salvarAlteracoes = () => {
    const userSalvo = localStorage.getItem("valente_user");
    if (userSalvo) {
      const userData = JSON.parse(userSalvo);
      userData.name = formData.nome;
      userData.email = formData.email;
      userData.telefone = formData.telefone;
      localStorage.setItem("valente_user", JSON.stringify(userData));
    }
    
    const perfilIA = localStorage.getItem("academia_perfil_ia");
    if (perfilIA) {
      const perfilData = JSON.parse(perfilIA);
      perfilData.nome = formData.nome;
      perfilData.telefone = formData.telefone;
      localStorage.setItem("academia_perfil_ia", JSON.stringify(perfilData));
    }
    
    setPerfil(formData);
    setEditando(false);
    toast.success("✅ Perfil atualizado com sucesso!");
  };

  const cancelarEdicao = () => {
    setFormData(perfil);
    setEditando(false);
  };

  const handleLogout = () => {
    // Limpar dados de sessão
    logout();
    
    // Limpar dados específicos do usuário (opcional)
    localStorage.removeItem("valente_user");
    
    toast.success("👋 Logout realizado com sucesso!");
    
    // Redirecionar para login
    router.push("/login");
  };

  const copiarLink = () => {
    const link = "https://valenteconecta.com.br/convite/abc123";
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

  const dadosExibicao = editando ? formData : perfil;

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
            <button onClick={() => setEditando(true)} className="relative group">
              <Edit2 className="w-6 h-6 text-yellow-400" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={salvarAlteracoes} className="p-1">
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
            <span className="text-4xl font-bold text-white">
              {dadosExibicao.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {editando ? (
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="text-center text-2xl font-bold bg-white/10 rounded-xl px-4 py-2 w-full max-w-xs mx-auto"
            />
          ) : (
            <h2 className="text-2xl font-bold text-white">{dadosExibicao.nome}</h2>
          )}
          
          <p className={`text-sm mt-1 ${isAdmin ? "text-yellow-400" : "text-green-400"}`}>
            Plano: {dadosExibicao.plano}
          </p>
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
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome completo</label>
              {editando ? (
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                />
              ) : (
                <p className="mt-1 text-white font-medium">{dadosExibicao.nome}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">E-mail</label>
              {editando ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                />
              ) : (
                <p className="mt-1 text-white font-medium">{dadosExibicao.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">WhatsApp</label>
              {editando ? (
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(75) 99999-9999"
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                />
              ) : (
                <p className="mt-1 text-white font-medium">
                  {dadosExibicao.telefone !== "Não informado" ? dadosExibicao.telefone : "Não informado"}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Cadastrado em: {dadosExibicao.dataCadastro}</span>
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
            <p className="text-3xl font-bold text-green-400">R$ {dadosExibicao.wallet.toFixed(2)}</p>
            <button className="mt-3 bg-green-500 text-black px-6 py-2 rounded-xl font-semibold text-sm hover:bg-green-400 transition">
              Adicionar Saldo
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-5 py-3 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-400" />
              Indique amigos e ganhe!
            </h2>
          </div>
          <div className="p-5">
            <div className="flex gap-2">
              <input
                type="text"
                value="https://valenteconecta.com.br/convite/abc123"
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

        {/* Botão Sair - DESTAQUE */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/30 border-2 border-red-500 text-red-400 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-500/50 hover:text-white transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          SAIR DA CONTA
        </button>

        {/* Dica para admin */}
        {isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
            <p className="text-yellow-400 text-sm">
              👑 Você está logado como Administrador Master
            </p>
            <p className="text-yellow-400/70 text-xs mt-1">
              Para testar como usuário comum, clique em "SAIR DA CONTA" e faça login com uma conta normal
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
