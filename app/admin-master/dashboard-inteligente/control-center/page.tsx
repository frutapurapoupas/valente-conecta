"use client";

import { Bell, CheckSquare, Lock, Mail, Search, Unlock } from "lucide-react";
import { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  tipo: "comum" | "empresa";
  cidade: string;
  status: "ativo" | "pendente" | "bloqueado";
  telefone?: string;
  email?: string;
}

export default function ControlCenterPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterCidade, setFilterCidade] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState("");

  useEffect(() => {
    const usuariosComuns = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const empresas = JSON.parse(localStorage.getItem("empresas") || "[]");
    const todos: Usuario[] = [
      ...usuariosComuns.map((u: any) => ({ ...u, tipo: "comum" as const })),
      ...empresas.map((e: any) => ({ ...e, tipo: "empresa" as const }))
    ];
    setUsuarios(todos);
    const cidadesUnicas: string[] = [];
    todos.forEach((u: Usuario) => {
      const cidade = u.cidade || "Valente";
      if (!cidadesUnicas.includes(cidade)) cidadesUnicas.push(cidade);
    });
    setCidades(cidadesUnicas);
  }, []);

  const usuariosFiltrados = usuarios.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === "todos" || u.tipo === filterTipo;
    const matchCidade = filterCidade === "todos" || (u.cidade || "Valente") === filterCidade;
    const matchStatus = filterStatus === "todos" || u.status === filterStatus;
    return matchSearch && matchTipo && matchCidade && matchStatus;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === usuariosFiltrados.length && usuariosFiltrados.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usuariosFiltrados.map(u => u.id));
    }
  };

  const handleSelectUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const executarAcao = (acao: string) => {
    if (selectedUsers.length === 0) {
      alert("Selecione pelo menos um usuário!");
      return;
    }
    setActionType(acao);
    setShowActionModal(true);
  };

  const confirmarAcao = () => {
    if (actionType === "enviar_mensagem" && !mensagemPersonalizada) {
      alert("Digite uma mensagem!");
      return;
    }

    let mensagem = "";
    if (actionType === "enviar_mensagem") mensagem = `📧 Mensagem enviada: "${mensagemPersonalizada}"`;
    if (actionType === "enviar_push") mensagem = `📱 Push enviado: "${mensagemPersonalizada || "Notificação geral"}"`;
    if (actionType === "bloquear") mensagem = `🔒 ${selectedUsers.length} usuário(s) bloqueados`;
    if (actionType === "desbloquear") mensagem = `🔓 ${selectedUsers.length} usuário(s) desbloqueados`;

    alert(`✅ ${mensagem}`);
    setShowActionModal(false);
    setSelectedUsers([]);
    setMensagemPersonalizada("");
  };

  const stats = {
    total: usuarios.length,
    selecionados: selectedUsers.length,
    empresas: usuarios.filter(u => u.tipo === "empresa").length,
    comuns: usuarios.filter(u => u.tipo === "comum").length,
    ativos: usuarios.filter(u => u.status === "ativo").length,
    pendentes: usuarios.filter(u => u.status === "pendente").length
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🎛️ Central de Controle</h1>
        <p className="text-sm text-gray-500">Gerencie usuários e execute ações em massa</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.empresas}</p>
          <p className="text-xs text-gray-500">Empresas</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">{stats.comuns}</p>
          <p className="text-xs text-gray-500">Usuários</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
          <p className="text-xs text-gray-500">Ativos</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
          <p className="text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <p className="text-2xl font-bold text-indigo-600">{stats.selecionados}</p>
          <p className="text-xs text-gray-500">Selecionados</p>
        </div>
      </div>

      {/* Modal de ação */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {actionType === "bloquear" && "🔒 Bloquear Usuários"}
              {actionType === "desbloquear" && "🔓 Desbloquear Usuários"}
              {actionType === "enviar_mensagem" && "✉️ Enviar Mensagem"}
              {actionType === "enviar_push" && "📱 Enviar Push"}
            </h3>
            {(actionType === "enviar_mensagem" || actionType === "enviar_push") && (
              <textarea
                value={mensagemPersonalizada}
                onChange={(e) => setMensagemPersonalizada(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full p-2 border rounded-lg h-24 mb-3"
              />
            )}
            <p className="text-sm text-gray-600 mb-4">Aplicar a <strong>{stats.selecionados}</strong> usuário(s)</p>
            <button onClick={confirmarAcao} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Confirmar</button>
            <button onClick={() => setShowActionModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* Barra de ações em massa */}
      {stats.selecionados > 0 && (
        <div className="bg-indigo-50 rounded-xl p-3 flex flex-wrap gap-2 items-center justify-between">
          <span className="text-sm text-indigo-700">
            <CheckSquare size={14} className="inline mr-1" />
            {stats.selecionados} usuário(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <button onClick={() => executarAcao("enviar_push")} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
              <Bell size={12} /> Push
            </button>
            <button onClick={() => executarAcao("enviar_mensagem")} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
              <Mail size={12} /> Mensagem
            </button>
            <button onClick={() => executarAcao("bloquear")} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
              <Lock size={12} /> Bloquear
            </button>
            <button onClick={() => executarAcao("desbloquear")} className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
              <Unlock size={12} /> Desbloquear
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuário..."
              className="w-full pl-9 p-2 border rounded-lg text-sm"
            />
          </div>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
            <option value="todos">Todos os tipos</option>
            <option value="comum">Usuários Comuns</option>
            <option value="empresa">Empresas</option>
          </select>
          <select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
            <option value="todos">Todas as cidades</option>
            {cidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 w-10">
                  <input type="checkbox" onChange={handleSelectAll} className="w-4 h-4" />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Usuário</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Tipo</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Cidade</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.slice(0, 50).map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => handleSelectUser(u.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-800">{u.nome}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.tipo === "empresa" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                        {u.tipo === "empresa" ? "🏢 Empresa" : "👤 Usuário"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{u.cidade || "Valente"}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "ativo" ? "bg-green-100 text-green-700" :
                          u.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                        }`}>
                        {u.status === "ativo" ? "Ativo" : u.status === "pendente" ? "Pendente" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedUsers([u.id]); setActionType("enviar_mensagem"); setShowActionModal(true); }} className="text-blue-500 hover:text-blue-700">
                          <Mail size={14} />
                        </button>
                        <button onClick={() => { setSelectedUsers([u.id]); setActionType("enviar_push"); setShowActionModal(true); }} className="text-green-500 hover:text-green-700">
                          <Bell size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

