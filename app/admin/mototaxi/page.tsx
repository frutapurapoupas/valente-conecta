"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { useState } from "react";

export default function AdminMototaxiPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  if (!isAdmin) { router.push("/"); return null; }

  const [motoristas, setMotoristas] = useState([
    { id: 1, nome: "Carlos Moto", veiculo: "Honda CG 160", status: "ativo", corridasHoje: 12 },
    { id: 2, nome: "Paulo Freire", veiculo: "Yamaha Fazer", status: "ativo", corridasHoje: 8 },
    { id: 3, nome: "José Roberto", veiculo: "Suzuki Intruder", status: "inativo", corridasHoje: 0 },
  ]);

  const stats = { motoristasAtivos: motoristas.filter(m => m.status === "ativo").length, corridasHoje: 20, faturamentoDia: 240 };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white"></i></button>
        <h1 className="text-white font-bold text-xl">🛵 Admin Moto Táxi</h1>
      </header>

      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.motoristasAtivos}</p>
          <p className="text-xs text-gray-400">Motoristas Ativos</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.corridasHoje}</p>
          <p className="text-xs text-gray-400">Corridas Hoje</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">R$ {stats.faturamentoDia}</p>
          <p className="text-xs text-gray-400">Faturamento</p>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-white font-bold mb-3">🏍️ Motoristas</h2>
        <div className="space-y-2">
          {motoristas.map(m => (
            <div key={m.id} className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{m.nome}</p>
                <p className="text-gray-400 text-sm">{m.veiculo}</p>
                <p className="text-green-400 text-xs">{m.corridasHoje} corridas hoje</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${m.status === "ativo" ? "bg-green-500" : "bg-gray-600"}`}>
                {m.status === "ativo" ? "✅ Ativo" : "❌ Inativo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}