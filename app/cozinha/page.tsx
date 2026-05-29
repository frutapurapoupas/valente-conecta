"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
}

// Cardápio com 2 pratos por dia (Segunda a Sábado)
const cardapioSemana = {
  segunda: {
    pratos: [
      { id: 1, nome: "Frango ao Molho Especial", descricao: "Frango desfiado ao molho branco com legumes e batata palha", preco: 18, imagem: "🍗" },
      { id: 2, nome: "Bife à Parmegiana", descricao: "Bife empanado ao molho de tomate e queijo gratinado", preco: 22, imagem: "🥩" }
    ],
    sobremesas: [
      { id: 101, nome: "Pudim de Leite", descricao: "Pudim caseiro com calda de caramelo", preco: 6, imagem: "🍮" },
      { id: 102, nome: "Bolo de Chocolate", descricao: "Bolo fofinho com cobertura de brigadeiro", preco: 7, imagem: "🍰" }
    ]
  },
  terca: {
    pratos: [
      { id: 3, nome: "Carne de Panela", descricao: "Carne macia cozida com legumes e mandioca", preco: 20, imagem: "🍲" },
      { id: 4, nome: "Feijoada Light", descricao: "Feijoada com carnes magras, arroz, couve e farofa", preco: 24, imagem: "🍛" }
    ],
    sobremesas: [
      { id: 103, nome: "Brigadeirão", descricao: "Tradicional brigadeirão de chocolate", preco: 8, imagem: "🍫" },
      { id: 104, nome: "Mousse de Maracujá", descricao: "Mousse refrescante com calda", preco: 6, imagem: "🥭" }
    ]
  },
  quarta: {
    pratos: [
      { id: 5, nome: "Strogonoff de Frango", descricao: "Strogonoff cremoso com batata palha e arroz", preco: 19, imagem: "🍲" },
      { id: 6, nome: "Peixe Frito com Molho", descricao: "Peixe fresco frito com molho tártaro", preco: 23, imagem: "🐟" }
    ],
    sobremesas: [
      { id: 105, nome: "Torta de Limão", descricao: "Torta com merengue e calda de limão", preco: 8, imagem: "🍋" },
      { id: 106, nome: "Sorvete Artesanal", descricao: "Sorvete de creme com calda de chocolate", preco: 5, imagem: "🍦" }
    ]
  },
  quinta: {
    pratos: [
      { id: 7, nome: "Escondidinho de Carne", descricao: "Carne seca com purê de mandioca gratinado", preco: 21, imagem: "🥔" },
      { id: 8, nome: "Frango Grelhado", descricao: "Frango grelhado com legumes e arroz", preco: 18, imagem: "🍗" }
    ],
    sobremesas: [
      { id: 107, nome: "Banana Caramelada", descricao: "Banana flambada com sorvete", preco: 7, imagem: "🍌" },
      { id: 108, nome: "Gelatina Colorida", descricao: "Gelatina com frutas", preco: 4, imagem: "🍮" }
    ]
  },
  sexta: {
    pratos: [
      { id: 9, nome: "Moqueca Baiana", descricao: "Moqueca de peixe com arroz e pirão", preco: 28, imagem: "🍲" },
      { id: 10, nome: "Filé à Milanesa", descricao: "Filé empanado com fritas e arroz", preco: 25, imagem: "🥩" }
    ],
    sobremesas: [
      { id: 109, nome: "Quindim", descricao: "Quindim caseiro tradicional", preco: 6, imagem: "🥚" },
      { id: 110, nome: "Pavê de Chocolate", descricao: "Pavê cremoso de chocolate", preco: 9, imagem: "🍫" }
    ]
  },
  sabado: {
    pratos: [
      { id: 11, nome: "Feijoada Completa", descricao: "Feijoada com todas as carnes, arroz, couve, laranja e farofa", preco: 32, imagem: "🍛" },
      { id: 12, nome: "Churrasco Misto", descricao: "Carnes, linguiça, frango com acompanhamentos", preco: 35, imagem: "🍖" }
    ],
    sobremesas: [
      { id: 111, nome: "Bolo de Cenoura com Brigadeiro", descricao: "Bolo fofinho coberto com brigadeiro", preco: 8, imagem: "🥕" },
      { id: 112, nome: "Romeu e Julieta", descricao: "Goiabada com queijo derretido", preco: 7, imagem: "🧀" }
    ]
  }
};

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const nomesDias = { segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta", sexta: "Sexta", sabado: "Sábado" };

export default function CozinhaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pratos" | "sobremesas">("pratos");
  const [selectedDia, setSelectedDia] = useState<string>("segunda");
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [observacao, setObservacao] = useState("");

  const pratosAtivos = cardapioSemana[selectedDia as keyof typeof cardapioSemana]?.pratos || [];
  const sobremesasAtivas = cardapioSemana[selectedDia as keyof typeof cardapioSemana]?.sobremesas || [];

  const addToCart = (item: any, tipo: string) => {
    setCarrinho(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { 
        id: item.id, 
        nome: `${item.nome} (${nomesDias[selectedDia as keyof typeof nomesDias]})`, 
        preco: item.preco, 
        quantidade: 1,
        observacao: observacao
      }];
    });
    toast.success(`${item.nome} adicionado ao carrinho`);
    setObservacao("");
  };

  const removeFromCart = (id: number) => {
    setCarrinho(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantidade = (id: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(id);
      return;
    }
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, quantidade } : i));
  };

  const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  const finalizarPedido = () => {
    if (carrinho.length === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    
    const mensagem = `🍽️ *PEDIDO VALENTE CONECTA - COZINHA* 🍽️%0A%0A` +
      `📅 Dia: ${nomesDias[selectedDia as keyof typeof nomesDias]}%0A` +
      `🕒 Horário: ${new Date().toLocaleTimeString()}%0A%0A` +
      `*ITENS DO PEDIDO:*%0A` +
      `${carrinho.map(i => `${i.quantidade}x ${i.nome} - R$ ${(i.preco * i.quantidade).toFixed(2)}${i.observacao ? ` (Obs: ${i.observacao})` : ""}`).join("%0A")}%0A%0A` +
      `📦 *TOTAL: R$ ${totalCarrinho.toFixed(2)}*%0A%0A` +
      `📍 Entrega: Valente, BA%0A` +
      `📱 Pedido via App Valente Conecta`;
    
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
    setCarrinho([]);
    toast.success("Pedido enviado! Aguarde confirmação.");
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-lg">🍳 Cozinha Valente - Marmitas Caseiras</h1>
        <button onClick={() => setShowCart(true)} className="relative">
          <i className="fas fa-shopping-cart text-white text-xl"></i>
          {carrinho.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {carrinho.length}
            </span>
          )}
        </button>
      </header>

      {/* Dias da Semana - Scroll Horizontal */}
      <div className="bg-gray-900 py-3 border-b border-gray-800">
        <div className="overflow-x-auto whitespace-nowrap px-4">
          {diasSemana.map(dia => (
            <button
              key={dia}
              onClick={() => setSelectedDia(dia)}
              className={`inline-block px-4 py-2 mx-1 rounded-full transition-all ${
                selectedDia === dia 
                  ? "bg-yellow-500 text-black font-bold" 
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {nomesDias[dia as keyof typeof nomesDias]}
              <span className="text-xs ml-1">
                {cardapioSemana[dia as keyof typeof cardapioSemana]?.pratos.length || 0} itens
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Abas Pratos / Sobremesas */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button 
          onClick={() => setActiveTab("pratos")} 
          className={`flex-1 py-3 text-center font-bold transition-all ${
            activeTab === "pratos" 
              ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800" 
              : "text-gray-400"
          }`}
        >
          🍽️ PRATOS DO DIA ({pratosAtivos.length})
        </button>
        <button 
          onClick={() => setActiveTab("sobremesas")} 
          className={`flex-1 py-3 text-center font-bold transition-all ${
            activeTab === "sobremesas" 
              ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800" 
              : "text-gray-400"
          }`}
        >
          🍰 SOBREMESAS ({sobremesasAtivas.length})
        </button>
      </div>

      {/* Conteúdo - 2 PRATOS POR DIA */}
      <div className="p-4 space-y-4">
        {activeTab === "pratos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pratosAtivos.map((prato) => (
                <div key={prato.id} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-5xl">{prato.imagem}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{prato.nome}</h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{prato.descricao}</p>
                        <p className="text-yellow-400 font-bold text-lg mt-2">R$ {prato.preco.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <input
                        type="text"
                        placeholder="Observação (ex: sem cebola)"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        className="w-full bg-gray-700 rounded-xl p-2 text-white text-sm placeholder-gray-400 mb-2"
                      />
                      <button 
                        onClick={() => addToCart(prato, "prato")}
                        className="w-full bg-yellow-500 text-black py-2 rounded-xl font-bold hover:bg-yellow-400 transition"
                      >
                        Adicionar ao Carrinho +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sobremesas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sobremesasAtivas.map((sobremesa) => (
              <div key={sobremesa.id} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-pink-500 transition-all">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{sobremesa.imagem}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{sobremesa.nome}</h3>
                      <p className="text-gray-400 text-xs">{sobremesa.descricao}</p>
                      <p className="text-pink-400 font-bold text-lg mt-2">R$ {sobremesa.preco.toFixed(2)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(sobremesa, "sobremesa")}
                    className="w-full bg-pink-500 text-white py-2 rounded-xl font-bold hover:bg-pink-400 transition mt-3"
                  >
                    Adicionar ao Carrinho +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal do Carrinho */}
      {showCart && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end">
          <div className="bg-gray-900 w-full rounded-t-3xl p-4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">🛒 Carrinho</h2>
              <button onClick={() => setShowCart(false)}><i className="fas fa-times text-white text-xl"></i></button>
            </div>
            
            {carrinho.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Carrinho vazio</p>
            ) : (
              <>
                {carrinho.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.nome}</p>
                      {item.observacao && <p className="text-gray-400 text-xs">Obs: {item.observacao}</p>}
                      <p className="text-yellow-400">R$ {item.preco.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantidade(item.id, item.quantidade - 1)} className="w-8 h-8 bg-gray-800 rounded-full text-white">-</button>
                      <span className="text-white w-8 text-center">{item.quantidade}</span>
                      <button onClick={() => updateQuantidade(item.id, item.quantidade + 1)} className="w-8 h-8 bg-gray-800 rounded-full text-white">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-white text-lg font-bold">Total: R$ {totalCarrinho.toFixed(2)}</p>
                  <button onClick={finalizarPedido} className="w-full bg-green-500 text-black py-3 rounded-xl font-bold mt-3">
                    📱 FINALIZAR PEDIDO (WhatsApp)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}