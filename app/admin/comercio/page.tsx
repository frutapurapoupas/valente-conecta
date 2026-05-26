"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useState } from "react";

export default function AdminComercioPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  if (!isAdmin) { router.push("/"); return null; }

  const [lojas] = useState([
    { id: 1, nome: "Supermercado Central", categoria: "Mercearia", produtos: 450, status: "ativo" },
    { id: 2, nome: "Farmácia Popular", categoria: "Farmácia", produtos: 120, status: "ativo" },
    { id: 3, nome: "Água Mineral Santa", categoria: "Água/Gás", produtos: 3, status: "ativo" },
  ]);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3"><button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">🏪 Admin Comércio</h1></header>
      <div className="p-4"><h2 className="text-white font-bold mb-3">📋 Lojas Cadastradas</h2><div className="space-y-2">{lojas.map(loja => (<div key={loja.id} className="bg-white/10 rounded-2xl p-3 flex items-center justify-between"><div><p className="font-bold text-white">{loja.nome}</p><p className="text-gray-400 text-sm">{loja.categoria} • {loja.produtos} produtos</p></div><span className={`px-2 py-1 rounded-full text-xs ${loja.status === "ativo" ? "bg-green-500" : "bg-gray-600"}`}>{loja.status}</span></div>))}</div></div>
    </div>
  );
}
