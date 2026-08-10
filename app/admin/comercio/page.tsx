"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import { Store, Plus, Edit, Trash2, Search, X, Package } from "lucide-react";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

export default function AdminComercioPage() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [isMounted, setIsMounted] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [lojas, setLojas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsMounted(true);
    
    // Carregar dados do localStorage
    const produtosSalvos = localStorage.getItem("admin_comercio_produtos");
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos));
    } else {
      const exemplos = [
        { id: 1, nome: "Arroz 5kg", preco: 25.90, estoque: 50, loja: "Supermercado Central", categoria: "Alimentos" },
        { id: 2, nome: "Feijão 1kg", preco: 8.90, estoque: 100, loja: "Supermercado Central", categoria: "Alimentos" },
      ];
      setProdutos(exemplos);
      localStorage.setItem("admin_comercio_produtos", JSON.stringify(exemplos));
    }
  }, []);

  if (!isMounted || !isAdmin) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/admin")} className="text-white text-xl">â†</button>
          <h1 className="text-white font-bold text-lg">🛒 Gerenciar Comércio</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-2xl p-4 text-center">
            <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{produtos.length}</p>
            <p className="text-gray-400 text-sm">Produtos</p>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-2xl p-4 text-center">
            <Store className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{lojas.length}</p>
            <p className="text-gray-400 text-sm">Lojas</p>
          </div>
        </div>

        <div className="space-y-3">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold">{produto.nome}</h3>
              <p className="text-green-400">R$ {produto.preco.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

