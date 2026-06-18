"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Building, Dumbbell, ShoppingBag, Calendar, 
  CreditCard, Bell, Send, Edit, Save, X, 
  CheckCircle, AlertCircle, Clock, DollarSign,
  TrendingUp, Award, Target, Settings, Mail, Phone
} from "lucide-react";

interface Plano {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  precoOriginal: number;
  status: "ativo" | "inativo";
  recursos: string[];
  limites: {
    usuarios?: number;
    produtos?: number;
    armazenamento?: number;
  };
}

interface UsuarioPlano {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  tipo: "empresa" | "comum";
  cnpj?: string;
  planoId: string;
  planoNome: string;
  status: "ativo" | "pendente" | "bloqueado" | "expirado";
  dataInicio: string;
  dataExpiracao: string;
  pagamento: "pago" | "pendente" | "cancelado";
  bonusAcumulado: number;
}

// Tipo para as opções de notificação
type NotificationType = "todos" | "empresas" | "comuns" | "usuario" | (string & {});

export default function AdminPlanosPage() {
  const [activeTab, setActiveTab] = useState("planos");
  const [planos, setPlanos] = useState<Plano[]>([
    { id: "academia_gratis", nome: "Academia Grátis", categoria: "academia", preco: 0, precoOriginal: 0, status: "ativo", recursos: ["Cadastro completo", "Navegação", "Indicações", "Alertas"], limites: {} },
    { id: "academia_premium", nome: "Academia Premium", categoria: "academia", preco: 9.90, precoOriginal: 9.90, status: "ativo", recursos: ["Treinos personalizados", "Metas avançadas", "Histórico", "Relatórios", "Suporte"], limites: {} },
    { id: "profissional_basico", nome: "Profissional Básico", categoria: "profissional", preco: 25, precoOriginal: 25, status: "ativo", recursos: ["3 usuários", "10 itens catálogo", "Agendamento básico"], limites: { usuarios: 3, produtos: 10 } },
    { id: "profissional_premium", nome: "Profissional Premium", categoria: "profissional", preco: 35, precoOriginal: 35, status: "ativo", recursos: ["10 usuários", "Catálogo ilimitado", "Relatórios", "Destaque busca"], limites: { usuarios: 10, produtos: -1 } },
    { id: "servico_gratis", nome: "Serviço Grátis", categoria: "servico", preco: 0, precoOriginal: 0, status: "ativo", recursos: ["1 usuário", "5 itens catálogo", "Agendamento básico"], limites: { usuarios: 1, produtos: 5 } },
    { id: "servico_basico", nome: "Serviço Básico", categoria: "servico", preco: 25, precoOriginal: 25, status: "ativo", recursos: ["3 usuários", "10 itens catálogo", "Gestão agendamentos"], limites: { usuarios: 3, produtos: 10 } },
    { id: "servico_premium", nome: "Serviço Premium", categoria: "servico", preco: 35, precoOriginal: 35, status: "ativo", recursos: ["10 usuários", "Catálogo ilimitado", "Relatórios", "Suporte", "Destaque"], limites: { usuarios: 10, produtos: -1 } },
    { id: "ambulante_basico", nome: "Ambulante Básico", categoria: "ambulante", preco: 15, precoOriginal: 15, status: "ativo", recursos: ["20 itens catálogo", "Gestão estoque"], limites: { produtos: 20 } },
    { id: "ambulante_premium", nome: "Ambulante Premium", categoria: "ambulante", preco: 25, precoOriginal: 25, status: "ativo", recursos: ["Catálogo ilimitado", "Relatórios", "Suporte", "Destaque"], limites: { produtos: -1 } }
  ]);

  const [usuariosPlanos, setUsuariosPlanos] = useState<UsuarioPlano[]>([]);
  const [editingPlano, setEditingPlano] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState<number>(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<NotificationType>("todos");
  const [selectedUser, setSelectedUser] = useState<UsuarioPlano | null>(null);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    
    const usuariosComPlanos: UsuarioPlano[] = [
      ...usuarios.map((u: any) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        tipo: "comum" as const,
        planoId: u.plano || "gratis",
        planoNome: u.plano === "premium" ? "Premium" : u.plano === "basico" ? "Básico" : "Grátis",
        status: u.status || "ativo",
        dataInicio: u.dataCadastro,
        dataExpiracao: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        pagamento: "pago",
        bonusAcumulado: 0
      })),
      ...empresas.map((e: any) => ({
        id: e.id,
        nome: e.nome,
        email: e.email,
        telefone: e.whatsapp,
        tipo: "empresa" as const,
        cnpj: e.cnpj,
        planoId: e.plano || "profissional_basico",
        planoNome: e.plano === "profissional_premium" ? "Profissional Premium" : "Profissional Básico",
        status: e.status || "ativo",
        dataInicio: e.dataCadastro,
        dataExpiracao: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        pagamento: "pago",
        bonusAcumulado: 0
      }))
    ];
    
    setUsuariosPlanos(usuariosComPlanos);
  }, []);

  const handleSalvarPreco = (id: string) => {
    setPlanos(planos.map(p => p.id === id ? { ...p, preco: novoPreco } : p));
    setEditingPlano(null);
    alert(`✅ Preço atualizado para R$ ${novoPreco.toFixed(2)}`);
  };

  const handleToggleStatus = (id: string) => {
    setPlanos(planos.map(p => p.id === id ? { ...p, status: p.status === "ativo" ? "inativo" : "ativo" } : p));
    const plano = planos.find(p => p.id === id);
    alert(`✅ Plano ${plano?.nome} ${plano?.status === "ativo" ? "desativado" : "ativado"}`);
  };

  const enviarPushNotification = () => {
    let destinatarios: UsuarioPlano[] = [];
    
    if (notificationType === "todos") {
      destinatarios = usuariosPlanos;
    } else if (notificationType === "empresas") {
      destinatarios = usuariosPlanos.filter(u => u.tipo === "empresa");
    } else if (notificationType === "comuns") {
      destinatarios = usuariosPlanos.filter(u => u.tipo === "comum");
    } else if (notificationType.startsWith("plano_")) {
      const planoId = notificationType.replace("plano_", "");
      destinatarios = usuariosPlanos.filter(u => u.planoId === planoId);
    } else if (notificationType === "usuario" && selectedUser) {
      destinatarios = [selectedUser];
    } else {
      destinatarios = [];
    }
    
    destinatarios.forEach(user => {
      console.log(`📱 Push para ${user.nome}: ${notificationMessage}`);
    });
    
    alert(`✅ Notificação enviada para ${destinatarios.length} usuário(s)`);
    setShowNotificationModal(false);
    setNotificationMessage("");
  };

  const enviarPushManual = () => {
    if (!pushTitle || !pushBody) {
      alert("Preencha título e mensagem!");
      return;
    }
    
    let destinatarios: UsuarioPlano[] = [];
    if (notificationType === "todos") {
      destinatarios = usuariosPlanos;
    } else if (notificationType === "empresas") {
      destinatarios = usuariosPlanos.filter(u => u.tipo === "empresa");
    } else if (notificationType === "comuns") {
      destinatarios = usuariosPlanos.filter(u => u.tipo === "comum");
    } else if (selectedUser) {
      destinatarios = [selectedUser];
    } else {
      destinatarios = [];
    }
    
    destinatarios.forEach(user => {
      const message = `📢 *${pushTitle}*\n\n${pushBody}\n\nAcesse o app para mais informações.`;
      const whatsappNumber = user.telefone?.replace(/\D/g, '');
      if (whatsappNumber) {
        window.open(`https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }
    });
    
    alert(`✅ Push enviado para ${destinatarios.length} usuário(s)`);
    setShowPushModal(false);
    setPushTitle("");
    setPushBody("");
  };

  const categorias = [
    { id: "academia", nome: "🏋️ Academia", icon: Dumbbell, planos: planos.filter(p => p.categoria === "academia") },
    { id: "profissional", nome: "👔 Profissionais", icon: Users, planos: planos.filter(p => p.categoria === "profissional") },
    { id: "servico", nome: "📅 Serviços", icon: Calendar, planos: planos.filter(p => p.categoria === "servico") },
    { id: "ambulante", nome: "🛒 Ambulantes", icon: ShoppingBag, planos: planos.filter(p => p.categoria === "ambulante") }
  ];

  const stats = {
    totalPlanos: planos.length,
    ativos: planos.filter(p => p.status === "ativo").length,
    empresasAtivas: usuariosPlanos.filter(u => u.tipo === "empresa" && u.status === "ativo").length,
    usuariosAtivos: usuariosPlanos.filter(u => u.tipo === "comum" && u.status === "ativo").length,
    receitaMensal: planos.reduce((acc, p) => acc + (p.status === "ativo" ? p.preco : 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Modal de Notificação */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Enviar Notificação</h3>
            <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="w-full p-2 border rounded-lg mb-3">
              <option value="todos">Todos os usuários</option>
              <option value="empresas">Apenas empresas (CNPJ)</option>
              <option value="comuns">Apenas usuários comuns</option>
              {planos.map(p => <option key={p.id} value={`plano_${p.id}`}>Usuários do plano: {p.nome}</option>)}
              <option value="usuario">Usuário específico</option>
            </select>
            {notificationType === "usuario" && (
              <select onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                const found = usuariosPlanos.find(u => u.id === val);
                setSelectedUser(found || null);
              }} className="w-full p-2 border rounded-lg mb-3">
                <option value="">Selecione o usuário</option>
                {usuariosPlanos.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.tipo})</option>)}
              </select>
            )}
            <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="Digite a mensagem..." className="w-full p-2 border rounded-lg h-24 mb-3" />
            <button onClick={enviarPushNotification} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"><Send size={16} /> Enviar</button>
            <button onClick={() => setShowNotificationModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de Push Manual */}
      {showPushModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Push Manual</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="flex-1 p-2 border rounded-lg">
                  <option value="todos">Todos</option>
                  <option value="empresas">Empresas</option>
                  <option value="comuns">Usuários comuns</option>
                </select>
                {notificationType !== "todos" && (
                  <select onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const found = usuariosPlanos.find(u => u.id === val);
                    setSelectedUser(found || null);
                  }} className="flex-1 p-2 border rounded-lg">
                    <option value="">Específico</option>
                    {usuariosPlanos.filter(u => notificationType === "empresas" ? u.tipo === "empresa" : u.tipo === "comum").map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                )}
              </div>
              <input type="text" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="Título" className="w-full p-2 border rounded-lg" />
              <textarea value={pushBody} onChange={(e) => setPushBody(e.target.value)} placeholder="Mensagem" className="w-full p-2 border rounded-lg h-24" />
              <button onClick={enviarPushManual} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"><Bell size={16} /> Enviar Push</button>
              <button onClick={() => setShowPushModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">💰 Planos e Assinaturas</h1><p className="text-gray-500 text-sm">Gestão completa de planos e envio de notificações</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowNotificationModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Bell size={16} /> Notificar</button>
          <button onClick={() => setShowPushModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Send size={16} /> Push Manual</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-indigo-600">{stats.totalPlanos}</div><div className="text-xs text-gray-500">Planos</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-green-600">{stats.ativos}</div><div className="text-xs text-gray-500">Ativos</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-blue-600">{stats.empresasAtivas}</div><div className="text-xs text-gray-500">Empresas</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-purple-600">{stats.usuariosAtivos}</div><div className="text-xs text-gray-500">Usuários</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-yellow-600">R$ {stats.receitaMensal.toFixed(2)}</div><div className="text-xs text-gray-500">Receita/mês</div></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab("planos")} className={`pb-2 px-4 text-sm font-medium ${activeTab === "planos" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>📋 Planos</button>
        <button onClick={() => setActiveTab("usuarios")} className={`pb-2 px-4 text-sm font-medium ${activeTab === "usuarios" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>👥 Usuários</button>
        <button onClick={() => setActiveTab("configuracoes")} className={`pb-2 px-4 text-sm font-medium ${activeTab === "configuracoes" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>⚙️ Configurações</button>
      </div>

      {/* Planos */}
      {activeTab === "planos" && (
        <div className="space-y-6">
          {categorias.map(categoria => {
            const Icon = categoria.icon;
            return (
              <div key={categoria.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2"><Icon size={18} className="text-indigo-600" /><h3 className="font-semibold">{categoria.nome}</h3></div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoria.planos.map(plano => (
                    <div key={plano.id} className={`border rounded-xl p-4 ${plano.status === "ativo" ? "border-gray-200" : "border-red-200 bg-red-50"}`}>
                      <div className="flex justify-between items-start"><h4 className="font-bold">{plano.nome}</h4><span className={`text-xs px-2 py-0.5 rounded-full ${plano.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{plano.status === "ativo" ? "Ativo" : "Inativo"}</span></div>
                      {editingPlano === plano.id ? (
                        <div className="mt-2"><input type="number" value={novoPreco} onChange={(e) => setNovoPreco(parseFloat(e.target.value))} className="w-full p-1 border rounded text-lg font-bold" step="0.01" /><button onClick={() => handleSalvarPreco(plano.id)} className="mt-2 w-full bg-green-600 text-white py-1 rounded-lg text-sm flex items-center justify-center gap-1"><Save size={14} /> Salvar</button></div>
                      ) : (
                        <p className="text-2xl font-bold text-indigo-600 mt-1">R$ {plano.preco.toFixed(2)}<span className="text-sm font-normal text-gray-400">/mês</span></p>
                      )}
                      <div className="mt-2 space-y-1">{plano.recursos.slice(0, 2).map(r => <p key={r} className="text-xs text-gray-500">✓ {r}</p>)}</div>
                      <div className="flex gap-2 mt-3">
                        {editingPlano !== plano.id && <button onClick={() => { setEditingPlano(plano.id); setNovoPreco(plano.preco); }} className="flex-1 bg-blue-600 text-white py-1 rounded-lg text-xs flex items-center justify-center gap-1"><Edit size={12} /> Editar</button>}
                        <button onClick={() => handleToggleStatus(plano.id)} className={`flex-1 ${plano.status === "ativo" ? "bg-red-600" : "bg-green-600"} text-white py-1 rounded-lg text-xs`}>{plano.status === "ativo" ? "Desativar" : "Ativar"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Usuários por Plano */}
      {activeTab === "usuarios" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b"><h3 className="font-semibold">👥 Usuários Contratantes</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr><th className="p-3 text-left text-xs">Nome</th><th className="p-3 text-left text-xs">Tipo</th><th className="p-3 text-left text-xs">Plano</th><th className="p-3 text-left text-xs">Status</th><th className="p-3 text-left text-xs">Expiração</th><th className="p-3 text-left text-xs">Ações</th></tr>
              </thead>
              <tbody>
                {usuariosPlanos.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{u.nome}</td>
                    <td className="p-3 text-sm"><span className={`text-xs px-2 py-0.5 rounded-full ${u.tipo === "empresa" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{u.tipo === "empresa" ? "🏢 Empresa" : "👤 Usuário"}</span></td>
                    <td className="p-3 text-sm">{u.planoNome}</td>
                    <td className="p-3 text-sm"><span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "ativo" ? "bg-green-100 text-green-700" : u.status === "pendente" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{u.status}</span></td>
                    <td className="p-3 text-sm">{new Date(u.dataExpiracao).toLocaleDateString()}</td>
                    <td className="p-3 text-sm"><button onClick={() => { setSelectedUser(u); setShowPushModal(true); }} className="text-blue-600"><Bell size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configurações */}
      {activeTab === "configuracoes" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">⚙️ Configurações</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Intervalo de notificações</label><select className="w-full p-2 border rounded-lg"><option>Diário</option><option>Semanal</option><option>Mensal</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Template de mensagem</label><textarea className="w-full p-2 border rounded-lg h-24" placeholder="Olá {nome}, seu plano {plano} vence em {dias} dias!" /></div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold">Salvar Configurações</button>
          </div>
        </div>
      )}
    </div>
  );
}