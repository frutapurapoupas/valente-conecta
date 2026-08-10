"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  Bell, CheckCircle, XCircle, Clock, Send, 
  Mail, Phone, MapPin, ArrowLeft, User, Briefcase,
  Calendar, MessageSquare, Trash2, Check, Search,
  AlertCircle, Globe, Link, Users, Plus
} from "lucide-react";
import toast from "react-hot-toast";
import { SupplierStorage } from "@/services/supplierStorage";

interface Solicitacao {
  id: string;
  servico: string;
  categoria: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  descricao: string;
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  data: string;
  respondido: boolean;
  fornecedorConvidado?: string;
  dataResposta?: string;
}

interface Fornecedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  servicos: string[];
  status: "pendente" | "ativo" | "inativo";
  dataCadastro: string;
}

// 🆕 INTERFACE PARA BUSCAS PENDENTES
interface BuscaPendente {
  id: string;
  termo: string;
  usuario_id?: string;
  usuario_nome: string;
  usuario_email: string;
  tipo: "produto" | "servico";
  status: "pendente" | "em_andamento" | "concluido" | "cancelado";
  data_busca: string;
  data_resposta?: string;
  fornecedor_convidado?: string;
  produto_sugerido?: {
    nome: string;
    preco: number;
    link: string;
    loja: string;
  };
  notificado_usuario: boolean;
}

