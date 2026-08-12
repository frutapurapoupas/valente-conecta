"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

function ServicoIndisponivelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  
  const servico = searchParams?.get("servico") || "este serviço";
  const categoria = searchParams?.get("categoria") || "";
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [whatsappSuporte, setWhatsappSuporte] = useState("");

  useEffect(() => {
    fetch("/api/config-suporte")
      .then((r) => r.json())
      .then((res) => setWhatsappSuporte(res.success ? res.data?.whatsapp || "" : ""))
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappSuporte) {
      toast.error("Contato de suporte não configurado. Tente novamente mais tarde.");
      return;
    }
    const texto = `📢 *NOVO INTERESSE - VALENTE CONECTA* 📢%0A%0A🔹 *Serviço:* ${servico}%0A🔹 *Categoria:* ${categoria || "Não especificada"}%0A%0A📌 *Dados:*%0A👤 Nome: ${nome}%0A📧 Email: ${email}%0A📱 Telefone: ${telefone}%0A💬 ${mensagem || "Gostaria de mais informações"}`;
    window.open(`https://wa.me/55${whatsappSuporte}?text=${texto}`, "_blank");
    setEnviado(true);
    toast.success("Solicitação enviada! Responderemos em até 24h.");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-lg">🚧 Em Construção</h1>
      </header>
      <div className="p-6 text-center"><div className="text-8xl mb-4">🚧</div><h2 className="text-2xl font-bold text-white mb-2">{servico}</h2><p className="text-gray-400 mb-6">Estamos desenvolvendo esta área para melhor atendê-lo!</p></div>
      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-center"><i className="fas fa-bell text-4xl text-white mb-3"></i><p className="text-white font-bold text-lg">Quer ser o primeiro a saber?</p><p className="text-white/80 text-sm">Deixe seus dados e avisaremos quando estiver pronto!</p></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-white/10 rounded-xl p-3 text-white" required />
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/10 rounded-xl p-3 text-white" required />
          <input type="tel" placeholder="WhatsApp (com DDD)" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-white/10 rounded-xl p-3 text-white" required />
          <textarea placeholder="Mensagem (opcional)" value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} className="w-full bg-white/10 rounded-xl p-3 text-white" />
          <button type="submit" disabled={enviado} className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold text-lg disabled:opacity-50">{enviado ? "✅ Enviada!" : "📩 Quero ser avisado!"}</button>
        </form>
      </div>
    </div>
  );
}

export default function ServicoIndisponivelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-blue-400"></i></div>}>
      <ServicoIndisponivelContent />
    </Suspense>
  );
}

