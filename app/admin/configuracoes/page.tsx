"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

// Configuração padrão dos cards da Home
const configuracaoPadrao = {
  blocos: [
    {
      id: 1,
      titulo: "Bloco 1 - Categorias Principais",
      cards: [
        { id: 1, nome: "ACADEMIAS & ESPORTES", icone: "💪", href: "/academia", ativo: true, ordem: 1 },
        { id: 2, nome: "MARMITA & BOLOS", icone: "🍱", href: "/cozinha", ativo: true, ordem: 2 },
        { id: 3, nome: "ALIMENTAÇÃO", icone: "🍔", href: "/comercio", ativo: true, ordem: 3 },
        { id: 4, nome: "TRANSPORTE & DELIVERY", icone: "🏍️", href: "/mototaxi", ativo: true, ordem: 4 },
        { id: 5, nome: "UTILIDADES", icone: "💡", href: "/servicos", ativo: false, ordem: 5 },
        { id: 6, nome: "SERVIÇOS", icone: "🔧", href: "/servicos", ativo: true, ordem: 6 }
      ]
    },
    {
      id: 2,
      titulo: "Bloco 2 - Comércio e Serviços",
      cards: [
        { id: 7, nome: "MERCADOS", icone: "🏪", href: "/comercio", ativo: true, ordem: 1 },
        { id: 8, nome: "IMÓVEL", icone: "🏠", href: "/servicos", ativo: false, ordem: 2 },
        { id: 9, nome: "AGRO E CAMPO", icone: "🌾", href: "/servicos", ativo: false, ordem: 3 },
        { id: 10, nome: "CONSTRUÇÃO", icone: "🏗️", href: "/servicos", ativo: false, ordem: 4 },
        { id: 11, nome: "ALUGUEL MÁQUINAS", icone: "🔨", href: "/servicos", ativo: false, ordem: 5 },
        { id: 12, nome: "TECNOLOGIA", icone: "💻", href: "/servicos", ativo: false, ordem: 6 }
      ]
    },
    {
      id: 3,
      titulo: "Bloco 3 - Moda e Estilo",
      cards: [
        { id: 13, nome: "AUTOMOTIVO", icone: "🚗", href: "/servicos", ativo: false, ordem: 1 },
        { id: 14, nome: "EDUCAÇÃO", icone: "📚", href: "/servicos", ativo: false, ordem: 2 },
        { id: 15, nome: "SAÚDE", icone: "🏥", href: "/servicos", ativo: false, ordem: 3 },
        { id: 16, nome: "MODA MASCULINA", icone: "👔", href: "/servicos", ativo: false, ordem: 4 },
        { id: 17, nome: "MODA FEMININA", icone: "👗", href: "/servicos", ativo: false, ordem: 5 },
        { id: 18, nome: "BELEZA & ESTÉTICA", icone: "💇", href: "/servicos", ativo: false, ordem: 6 }
      ]
    },
    {
      id: 4,
      titulo: "Bloco 4 - Novas Categorias",
      cards: [
        { id: 19, nome: "BELEZA & ESTÉTICA", icone: "💅", href: "/servicos", ativo: false, ordem: 1 },
        { id: 20, nome: "EVENTOS & ENTRETENIMENTO", icone: "🎉", href: "/servicos", ativo: false, ordem: 2 },
        { id: 21, nome: "PET SHOP & ANIMAIS", icone: "🐕", href: "/servicos", ativo: false, ordem: 3 },
        { id: 22, nome: "FINANCEIRO", icone: "💰", href: "/servicos", ativo: false, ordem: 4 }
      ]
    }
  ]
};

export default function AdminConfiguracoesPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [config, setConfig] = useState(configuracaoPadrao);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_config_cards");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  if (!mounted) return null;
  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const toggleCard = (blocoId: number, cardId: number) => {
    setConfig(prev => ({
      ...prev,
      blocos: prev.blocos.map(bloco => 
        bloco.id === blocoId 
          ? { ...bloco, cards: bloco.cards.map(card => 
              card.id === cardId ? { ...card, ativo: !card.ativo } : card
            ) }
          : bloco
      )
    }));
    toast.success("Card atualizado!");
  };

  const salvarConfiguracao = () => {
    localStorage.setItem("admin_config_cards", JSON.stringify(config));
    toast.success("✅ Configuração salva! Recarregue a página para ver as mudanças.");
  };

  const ativarTodos = (blocoId: number) => {
    setConfig(prev => ({
      ...prev,
      blocos: prev.blocos.map(bloco =>
        bloco.id === blocoId
          ? { ...bloco, cards: bloco.cards.map(card => ({ ...card, ativo: true })) }
          : bloco
      )
    }));
    toast.success("Todos os cards do bloco ativados!");
  };

  const desativarTodos = (blocoId: number) => {
    setConfig(prev => ({
      ...prev,
      blocos: prev.blocos.map(bloco =>
        bloco.id === blocoId
          ? { ...bloco, cards: bloco.cards.map(card => ({ ...card, ativo: false })) }
          : bloco
      )
    }));
    toast.success("Todos os cards do bloco desativados!");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
          <h1 className="text-white font-bold text-xl">⚙️ Configuração da Home</h1>
        </div>
        <button onClick={salvarConfiguracao} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold">
          💾 Salvar Tudo
        </button>
      </header>

      <div className="p-4">
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-2xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            <i className="fas fa-info-circle mr-2"></i>
            Controle quais categorias aparecem na Home principal. Cards desativados ficarão "Em Construção" para usuários.
          </p>
        </div>

        {config.blocos.map(bloco => (
          <div key={bloco.id} className="bg-gray-800 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">{bloco.titulo}</h2>
              <div className="flex gap-2">
                <button onClick={() => ativarTodos(bloco.id)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                  Ativar Todos
                </button>
                <button onClick={() => desativarTodos(bloco.id)} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">
                  Desativar Todos
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bloco.cards.map(card => (
                <div key={card.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                  card.ativo ? "bg-green-500/10 border-green-500" : "bg-gray-700/50 border-gray-600"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{card.icone}</span>
                    <span className="text-white text-sm">{card.nome}</span>
                  </div>
                  <button
                    onClick={() => toggleCard(bloco.id, card.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      card.ativo ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {card.ativo ? "✅ Ativo" : "🔧 Em Construção"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
