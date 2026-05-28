"use client";


export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  Bell, Plus, Trash2, Edit2, Save, X, 
  Send, Users, User, AlertCircle, CheckCircle,
  ArrowLeft, Calendar, Clock, Tag, TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  importancia: "alta" | "media" | "baixa";
  data: string;
  ativa: boolean;
}

export default function AdminNotificacoesPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novaNotificacao, setNovaNotificacao] = useState({
    titulo: "",
    mensagem: "",
    importancia: "media" as "alta" | "media" | "baixa"
  });

  // Garantir que só executa no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar notificações - executado após mounted
  useEffect(() => {
    if (mounted) {
      const salvas = localStorage.getItem("admin_notificacoes_sistema");
      if (salvas) {
        setNotificacoes(JSON.parse(salvas));
      } else {
        const notificacoesPadrao: Notificacao[] = [
          { id: 1, titulo: "📢 Novas funcionalidades!", mensagem: "Confira o novo cardápio da Cozinha com opções fitness.", importancia: "alta", data: new Date().toLocaleDateString(), ativa: true },
          { id: 2, titulo: "🎁 Campanha de Indicação", mensagem: "Indique um amigo e ganhe R$5 de bônus!", importancia: "media", data: new Date().toLocaleDateString(), ativa: true },
          { id: 3, titulo: "💪 Academia Atualizada", mensagem: "Nova funcionalidade de geolocalização disponível!", importancia: "alta", data: new Date().toLocaleDateString(), ativa: true }
        ];
        setNotificacoes(notificacoesPadrao);
        localStorage.setItem("admin_notificacoes_sistema", JSON.stringify(notificacoesPadrao));
      }
    }
  }, [mounted]);

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

  const adicionarNotificacao = () => {
    if (!novaNotificacao.titulo || !novaNotificacao.mensagem) {
      toast.error("Preencha título e mensagem");
      return;
    }

    const nova: Notificacao = {
      id: Date.now(),
      titulo: novaNotificacao.titulo,
      mensagem: novaNotificacao.mensagem,
      importancia: novaNotificacao.importancia,
      data: new Date().toLocaleDateString(),
      ativa: true
    };

    const novas = [nova, ...notificacoes];
    salvarNotificacoes(novas);
    
    setNovaNotificacao({ titulo: "", mensagem: "", importancia: "media" });
    setMostrarFormulario(false);
    toast.success("✅ Notificação adicionada!");
  };

  const editarNotificacao = (notif: Notificacao) => {
    setEditandoId(notif.id);
    setNovaNotificacao({
      titulo: notif.titulo,
      mensagem: notif.mensagem,
      importancia: notif.importancia
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
        ? { ...n, titulo: novaNotificacao.titulo, mensagem: novaNotificacao.mensagem, importancia: novaNotificacao.importancia }
        : n
    );
    salvarNotificacoes(novas);
    
    setNovaNotificacao({ titulo: "", mensagem: "", importancia: "media" });
    setMostrarFormulario(false);
    setEditandoId(null);
    toast.success("✅ Notificação atualizada!");
  };

  const removerNotificacao = (id: number) => {
    const novas = notificacoes.filter(n => n.id !== id);
    salvarNotificacoes(novas);
    toast.success("🗑️ Notificação removida!");
  };

  const toggleAtiva = (id: number) => {
    const novas = notificacoes.map(n => 
      n.id === id ? { ...n, ativa: !n.ativa } : n
    );
    salvarNotificacoes(novas);
    toast.success(novas.find(n => n.id === id)?.ativa ? "✅ Notificação ativada!" : "🔕 Notificação desativada!");
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

  const notificacoesAtivas = notificacoes.filter(n => n.ativa).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Bell className="w-6 h-6 text-white" />
          <h1 className="text-white font-bold text-xl">Comunicados Oficiais</h1>
        </div>
        <button 
          onClick={() => { setMostrarFormulario(true); setEditandoId(null); setNovaNotificacao({ titulo: "", mensagem: "", importancia: "media" }); }}
          className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Notificação
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoes.length}</p>
            <p className="text-sm opacity-90">Total</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoesAtivas}</p>
            <p className="text-sm opacity-90">Ativas</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{notificacoes.filter(n => n.importancia === "alta").length}</p>
            <p className="text-sm opacity-90">Urgentes</p>
          </div>
        </div>

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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Importância</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNovaNotificacao({ ...novaNotificacao, importancia: "baixa" })}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                      novaNotificacao.importancia === "baixa"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    📘 Informativa
                  </button>
                  <button
                    onClick={() => setNovaNotificacao({ ...novaNotificacao, importancia: "media" })}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                      novaNotificacao.importancia === "media"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ⚠️ Importante
                  </button>
                  <button
                    onClick={() => setNovaNotificacao({ ...novaNotificacao, importancia: "alta" })}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                      novaNotificacao.importancia === "alta"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    🚨 Urgente
                  </button>
                </div>
              </div>
              
              <button
                onClick={editandoId ? salvarEdicao : adicionarNotificacao}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <Save className="w-4 h-4" />
                {editandoId ? "Salvar Alterações" : "Publicar Notificação"}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Notificações Publicadas
          </h2>
          
          <div className="space-y-3">
            {notificacoes.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl ${getImportanciaCor(notif.importancia)} border`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{notif.titulo}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getImportanciaBadge(notif.importancia)}`}>
                        {notif.importancia === "alta" ? "Urgente" : notif.importancia === "media" ? "Importante" : "Informativo"}
                      </span>
                      {!notif.ativa && (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">Inativa</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{notif.mensagem}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notif.data}
                    </p>
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
      </main>
    </div>
  );
}
