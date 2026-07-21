"use client";

import { Bell, Mail, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nome: string;
  tipo: "comum" | "empresa";
  cidade: string;
  status: "ativo" | "pendente" | "bloqueado";
}

export default function ControlCenter() {
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
      alert("Selecione pelo menos um usuÃ¡rio!");
      return;
    }
    setActionType(acao);
    setShowActionModal(true);
  };

  const confirmarAcao = () => {
    if ((actionType === "enviar_mensagem" || actionType === "enviar_push") && mensagemPersonalizada) {
      alert(`âœ… ${actionType === "enviar_mensagem" ? "Mensagem" : "Push"} enviado para ${selectedUsers.length} usuÃ¡rio(s)`);
    } else {
      alert(`âœ… AÃ§Ã£o "${actionType}" aplicada para ${selectedUsers.length} usuÃ¡rio(s)`);
    }
    setShowActionModal(false);
    setSelectedUsers([]);
    setMensagemPersonalizada("");
  };

  const stats = { selecionados: selectedUsers.length };

  return (
    <div className="space-y-6">
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {actionType === "bloquear" && "ðŸ”’ Bloquear"}
              {actionType === "desbloquear" && "ðŸ”“ Desbloquear"}
              {actionType === "enviar_mensagem" && "âœ‰ï¸ Enviar Mensagem"}
              {actionType === "enviar_push" && "ðŸ“± Enviar Push"}
            </h3>
            {(actionType === "enviar_mensagem" || actionType === "enviar_push") && (
              <textarea
                value={mensagemPersonalizada}
                onChange={(e) => setMensagemPersonalizada(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full p-2 border rounded-lg h-24 mb-3"
              />
            )}
            <p className="text-sm text-gray-600 mb-4">Aplicar a <strong>{stats.selecionados}</strong> usuÃ¡rio(s)</p>
            <button onClick={confirmarAcao} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Confirmar</button>
            <button onClick={() => setShowActionModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2">Cancelar</button>
          </div>
        </div>
      )}

      {stats.selecionados > 0 && (
        <div className="bg-indigo-50 rounded-xl p-3 flex flex-wrap gap-2 items-center justify-between">
          <span className="text-sm text-indigo-700">{stats.selecionados} usuÃ¡rio(s) selecionado(s)</span>
          <div className="flex gap-2">
            <button onClick={() => executarAcao("enviar_push")} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">ðŸ“± Push</button>
            <button onClick={() => executarAcao("enviar_mensagem")} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs">âœ‰ï¸ Msg</button>
            <button onClick={() => executarAcao("bloquear")} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs">ðŸ”’ Bloquear</button>
            <button onClick={() => executarAcao("desbloquear")} className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs">ðŸ”“ Desbloquear</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar usuÃ¡rio..." className="w-full pl-9 p-2 border rounded-lg text-sm" />
          </div>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="p-2 border rounded-lg text-sm">
            <option value="todos">Todos os tipos</option>
            <option value="comum">UsuÃ¡rios Comuns</option>
            <option value="empresa">Empresas</option>
          </select>
          <select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} className="p-2 border rounded-lg text-sm">
            <option value="todos">Todas as cidades</option>
            {cidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border rounded-lg text-sm">
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} className="w-4 h-4" /></th>
                <th className="p-3 text-left text-xs">UsuÃ¡rio</th>
                <th className="p-3 text-left text-xs">Tipo</th>
                <th className="p-3 text-left text-xs">Cidade</th>
                <th className="p-3 text-left text-xs">Status</th>
                <th className="p-3 text-left text-xs">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.slice(0, 20).map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => handleSelectUser(u.id)} className="w-4 h-4" /></td>
                  <td className="p-3 text-sm font-medium">{u.nome}</td>
                  <td className="p-3 text-sm"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{u.tipo === "empresa" ? "Empresa" : "Usuario"}</span></td>
                  <td className="p-3 text-sm">{u.cidade || "Valente"}</td>
                  <td className="p-3 text-sm"><span className="text-xs px-2 py-0.5 rounded-full bg-green-100">{u.status}</span></td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUsers([u.id]); setActionType("enviar_mensagem"); setShowActionModal(true); }} className="text-blue-600"><Mail size={14} /></button>
                      <button onClick={() => { setSelectedUsers([u.id]); setActionType("enviar_push"); setShowActionModal(true); }} className="text-green-600"><Bell size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

