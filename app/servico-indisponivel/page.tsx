"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

export default function ServicoIndisponivelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  
  const servico = searchParams.get("servico") || "este serviço";
  const categoria = searchParams.get("categoria") || "serviço";
  const subcategoria = searchParams.get("subcategoria") || "";
  
  const [nomeProduto, setNomeProduto] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<"prestador" | "consumidor">("consumidor");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mensagem = `📢 *NOVO INTERESSE NA PLATAFORMA* 📢%0A%0A` +
      `🔹 *Tipo:* ${tipo === "prestador" ? "PRESTADOR DE SERVIÇO" : "CONSUMIDOR"}%0A` +
      `🔹 *Categoria:* ${categoria}%0A` +
      `🔹 *Subcategoria:* ${subcategoria || "Não especificada"}%0A` +
      `🔹 *Serviço:* ${servico}%0A%0A` +
      `${tipo === "prestador" ? "📌 *DADOS DO PRESTADOR:*" : "📌 *DADOS DO CONSUMIDOR:*"}%0A` +
      `📧 Email: ${email}%0A` +
      `📱 Telefone: ${telefone}%0A` +
      `${tipo === "consumidor" ? `🔍 Produto/serviço procurado: ${nomeProduto}` : `🏪 Nome do negócio: ${nomeProduto}`}%0A%0A` +
      `⏰ *Prazo de resposta:* Até 24 horas`;
    
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
    setEnviado(true);
    toast.success("Solicitação enviada! Responderemos em até 24h.");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-lg">🚧 Em Construção</h1>
      </header>

      <div className="p-6 text-center">
        <div className="text-8xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-white mb-2">{servico}</h2>
        <p className="text-gray-400 mb-6">
          Estamos desenvolvendo esta área para melhor atendê-lo!
        </p>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-center">
          <i className="fas fa-store text-4xl text-white mb-3"></i>
          <p className="text-white font-bold text-lg">Você é prestador de serviço?</p>
          <p className="text-white/80 text-sm mb-4">Cadastre-se gratuitamente e comece a vender hoje mesmo!</p>
          <button 
            onClick={() => setTipo("prestador")}
            className={`px-4 py-2 rounded-full text-sm font-bold mr-2 ${tipo === "prestador" ? "bg-yellow-500 text-black" : "bg-white/20 text-white"}`}
          >
            Sou Prestador
          </button>
          <button 
            onClick={() => setTipo("consumidor")}
            className={`px-4 py-2 rounded-full text-sm font-bold ${tipo === "consumidor" ? "bg-yellow-500 text-black" : "bg-white/20 text-white"}`}
          >
            Sou Consumidor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">
              {tipo === "prestador" ? "Nome do seu negócio/serviço" : "O que você procura?"}
            </label>
            <input
              type="text"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder={tipo === "prestador" ? "Ex: Salão da Maria, Churrasquinho do Zé..." : "Ex: bolo de chocolate, conserto de celular..."}
              className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">Seu melhor e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-1">WhatsApp com DDD</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(75) 99999-9999"
              className="w-full bg-white/10 rounded-xl p-3 text-white placeholder-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviado}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {enviado ? "✅ Solicitação Enviada!" : "📩 Enviar Solicitação"}
          </button>
        </form>

        {enviado && (
          <div className="mt-4 bg-green-500/20 border border-green-500 rounded-xl p-3 text-center">
            <p className="text-green-400 text-sm">✅ Recebemos sua solicitação!</p>
            <p className="text-gray-400 text-xs mt-1">Responderemos em até 24 horas pelo WhatsApp.</p>
          </div>
        )}

        <div className="mt-6 bg-white/5 rounded-2xl p-4 text-center">
          <i className="fas fa-chart-line text-3xl text-yellow-400 mb-2"></i>
          <p className="text-white text-sm">Sabia que empresas que anunciam aqui têm até <span className="text-yellow-400 font-bold">300% mais visibilidade</span>?</p>
          <button className="mt-2 text-yellow-400 text-sm font-bold">Saiba mais →</button>
        </div>
      </div>
    </div>
  );
}
