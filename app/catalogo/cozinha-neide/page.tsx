"use client";

import React, { useState, useEffect } from 'react';
import { getPratosPublicados } from "@/services/cozinhaService"; // Seu serviço original

type Item = {
  id: string | number;
  nome: string;
  descricaoCurta: string;
  preco: number;
};

export default function CatalogoMarmita() {
  const [pratos, setPratos] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<{ item: Item; quantidade: number }[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Busca os pratos reais do banco de dados na inicialização
  useEffect(() => {
    async function carregarPratos() {
      const dados = await getPratosPublicados();
      setPratos(dados);
    }
    carregarPratos();
  }, []);

  // Calcula o valor total sempre que o carrinho mudar
  useEffect(() => {
    const novoTotal = cartItems.reduce((acc, current) => acc + (current.item.preco * current.quantidade), 0);
    setTotal(novoTotal);
  }, [cartItems]);

  const handleAddToCart = (item: Item) => {
    const existing = cartItems.find((i) => i.item.id === item.id);
    if (existing) {
      setCartItems(cartItems.map((i) => i.item.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      setCartItems([...cartItems, { item, quantidade: 1 }]);
    }
  };

  const handleRemoveFromCart = (item: Item) => {
    const existing = cartItems.find((i) => i.item.id === item.id);
    if (!existing) return;

    if (existing.quantidade === 1) {
      setCartItems(cartItems.filter((i) => i.item.id !== item.id));
    } else {
      setCartItems(cartItems.map((i) => i.item.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cardápio Chef Neide</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pratos.map((prato) => {
          const itemNoCarrinho = cartItems.find((i) => i.item.id === prato.id);
          return (
            <div key={prato.id} className="border p-4 rounded-lg shadow bg-white flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg">{prato.nome}</h2>
                <p className="text-sm text-gray-600 my-2">{prato.descricaoCurta}</p>
                <p className="font-bold text-orange-600">R$ {prato.preco.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center justify-end mt-4 gap-2">
                {itemNoCarrinho && (
                  <>
                    <button onClick={() => handleRemoveFromCart(prato)} className="bg-red-500 text-white px-3 py-1 rounded font-bold">-</button>
                    <span className="font-bold px-2">{itemNoCarrinho.quantidade}</span>
                  </>
                )}
                <button onClick={() => handleAddToCart(prato)} className="bg-green-500 text-white px-3 py-1 rounded font-bold">+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Flutuante do Carrinho */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl cursor-pointer hover:bg-blue-700 transition" onClick={() => setIsModalOpen(true)}>
          <span className="font-bold">🛒 Ver Carrinho (R$ {total.toFixed(2)})</span>
        </div>
      )}

      {/* Modal de Pagamento Simulado */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            <div className="max-h-40 overflow-y-auto mb-4 border-b pb-2">
              {cartItems.map((oi) => (
                <div key={oi.item.id} className="flex justify-between text-sm mb-1">
                  <span>{oi.quantidade}x {oi.item.nome}</span>
                  <span>R$ {(oi.item.preco * oi.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-lg font-bold mb-4 flex justify-between"><span>Total:</span> <span className="text-green-600">R$ {total.toFixed(2)}</span></p>
            
            <h3 className="font-bold mb-2 text-sm text-gray-700">Escolha a Forma de Pagamento (Simulação):</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button className="border p-3 rounded-lg font-medium hover:bg-gray-50 active:border-blue-500" onClick={() => alert('Simulação: Pix Selecionado!')}>📱 PIX</button>
              <button className="border p-3 rounded-lg font-medium hover:bg-gray-50 active:border-blue-500" onClick={() => alert('Simulação: Cartão Selecionado!')}>💳 Cartão</button>
            </div>

            <div className="flex gap-2">
              <button className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium" onClick={() => setIsModalOpen(false)}>Fechar</button>
              <button className="w-1/2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700" onClick={() => { alert('Pedido Concluído e enviado para a produção!'); setCartItems([]); setIsModalOpen(false); }}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
