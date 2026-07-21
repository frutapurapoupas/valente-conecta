"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { User, Mail, Lock, Briefcase, FileText, ArrowRight, CheckCircle } from "lucide-react";

export default function AutenticacaoCompletaPage() {
  const router = useRouter();
  const { user } = useApp();
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica">("fisica");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Pessoa FÃ­sica
    cpf: "",
    // Pessoa JurÃ­dica
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    // Comuns
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.senha) {
      toast.error("Preencha email e senha");
      return;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas nÃ£o coincidem");
      return;
    }
    
    if (tipoPessoa === "fisica" && !formData.cpf) {
      toast.error("Informe seu CPF");
      return;
    }
    
    if (tipoPessoa === "juridica" && (!formData.cnpj || !formData.razaoSocial)) {
      toast.error("Informe CNPJ e RazÃ£o Social");
      return;
    }
    
    setLoading(true);
    
    // Salvar dados completos do usuÃ¡rio
    const userCompleto = {
      ...user,
      email: formData.email,
      tipoPessoa,
      cpf: tipoPessoa === "fisica" ? formData.cpf : undefined,
      cnpj: tipoPessoa === "juridica" ? formData.cnpj : undefined,
      razaoSocial: tipoPessoa === "juridica" ? formData.razaoSocial : undefined,
      nomeFantasia: tipoPessoa === "juridica" ? formData.nomeFantasia : undefined,
      cadastroCompleto: true,
      plano: "Premium" // ou o plano escolhido
    };
    
    localStorage.setItem("valente_user", JSON.stringify(userCompleto));
    
    toast.success("âœ… Cadastro completo! Agora vocÃª tem acesso total.");
    
    setTimeout(() => {
      router.push("/planos");
    }, 1500);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <h1 className="text-white font-bold text-lg text-center">Complete seu Cadastro</h1>
      </header>

      <main className="max-w-md mx-auto p-6">
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">Bem-vindo, {user?.nome}!</h3>
          <p className="text-gray-400 text-sm">
            Para assinar um plano e ter acesso completo, precisamos de mais algumas informaÃ§Ãµes.
          </p>
        </div>

        {/* Seletor de tipo de pessoa */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTipoPessoa("fisica")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              tipoPessoa === "fisica" 
                ? "bg-green-500 text-white" 
                : "bg-white/10 text-gray-400"
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Pessoa FÃ­sica
          </button>
          <button
            onClick={() => setTipoPessoa("juridica")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              tipoPessoa === "juridica" 
                ? "bg-green-500 text-white" 
                : "bg-white/10 text-gray-400"
            }`}
          >
            <Briefcase className="w-5 h-5 inline mr-2" />
            Pessoa JurÃ­dica
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos para Pessoa FÃ­sica */}
          {tipoPessoa === "fisica" && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">CPF *</label>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                <FileText className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="flex-1 bg-transparent outline-none text-white"
                />
              </div>
            </div>
          )}

          {/* Campos para Pessoa JurÃ­dica */}
          {tipoPessoa === "juridica" && (
            <>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">CNPJ *</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">RazÃ£o Social *</label>
                <input
                  type="text"
                  placeholder="Nome oficial da empresa"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1 block">Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="Nome comercial (opcional)"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white"
                />
              </div>
            </>
          )}

          {/* Campos comuns */}
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">E-mail *</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Senha *</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Confirmar senha *</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Continuar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </main>
    </div>
  );
}

