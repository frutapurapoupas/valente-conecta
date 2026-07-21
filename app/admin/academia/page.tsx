"use client";

export const dynamic = 'force-dynamic';  // â† ÃšNICA LINHA ADICIONADA

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

interface AlunoAdmin {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  peso: number;
  altura: number;
  imc: number;
  objetivo: string;
  plano: string;
  status: "ativo" | "inativo";
  ultimoTreino?: string;
  treinosRealizados: number;
}

export default function AdminAcademiaPage() {
  const router = useRouter();
  const { isAdmin } = useApp();

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const [alunos, setAlunos] = useState<AlunoAdmin[]>([
    { id: 1, nome: "JoÃ£o Silva", email: "joao@email.com", telefone: "(75) 99999-1111", peso: 72, altura: 1.75, imc: 23.5, objetivo: "Ganhar Massa", plano: "Premium", status: "ativo", treinosRealizados: 45 },
    { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(75) 99999-2222", peso: 65, altura: 1.65, imc: 23.9, objetivo: "Emagrecer", plano: "BÃ¡sico", status: "ativo", treinosRealizados: 28 },
    { id: 3, nome: "Pedro Costa", email: "pedro@email.com", telefone: "(75) 99999-3333", peso: 85, altura: 1.80, imc: 26.2, objetivo: "Definir", plano: "GrÃ¡tis", status: "inativo", treinosRealizados: 12 }
  ]);

  const [estatisticas, setEstatisticas] = useState({
    totalAlunos: 156,
    ativos: 128,
    treinosHoje: 45,
    mediaIMC: 24.5,
    planosPremium: 34
  });

  const alterarStatus = (id: number) => {
    setAlunos(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === "ativo" ? "inativo" : "ativo" } : a
    ));
    toast.success("Status do aluno atualizado!");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-xl">ðŸ‹ï¸ Admin Academia</h1>
      </header>

      {/* EstatÃ­sticas */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{estatisticas.totalAlunos}</p>
          <p className="text-xs text-gray-400">Total Alunos</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{estatisticas.ativos}</p>
          <p className="text-xs text-gray-400">Ativos</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{estatisticas.treinosHoje}</p>
          <p className="text-xs text-gray-400">Treinos Hoje</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{estatisticas.mediaIMC}</p>
          <p className="text-xs text-gray-400">MÃ©dia IMC</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-400">{estatisticas.planosPremium}</p>
          <p className="text-xs text-gray-400">Planos Premium</p>
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="px-4">
        <h2 className="text-white font-bold mb-3">ðŸ“‹ Alunos Cadastrados</h2>
        <div className="space-y-3">
          {alunos.map(aluno => (
            <div key={aluno.id} className="bg-gray-800 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold">{aluno.nome}</h3>
                  <p className="text-gray-400 text-sm">{aluno.email}</p>
                  <p className="text-gray-500 text-xs">{aluno.telefone}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-gray-400">Peso: {aluno.peso}kg</span>
                    <span className="text-xs text-gray-400">Altura: {aluno.altura}m</span>
                    <span className="text-xs text-gray-400">IMC: {aluno.imc}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-purple-400">ðŸŽ¯ {aluno.objetivo}</span>
                    <span className="text-xs text-yellow-400">ðŸ’Ž {aluno.plano}</span>
                    <span className="text-xs text-green-400">ðŸ’ª {aluno.treinosRealizados} treinos</span>
                  </div>
                </div>
                <button
                  onClick={() => alterarStatus(aluno.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${aluno.status === "ativo" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {aluno.status === "ativo" ? "âœ… Ativo" : "âŒ Inativo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BotÃ£o adicionar */}
      <div className="p-4">
        <button className="w-full bg-yellow-500 text-black py-3 rounded-2xl font-bold">
          + Adicionar Novo Aluno
        </button>
      </div>
    </div>
  );
}