export default function AdminDemandasPage() {
  const router = useRouter();
  const { isAdmin, user } = useApp();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  // 🆕 Estado para buscas pendentes
  const [buscasPendentes, setBuscasPendentes] = useState<BuscaPendente[]>([]);
  const [activeTab, setActiveTab] = useState<"solicitacoes" | "fornecedores" | "buscas">("solicitacoes");
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [conviteData, setConviteData] = useState({ email: "", mensagem: "" });
  // 🆕 Estado para modal de busca pendente
  const [showBuscaModal, setShowBuscaModal] = useState(false);
  const [buscaSelecionada, setBuscaSelecionada] = useState<BuscaPendente | null>(null);
  const [produtoSugerido, setProdutoSugerido] = useState({
    nome: "",
    preco: "",
    link: "",
    loja: ""
  });

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    carregarDados();
    carregarBuscasPendentes();
  }, []);

  const carregarDados = () => {
    const solicitacoesSalvas = localStorage.getItem("solicitacoes_servicos");
    if (solicitacoesSalvas) {
      setSolicitacoes(JSON.parse(solicitacoesSalvas));
    }

    const fornecedoresSalvos = localStorage.getItem("fornecedores_servicos");
    if (fornecedoresSalvos) {
      setFornecedores(JSON.parse(fornecedoresSalvos));
    }
  };

  // 🆕 Carregar buscas pendentes do localStorage
  const carregarBuscasPendentes = () => {
    const buscasSalvas = localStorage.getItem("buscas_pendentes");
    if (buscasSalvas) {
      setBuscasPendentes(JSON.parse(buscasSalvas));
    } else {
      // Dados de exemplo para demonstração
      const exemplos: BuscaPendente[] = [
        {
          id: "1",
          termo: "pneu de bicicleta aro 26",
          usuario_nome: "João Silva",
          usuario_email: "joao@email.com",
          tipo: "produto",
          status: "pendente",
          data_busca: new Date().toISOString(),
          notificado_usuario: false
        },
        {
          id: "2",
          termo: "manicure em domicílio",
          usuario_nome: "Maria Santos",
          usuario_email: "maria@email.com",
          tipo: "servico",
          status: "pendente",
          data_busca: new Date().toISOString(),
          notificado_usuario: false
        }
      ];
      setBuscasPendentes(exemplos);
      localStorage.setItem("buscas_pendentes", JSON.stringify(exemplos));
    }
  };

  // 🆕 Salvar buscas pendentes
  const salvarBuscasPendentes = (novas: BuscaPendente[]) => {
    setBuscasPendentes(novas);
    localStorage.setItem("buscas_pendentes", JSON.stringify(novas));
  };

  // 🆕 Atualizar status da busca pendente
  const atualizarStatusBusca = (id: string, status: BuscaPendente["status"]) => {
    const novas = buscasPendentes.map(b => 
      b.id === id ? { ...b, status, data_resposta: new Date().toISOString() } : b
    );
    salvarBuscasPendentes(novas);
    toast.success(`Busca atualizada para ${status === "concluido" ? "concluída" : status}`);
  };

  // 🆕 Convidar fornecedor para a busca pendente
  const convidarFornecedorBusca = () => {
    if (!buscaSelecionada) return;

    const novoFornecedor: Fornecedor = {
      id: Date.now().toString(),
      nome: conviteData.email.split("@")[0],
      email: conviteData.email,
      telefone: "",
      servicos: [buscaSelecionada.termo],
      status: "pendente",
      dataCadastro: new Date().toISOString()
    };

    const novosFornecedores = [...fornecedores, novoFornecedor];
    setFornecedores(novosFornecedores);
    SupplierStorage.saveAll(novosFornecedores);

    // Atualizar busca pendente
    const novasBuscas = buscasPendentes.map(b =>
      b.id === buscaSelecionada.id 
        ? { ...b, status: "em_andamento" as const, fornecedor_convidado: conviteData.email }
        : b
    );
    salvarBuscasPendentes(novasBuscas);

    setShowBuscaModal(false);
    setBuscaSelecionada(null);
    setConviteData({ email: "", mensagem: "" });
    setProdutoSugerido({ nome: "", preco: "", link: "", loja: "" });
    toast.success(`Convite enviado para ${conviteData.email}`);
  };

  // 🆕 Sugerir produto da internet
  const sugerirProduto = () => {
    if (!buscaSelecionada) return;

    if (!produtoSugerido.nome || !produtoSugerido.link) {
      toast.error("Preencha o nome do produto e o link");
      return;
    }

    const novasBuscas = buscasPendentes.map(b =>
      b.id === buscaSelecionada.id 
        ? { 
            ...b, 
            status: "concluido" as const, 
            produto_sugerido: {
              nome: produtoSugerido.nome,
              preco: parseFloat(produtoSugerido.preco) || 0,
              link: produtoSugerido.link,
              loja: produtoSugerido.loja || "Loja online"
            },
            notificado_usuario: true,
            data_resposta: new Date().toISOString()
          }
        : b
    );
    salvarBuscasPendentes(novasBuscas);

    // TODO: Enviar notificação para o usuário via popup/push
    toast.success(`Produto sugerido! Usuário será notificado.`);
    setShowBuscaModal(false);
    setBuscaSelecionada(null);
    setProdutoSugerido({ nome: "", preco: "", link: "", loja: "" });
  };

  // 🆕 Notificar usuário que o produto foi encontrado
  const notificarUsuario = (busca: BuscaPendente) => {
    if (busca.produto_sugerido) {
      // Disparar notificação push/popup para o usuário
      toast.success(`Usuário ${busca.usuario_nome} notificado sobre ${busca.produto_sugerido.nome}`);
      
      const novasBuscas = buscasPendentes.map(b =>
        b.id === busca.id ? { ...b, notificado_usuario: true } : b
      );
      salvarBuscasPendentes(novasBuscas);
    }
  };

  const atualizarStatus = (id: string, status: Solicitacao["status"]) => {
    const novas = solicitacoes.map(s => 
      s.id === id ? { ...s, status, dataResposta: new Date().toISOString() } : s
    );
    setSolicitacoes(novas);
    localStorage.setItem("solicitacoes_servicos", JSON.stringify(novas));
    toast.success(`Status atualizado para ${status}`);
  };

  const convidarFornecedor = () => {
    if (!conviteData.email || !solicitacaoSelecionada) return;

    const novoFornecedor: Fornecedor = {
      id: Date.now().toString(),
      nome: conviteData.email.split("@")[0],
      email: conviteData.email,
      telefone: "",
      servicos: [solicitacaoSelecionada.servico],
      status: "pendente",
      dataCadastro: new Date().toISOString()
    };

    const novosFornecedores = [...fornecedores, novoFornecedor];
    setFornecedores(novosFornecedores);
    SupplierStorage.saveAll(novosFornecedores);

    const novasSolicitacoes = solicitacoes.map(s =>
      s.id === solicitacaoSelecionada.id 
        ? { ...s, status: "em_andamento" as const, fornecedorConvidado: conviteData.email }
        : s
    );
    setSolicitacoes(novasSolicitacoes);
    localStorage.setItem("solicitacoes_servicos", JSON.stringify(novasSolicitacoes));

    setShowConviteModal(false);
    setSolicitacaoSelecionada(null);
    setConviteData({ email: "", mensagem: "" });
    toast.success(`Convite enviado para ${conviteData.email}`);
  };

  const pendentes = solicitacoes.filter(s => s.status === "pendente").length;
  const emAndamento = solicitacoes.filter(s => s.status === "em_andamento").length;
  const concluidas = solicitacoes.filter(s => s.status === "concluido").length;
  
  // 🆕 Estatísticas de buscas pendentes
  const buscasPendentesCount = buscasPendentes.filter(b => b.status === "pendente").length;
  const buscasEmAndamento = buscasPendentes.filter(b => b.status === "em_andamento").length;
  const buscasConcluidas = buscasPendentes.filter(b => b.status === "concluido").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Bell className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">📋 Demandas de Serviços</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Stats - 4 cards agora */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{pendentes}</p>
            <p className="text-sm opacity-90">Pendentes</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{emAndamento}</p>
            <p className="text-sm opacity-90">Em Andamento</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{concluidas}</p>
            <p className="text-sm opacity-90">Concluídas</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{buscasPendentesCount}</p>
            <p className="text-sm opacity-90">Buscas Pendentes</p>
          </div>
        </div>

        {/* Tabs - Nova aba "Buscas" */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("solicitacoes")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === "solicitacoes"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📝 Solicitações ({solicitacoes.length})
          </button>
          <button
            onClick={() => setActiveTab("fornecedores")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === "fornecedores"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🏢 Fornecedores ({fornecedores.length})
          </button>
          <button
            onClick={() => setActiveTab("buscas")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "buscas"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Search className="w-4 h-4" />
            🔍 Demandas de Busca ({buscasPendentes.length})
            {buscasPendentesCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                {buscasPendentesCount}
              </span>
            )}
          </button>
        </div>

        {/* Lista de Solicitações (ORIGINAL - NÃO MODIFICADA) */}
        {activeTab === "solicitacoes" && (
          <div className="space-y-4">
            {solicitacoes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhuma solicitação pendente</p>
                <p className="text-sm text-gray-400">As demandas dos usuários aparecerão aqui</p>
              </div>
            ) : (
              solicitacoes.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-bold text-gray-800">{s.servico}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                          s.status === "em_andamento" ? "bg-blue-100 text-blue-700" :
                          s.status === "concluido" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {s.status === "pendente" ? "⏳ Pendente" :
                           s.status === "em_andamento" ? "🔄 Em andamento" :
                           s.status === "concluido" ? "✅ Concluído" : "❌ Cancelado"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{s.categoria}</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /> {s.cliente.nome}</p>
                        <p className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {s.cliente.email}</p>
                        {s.cliente.telefone && <p className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {s.cliente.telefone}</p>}
                      </div>
                      {s.descricao && (
                        <p className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">{s.descricao}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Solicitado em: {new Date(s.data).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {s.status === "pendente" && (
                        <button
                          onClick={() => {
                            setSolicitacaoSelecionada(s);
                            setShowConviteModal(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Convidar Fornecedor
                        </button>
                      )}
                      {s.status === "em_andamento" && (
                        <button
                          onClick={() => atualizarStatus(s.id, "concluido")}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Marcar Concluído
                        </button>
                      )}
                      <button
                        onClick={() => atualizarStatus(s.id, "cancelado")}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Lista de Fornecedores (ORIGINAL - NÃO MODIFICADA) */}
        {activeTab === "fornecedores" && (
          <div className="space-y-4">
            {fornecedores.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum fornecedor cadastrado</p>
                <p className="text-sm text-gray-400">Convide fornecedores para atender às demandas</p>
              </div>
            ) : (
              fornecedores.map((f) => (
                <div key={f.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{f.nome}</h3>
                      <p className="text-sm text-gray-500">{f.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {f.servicos.map((s, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      f.status === "ativo" ? "bg-green-100 text-green-700" :
                      f.status === "pendente" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {f.status === "ativo" ? "✅ Ativo" : f.status === "pendente" ? "⏳ Pendente" : "❌ Inativo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 🆕 LISTA DE BUSCAS PENDENTES */}
        {activeTab === "buscas" && (
          <div className="space-y-4">
            {buscasPendentes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhuma busca pendente</p>
                <p className="text-sm text-gray-400">Quando um usuário buscar algo não encontrado, aparecerá aqui</p>
              </div>
            ) : (
              buscasPendentes.sort((a,b) => new Date(b.data_busca).getTime() - new Date(a.data_busca).getTime()).map((busca) => (
                <div key={busca.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {busca.tipo === "produto" ? (
                          <Package className="w-5 h-5 text-green-500" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-purple-500" />
                        )}
                        <h3 className="font-bold text-gray-800">{busca.termo}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          busca.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                          busca.status === "em_andamento" ? "bg-blue-100 text-blue-700" :
                          busca.status === "concluido" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {busca.status === "pendente" ? "⏳ Pendente" :
                           busca.status === "em_andamento" ? "🔄 Em andamento" :
                           busca.status === "concluido" ? "✅ Concluído" : "❌ Cancelado"}
                        </span>
                        {busca.produto_sugerido && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            🎯 Sugestão enviada
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" /> {busca.usuario_nome}
                        </p>
                        <p className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" /> {busca.usuario_email}
                        </p>
                      </div>
                      
                      {busca.produto_sugerido && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Produto sugerido:
                          </p>
                          <p className="text-sm font-bold mt-1">{busca.produto_sugerido.nome}</p>
                          <p className="text-sm text-gray-600">
                            {busca.produto_sugerido.loja} - R$ {busca.produto_sugerido.preco.toFixed(2)}
                          </p>
                          <a 
                            href={busca.produto_sugerido.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <Link className="w-3 h-3" /> Ver produto
                          </a>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Buscado em: {new Date(busca.data_busca).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {busca.status === "pendente" && (
                        <button
                          onClick={() => {
                            setBuscaSelecionada(busca);
                            setProdutoSugerido({ nome: "", preco: "", link: "", loja: "" });
                            setShowBuscaModal(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Sugerir Produto
                        </button>
                      )}
                      {busca.status === "em_andamento" && (
                        <button
                          onClick={() => atualizarStatusBusca(busca.id, "concluido")}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Marcar Concluído
                        </button>
                      )}
                      {busca.produto_sugerido && !busca.notificado_usuario && (
                        <button
                          onClick={() => notificarUsuario(busca)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                          <Bell className="w-4 h-4" />
                          Notificar Usuário
                        </button>
                      )}
                      <button
                        onClick={() => atualizarStatusBusca(busca.id, "cancelado")}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal de Convite (ORIGINAL - NÃO MODIFICADO) */}
      {showConviteModal && solicitacaoSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Convidar Fornecedor</h2>
              <button onClick={() => setShowConviteModal(false)} className="text-gray-400">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Serviço solicitado: <strong>{solicitacaoSelecionada.servico}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Cliente: <strong>{solicitacaoSelecionada.cliente.nome}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do fornecedor</label>
                <input
                  type="email"
                  value={conviteData.email}
                  onChange={(e) => setConviteData({ ...conviteData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="fornecedor@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                <textarea
                  value={conviteData.mensagem}
                  onChange={(e) => setConviteData({ ...conviteData, mensagem: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder={`Olá! Recebemos uma solicitação de ${solicitacaoSelecionada.cliente.nome} para o serviço "${solicitacaoSelecionada.servico}". Gostaria de se cadastrar como fornecedor?`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConviteModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={convidarFornecedor}
                disabled={!conviteData.email}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL PARA SUGERIR PRODUTO DA INTERNET */}
      {showBuscaModal && buscaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🔍 Sugerir Produto/Serviço</h2>
              <button onClick={() => setShowBuscaModal(false)} className="text-gray-400">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Usuário buscou por:</p>
              <p className="font-bold text-gray-800">{buscaSelecionada.termo}</p>
              <p className="text-xs text-gray-500 mt-1">
                {buscaSelecionada.usuario_nome} - {buscaSelecionada.usuario_email}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do produto/serviço *
                </label>
                <input
                  type="text"
                  value={produtoSugerido.nome}
                  onChange={(e) => setProdutoSugerido({ ...produtoSugerido, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="Ex: Pneu Aro 26 Kenda"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={produtoSugerido.preco}
                    onChange={(e) => setProdutoSugerido({ ...produtoSugerido, preco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="49,90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loja
                  </label>
                  <input
                    type="text"
                    value={produtoSugerido.loja}
                    onChange={(e) => setProdutoSugerido({ ...produtoSugerido, loja: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    placeholder="Mercado Livre"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do produto *
                </label>
                <input
                  type="url"
                  value={produtoSugerido.link}
                  onChange={(e) => setProdutoSugerido({ ...produtoSugerido, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBuscaModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={sugerirProduto}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Sugerir e Notificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🆕 Ícone Package (não estava no import)
function Package(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7l-8-4-8 4v10l8 4 8-4V7z" />
      <path d="M12 3v10" />
    </svg>
  );
}

