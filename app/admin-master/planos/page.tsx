"use client";

import {
  Bell,
  Briefcase,
  Calendar,
  Crown,
  Dumbbell,
  Edit,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

interface Funcionalidade {
  id: string;
  nome: string;
  ativa: boolean;
  descricao?: string;
}

interface Plano {
  id: string;
  nome: string;
  categoria: string;
  icone: any;
  preco: number;
  precoOriginal: number;
  status: "ativo" | "inativo";
  funcionalidades: Funcionalidade[];
  limites: {
    usuarios?: number;
    produtos?: number;
    armazenamento?: number;
    categorias?: number;
  };
  recomendado?: boolean;
  cor: string;
}

export default function AdminPlanosPage() {
  const [activeTab, setActiveTab] = useState("planos");
  const [editingPlano, setEditingPlano] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState<number>(0);
  const [showAddFuncionalidade, setShowAddFuncionalidade] = useState<string | null>(null);
  const [novaFuncionalidade, setNovaFuncionalidade] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("todos");
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [planos, setPlanos] = useState<Plano[]>([
    // ==================== ACADEMIA ====================
    {
      id: "academia_gratis", nome: "Academia Grátis", categoria: "academia", icone: Dumbbell,
      preco: 0, precoOriginal: 0, status: "ativo", recomendado: false, cor: "bg-gray-500",
      funcionalidades: [
        { id: "cadastro", nome: "Cadastro completo", ativa: true, descricao: "Registro de alunos com dados básicos" },
        { id: "navegacao", nome: "Navegação completa", ativa: true, descricao: "Acesso a todas as telas do módulo" },
        { id: "indicacoes", nome: "Sistema de indicações", ativa: true, descricao: "Indique amigos e ganhe bônus" },
        { id: "alertas", nome: "Alertas de treino", ativa: true, descricao: "Notificações de tempo e desempenho" },
        { id: "treinos", nome: "Treinos personalizados", ativa: false, descricao: "Crie treinos específicos por aluno" },
        { id: "metas", nome: "Metas avançadas", ativa: false, descricao: "Defina e acompanhe metas detalhadas" },
        { id: "relatorios", nome: "Relatórios de desempenho", ativa: false, descricao: "Gráficos e estatísticas de evolução" },
        { id: "suporte", nome: "Suporte prioritário", ativa: false, descricao: "Atendimento preferencial 24h" }
      ],
      limites: {}
    },
    {
      id: "academia_premium", nome: "Academia Premium", categoria: "academia", icone: Crown,
      preco: 9.90, precoOriginal: 9.90, status: "ativo", recomendado: true, cor: "bg-yellow-500",
      funcionalidades: [
        { id: "cadastro", nome: "Cadastro completo", ativa: true, descricao: "Registro de alunos com dados básicos" },
        { id: "navegacao", nome: "Navegação completa", ativa: true, descricao: "Acesso a todas as telas do módulo" },
        { id: "indicacoes", nome: "Sistema de indicações", ativa: true, descricao: "Indique amigos e ganhe bônus" },
        { id: "alertas", nome: "Alertas de treino", ativa: true, descricao: "Notificações de tempo e desempenho" },
        { id: "treinos", nome: "Treinos personalizados", ativa: true, descricao: "Crie treinos específicos por aluno" },
        { id: "metas", nome: "Metas avançadas", ativa: true, descricao: "Defina e acompanhe metas detalhadas" },
        { id: "relatorios", nome: "Relatórios de desempenho", ativa: true, descricao: "Gráficos e estatísticas de evolução" },
        { id: "suporte", nome: "Suporte prioritário", ativa: true, descricao: "Atendimento preferencial 24h" }
      ],
      limites: {}
    },
    // ==================== PROFISSIONAIS ====================
    {
      id: "profissional_basico", nome: "Profissional Básico", categoria: "profissional", icone: Briefcase,
      preco: 25, precoOriginal: 25, status: "ativo", recomendado: false, cor: "bg-blue-500",
      funcionalidades: [
        { id: "usuarios_3", nome: "3 usuários", ativa: true, descricao: "Limite de 3 usuários na conta" },
        { id: "produtos_10", nome: "10 itens no catálogo", ativa: true, descricao: "Cadastre até 10 produtos/serviços" },
        { id: "agendamento", nome: "Agendamento básico", ativa: true, descricao: "Gestão simples de horários" },
        { id: "relatorios", nome: "Relatórios básicos", ativa: false, descricao: "Exportação de dados em CSV" },
        { id: "destaque", nome: "Destaque na busca", ativa: false, descricao: "Apareça no topo das pesquisas" },
        { id: "suporte", nome: "Suporte 48h", ativa: false, descricao: "Resposta em até 48 horas" },
        { id: "api", nome: "API externa", ativa: false, descricao: "Integração com sistemas terceiros" },
        { id: "certificado", nome: "Certificado digital", ativa: false, descricao: "Selo de verificação profissional" }
      ],
      limites: { usuarios: 3, produtos: 10 }
    },
    {
      id: "profissional_premium", nome: "Profissional Premium", categoria: "profissional", icone: Star,
      preco: 35, precoOriginal: 35, status: "ativo", recomendado: true, cor: "bg-purple-500",
      funcionalidades: [
        { id: "usuarios_10", nome: "10 usuários", ativa: true, descricao: "Limite de 10 usuários na conta" },
        { id: "produtos_ilimitados", nome: "Catálogo ilimitado", ativa: true, descricao: "Sem limite de produtos/serviços" },
        { id: "agendamento", nome: "Agendamento avançado", ativa: true, descricao: "Gestão completa de horários" },
        { id: "relatorios", nome: "Relatórios avançados", ativa: true, descricao: "Gráficos e análises detalhadas" },
        { id: "destaque", nome: "Destaque na busca", ativa: true, descricao: "Apareça no topo das pesquisas" },
        { id: "suporte", nome: "Suporte 24h", ativa: true, descricao: "Atendimento prioritário" },
        { id: "api", nome: "API externa", ativa: true, descricao: "Integração com sistemas terceiros" },
        { id: "certificado", nome: "Certificado digital", ativa: true, descricao: "Selo de verificação profissional" }
      ],
      limites: { usuarios: 10, produtos: -1 }
    },
    // ==================== SERVIÇOS COM AGENDAMENTO ====================
    {
      id: "servico_gratis", nome: "Serviço Grátis", categoria: "servico", icone: Calendar,
      preco: 0, precoOriginal: 0, status: "ativo", recomendado: false, cor: "bg-gray-500",
      funcionalidades: [
        { id: "usuario_1", nome: "1 usuário", ativa: true, descricao: "Apenas um usuário na conta" },
        { id: "produtos_5", nome: "5 itens no catálogo", ativa: true, descricao: "Cadastre até 5 serviços" },
        { id: "agendamento", nome: "Agendamento básico", ativa: true, descricao: "Gestão simples de agenda" },
        { id: "cliente", nome: "Cadastro de clientes", ativa: false, descricao: "Gerencie sua base de clientes" },
        { id: "lembretes", nome: "Lembretes automáticos", ativa: false, descricao: "Notificações para clientes" },
        { id: "financeiro", nome: "Controle financeiro", ativa: false, descricao: "Gestão de receitas e despesas" }
      ],
      limites: { usuarios: 1, produtos: 5 }
    },
    {
      id: "servico_basico", nome: "Serviço Básico", categoria: "servico", icone: Settings,
      preco: 25, precoOriginal: 25, status: "ativo", recomendado: false, cor: "bg-blue-500",
      funcionalidades: [
        { id: "usuarios_3", nome: "3 usuários", ativa: true, descricao: "Até 3 usuários na conta" },
        { id: "produtos_10", nome: "10 itens no catálogo", ativa: true, descricao: "Cadastre até 10 serviços" },
        { id: "agendamento", nome: "Agendamento completo", ativa: true, descricao: "Gestão avançada de agenda" },
        { id: "cliente", nome: "Cadastro de clientes", ativa: true, descricao: "Gerencie sua base de clientes" },
        { id: "lembretes", nome: "Lembretes automáticos", ativa: true, descricao: "Notificações para clientes" },
        { id: "financeiro", nome: "Controle financeiro", ativa: false, descricao: "Gestão de receitas e despesas" },
        { id: "relatorios", nome: "Relatórios de agenda", ativa: false, descricao: "Análise de ocupação" }
      ],
      limites: { usuarios: 3, produtos: 10 }
    },
    {
      id: "servico_premium", nome: "Serviço Premium", categoria: "servico", icone: Crown,
      preco: 35, precoOriginal: 35, status: "ativo", recomendado: true, cor: "bg-purple-500",
      funcionalidades: [
        { id: "usuarios_10", nome: "10 usuários", ativa: true, descricao: "Até 10 usuários na conta" },
        { id: "produtos_ilimitados", nome: "Catálogo ilimitado", ativa: true, descricao: "Sem limite de serviços" },
        { id: "agendamento", nome: "Agendamento completo", ativa: true, descricao: "Gestão avançada de agenda" },
        { id: "cliente", nome: "Cadastro de clientes", ativa: true, descricao: "Gerencie sua base de clientes" },
        { id: "lembretes", nome: "Lembretes automáticos", ativa: true, descricao: "Notificações para clientes" },
        { id: "financeiro", nome: "Controle financeiro", ativa: true, descricao: "Gestão de receitas e despesas" },
        { id: "relatorios", nome: "Relatórios avançados", ativa: true, descricao: "Análise de ocupação e faturamento" },
        { id: "suporte", nome: "Suporte prioritário", ativa: true, descricao: "Atendimento 24h" }
      ],
      limites: { usuarios: 10, produtos: -1 }
    },
    // ==================== AMBULANTES ====================
    {
      id: "ambulante_basico", nome: "Ambulante Básico", categoria: "ambulante", icone: ShoppingBag,
      preco: 15, precoOriginal: 15, status: "ativo", recomendado: false, cor: "bg-green-500",
      funcionalidades: [
        { id: "produtos_20", nome: "20 itens no catálogo", ativa: true, descricao: "Cadastre até 20 produtos" },
        { id: "estoque", nome: "Gestão de estoque", ativa: true, descricao: "Controle básico de inventário" },
        { id: "vendas", nome: "Registro de vendas", ativa: false, descricao: "Histórico de transações" },
        { id: "localizacao", nome: "Compartilhar localização", ativa: false, descricao: "Clientes veem onde você está" },
        { id: "promocoes", nome: "Promoções relâmpago", ativa: false, descricao: "Crie ofertas por tempo limitado" }
      ],
      limites: { produtos: 20 }
    },
    {
      id: "ambulante_premium", nome: "Ambulante Premium", categoria: "ambulante", icone: Star,
      preco: 25, precoOriginal: 25, status: "ativo", recomendado: true, cor: "bg-orange-500",
      funcionalidades: [
        { id: "produtos_ilimitados", nome: "Catálogo ilimitado", ativa: true, descricao: "Sem limite de produtos" },
        { id: "estoque", nome: "Gestão de estoque", ativa: true, descricao: "Controle avançado de inventário" },
        { id: "vendas", nome: "Registro de vendas", ativa: true, descricao: "Histórico completo de transações" },
        { id: "localizacao", nome: "Compartilhar localização", ativa: true, descricao: "Clientes veem onde você está" },
        { id: "promocoes", nome: "Promoções relâmpago", ativa: true, descricao: "Crie ofertas por tempo limitado" },
        { id: "relatorios", nome: "Relatórios de vendas", ativa: true, descricao: "Análise de desempenho" },
        { id: "destaque", nome: "Destaque na busca", ativa: true, descricao: "Apareça no topo das pesquisas" }
      ],
      limites: { produtos: -1 }
    }
  ]);

  const categorias = [
    { id: "academia", nome: "🏋️ Academia", icon: Dumbbell, cor: "bg-indigo-100 text-indigo-700", planos: planos.filter(p => p.categoria === "academia") },
    { id: "profissional", nome: "👔 Profissionais", icon: Briefcase, cor: "bg-blue-100 text-blue-700", planos: planos.filter(p => p.categoria === "profissional") },
    { id: "servico", nome: "📅 Serviços com Agendamento", icon: Calendar, cor: "bg-green-100 text-green-700", planos: planos.filter(p => p.categoria === "servico") },
    { id: "ambulante", nome: "🛒 Ambulantes", icon: ShoppingBag, cor: "bg-orange-100 text-orange-700", planos: planos.filter(p => p.categoria === "ambulante") }
  ];

  const handleToggleFuncionalidade = (planoId: string, funcId: string) => {
    setPlanos(planos.map(p =>
      p.id === planoId ? {
        ...p,
        funcionalidades: p.funcionalidades.map(f =>
          f.id === funcId ? { ...f, ativa: !f.ativa } : f
        )
      } : p
    ));
  };

  const handleToggleStatus = (planoId: string) => {
    setPlanos(planos.map(p =>
      p.id === planoId ? { ...p, status: p.status === "ativo" ? "inativo" : "ativo" } : p
    ));
  };

  const handleSalvarPreco = (planoId: string) => {
    setPlanos(planos.map(p => p.id === planoId ? { ...p, preco: novoPreco } : p));
    setEditingPlano(null);
    alert(`✅ Preço do plano atualizado para R$ ${novoPreco.toFixed(2)}`);
  };

  const handleAddFuncionalidade = (planoId: string) => {
    if (!novaFuncionalidade.trim()) return;
    setPlanos(planos.map(p =>
      p.id === planoId ? {
        ...p,
        funcionalidades: [
          ...p.funcionalidades,
          { id: Date.now().toString(), nome: novaFuncionalidade, ativa: true, descricao: "Funcionalidade personalizada" }
        ]
      } : p
    ));
    setShowAddFuncionalidade(null);
    setNovaFuncionalidade("");
    alert(`✅ Funcionalidade "${novaFuncionalidade}" adicionada!`);
  };

  const handleRemoveFuncionalidade = (planoId: string, funcId: string) => {
    if (confirm("Remover esta funcionalidade?")) {
      setPlanos(planos.map(p =>
        p.id === planoId ? {
          ...p,
          funcionalidades: p.funcionalidades.filter(f => f.id !== funcId)
        } : p
      ));
    }
  };

  const handleSendNotification = () => {
    alert(`✅ Notificação enviada para ${notificationType === "todos" ? "todos os usuários" : notificationType}`);
    setShowNotificationModal(false);
    setNotificationMessage("");
  };

  const stats = {
    totalPlanos: planos.length,
    ativos: planos.filter(p => p.status === "ativo").length,
    planosComDesconto: planos.filter(p => p.preco < p.precoOriginal).length,
    receitaMensal: planos.filter(p => p.status === "ativo").reduce((acc, p) => acc + p.preco, 0)
  };

  return (
    <div className="space-y-6">
      {/* Modal de Notificação */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">📢 Enviar Notificação</h3>
            <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="w-full p-2 border rounded-lg mb-3">
              <option value="todos">Todos os usuários</option>
              <option value="planos">Usuários por plano</option>
            </select>
            <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="Digite a mensagem..." className="w-full p-2 border rounded-lg h-24 mb-3" />
            <button onClick={handleSendNotification} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">Enviar</button>
            <button onClick={() => setShowNotificationModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💰 Planos e Assinaturas</h1>
          <p className="text-sm text-gray-500">Gerencie planos, preços e funcionalidades liberadas por cada plano</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNotificationModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Bell size={16} /> Notificar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-indigo-500">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalPlanos}</div>
          <div className="text-xs text-gray-500">Total de Planos</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
          <div className="text-xs text-gray-500">Planos Ativos</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.planosComDesconto}</div>
          <div className="text-xs text-gray-500">Com Preço Especial</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">R$ {stats.receitaMensal.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Receita Potencial</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab("planos")} className={`pb-2 px-4 text-sm font-medium ${activeTab === "planos" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500"}`}>📋 Planos</button>
      </div>

      {/* Planos por Categoria */}
      {activeTab === "planos" && (
        <div className="space-y-8">
          {categorias.map(categoria => {
            const Icon = categoria.icon;
            return categoria.planos.length > 0 && (
              <div key={categoria.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className={`px-4 py-3 ${categoria.cor} border-b flex items-center gap-2`}>
                  <Icon size={18} />
                  <h3 className="font-semibold">{categoria.nome}</h3>
                  <span className="text-xs ml-auto">{categoria.planos.length} planos</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoria.planos.map(plano => {
                    const PlanoIcon = plano.icone;
                    return (
                      <div key={plano.id} className={`border rounded-xl p-4 transition-all hover:shadow-md ${plano.status === "ativo" ? "border-gray-200" : "border-red-200 bg-red-50"}`}>
                        {/* Cabeçalho */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 ${plano.cor} rounded-xl flex items-center justify-center text-white`}>
                              <PlanoIcon size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{plano.nome}</h4>
                              {plano.recomendado && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">⭐ Recomendado</span>}
                            </div>
                          </div>
                          <button onClick={() => handleToggleStatus(plano.id)} className={`px-2 py-1 rounded-full text-[10px] font-semibold ${plano.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {plano.status === "ativo" ? "✅ Ativo" : "❌ Inativo"}
                          </button>
                        </div>

                        {/* Preço */}
                        <div className="mb-3">
                          {editingPlano === plano.id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={novoPreco} onChange={(e) => setNovoPreco(parseFloat(e.target.value))} className="w-24 p-1 border rounded text-right text-xl font-bold" step="0.01" />
                              <button onClick={() => handleSalvarPreco(plano.id)} className="bg-green-600 text-white p-1 rounded"><Save size={14} /></button>
                              <button onClick={() => setEditingPlano(null)} className="bg-gray-400 text-white p-1 rounded"><X size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold text-indigo-600">R$ {plano.preco.toFixed(2)}</span>
                              <span className="text-sm text-gray-400">/mês</span>
                              {plano.preco < plano.precoOriginal && (
                                <span className="text-xs text-gray-400 line-through">R$ {plano.precoOriginal.toFixed(2)}</span>
                              )}
                              <button onClick={() => { setEditingPlano(plano.id); setNovoPreco(plano.preco); }} className="text-blue-500"><Edit size={14} /></button>
                            </div>
                          )}
                        </div>

                        {/* Funcionalidades */}
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Funcionalidades liberadas:</p>
                            <button onClick={() => setShowAddFuncionalidade(showAddFuncionalidade === plano.id ? null : plano.id)} className="text-blue-600 text-[10px] flex items-center gap-1">
                              <Plus size={10} /> Adicionar
                            </button>
                          </div>
                          {showAddFuncionalidade === plano.id && (
                            <div className="flex gap-1 mb-2">
                              <input type="text" value={novaFuncionalidade} onChange={(e) => setNovaFuncionalidade(e.target.value)} placeholder="Nova funcionalidade" className="flex-1 p-1 border rounded text-xs" />
                              <button onClick={() => handleAddFuncionalidade(plano.id)} className="bg-green-600 text-white px-2 py-1 rounded text-[10px]">Add</button>
                            </div>
                          )}
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {plano.funcionalidades.map(func => (
                              <div key={func.id} className="flex items-center justify-between">
                                <label className="flex items-start gap-2 cursor-pointer flex-1">
                                  <input type="checkbox" checked={func.ativa} onChange={() => handleToggleFuncionalidade(plano.id, func.id)} className="w-4 h-4 mt-0.5 cursor-pointer" />
                                  <div>
                                    <span className={`text-sm ${func.ativa ? "text-gray-700 font-medium" : "text-gray-400 line-through"}`}>{func.nome}</span>
                                    {func.descricao && <p className="text-[10px] text-gray-400">{func.descricao}</p>}
                                  </div>
                                </label>
                                <button onClick={() => handleRemoveFuncionalidade(plano.id, func.id)} className="text-red-400 hover:text-red-600">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Limites */}
                        {Object.keys(plano.limites).length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <p className="text-[10px] font-semibold text-gray-500 mb-1">📊 Limites do plano:</p>
                            <div className="flex gap-3 text-[10px] text-gray-600">
                              {plano.limites.usuarios !== undefined && <span>👥 {plano.limites.usuarios === -1 ? "Ilimitados" : `${plano.limites.usuarios} usuários`}</span>}
                              {plano.limites.produtos !== undefined && <span>📦 {plano.limites.produtos === -1 ? "Ilimitados" : `${plano.limites.produtos} produtos`}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}