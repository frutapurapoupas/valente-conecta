"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  plano: string;
  status: "ativo" | "suspenso" | "pendente";
  dataCadastro: string;
  ultimoAcesso: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(75) 99999-1111", plano: "Premium", status: "ativo", dataCadastro: "01/05/2026", ultimoAcesso: "10/05/2026" },
    { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(75) 99999-2222", plano: "Básico", status: "ativo", dataCadastro: "02/05/2026", ultimoAcesso: "09/05/2026" },
    { id: 3, nome: "Pedro Costa", email: "pedro@email.com", telefone: "(75) 99999-3333", plano: "Grátis", status: "suspenso", dataCadastro: "03/05/2026", ultimoAcesso: "05/05/2026" },
    { id: 4, nome: "Ana Paula", email: "ana@email.com", telefone: "(75) 99999-4444", plano: "Premium", status: "ativo", dataCadastro: "04/05/2026", ultimoAcesso: "10/05/2026" },
    { id: 5, nome: "Carlos Lima", email: "carlos@email.com", telefone: "(75) 99999-5555", plano: "Grátis", status: "pendente", dataCadastro: "07/05/2026", ultimoAcesso: "-" },
  ]);

  const filtrarUsuarios = () => {
    let filtered = usuarios;
    if (searchTerm) {
      filtered = filtered.filter(u => u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterStatus !== "todos") {
      filtered = filtered.filter(u => u.status === filterStatus);
    }
    return filtered;
  };

  const alterarStatus = (id: number, novoStatus: "ativo" | "suspenso" | "pendente") => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: novoStatus } : u));
    toast.success(`Usuário ${novoStatus === "ativo" ? "liberado" : novoStatus === "suspenso" ? "suspenso" : "pendente"} com sucesso!`);
  };

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === "ativo").length,
    suspensos: usuarios.filter(u => u.status === "suspenso").length,
    pendentes: usuarios.filter(u => u.status === "pendente").length
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-xl">👥 Gerenciar Usuários</h1>
      </header>

      {/* Stats */}
      <div className="p-4 grid grid-cols-4 gap-3">
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
          <p className="text-xs text-gray-400">Ativos</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.suspensos}</p>
          <p className="text-xs text-gray-400">Suspensos</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pendentes}</p>
          <p className="text-xs text-gray-400">Pendentes</p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-800 rounded-xl px-3 py-2">
            <i className="fas fa-search text-gray-400 mr-2"></i>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 rounded-xl px-3 py-2 text-white"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="suspenso">Suspensos</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="px-4 space-y-3">
        {filtrarUsuarios().map(usuario => (
          <div key={usuario.id} className="bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold">{usuario.nome}</h3>
                <p className="text-gray-400 text-sm">{usuario.email}</p>
                <p className="text-gray-500 text-xs">{usuario.telefone}</p>
                <div className="flex gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    usuario.plano === "Premium" ? "bg-yellow-500/20 text-yellow-400" :
                    usuario.plano === "Básico" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {usuario.plano}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    usuario.status === "ativo" ? "bg-green-500/20 text-green-400" :
                    usuario.status === "suspenso" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {usuario.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {usuario.status !== "ativo" && (
                  <button onClick={() => alterarStatus(usuario.id, "ativo")} className="bg-green-500/20 text-green-400 p-2 rounded-xl text-sm">
                    <i className="fas fa-check-circle"></i>
                  </button>
                )}
                {usuario.status !== "suspenso" && (
                  <button onClick={() => alterarStatus(usuario.id, "suspenso")} className="bg-red-500/20 text-red-400 p-2 rounded-xl text-sm">
                    <i className="fas fa-ban"></i>
                  </button>
                )}
                <button className="bg-blue-500/20 text-blue-400 p-2 rounded-xl text-sm">
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span>📅 Cadastro: {usuario.dataCadastro}</span>
              <span>🕒 Último acesso: {usuario.ultimoAcesso}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        <button className="w-full bg-yellow-500 text-black py-3 rounded-2xl font-bold">
          + Adicionar Novo Usuário
        </button>
      </div>
    </div>
  );
}
