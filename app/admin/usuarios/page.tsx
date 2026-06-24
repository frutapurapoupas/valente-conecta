"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, RefreshCw, Shield, User, Wallet, 
  Calendar, Hash, Plus, X, Check, Edit2, Trash2,
  MessageCircle, Smartphone, Globe, Award, Dumbbell, Bike, Store, Briefcase, TestTube
} from "lucide-react";
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

interface GrupoDinamico {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  telegram_chat_id: string | null;
  ativo: boolean;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<GrupoDinamico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [mostrarModalGrupos, setMostrarModalGrupos] = useState(false);
  const [gruposDoUsuario, setGruposDoUsuario] = useState<string[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    carregarUsuarios();
    carregarGrupos();
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

  const carregarGrupos = async () => {
    try {
      const response = await fetch('/api/grupos');
      const data = await response.json();
      if (data.success && data.data) {
        setGrupos(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    }
  };

  const carregarGruposDoUsuario = async (usuarioId: string) => {
    setCarregandoGrupos(true);
    try {
      const response = await fetch(`/api/grupos?usuarioId=${usuarioId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setGruposDoUsuario(data.data.map((g: GrupoDinamico) => g.id));
      }
    } catch (error) {
      console.error("Erro ao carregar grupos do usuário:", error);
    } finally {
      setCarregandoGrupos(false);
    }
  };

  const adicionarUsuarioAoGrupo = async (usuarioId: string, grupoId: string) => {
    try {
      const response = await fetch('/api/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo: 'usuario',
          usuarioId, 
          grupoId 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Usuário adicionado ao grupo!`);
        setGruposDoUsuario([...gruposDoUsuario, grupoId]);
      } else {
        toast.error(data.error || 'Erro ao adicionar usuário ao grupo');
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error('Erro ao adicionar usuário ao grupo');
    }
  };

  const removerUsuarioDoGrupo = async (usuarioId: string, grupoId: string) => {
    try {
      const response = await fetch(`/api/grupos?tipo=usuario&usuarioId=${usuarioId}&grupoId=${grupoId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Usuário removido do grupo!`);
        setGruposDoUsuario(gruposDoUsuario.filter(id => id !== grupoId));
      } else {
        toast.error(data.error || 'Erro ao remover usuário do grupo');
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error('Erro ao remover usuário do grupo');
    }
  };

  const toggleGrupo = (grupoId: string, usuarioId: string) => {
    if (gruposDoUsuario.includes(grupoId)) {
      removerUsuarioDoGrupo(usuarioId, grupoId);
    } else {
      adicionarUsuarioAoGrupo(usuarioId, grupoId);
    }
  };

  const abrirModalGrupos = async (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    await carregarGruposDoUsuario(usuario.id);
    setMostrarModalGrupos(true);
  };

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const getIconeGrupo = (icone: string) => {
    switch (icone) {
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Dumbbell': return <Dumbbell className="w-4 h-4" />;
      case 'Bike': return <Bike className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'TestTube': return <TestTube className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const filtrarUsuarios = () => {
    let filtered = usuarios;
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.whatsapp?.includes(searchTerm)
      );
    }
    if (filterStatus === 'admin') {
      filtered = filtered.filter(u => u.role === 'admin');
    } else if (filterStatus === 'user') {
      filtered = filtered.filter(u => u.role === 'user');
    }
    return filtered;
  };

  const stats = {
    total: usuarios.length,
    usuarios: usuarios.filter(u => u.role === 'user').length,
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
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")} className="text-white">
          <i className="fas fa-arrow-left text-white text-xl"></i>
        </button>
        <Users className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">👥 Gerenciar Usuários</h1>
      </header>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.usuarios}</p>
          <p className="text-xs text-gray-400">Usuários</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.admins}</p>
          <p className="text-xs text-gray-400">Admins</p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="px-4 mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-gray-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-sm"
            />
          </div>
          <button 
            onClick={carregarUsuarios} 
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1 rounded-full text-xs transition ${
              filterStatus === 'todos' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('user')}
            className={`px-3 py-1 rounded-full text-xs transition ${
              filterStatus === 'user' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            👤 Usuários
          </button>
          <button
            onClick={() => setFilterStatus('admin')}
            className={`px-3 py-1 rounded-full text-xs transition ${
              filterStatus === 'admin' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            👑 Admins
          </button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="px-4 space-y-3 pb-20">
        {filtrarUsuarios().map(usuario => (
          <div key={usuario.id} className="bg-gray-800 rounded-2xl p-4 hover:bg-gray-750 transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-bold">{usuario.nome}</h3>
                  {usuario.role === 'admin' && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{usuario.email || "Sem email"}</p>
                <p className="text-gray-500 text-xs">{usuario.whatsapp}</p>
                <div className="flex gap-3 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> R$ {usuario.wallet || 0}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    {usuario.plano || 'Grátis'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => abrirModalGrupos(usuario)}
                className="p-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600/30 transition"
                title="Gerenciar grupos"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(usuario.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ID: {usuario.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtrarUsuarios().length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      )}

      {/* Modal de Grupos */}
      {mostrarModalGrupos && usuarioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Grupos de {usuarioSelecionado.nome}
              </h2>
              <button onClick={() => setMostrarModalGrupos(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Selecione os grupos que este usuário participa:
            </p>
            
            {carregandoGrupos ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-auto">
                {grupos.map(grupo => (
                  <button
                    key={grupo.id}
                    onClick={() => toggleGrupo(grupo.id, usuarioSelecionado.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                      gruposDoUsuario.includes(grupo.id)
                        ? 'bg-purple-600/20 border border-purple-500'
                        : 'bg-gray-700 border border-gray-600 hover:bg-gray-650'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: grupo.cor }}>
                        {getIconeGrupo(grupo.icone)}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">{grupo.nome}</p>
                        <p className="text-gray-400 text-xs">{grupo.descricao}</p>
                      </div>
                    </div>
                    {gruposDoUsuario.includes(grupo.id) && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </button>
                ))}
                
                {grupos.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    Nenhum grupo disponível. Crie grupos em Configurações.
                  </p>
                )}
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMostrarModalGrupos(false)}
                className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
