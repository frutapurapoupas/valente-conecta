"use client";

export const dynamic = 'force-dynamic';  // ? ÚNICA LINHA ADICIONADA

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ComercioPage() {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<"mercearia" | "farmacia" | "aguagas">("mercearia");

  const produtosMercearia = [
    { id: 1, nome: "Arroz 5kg", preco: 22.90, imagem: "🍚" },
    { id: 2, nome: "Feijão 1kg", preco: 7.50, imagem: "🫘" },
    { id: 3, nome: "Açúcar 1kg", preco: 4.50, imagem: "🍬" },
    { id: 4, nome: "Óleo 900ml", preco: 6.90, imagem: "🫒" },
    { id: 5, nome: "Café 500g", preco: 12.90, imagem: "☕" },
  ];

  const produtosFarmacia = [
    { id: 6, nome: "Dipirona", preco: 8.90, receita: false, imagem: "💊" },
    { id: 7, nome: "Amoxicilina", preco: 25.90, receita: true, imagem: "💊" },
    { id: 8, nome: "Paracetamol", preco: 7.50, receita: false, imagem: "💊" },
  ];

  const produtosAguaGas = [
    { id: 9, nome: "Água Mineral 20L", preco: 12.00, imagem: "💧" },
    { id: 10, nome: "Gás de Cozinha 13kg", preco: 95.00, imagem: "🔥" },
  ];

  const addToCart = (item: any) => {
    setCarrinho(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { ...item, quantidade: 1 }];
    });
    toast.success(`${item.nome} adicionado`);
  };

  const totalCarrinho = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  const finalizarCompra = () => {
    if (carrinho.length === 0) { toast.error("Carrinho vazio"); return; }
    const mensagem = `🛒 *PEDIDO VALENTE CONECTA*%0A%0A${carrinho.map(i => `${i.quantidade}x ${i.nome} - R$ ${(i.preco * i.quantidade).toFixed(2)}`).join("%0A")}%0A%0A📦 *TOTAL: R$ ${totalCarrinho.toFixed(2)}*%0A📍 Entrega: Valente, BA`;
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
    setCarrinho([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">🏪 Comércio</h1></div><div className="relative"><i className="fas fa-shopping-cart text-white text-xl"></i>{carrinho.length > 0 && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">{carrinho.length}</span>}</div></header>

      <div className="flex border-b border-gray-800"><button onClick={() => setActiveCategory("mercearia")} className={`flex-1 py-3 text-center ${activeCategory === "mercearia" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>🛒 Mercearia</button><button onClick={() => setActiveCategory("farmacia")} className={`flex-1 py-3 text-center ${activeCategory === "farmacia" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>💊 Farmácia</button><button onClick={() => setActiveCategory("aguagas")} className={`flex-1 py-3 text-center ${activeCategory === "aguagas" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>💧 Água/Gás</button></div>

      <div className="p-4 space-y-3">{activeCategory === "mercearia" && produtosMercearia.map(p => (<div key={p.id} className="bg-white/10 rounded-2xl p-3 flex items-center gap-3"><div className="text-4xl">{p.imagem}</div><div className="flex-1"><p className="font-bold text-white">{p.nome}</p><p className="text-yellow-400">R$ {p.preco.toFixed(2)}</p></div><button onClick={() => addToCart(p)} className="bg-yellow-500 text-black px-4 py-2 rounded-xl">+</button></div>))}{activeCategory === "farmacia" && produtosFarmacia.map(p => (<div key={p.id} className="bg-white/10 rounded-2xl p-3 flex items-center gap-3"><div className="text-4xl">{p.imagem}</div><div className="flex-1"><p className="font-bold text-white">{p.nome}</p><p className="text-yellow-400">R$ {p.preco.toFixed(2)}</p>{p.receita && <p className="text-red-400 text-xs">⚠️ Requer receita</p>}</div><button onClick={() => addToCart(p)} className="bg-yellow-500 text-black px-4 py-2 rounded-xl">+</button></div>))}{activeCategory === "aguagas" && produtosAguaGas.map(p => (<div key={p.id} className="bg-white/10 rounded-2xl p-3 flex items-center gap-3"><div className="text-4xl">{p.imagem}</div><div className="flex-1"><p className="font-bold text-white">{p.nome}</p><p className="text-yellow-400">R$ {p.preco.toFixed(2)}</p></div><button onClick={() => addToCart(p)} className="bg-yellow-500 text-black px-4 py-2 rounded-xl">+</button></div>))}</div>

      {carrinho.length > 0 && (<div className="fixed bottom-20 left-4 right-4 bg-gray-800 rounded-2xl p-3"><div className="flex justify-between items-center"><div><p className="text-white text-sm">Total: R$ {totalCarrinho.toFixed(2)}</p><p className="text-gray-400 text-xs">{carrinho.length} itens</p></div><button onClick={finalizarCompra} className="bg-green-500 text-black px-6 py-2 rounded-xl font-bold">Finalizar</button></div></div>)}
    </div>
  );
}

