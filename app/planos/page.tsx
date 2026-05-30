"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { CheckCircle, Crown, Star, Building, ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";

// Planos sincronizados com o Admin Master
// Estes valores serão carregados do localStorage/admin_configuracoes
// Por enquanto, mantemos a mesma estrutura do admin

interface Plano {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  recursos: string[];
  cor: string;
  ativo: boolean;
  destaque?: boolean;
}

export default function PlanosPage() {
  const router = useRouter();
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([
    { id: 1, nome: "Grátis", preco: 0, descricao: "Acesso básico", recursos: ["Perfil público", "Busca limitada"], cor: "gray", ativo: true },
    { id: 2, nome: "Básico", preco: 15, descricao: "Para profissionais", recursos: ["Destaque na busca", "Contato visível"], cor: "blue", ativo: true },
    { id: 3, nome: "Premium", preco: 49.90, descricao: "Para empresas", recursos: ["Destaque VIP", "Produtos ilimitados"], cor: "yellow", ativo: true, destaque: true },
    { id: 4, nome: "Fisco", preco: 99.90, descricao: "Módulo fiscal completo", recursos: ["Nota fiscal", "Relatórios"], cor: "purple", ativo: true },
  ]);

  // Carregar planos do localStorage (configurações do Admin Master)
  useEffect(() => {
    const saved = localStorage.getItem("admin_planos_config");
    if (saved) {
      try {
        const savedPlanos = JSON.parse(saved);
        setPlanos(savedPlanos);
      } catch (e) {}
    }
  }, []);

  const handleAssinar = async (plano: Plano) => {
    if (!plano.ativo) {
      toast.error("Este plano está temporariamente indisponível");
      return;
    }

    setLoading(true);

    // Verificar se o usuário já fez o cadastro completo (CPF/CNPJ, email, senha)
    if (!user?.cadastroCompleto) {
      // Salvar o plano escolhido para redirecionar após autenticação
      localStorage.setItem("plano_escolhido", JSON.stringify(plano));
      toast.info("Complete seu cadastro para assinar o plano");
      router.push("/autenticacao-completa");
    } else {
      // Usuário já tem cadastro completo, prosseguir para checkout/pagamento
      toast.success(`Redirecionando para assinatura do plano ${plano.nome}...`);
      // Aqui você pode redirecionar para página de pagamento
      // router.push(`/checkout/${plano.id}`);
    }

    setLoading(false);
  };

  const getCorBg = (cor: string) => {
    const cores: Record<string, string> = {
      gray: "from-gray-800 to-gray-900",
      blue: "from-blue-800 to-blue-900",
      yellow: "from-yellow-700 to-amber-800",
      purple: "from-purple-800 to-indigo-900"
    };
    return cores[cor] || "from-gray-800 to-gray-900";
  };

  const getCorTexto = (cor: string) => {
    const cores: Record<string, string> = {
      gray: "text-gray-400",
      blue: "text-blue-400",
      yellow: "text-yellow-400",
      purple: "text-purple-400"
    };
    return cores[cor] || "text-gray-400";
  };

  const getCorBotao = (cor: string) => {
    const cores: Record<string, string> = {
      gray: "bg-gray-600 hover:bg-gray-500",
      blue: "bg-blue-600 hover:bg-blue-500",
      yellow: "bg-yellow-500 hover:bg-yellow-400 text-black",
      purple: "bg-purple-600 hover:bg-purple-500"
    };
    return cores[cor] || "bg-gray-600 hover:bg-gray-500";
  };

  const getCorDestaque = (cor: string) => {
    const cores: Record<string, string> = {
      gray: "border-gray-500",
      blue: "border-blue-500",
      yellow: "border-yellow-500",
      purple: "border-purple-500"
    };
    return cores[cor] || "border-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pb-28">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-white">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-white font-bold text-lg">💰 Planos e Assinaturas</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Banner de informação */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 mb-8 text-center border border-indigo-500/30">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Escolha o plano ideal para você</h2>
          <p className="text-gray-300">Desbloqueie todos os recursos e leve seu negócio ao próximo nível</p>
        </div>

        {/* Grid de planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planos.filter(p => p.ativo).map((plano) => (
            <div
              key={plano.id}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl
                bg-gradient-to-br ${getCorBg(plano.cor)} border ${getCorDestaque(plano.cor)}`}
            >
              {/* Badge de destaque */}
              {plano.destaque && (
                <div className="absolute top-0 right-0">
                  <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-2xl">
                    ⭐ Mais Popular
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Ícone e nome */}
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-3`}>
                    {plano.nome === "Premium" && <Crown className={`w-8 h-8 ${getCorTexto(plano.cor)}`} />}
                    {plano.nome === "Básico" && <Zap className={`w-8 h-8 ${getCorTexto(plano.cor)}`} />}
                    {plano.nome === "Grátis" && <Shield className={`w-8 h-8 ${getCorTexto(plano.cor)}`} />}
                    {plano.nome === "Fisco" && <TrendingUp className={`w-8 h-8 ${getCorTexto(plano.cor)}`} />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-yellow-400">R$ {plano.preco}</span>
                    {plano.preco > 0 && <span className="text-gray-400 text-sm">/mês</span>}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{plano.descricao}</p>
                </div>

                {/* Recursos */}
                <ul className="space-y-2 mb-6">
                  {plano.recursos.map((recurso, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className={`w-4 h-4 ${getCorTexto(plano.cor)} flex-shrink-0`} />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão de ação */}
                <button
                  onClick={() => handleAssinar(plano)}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${getCorBotao(plano.cor)} disabled:opacity-50`}
                >
                  {plano.preco === 0 ? (
                    <>Começar Grátis <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Assinar Agora <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 bg-white/5 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-3 text-center">❓ Dúvidas frequentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-bold text-yellow-400">🔒 Como cancelar?</p>
              <p>Você pode cancelar sua assinatura a qualquer momento pelo app</p>
            </div>
            <div>
              <p className="font-bold text-yellow-400">💳 Formas de pagamento</p>
              <p>Cartão de crédito, PIX e boleto bancário</p>
            </div>
            <div>
              <p className="font-bold text-yellow-400">🔄 Mudar de plano</p>
              <p>Você pode trocar de plano a qualquer momento</p>
            </div>
            <div>
              <p className="font-bold text-yellow-400">📞 Suporte</p>
              <p>Suporte 24/7 para planos Premium e Fisco</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}