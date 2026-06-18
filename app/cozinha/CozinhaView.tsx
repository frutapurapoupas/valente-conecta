"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
}

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacao?: string;
}

interface CozinhaViewProps {
  // Estados
  activeTab: "pratos" | "sobremesas";
  selectedDia: string;
  carrinho: ItemCarrinho[];
  showCart: boolean;
  observacao: string;
  // Dados
  pratosAtivos: ItemCardapio[];
  sobremesasAtivas: ItemCardapio[];
  totalCarrinho: number;
  nomesDias: Record<string, string>;
  // Navigation
  router: ReturnType<typeof useRouter>;
  // Actions
  onTabChange: (tab: "pratos" | "sobremesas") => void;
  onDiaChange: (dia: string) => void;
  onAddToCart: (item: ItemCardapio, tipo: string) => void;
  onRemoveFromCart: (id: number) => void;
  onUpdateQuantidade: (id: number, quantidade: number) => void;
  onToggleCart: (show: boolean) => void;
  onObservacaoChange: (obs: string) => void;
  onFinalizarPedido: () => void;
}

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export default function CozinhaView({
  activeTab, selectedDia, carrinho, showCart, observacao,
  pratosAtivos, sobremesasAtivas, totalCarrinho, nomesDias,
  router,
  onTabChange, onDiaChange, onAddToCart, onRemoveFromCart,
  onUpdateQuantidade, onToggleCart, onObservacaoChange, onFinalizarPedido
}: CozinhaViewProps) {
  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-400 to-green-700 sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()}>
          <i className="fas fa-arrow-left text-white text-xl"></i>
        </button>
        <h1 className="text-white font-bold text-lg">🍳 Cozinha Valente - Marmitas Caseiras</h1>
        <button onClick={() => onToggleCart(true)} className="relative">
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
              onClick={() => onDiaChange(dia)}
              className={`inline-block px-4 py-2 mx-1 rounded-full transition-all ${
                selectedDia === dia
                  ? "bg-yellow-500 text-black font-bold"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {nomesDias[dia]}
            </button>
          ))}
        </div>
      </div>

      {/* Abas Pratos / Sobremesas */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => onTabChange("pratos")}
          className={`flex-1 py-3 text-center font-bold transition-all ${
            activeTab === "pratos"
              ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800"
              : "text-gray-400"
          }`}
        >
          🍽️ PRATOS DO DIA ({pratosAtivos.length})
        </button>
        <button
          onClick={() => onTabChange("sobremesas")}
          className={`flex-1 py-3 text-center font-bold transition-all ${
            activeTab === "sobremesas"
              ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800"
              : "text-gray-400"
          }`}
        >
          🍰 SOBREMESAS ({sobremesasAtivas.length})
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-4">
        {activeTab === "pratos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pratosAtivos.map((prato) => (
              <div
                key={prato.id}
                className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all"
              >
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
                      onChange={(e) => onObservacaoChange(e.target.value)}
                      className="w-full bg-gray-700 rounded-xl p-2 text-white text-sm placeholder-gray-400 mb-2"
                    />
                    <button
                      onClick={() => onAddToCart(prato, "prato")}
                      className="w-full bg-yellow-500 text-black py-2 rounded-xl font-bold hover:bg-yellow-400 transition"
                    >
                      Adicionar ao Carrinho +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "sobremesas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sobremesasAtivas.map((sobremesa) => (
              <div
                key={sobremesa.id}
                className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-pink-500 transition-all"
              >
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
                    onClick={() => onAddToCart(sobremesa, "sobremesa")}
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
              <button onClick={() => onToggleCart(false)}>
                <i className="fas fa-times text-white text-xl"></i>
              </button>
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
                      <button
                        onClick={() => onUpdateQuantidade(item.id, item.quantidade - 1)}
                        className="w-8 h-8 bg-gray-800 rounded-full text-white"
                      >-</button>
                      <span className="text-white w-8 text-center">{item.quantidade}</span>
                      <button
                        onClick={() => onUpdateQuantidade(item.id, item.quantidade + 1)}
                        className="w-8 h-8 bg-gray-800 rounded-full text-white"
                      >+</button>
                      <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-white text-lg font-bold">Total: R$ {totalCarrinho.toFixed(2)}</p>
                  <button
                    onClick={onFinalizarPedido}
                    className="w-full bg-green-500 text-black py-3 rounded-xl font-bold mt-3"
                  >
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
