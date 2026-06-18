"use client";

import { Calendar, Clock, MapPin, Phone, ShoppingBag, Star, Utensils } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Prato {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  diaSemana?: string;
  configCardapio?: {
    diasAtivos: string[];
    tipoRefeicao: "almoco" | "jantar" | "diario";
    previsaoVendas: number;
    status: "ativo" | "inativo";
    ordem: number;
    destaque: boolean;
  };
}

export default function CozinhaPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [diaAtual, setDiaAtual] = useState("");
  const [refeicaoAtual, setRefeicaoAtual] = useState<"almoco" | "jantar" | "diario">("almoco");

  // Mapeamento dos dias da semana
  const diasMap: Record<string, string> = {
    "SEGUNDA": "Segunda-feira",
    "TERÇA": "Terça-feira",
    "QUARTA": "Quarta-feira",
    "QUINTA": "Quinta-feira",
    "SEXTA": "Sexta-feira",
    "SABADO": "Sábado",
    "DOMINGO": "Domingo"
  };

  // Dia atual em português
  const getDiaAtualEmPortugues = () => {
    const dias = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
    return dias[new Date().getDay()];
  };

  // Verifica se é horário de almoço ou jantar
  const getRefeicaoAtual = (): "almoco" | "jantar" | "diario" => {
    const hora = new Date().getHours();
    if (hora >= 11 && hora < 15) return "almoco";
    if (hora >= 18 && hora < 22) return "jantar";
    return "diario";
  };

  useEffect(() => {
    // Tenta carregar do novo formato primeiro
    const storedCompleto = localStorage.getItem("cozinha_cardapio_completo");

    if (storedCompleto) {
      // Usa o novo formato completo
      const todosPratos = JSON.parse(storedCompleto);
      setPratos(todosPratos);
    } else {
      // Fallback: tenta carregar do formato antigo (apenas imagens)
      const storedImagens = localStorage.getItem("cozinha_cardapio_imagens");
      const cardapioPadrao = getCardapioPadrao();

      if (storedImagens) {
        const imagens = JSON.parse(storedImagens);
        const pratosComImagens = cardapioPadrao.map(p => ({
          ...p,
          image: imagens[p.name] || p.image
        }));
        setPratos(pratosComImagens);
      } else {
        setPratos(cardapioPadrao);
      }
    }

    setDiaAtual(getDiaAtualEmPortugues());
    setRefeicaoAtual(getRefeicaoAtual());
    setLoading(false);
  }, []);

  // Filtra pratos disponíveis para hoje
  const pratosDisponiveis = pratos.filter(prato => {
    const config = prato.configCardapio;

    // Se não tem configuração, usa o diaSemana original
    if (!config) {
      return prato.diaSemana === diaAtual;
    }

    // Verifica se está ativo
    if (config.status !== "ativo") return false;

    // Verifica se está disponível no dia atual
    if (!config.diasAtivos.includes(diaAtual)) return false;

    // Verifica o tipo de refeição
    if (config.tipoRefeicao !== "diario" && config.tipoRefeicao !== refeicaoAtual) return false;

    return true;
  });

  // Ordena pratos
  const pratosOrdenados = [...pratosDisponiveis].sort((a, b) => {
    const ordemA = a.configCardapio?.ordem || 999;
    const ordemB = b.configCardapio?.ordem || 999;
    return ordemA - ordemB;
  });

  // Pratos em destaque
  const pratosDestaque = pratosOrdenados.filter(p => p.configCardapio?.destaque === true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header com Imagem */}
      <div className="relative h-48 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">Cozinha Chef Neide</h1>
          <p className="text-white/90 mt-1 flex items-center gap-2">
            <MapPin size={16} /> Rua Principal, 123 - Valente, BA
          </p>
        </div>
      </div>

      {/* Informações do Dia */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Calendar size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cardápio de</p>
            <p className="font-semibold text-gray-800">{diasMap[diaAtual] || diaAtual}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Horário</p>
            <p className="font-semibold text-gray-800">
              {refeicaoAtual === "almoco" ? "Almoço (11h-14h)" : refeicaoAtual === "jantar" ? "Jantar (18h-21h)" : "Dia todo"}
            </p>
          </div>
        </div>
        <Link href="/pedidos" className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md">
          <ShoppingBag size={16} /> Fazer Pedido
        </Link>
      </div>

      {/* Pratos em Destaque */}
      {pratosDestaque.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            <h2 className="font-bold text-gray-800">Destaques do Dia</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-hide">
            {pratosDestaque.map(prato => (
              <div key={prato.id} className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden">
                <img src={prato.image} alt={prato.name} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm">{prato.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prato.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-orange-600">R$ {prato.price.toFixed(2)}</span>
                    <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Pratos */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Utensils size={18} className="text-orange-600" />
          <h2 className="font-bold text-gray-800">Cardápio Completo</h2>
          <span className="text-xs text-gray-400 ml-auto">{pratosOrdenados.length} pratos disponíveis</span>
        </div>

        {pratosOrdenados.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Utensils size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum prato disponível para este horário</p>
            <p className="text-sm text-gray-400 mt-1">Volte mais tarde ou confira nosso cardápio especial</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pratosOrdenados.map(prato => (
              <div key={prato.id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <div className="flex gap-4 p-4">
                  {/* Imagem */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <img src={prato.image} alt={prato.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Informações */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{prato.name}</h3>
                        {prato.configCardapio?.destaque && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full mt-1">
                            <Star size={10} /> Destaque
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-orange-600 text-lg">R$ {prato.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{prato.description}</p>

                    {/* Badges de disponibilidade */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prato.configCardapio?.tipoRefeicao === "almoco" && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">🍽️ Almoço</span>
                      )}
                      {prato.configCardapio?.tipoRefeicao === "jantar" && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">🌙 Jantar</span>
                      )}
                      {prato.configCardapio?.tipoRefeicao === "diario" && (
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">☀️ Dia todo</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de ação */}
                <div className="border-t bg-gray-50 px-4 py-2 flex justify-end">
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <ShoppingBag size={14} /> Fazer Pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="px-4 mt-6">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={16} className="text-orange-600" />
            <h3 className="font-semibold text-gray-800">Precisa de ajuda?</h3>
          </div>
          <p className="text-sm text-gray-600">
            Ligou, chegou! Entregamos em toda Valente.
            <span className="block text-xs text-gray-400 mt-1">Tempo médio de entrega: 30-45 min</span>
          </p>
          <button className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full">
            WhatsApp: (75) 9 9999-9999
          </button>
        </div>
      </div>
    </div>
  );
}

// Cardápio padrão (fallback)
function getCardapioPadrao(): Prato[] {
  return [
    { id: 1, name: "Frango com Quiabo", price: 12, description: "Frango com quiabo, vinagrete, arroz e feijão", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop", diaSemana: "SEGUNDA" },
    { id: 2, name: "Bife à Cavalo", price: 14, description: "Bife acebolado, ovo frito, arroz, feijão e farofa", image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop", diaSemana: "SEGUNDA" },
    { id: 3, name: "Strogonoff", price: 12, description: "Strogonoff de frango, arroz e batata palha", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop", diaSemana: "TERÇA" },
    { id: 4, name: "Feijoada Magra", price: 12, description: "Feijoada magra, arroz, couve e farofa", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop", diaSemana: "QUARTA" },
    { id: 5, name: "PF Completo", price: 24.90, description: "Arroz, feijão, bife acebolado, farofa, salada e ovo frito", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop", diaSemana: "QUINTA" },
    { id: 6, name: "Peixe à Milanesa", price: 28.90, description: "Filé de peixe empanado, arroz, purê e salada", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1200&auto=format&fit=crop", diaSemana: "SEXTA" },
  ];
}