"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  Bell, Plus, Trash2, Edit2, Save, X, 
  Send, ArrowLeft, Calendar, MessageCircle, Smartphone, Globe, Database, CheckCircle,
  Users, User, Target, Award, Briefcase, Dumbbell, Bike, Store, Flask
} from "lucide-react";
import toast from "react-hot-toast";

interface Notificacao {
  id: number | string;
  titulo: string;
  mensagem: string;
  importancia: "alta" | "media" | "baixa";
  tipo: "aviso" | "alerta" | "info" | "sucesso" | "promocao";
  data: string;
  ativa: boolean;
  enviar_telegram: boolean;
  enviar_push: boolean;
  link_url: string;
  data_expiracao: string;
  exibida_uma_vez: boolean;
  para_grupo?: string;
  para_usuario_id?: string;
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

interface Usuario {
  id: string;
  nome: string;
  email: string;
  plano?: string;
  whatsapp?: string;
}

export default function AdminNotificacoesPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<GrupoDinamico[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);
  const [modoTeste, setModoTeste] = useState(true);
  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: "",
    mensagem: "",
    importancia: "media" as const,
    tipo: "aviso" as const,
    enviar_telegram: true,
    enviar_push: true,
    link_url: "",
    data_expiracao: "",
    exibida_uma_vez: true,
    tipoAlvo: "todos" as "todos" | "grupo" | "usuario",
    grupoAlvo: "todos",
    usuarioAlvo: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) {
      carregarNotificacoes();
      carregarUsuarios();
      carregarGrupos();
      carregarModoTeste();
    }
  }, [mounted, isAdmin]);

  const carregarModoTeste = async () => {
    try {
      const response = await fetch('/api/configuracoes?chave=modo_teste');
      const data = await response.json();
      if (data.success && data.data) {
        setModoTeste(data.data.valor === true || data.data.valor === 'true');
      }
    } catch (error) {
      console.error("Erro ao carregar modo teste:", error);
    }
  };

  const carregarUsuarios = async () => {
    setCarregandoUsuarios(true);
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.data || []);
      } else {
        // Fallback
        setUsuarios([
          { id: "1", nome: "Usuário Teste", email: "teste@email.com", plano: "premium", whatsapp: "11999999999" },
          { id: "2", nome: "João Silva", email: "joao@email.com", plano: "basico", whatsapp: "11988888888" },
          { id: "3", nome: "Maria Santos", email: "maria@email.com", plano: "premium", whatsapp: "11977777777" }
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setCarregandoUsuarios(false);
    }
  };

  const carregarGrupos = async () => {
    setCarregandoGrupos(true);
    try {
      const response = await fetch('/api/grupos');
      const data = await response.json();
      if (data.success && data.data) {
        setGrupos(data.data);
      } else {
        // Grupos padrão
        setGrupos([
          { id: "premium", nome: "⭐ Usuários Premium", descricao: "Usuários com plano Premium", icone: "Award", cor: "#f59e0b", telegram_chat_id: "@valenteconecta_premium", ativo: true },
          { id: "academia", nome: "💪 Academia", descricao: "Alunos da academia", icone: "Dumbbell", cor: "#10b981", telegram_chat_id: "@valenteconecta_academia", ativo: true },
          { id: "mototaxi", nome: "🏍️ Moto Táxi", descricao: "Motoristas parceiros", icone: "Bike", cor: "#ef4444", telegram_chat_id: "@valenteconecta_mototaxi", ativo: true },
          { id: "comercio", nome: "🏪 Comércio Local", descricao: "Lojistas e comerciantes", icone: "Store", cor: "#8b5cf6", telegram_chat_id: "@valenteconecta_comercio", ativo: true },
          { id: "teste", nome: "🧪 Grupo de Teste", descricao: "Para testar notificações", icone: "Flask", cor: "#06b6d4", telegram_chat_id: "@valenteconecta_teste", ativo: true }
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setCarregandoGrupos(false);
    }
  };

  const carregarNotificacoes = () => {
    const salvas = localStorage.getItem("admin_notificacoes_sistema");
    if (salvas) {
      setNotificacoes(JSON.parse(salvas));
    } else {
      const notificacoesPadrao: Notificacao[] = [
        { 
          id: 1, 
          titulo: "🎉 Novas funcionalidades!", 
          mensagem: "Confira o novo cardápio da Cozinha com opções fitness.", 
          importancia: "alta", 
          tipo: "aviso",
          data: new Date().toLocaleDateString(), 
          ativa: true,
          enviar_telegram: true,
          enviar_push: true,
          link_url: "",
          data_expiracao: "",
          exibida_uma_vez: true,
          para_grupo: "todos"
        },
        { 
          id: 2, 
          titulo: "💰 Campanha de Indicação", 
          mensagem: "Indique um amigo e ganhe R$5 de bônus!", 
          importancia: "media", 
          tipo: "promocao",
          data: new Date().toLocaleDateString(), 
          ativa: true,
          enviar_telegram: true,
          enviar_push: true,
          link_url: "",
          data_expiracao: "",
          exibida_uma_vez: true,
          para_grupo: "todos"
        },
        { 
          id: 3, 
          titulo: "💪 Academia Atualizada", 
          mensagem: "Nova funcionalidade de geolocalização disponível para alunos!", 
          importancia: "alta", 
          tipo: "aviso",
          data: new Date().toLocaleDateString(), 
          ativa: true,
          enviar_telegram: true,
          enviar_push: true,
          link_url: "",
          data_expiracao: "",
          exibida_uma_vez: true,
          para_grupo: "academia"
        }
      ];
      setNotificacoes(notificacoesPadrao);
      localStorage.setItem("admin_notificacoes_sistema", JSON.stringify(notificacoesPadrao));
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-yellow-400 animate-pulse mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  const salvarNotificacoes = (novas: Notificacao[]) => {
    setNotificacoes(novas);
    localStorage.setItem("admin_notificacoes_sistema", JSON.stringify(novas));
  };

  const getGrupoTelegramChatId = (grupoId: string): string => {
    if (modoTeste) {
      return '@valenteconecta_teste';
    }
    
    if (grupoId === 'todos') {
      return '@valenteconecta';
    }
    
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo?.telegram_chat_id || '@valenteconecta';
  };

  const enviarTelegram = async (notificacao: Notificacao) => {
    try {
      let chatId = '@valenteconecta';
      
      if (modoTeste) {
        chatId = '@valenteconecta_teste';
      } else if (notificacao.para_grupo && notificacao.para_grupo !== 'todos') {
        chatId = getGrupoTelegramChatId(notificacao.para_grupo);
      }
      
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: `📢 *${notificacao.titulo}*\n\n${notificacao.mensagem}\n\n${modoTeste ? '🧪 *MODO TESTE* - Esta notificação não foi enviada para todos\n\n' : ''}📌 *Grupo:* ${notificacao.para_grupo === 'todos' ? 'Todos' : notificacao.para_grupo}\n\n🔗 Acesse o app: valenteconecta.clic.com.br`,
          parseMode: 'Markdown'
        })
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao enviar Telegram:", error);
      return false;
    }
  };

  const enviarPushNotification = async (notificacao: Notificacao) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('Push não suportado ou sem permissão');
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notificacao.titulo, {
        body: `${notificacao.mensagem}${modoTeste ? ' 🧪 MODO TESTE' : ''}${notificacao.para_grupo ? `\n📌 Para: ${notificacao.para_grupo}` : ''}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: { url: notificacao.link_url || '/' }
      });
      return true;
    } catch (error) {
      console.error("Erro ao enviar Push:", error);
      return false;
    }
  };

  const adicionarNotificacao = async () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      toast.error("Preencha título e mensagem");
      return;
    }

    if (novaNotificacao.tipoAlvo === 'usuario' && !novaNotificacao.usuarioAlvo) {
      toast.error("Selecione um usuário para enviar");
      return;
    }

    setEnviando(true);
    
    const nova: Notificacao = {
      id: Date.now(),
      titulo: novaNotificacao.titulo,
      mensagem: novaNotificacao.mensagem,
      importancia: novaNotificacao.importancia,
      tipo: novaNotificacao.tipo,
      data: new Date().toLocaleDateString(),
      ativa: true,
      enviar_telegram: novaNotificacao.enviar_telegram,
      enviar_push: novaNotificacao.enviar_push,
      link_url: novaNotificacao.link_url,
      data_expiracao: novaNotificacao.data_expiracao,
      exibida_uma_vez: novaNotificacao.exibida_uma_vez,
      para_grupo: novaNotificacao.tipoAlvo === 'grupo' ? novaNotificacao.grupoAlvo : (novaNotificacao.tipoAlvo === 'todos' ? 'todos' : undefined),
      para_usuario_id: novaNotificacao.tipoAlvo === 'usuario' ? novaNotificacao.usuarioAlvo : undefined
    };

    const novas = [nova, ...notificacoes];
    salvarNotificacoes(novas);

    const msgCanais = [];
    const msgAlvo = novaNotificacao.tipoAlvo === 'todos' ? 'para todos' : (novaNotificacao.tipoAlvo === 'grupo' ? `para grupo ${novaNotificacao.grupoAlvo}` : `para usuário específico`);
    const msgTeste = modoTeste ? ' 🧪 MODO TESTE ATIVADO' : '';
    
    if (nova.enviar_telegram) {
      const enviado = await enviarTelegram(nova);
      if (enviado) msgCanais.push("Telegram");
    }
    
    if (nova.enviar_push) {
      const enviado = await enviarPushNotification(nova);
      if (enviado) msgCanais.push("Push Notification");
    }
    
    setNovaNotificacao({ 
      titulo: "", 
      mensagem: "", 
      importancia: "media",
      tipo: "aviso",
      enviar_telegram: true,
      enviar_push: true,
      link_url: "",
      data_expiracao: "",
      exibida_uma_vez: true,
      tipoAlvo: "todos",
      grupoAlvo: "todos",
      usuarioAlvo: ""
    });
    setMostrarFormulario(false);
    
    toast.success(`✅ Notificação publicada ${msgAlvo}!${msgTeste} ${msgCanais.length > 0 ? `Enviada via: ${msgCanais.join(", ")}` : ""}`);
    setEnviando(false);
  };

  const editarNotificacao = (notif: Notificacao) => {
    setEditandoId(notif.id);
    setNovaNotificacao({
      titulo: notif.titulo,
      mensagem: notif.mensagem,
      importancia: notif.importancia,
      tipo: notif.tipo,
      enviar_telegram: notif.enviar_telegram,
      enviar_push: notif.enviar_push,
      link_url: notif.link_url || "",
      data_expiracao: notif.data_expiracao || "",
      exibida_uma_vez: notif.exibida_uma_vez,
      tipoAlvo: notif.para_usuario_id ? "usuario" : (notif.para_grupo && notif.para_grupo !== 'todos' ? "grupo" : "todos"),
      grupoAlvo: notif.para_grupo || "todos",
      usuarioAlvo: notif.para_usuario_id || ""
    });
    setMostrarFormulario(true);
  };

  const salvarEdicao = () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      toast.error("Preencha título e mensagem");
      return;
    }

    const novas = notificacoes.map(n => 
      n.id === editandoId 
        ? { 
            ...n, 
            titulo: novaNotificacao.titulo, 
            mensagem: novaNotificacao.mensagem, 
            importancia: novaNotificacao.importancia,
            tipo: novaNotificacao.tipo,
            enviar_telegram: novaNotificacao.enviar_telegram,
            enviar_push: novaNotificacao.enviar_push,
            link_url: novaNotificacao.link_url,
            data_expiracao: novaNotificacao.data_expiracao,
            exibida_uma_vez: novaNotificacao.exibida_uma_vez,
            para_grupo: novaNotificacao.tipoAlvo === 'grupo' ? novaNotificacao.grupoAlvo : (novaNotificacao.tipoAlvo === 'todos' ? 'todos' : undefined),
            para_usuario_id: novaNotificacao.tipoAlvo === 'usuario' ? novaNotificacao.usuarioAlvo : undefined
          }
        : n
    );
    salvarNotificacoes(novas);
    
    setNovaNotificacao({ 
      titulo: "", 
      mensagem: "", 
      importancia: "media",
      tipo: "aviso",
      enviar_telegram: true,
      enviar_push: true,
      link_url: "",
      data_expiracao: "",
      exibida_uma_vez: true,
      tipoAlvo: "todos",
      grupoAlvo: "todos",
      usuarioAlvo: ""
    });
    setMostrarFormulario(false);
    setEditandoId(null);
    toast.success("✅ Notificação atualizada!");
  };

  const removerNotificacao = (id: number | string) => {
    const novas = notificacoes.filter(n => n.id !== id);
    salvarNotificacoes(novas);
    toast.success("🗑️ Notificação removida!");
  };

  const toggleAtiva = (id: number | string) => {
    const novas = notificacoes.map(n => 
      n.id === id ? { ...n, ativa: !n.ativa } : n
    );
    salvarNotificacoes(novas);
    toast.success(novas.find(n => n.id === id)?.ativa ? "✅ Notificação ativada!" : "❌ Notificação desativada!");
  };

  const getImportanciaCor = (importancia: string) => {
    if (importancia === "alta") return "border-l-4 border-l-red-500 bg-red-50";
    if (importancia === "media") return "border-l-4 border-l-yellow-500 bg-yellow-50";
    return "border-l-4 border-l-blue-500 bg-blue-50";
  };

  const getImportanciaBadge = (importancia: string) => {
    if (importancia === "alta") return "bg-red-100 text-red-700";
    if (importancia === "media") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case "alerta": return "⚠️";
      case "sucesso": return "✅";
      case "promocao": return "🎁";
      case "info": return "ℹ️";
      default: return "📢";
    }
  };

  const getIconeGrupo = (icone: string) => {
    switch (icone) {
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Dumbbell': return <Dumbbell className="w-4 h-4" />;
      case 'Bike': return <Bike className="w-4 h-4" />;
      case 'Store': return <Store className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Flask': return <Flask className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getAlvoLabel = (notif: Notificacao) => {
    if (notif.para_usuario_id) {
      const usuario = usuarios.find(u => u.id === notif.para_usuario_id);
      return `👤 ${usuario?.nome || 'Usuário específico'}`;
    }
    if (notif.para_grupo && notif.para_grupo !== 'todos') {
      const grupo = grupos.find(g => g.id === notif.para_grupo);
      return grupo ? `${getIconeGrupo(grupo.icone)} ${grupo.nome}` : `📌 Grupo: ${notif.para_grupo}`;
    }
    return "🌍 Todos os usuários";
  };

  const notificacoesAtivas = notificacoes.filter(n => n.ativa).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Bell className="w-6 h-6 text-white" />
          <h1 className="text-white font-bold text-xl">📢 Comunicados Oficiais</h1>
        </div>
        <div className="flex items-center gap-2">
          {modoTeste && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Flask className="w-3 h-3" /> MODO TESTE
            </span>
          )}
          <button 
            onClick={() => { setMostrarFormulario(true); setEditandoId(null); setNovaNotificacao({ 
              titulo: "", 
              mensagem: "", 
              importancia: "media",
              tipo: "aviso",
              enviar_telegram: true,
              enviar_push: true,
              link_url: "",
              data_expiracao: "",
              exibida_uma_vez: true,
              tipoAlvo: "todos",
              grupoAlvo: "todos",
              usuarioAlvo: ""
            }); }}
            className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Notificação
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoes.length}</p>
            <p className="text-sm opacity-90">Total</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoesAtivas}</p>
            <p className="text-sm opacity-90">Ativas</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoes.filter(n => n.importancia === "alta").length}</p>
            <p className="text-sm opacity-90">Urgentes</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoes.filter(n => n.enviar_telegram).length}</p>
            <p className="text-sm opacity-90">Via Telegram</p>
          </div>
        </div>

        {/* Formulário de nova notificação */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editandoId ? "✏️ Editar Notificação" : "➕ Nova Notificação"}
              </h2>
              <button onClick={() => { setMostrarFormulario(false); setEditandoId(null); }} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={novaNotificacao.titulo}
                  onChange={(e) => setNovaNotificacao({ ...novaNotificacao, titulo: e.target.value })}
                  placeholder="Ex: Novas funcionalidades disponíveis!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                <textarea
                  value={novaNotificacao.mensagem}
                  onChange={(e) => setNovaNotificacao({ ...novaNotificacao, mensagem: e.target.value })}
                  rows={3}
                  placeholder="Digite o conteúdo da notificação..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={novaNotificacao.tipo}
                    onChange={(e) => setNovaNotificacao({ ...novaNotificacao, tipo: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="aviso">📢 Aviso</option>
                    <option value="alerta">⚠️ Alerta</option>
                    <option value="info">ℹ️ Informação</option>
                    <option value="sucesso">✅ Sucesso</option>
                    <option value="promocao">🎁 Promoção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Importância</label>
                  <select
                    value={novaNotificacao.importancia}
                    onChange={(e) => setNovaNotificacao({ ...novaNotificacao, importancia: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  >
                    <option value="baixa">🔵 Informativa</option>
                    <option value="media">🟡 Importante</option>
                    <option value="alta">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
                <input
                  type="url"
                  value={novaNotificacao.link_url}
                  onChange={(e) => setNovaNotificacao({ ...novaNotificacao, link_url: e.target.value })}
                  placeholder="https://valenteconecta.clic.com.br/pagina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em (opcional)</label>
                <input
                  type="date"
                  value={novaNotificacao.data_expiracao}
                  onChange={(e) => setNovaNotificacao({ ...novaNotificacao, data_expiracao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                />
              </div>

              {/* SEÇÃO DE PÚBLICO ALVO */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">🎯 Público alvo:</p>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAlvo"
                      checked={novaNotificacao.tipoAlvo === 'todos'}
                      onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'todos' })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Todos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAlvo"
                      checked={novaNotificacao.tipoAlvo === 'grupo'}
                      onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'grupo' })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Grupo específico</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoAlvo"
                      checked={novaNotificacao.tipoAlvo === 'usuario'}
                      onChange={() => setNovaNotificacao({ ...novaNotificacao, tipoAlvo: 'usuario' })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Usuário específico</span>
                  </label>
                </div>

                {novaNotificacao.tipoAlvo === 'grupo' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o grupo:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {carregandoGrupos ? (
                        <div className="col-span-2 text-center py-4 text-gray-500">Carregando grupos...</div>
                      ) : (
                        grupos.filter(g => g.ativo).map((grupo) => (
                          <button
                            key={grupo.id}
                            type="button"
                            onClick={() => setNovaNotificacao({ ...novaNotificacao, grupoAlvo: grupo.id })}
                            className={`p-3 rounded-xl text-left transition-all ${
                              novaNotificacao.grupoAlvo === grupo.id
                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center`} style={{ backgroundColor: grupo.cor }}>
                                {getIconeGrupo(grupo.icone)}
                              </div>
                              <span className="font-medium text-sm">{grupo.nome}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{grupo.descricao}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {novaNotificacao.tipoAlvo === 'usuario' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o usuário:</label>
                    <select
                      value={novaNotificacao.usuarioAlvo}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, usuarioAlvo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione um usuário...</option>
                      {carregandoUsuarios ? (
                        <option disabled>Carregando usuários...</option>
                      ) : (
                        usuarios.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nome} - {usuario.email} {usuario.plano && `(${usuario.plano})`}
                          </option>
                        ))
                      )}
                    </select>
                    {novaNotificacao.usuarioAlvo && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Notificação será enviada apenas para este usuário
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Canais de envio */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">📡 Canais de envio:</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novaNotificacao.enviar_telegram}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, enviar_telegram: e.target.checked })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Telegram (@valenteconecta_bot)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novaNotificacao.enviar_push}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, enviar_push: e.target.checked })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <Smartphone className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Push Notification</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={novaNotificacao.exibida_uma_vez}
                      onChange={(e) => setNovaNotificacao({ ...novaNotificacao, exibida_uma_vez: e.target.checked })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-700">Popup única vez</span>
                  </label>
                </div>
              </div>
              
              {modoTeste && (
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <p className="text-xs text-yellow-700 flex items-center gap-2">
                    <Flask className="w-4 h-4" />
                    <strong>Modo Teste ativado!</strong> As notificações serão enviadas apenas para o grupo de teste.
                  </p>
                </div>
              )}
              
              <button
                onClick={editandoId ? salvarEdicao : adicionarNotificacao}
                disabled={enviando}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
              >
                {enviando ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {editandoId ? "Salvar Alterações" : "Publicar Notificação"}
              </button>
            </div>
          </div>
        )}

        {/* Lista de notificações */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Notificações Publicadas
            {notificacoesAtivas > 0 && (
              <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {notificacoesAtivas} ativas
              </span>
            )}
          </h2>
          
          <div className="space-y-3">
            {notificacoes.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl ${getImportanciaCor(notif.importancia)} border`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-lg">{getTipoIcone(notif.tipo)}</span>
                      <h3 className="font-bold text-gray-800">{notif.titulo}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getImportanciaBadge(notif.importancia)}`}>
                        {notif.importancia === "alta" ? "🔴 Urgente" : notif.importancia === "media" ? "⚠️ Importante" : "📘 Informativo"}
                      </span>
                      {!notif.ativa && (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Inativa</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{notif.mensagem}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notif.data}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {getAlvoLabel(notif)}
                      </span>
                      {notif.enviar_telegram && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Telegram
                        </span>
                      )}
                      {notif.enviar_push && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> Push
                        </span>
                      )}
                      {notif.exibida_uma_vez && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Popup 1x
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAtiva(notif.id)}
                      className={`p-2 rounded-lg transition-all ${
                        notif.ativa ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                      }`}
                      title={notif.ativa ? "Desativar" : "Ativar"}
                    >
                      {notif.ativa ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => editarNotificacao(notif)}
                      className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removerNotificacao(notif.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notificacoes.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma notificação cadastrada</p>
              <p className="text-sm text-gray-400">Clique em "Nova Notificação" para começar</p>
            </div>
          )}
        </div>

        {/* Dica sobre os canais */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">📡 Status dos canais de comunicação:</p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• <strong>Telegram</strong>: ✅ Bot @valenteconecta_bot ativo e funcionando</li>
                <li>• <strong>Push Notification</strong>: ⚠️ Necessário ativar permissão no navegador</li>
                <li>• <strong>Popup única vez</strong>: ✅ Cada usuário vê apenas uma vez</li>
                <li>• <strong>Segmentação</strong>: ✅ Envio para grupos específicos ou usuário individual</li>
                <li>• <strong>Modo Teste</strong>: {modoTeste ? '✅ ATIVADO - Notificações vão apenas para grupo de teste' : '❌ DESATIVADO - Notificações vão para todos'}</li>
                <li>• As notificações ativas aparecem no card abaixo do "Indique e Ganhe" na Home</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}