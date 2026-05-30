"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface Usuario {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  plano: string;
  role: string;
  created_at: string;
  wallet: number;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    carregarUsuarios();
  }, [isAdmin]);

  const carregarUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const filtrarUsuarios = () => {
    let filtered = usuarios;
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.whatsapp?.includes(searchTerm)
      );
    }
    return filtered;
  };

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.role === 'user').length,
    admins: usuarios.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="bg-gradient-to-r from-green-400 to-green-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")}><i className="fas fa-arrow-left text-white text-xl"></i></button>
        <h1 className="text-white font-bold text-xl">👥 Gerenciar Usuários</h1>
      </header>

      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
          <p className="text-xs text-gray-400">Usuários</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.admins}</p>
          <p className="text-xs text-gray-400">Admins</p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-800 rounded-xl px-3 py-2">
            <i className="fas fa-search text-gray-400 mr-2"></i>
            <input
              type="text"
              placeholder="Buscar por nome, email ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white"
            />
          </div>
          <button onClick={carregarUsuarios} className="bg-blue-500 text-white px-4 py-2 rounded-xl">
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filtrarUsuarios().map(usuario => (
          <div key={usuario.id} className="bg-gray-800 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold">{usuario.nome}</h3>
                <p className="text-gray-400 text-sm">{usuario.email || "Sem email"}</p>
                <p className="text-gray-500 text-xs">{usuario.whatsapp}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                    {usuario.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    💰 R$ {usuario.wallet || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span>📅 Cadastro: {new Date(usuario.created_at).toLocaleDateString()}</span>
              <span>🆔 ID: {usuario.id.slice(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>

      {filtrarUsuarios().length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      )}
    </div>
  );
}