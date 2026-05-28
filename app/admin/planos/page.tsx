"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

export default function AdminPlanosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const [planos, setPlanos] = useState([
    { id: 1, nome: "Grátis", preco: 0, descricao: "Acesso básico", recursos: ["Perfil público", "Busca limitada"], cor: "gray", ativo: true },
    { id: 2, nome: "Básico", preco: 15, descricao: "Para profissionais", recursos: ["Destaque na busca", "Contato visível"], cor: "blue", ativo: true },
    { id: 3, nome: "Premium", preco: 49.90, descricao: "Para empresas", recursos: ["Destaque VIP", "Produtos ilimitados"], cor: "yellow", ativo: true },
    { id: 4, nome: "Fisco", preco: 99.90, descricao: "Módulo fiscal completo", recursos: ["Nota fiscal", "Relatórios"], cor: "purple", ativo: true },
  ]);

  const toggleAtivo = (id: number) => {
    setPlanos(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
    toast.success("Plano atualizado!");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-xl">💎 Gerenciar Planos</h1>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {planos.map(plano => (
            <div key={plano.id} className={`bg-gradient-to-br from-${plano.cor}-900 to-${plano.cor}-800 rounded-2xl p-4 border border-${plano.cor}-500/30`}>
              <div className="text-center mb-3">
                <i className={`fas fa-gem text-3xl text-${plano.cor}-400`}></i>
                <h3 className="text-white font-bold text-lg mt-2">{plano.nome}</h3>
                <p className="text-yellow-400 text-2xl font-bold">R$ {plano.preco}</p>
                <p className="text-gray-400 text-xs">{plano.descricao}</p>
              </div>
              <ul className="space-y-1 mb-4">
                {plano.recursos.map((recurso, idx) => (
                  <li key={idx} className="text-gray-300 text-xs flex items-center gap-1">
                    <i className="fas fa-check text-green-400 text-xs"></i> {recurso}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => toggleAtivo(plano.id)}
                className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${
                  plano.ativo ? "bg-green-500 text-black" : "bg-gray-700 text-gray-400"
                }`}
              >
                {plano.ativo ? "Ativo" : "Inativo"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3">📊 Assinaturas Ativas</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Plano Grátis</span>
              <span className="text-white">1.234 usuários</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Plano Básico</span>
              <span className="text-white">456 usuários</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Plano Premium</span>
              <span className="text-white">234 usuários</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Plano Fisco</span>
              <span className="text-white">12 usuários</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
