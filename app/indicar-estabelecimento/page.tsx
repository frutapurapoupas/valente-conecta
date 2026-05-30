"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Store, Briefcase, MapPin, Phone, Building, ArrowLeft, CheckCircle } from "lucide-react";

export default function IndicarEstabelecimentoPage() {
  const router = useRouter();
  const { user } = useApp();
  const [tipo, setTipo] = useState<"comercio" | "servico">("comercio");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    contato: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      toast.error("Preencha o nome e telefone");
      return;
    }
    
    setLoading(true);
    
    const itensNecessarios = tipo === "comercio" ? 30 : 3;
    
    const { error } = await supabase
      .from('indicacoes_estabelecimentos')
      .insert({
        usuario_id: user?.id,
        nome_estabelecimento: formData.nome,
        tipo: tipo,
        telefone: formData.telefone,
        endereco: formData.endereco,
        itens_necessarios: itensNecessarios,
        status: "pendente"
      });
    
    if (error) {
      toast.error("Erro ao salvar indicação");
      console.error(error);
    } else {
      toast.success(`✅ ${tipo === "comercio" ? "Estabelecimento" : "Profissional"} indicado com sucesso!`);
      setFormData({ nome: "", telefone: "", endereco: "", contato: "" });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg">💰 Indicar e Ganhar</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4 text-center">
          <h2 className="text-yellow-400 font-bold text-lg">🎯 Ganhe dinheiro indicando!</h2>
          <p className="text-gray-300 text-sm mt-1">
            Indique 2 estabelecimentos com 30 itens cada → R$30<br />
            Indique 4 profissionais com 3 serviços cada → R$15
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTipo("comercio")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              tipo === "comercio" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <Store className="w-5 h-5 inline mr-2" />
            Estabelecimento
          </button>
          <button
            onClick={() => setTipo("servico")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              tipo === "servico" 
                ? "bg-green-600 text-white" 
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <Briefcase className="w-5 h-5 inline mr-2" />
            Profissional
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">
              {tipo === "comercio" ? "Nome do estabelecimento" : "Nome do profissional"}
            </label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Building className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={tipo === "comercio" ? "Ex: Supermercado Central" : "Ex: João Eletricista"}
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Telefone/WhatsApp</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="(75) 99999-9999"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1 block">Endereço (opcional)</label>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rua, número, bairro"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="flex-1 bg-transparent outline-none text-white"
              />
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-2">📋 Requisitos para validação:</h3>
            {tipo === "comercio" ? (
              <ul className="text-gray-400 text-xs space-y-1">
                <li>✅ Cadastrar 30 produtos/serviços no catálogo</li>
                <li>✅ Cada item com preço e foto</li>
                <li>✅ Estabelecimento não pode estar cadastrado</li>
              </ul>
            ) : (
              <ul className="text-gray-400 text-xs space-y-1">
                <li>✅ Cadastrar 3 serviços no catálogo</li>
                <li>✅ Cada serviço com preço e foto</li>
                <li>✅ Profissional não pode estar cadastrado</li>
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg disabled:opacity-50"
          >
            {loading ? "Enviando..." : "📤 Enviar Indicação"}
          </button>
        </form>
      </main>
    </div>
  );
}