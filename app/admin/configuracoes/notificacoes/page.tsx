// ============================================================================
// ARQUIVO 3: app/admin/configuracoes/notificacoes/page.tsx
// Funcionalidade: Interface do Admin Master para configuraÃ§Ãµes de notificaÃ§Ãµes
// Onde: /admin/configuracoes/notificacoes
// Funcionalidades:
//   - Configurar Telegram (bot token, grupos)
//   - Configurar Push (VAPID keys, Firebase)
//   - Gerenciar grupos dinÃ¢micos (criar, editar, deletar)
//   - Ver logs de notificaÃ§Ãµes enviadas
//   - Modo de teste
// ============================================================================

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  Bell, ArrowLeft, Save, CheckCircle, XCircle, 
  MessageCircle, Smartphone, Globe, Users, Plus, 
  Edit2, Trash2, Settings, Database, Send, Eye,
  AlertCircle, Info, Mail, Phone, MapPin,
  TrendingUp, Calendar, Clock, Filter, Download
} from "lucide-react";
import toast from "react-hot-toast";

interface GrupoDinamico {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  telegram_chat_id: string | null;
  ativo: boolean;
  criado_em: string;
  criado_por: string;
}

interface Configuracao {
  chave: string;
  valor: any;
  descricao: string;
}

interface NotificacaoLog {
  id: string;
  notificacao_id: string;
  usuario_nome: string;
  usuario_email: string;
  grupo_nome: string;
  canal: string;
  status: string;
  data_envio: string;
}

export default function AdminConfiguracoesNotificacoesPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"telegram" | "push" | "grupos" | "logs">("telegram");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Estado das configuraÃ§Ãµes
  const [configs, setConfigs] = useState({
    modo_teste: true,
    telegram_bot_token: '',
    telegram_grupo_teste_id: '',
    telegram_grupo_todos_id: '',
    push_vapid_public_key: '',
    push_vapid_private_key: '',
    notificacao_timeout: 8000
  });
  
  // Estado dos grupos
  const [grupos, setGrupos] = useState<GrupoDinamico[]>([]);
  const [mostrarModalGrupo, setMostrarModalGrupo] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<GrupoDinamico | null>(null);
  const [novoGrupo, setNovoGrupo] = useState({
    nome: '',
    descricao: '',
    icone: 'Users',
    cor: '#6366f1',
    telegram_chat_id: ''
  });
  
  // Estado dos logs
  const [logs, setLogs] = useState<NotificacaoLog[]>([]);
  const [filtroLog, setFiltroLog] = useState({ canal: '', status: '' });
  
  // Cores disponÃ­veis para grupos
  const coresDisponiveis = [
    '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'
  ];
  
  // Ãcones disponÃ­veis para grupos
  const iconesDisponiveis = [
    'Globe', 'Award', 'Dumbbell', 'Bike', 'Store', 'Briefcase', 
    'Users', 'Star', 'Heart', 'Crown', 'Rocket'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAdmin) {
      carregarConfiguracoes();
      carregarGrupos();
      carregarLogs();
    }
  }, [mounted, isAdmin]);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/configuracoes');
      const data = await response.json();
      
      if (data.success && data.data) {
        setConfigs(prev => ({
          ...prev,
          modo_teste: data.data.modo_teste ?? prev.modo_teste,
          telegram_grupo_teste_id: data.data.telegram_grupo_teste_id || '@valenteconecta_teste',
          telegram_grupo_todos_id: data.data.telegram_grupo_todos_id || '@valenteconecta',
          notificacao_timeout: data.data.notificacao_timeout || 8000
        }));
      }
      
      // Carregar configuraÃ§Ãµes especÃ­ficas
      const configsEspecificas = [
        'telegram_bot_token',
        'push_vapid_public_key',
        'push_vapid_private_key'
      ];
      
      for (const chave of configsEspecificas) {
        const res = await fetch(`/api/configuracoes?chave=${chave}`);
        const json = await res.json();
        if (json.success && json.data) {
          setConfigs(prev => ({ ...prev, [chave]: json.data.valor }));
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar configuraÃ§Ãµes:', error);
      toast.error('Erro ao carregar configuraÃ§Ãµes');
    } finally {
      setLoading(false);
    }
  };

  const carregarGrupos = async () => {
    try {
      const response = await fetch('/api/configuracoes?tipo=grupos');
      const data = await response.json();
      if (data.success && data.data) {
        setGrupos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const carregarLogs = async () => {
    try {
      const response = await fetch('/api/configuracoes?tipo=logs');
      const data = await response.json();
      if (data.success && data.data) {
        setLogs(data.data.slice(0, 50));
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const salvarConfiguracao = async (chave: string, valor: any) => {
    setSalvando(true);
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'config', chave, valor })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`ConfiguraÃ§Ã£o salva: ${chave}`);
      } else {
        toast.error(`Erro ao salvar ${chave}`);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuraÃ§Ã£o');
    } finally {
      setSalvando(false);
    }
  };

  const criarGrupo = async () => {
    if (!novoGrupo.nome) {
      toast.error('Nome do grupo Ã© obrigatÃ³rio');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo: 'grupo', 
          ...novoGrupo,
          telegram_chat_id: novoGrupo.telegram_chat_id || null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Grupo "${novoGrupo.nome}" criado!`);
        setMostrarModalGrupo(false);
        setNovoGrupo({ nome: '', descricao: '', icone: 'Users', cor: '#6366f1', telegram_chat_id: '' });
        carregarGrupos();
      } else {
        toast.error(data.error || 'Erro ao criar grupo');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const atualizarGrupo = async () => {
    if (!grupoEditando || !grupoEditando.nome) {
      toast.error('Nome do grupo Ã© obrigatÃ³rio');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo: 'grupo',
          id: grupoEditando.id,
          nome: grupoEditando.nome,
          descricao: grupoEditando.descricao,
          icone: grupoEditando.icone,
          cor: grupoEditando.cor,
          telegram_chat_id: grupoEditando.telegram_chat_id,
          ativo: grupoEditando.ativo
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Grupo "${grupoEditando.nome}" atualizado!`);
        setMostrarModalGrupo(false);
        setGrupoEditando(null);
        carregarGrupos();
      } else {
        toast.error(data.error || 'Erro ao atualizar grupo');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar grupo');
    } finally {
      setLoading(false);
    }
  };

  const deletarGrupo = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente deletar o grupo "${nome}"?`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/configuracoes?tipo=grupo&id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Grupo "${nome}" removido!`);
        carregarGrupos();
      } else {
        toast.error(data.error || 'Erro ao remover grupo');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover grupo');
    } finally {
      setLoading(false);
    }
  };

  const testarConexaoTelegram = async () => {
    toast.loading('Testando conexÃ£o com Telegram...');
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: configs.telegram_grupo_teste_id,
          message: `ðŸ§ª *TESTE DE CONEXÃƒO*\n\nEsta Ã© uma mensagem de teste do sistema de notificaÃ§Ãµes do Valente Conecta.\n\nâœ… ConfiguraÃ§Ã£o funcionando corretamente!\n\nðŸ“¡ Modo de teste: ${configs.modo_teste ? 'ATIVADO' : 'DESATIVADO'}`,
          parseMode: 'Markdown'
        })
      });
      
      if (response.ok) {
        toast.dismiss();
        toast.success('âœ… ConexÃ£o com Telegram funcionando!');
      } else {
        toast.dismiss();
        toast.error('âŒ Falha na conexÃ£o com Telegram');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao testar conexÃ£o');
    }
  };

  const logsFiltrados = logs.filter(log => {
    if (filtroLog.canal && log.canal !== filtroLog.canal) return false;
    if (filtroLog.status && log.status !== filtroLog.status) return false;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Settings className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">âš™ï¸ ConfiguraÃ§Ãµes de NotificaÃ§Ãµes</h1>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Cards de Status */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
            <MessageCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{configs.telegram_bot_token ? 'âœ…' : 'âš ï¸'}</p>
            <p className="text-sm opacity-90">Telegram</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <Smartphone className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{configs.push_vapid_public_key ? 'âœ…' : 'âš ï¸'}</p>
            <p className="text-sm opacity-90">Push Notification</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{grupos.length}</p>
            <p className="text-sm opacity-90">Grupos</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white text-center">
            <div className="w-6 h-6 mx-auto mb-2 text-white text-2xl">{configs.modo_teste ? 'ðŸ§ª' : 'ðŸ”’'}</div>
            <p className="text-2xl font-bold">{configs.modo_teste ? 'ON' : 'OFF'}</p>
            <p className="text-sm opacity-90">Modo Teste</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("telegram")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "telegram"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Telegram
          </button>
          <button
            onClick={() => setActiveTab("push")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "push"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Push Notification
          </button>
          <button
            onClick={() => setActiveTab("grupos")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "grupos"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Grupos
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "logs"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Database className="w-4 h-4" />
            Logs
          </button>
        </div>

        {/* Tab: Telegram */}
        {activeTab === "telegram" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              ConfiguraÃ§Ãµes do Telegram
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Token
                </label>
                <input
                  type="text"
                  value={configs.telegram_bot_token}
                  onChange={(e) => setConfigs({ ...configs, telegram_bot_token: e.target.value })}
                  onBlur={() => salvarConfiguracao('telegram_bot_token', configs.telegram_bot_token)}
                  placeholder="7596732182:AAH_oZ3cQ_v8lRKWCLU2_5MOM2j_7hxvPKA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Token do bot gerado pelo @BotFather</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat ID (Todos os usuÃ¡rios)
                </label>
                <input
                  type="text"
                  value={configs.telegram_grupo_todos_id}
                  onChange={(e) => setConfigs({ ...configs, telegram_grupo_todos_id: e.target.value })}
                  onBlur={() => salvarConfiguracao('telegram_grupo_todos_id', configs.telegram_grupo_todos_id)}
                  placeholder="@valenteconecta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat ID (Grupo de Teste)
                </label>
                <input
                  type="text"
                  value={configs.telegram_grupo_teste_id}
                  onChange={(e) => setConfigs({ ...configs, telegram_grupo_teste_id: e.target.value })}
                  onBlur={() => salvarConfiguracao('telegram_grupo_teste_id', configs.telegram_grupo_teste_id)}
                  placeholder="@valenteconecta_teste"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">Grupo usado para testar notificaÃ§Ãµes antes de enviar para todos</p>
              </div>
              
              <button
                onClick={testarConexaoTelegram}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" />
                Testar ConexÃ£o
              </button>
            </div>
          </div>
        )}

        {/* Tab: Push Notification */}
        {activeTab === "push" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-500" />
              ConfiguraÃ§Ãµes de Push Notification
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAPID Public Key
                </label>
                <textarea
                  value={configs.push_vapid_public_key}
                  onChange={(e) => setConfigs({ ...configs, push_vapid_public_key: e.target.value })}
                  onBlur={() => salvarConfiguracao('push_vapid_public_key', configs.push_vapid_public_key)}
                  rows={2}
                  placeholder="BM5KbQ3xY7vJnR8tLpW2mN4oP6qS0uV8wX2yZ4aB6cD8eF0gH2iJ4kL6mN8oP0qR2sT4uV6wX8yZ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Chave pÃºblica VAPID para Web Push</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAPID Private Key
                </label>
                <textarea
                  value={configs.push_vapid_private_key}
                  onChange={(e) => setConfigs({ ...configs, push_vapid_private_key: e.target.value })}
                  onBlur={() => salvarConfiguracao('push_vapid_private_key', configs.push_vapid_private_key)}
                  rows={2}
                  placeholder="-----BEGIN PRIVATE KEY-----..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">Chave privada VAPID (mantenha em segredo)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout da NotificaÃ§Ã£o (ms)
                </label>
                <input
                  type="number"
                  value={configs.notificacao_timeout}
                  onChange={(e) => setConfigs({ ...configs, notificacao_timeout: parseInt(e.target.value) })}
                  onBlur={() => salvarConfiguracao('notificacao_timeout', configs.notificacao_timeout)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">Tempo que a notificaÃ§Ã£o fica visÃ­vel</p>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Como gerar as chaves VAPID:</p>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                      <li>Execute no terminal: <code className="bg-yellow-100 px-1 rounded">npx web-push generate-vapid-keys</code></li>
                      <li>Copie a Public Key e Private Key geradas</li>
                      <li>Cole nos campos acima</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Grupos */}
        {activeTab === "grupos" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Grupos de UsuÃ¡rios
              </h2>
              <button
                onClick={() => {
                  setGrupoEditando(null);
                  setNovoGrupo({ nome: '', descricao: '', icone: 'Users', cor: '#6366f1', telegram_chat_id: '' });
                  setMostrarModalGrupo(true);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Novo Grupo
              </button>
            </div>
            
            <div className="grid gap-3">
              {grupos.map((grupo) => (
                <div
                  key={grupo.id}
                  className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  style={{ borderLeftColor: grupo.cor, borderLeftWidth: '4px' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white`} style={{ backgroundColor: grupo.cor }}>
                        {grupo.icone === 'Globe' && <Globe className="w-5 h-5" />}
                        {grupo.icone === 'Award' && <Award className="w-5 h-5" />}
                        {grupo.icone === 'Dumbbell' && <Dumbbell className="w-5 h-5" />}
                        {grupo.icone === 'Bike' && <Bike className="w-5 h-5" />}
                        {grupo.icone === 'Store' && <Store className="w-5 h-5" />}
                        {grupo.icone === 'Users' && <Users className="w-5 h-5" />}
                        {!['Globe','Award','Dumbbell','Bike','Store','Users'].includes(grupo.icone) && <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{grupo.nome}</h3>
                        <p className="text-sm text-gray-500">{grupo.descricao}</p>
                        {grupo.telegram_chat_id && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {grupo.telegram_chat_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGrupoEditando(grupo);
                          setNovoGrupo({
                            nome: grupo.nome,
                            descricao: grupo.descricao,
                            icone: grupo.icone,
                            cor: grupo.cor,
                            telegram_chat_id: grupo.telegram_chat_id || ''
                          });
                          setMostrarModalGrupo(true);
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletarGrupo(grupo.id, grupo.nome)}
                        className="p-2 text-gray-500 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Logs */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-500" />
              HistÃ³rico de NotificaÃ§Ãµes
            </h2>
            
            {/* Filtros */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={filtroLog.canal}
                onChange={(e) => setFiltroLog({ ...filtroLog, canal: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              >
                <option value="">Todos os canais</option>
                <option value="telegram">Telegram</option>
                <option value="push">Push</option>
                <option value="popup">Popup</option>
              </select>
              
              <select
                value={filtroLog.status}
                onChange={(e) => setFiltroLog({ ...filtroLog, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              >
                <option value="">Todos os status</option>
                <option value="enviado">âœ… Enviado</option>
                <option value="entregue">ðŸ“± Entregue</option>
                <option value="visualizado">ðŸ‘ï¸ Visualizado</option>
                <option value="falhou">âŒ Falhou</option>
              </select>
              
              <button
                onClick={() => setFiltroLog({ canal: '', status: '' })}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                Limpar filtros
              </button>
            </div>
            
            {/* Tabela de Logs */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600">Data</th>
                    <th className="px-4 py-3 text-left text-gray-600">UsuÃ¡rio</th>
                    <th className="px-4 py-3 text-left text-gray-600">Grupo</th>
                    <th className="px-4 py-3 text-left text-gray-600">Canal</th>
                    <th className="px-4 py-3 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Nenhum log encontrado
                      </td>
                    </tr>
                  ) : (
                    logsFiltrados.map((log, idx) => (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {new Date(log.data_envio).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-800">{log.usuario_nome}</div>
                          <div className="text-xs text-gray-400">{log.usuario_email}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {log.grupo_nome || 'Todos'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {log.canal === 'telegram' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                          {log.canal === 'push' && <Smartphone className="w-4 h-4 text-green-500" />}
                          {log.canal === 'popup' && <Globe className="w-4 h-4 text-purple-500" />}
                        </td>
                        <td className="px-4 py-2">
                          {log.status === 'enviado' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">ðŸ“¤ Enviado</span>}
                          {log.status === 'entregue' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">âœ… Entregue</span>}
                          {log.status === 'visualizado' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">ðŸ‘ï¸ Visualizado</span>}
                          {log.status === 'falhou' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">âŒ Falhou</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Grupo */}
        {mostrarModalGrupo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {grupoEditando ? 'âœï¸ Editar Grupo' : 'âž• Novo Grupo'}
                </h2>
                <button onClick={() => setMostrarModalGrupo(false)} className="text-gray-400">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={novoGrupo.nome}
                    onChange={(e) => {
                      if (grupoEditando) {
                        setGrupoEditando({ ...grupoEditando, nome: e.target.value });
                      } else {
                        setNovoGrupo({ ...novoGrupo, nome: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="Ex: UsuÃ¡rios Premium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DescriÃ§Ã£o</label>
                  <textarea
                    value={novoGrupo.descricao}
                    onChange={(e) => {
                      if (grupoEditando) {
                        setGrupoEditando({ ...grupoEditando, descricao: e.target.value });
                      } else {
                        setNovoGrupo({ ...novoGrupo, descricao: e.target.value });
                      }
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="DescriÃ§Ã£o do grupo"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ãcone</label>
                    <select
                      value={novoGrupo.icone}
                      onChange={(e) => {
                        if (grupoEditando) {
                          setGrupoEditando({ ...grupoEditando, icone: e.target.value });
                        } else {
                          setNovoGrupo({ ...novoGrupo, icone: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    >
                      {iconesDisponiveis.map(icone => (
                        <option key={icone} value={icone}>{icone}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                    <div className="flex gap-2 flex-wrap">
                      {coresDisponiveis.map(cor => (
                        <button
                          key={cor}
                          onClick={() => {
                            if (grupoEditando) {
                              setGrupoEditando({ ...grupoEditando, cor });
                            } else {
                              setNovoGrupo({ ...novoGrupo, cor });
                            }
                          }}
                          className={`w-8 h-8 rounded-full border-2 ${
                            (grupoEditando ? grupoEditando.cor : novoGrupo.cor) === cor ? 'border-gray-800' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chat ID do Telegram (opcional)
                  </label>
                  <input
                    type="text"
                    value={novoGrupo.telegram_chat_id}
                    onChange={(e) => {
                      if (grupoEditando) {
                        setGrupoEditando({ ...grupoEditando, telegram_chat_id: e.target.value });
                      } else {
                        setNovoGrupo({ ...novoGrupo, telegram_chat_id: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="@meugrupo"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se preenchido, as notificaÃ§Ãµes vÃ£o para este grupo especÃ­fico</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMostrarModalGrupo(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={grupoEditando ? atualizarGrupo : criarGrupo}
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                  {grupoEditando ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Ãcones adicionais para grupos
function Award(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z"/></svg>; }
function Dumbbell(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8h.01M6 16h.01M18 8h.01M18 16h.01M8 8l8 8M16 8l-8 8"/></svg>; }
function Bike(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11V8l-4 2"/><path d="M12 8l4 2"/></svg>; }
function Store(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18v9H3zM6 9v9M12 9v9M18 9v9M9 3h6l2 6H7z"/></svg>; }

