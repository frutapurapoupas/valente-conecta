"use client";
import { useState, useEffect } from "react";
import { X, Send, CheckCircle, Clock, Store, User, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { SupplierStorage } from "@/services/supplierStorage";

interface SolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  servico: string;
  categoria: string;
  userNome?: string;
  userEmail?: string;
  userTelefone?: string;
}

export default function SolicitacaoModal({
  isOpen,
  onClose,
  servico,
  categoria,
  userNome,
  userEmail,
  userTelefone
}: SolicitacaoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Dados do consumidor
  const [consumidor, setConsumidor] = useState({
    nome: "",
    telefone: "",
    descricao: ""
  });
  
  const [fornecedor, setFornecedor] = useState({
    nomeEmpresa: "",
    telefone: "",
    email: "",
    servicos: ""
  });

  // Carregar dados do localStorage APENAS no cliente
  useEffect(() => {
    setMounted(true);
    
    // Tentar buscar nome de várias fontes
    let nomeSalvo = userNome || "";
    let telefoneSalvo = userTelefone || "";
    
    if (!nomeSalvo) {
      const userSalvo = localStorage.getItem("valente_user");
      if (userSalvo) {
        const user = JSON.parse(userSalvo);
        nomeSalvo = user.name || "";
        telefoneSalvo = user.telefone || "";
      }
    }
    
    if (!nomeSalvo) {
      const perfilIA = localStorage.getItem("academia_perfil_ia");
      if (perfilIA) {
        const perfil = JSON.parse(perfilIA);
        nomeSalvo = perfil.nome || "";
        telefoneSalvo = perfil.telefone || "";
      }
    }
    
    if (!nomeSalvo) {
      const perfilInicial = localStorage.getItem("academia_perfil_inicial");
      if (perfilInicial) {
        const perfil = JSON.parse(perfilInicial);
        nomeSalvo = perfil.nome || "";
      }
    }
    
    setConsumidor(prev => ({
      ...prev,
      nome: nomeSalvo,
      telefone: telefoneSalvo
    }));
  }, [userNome, userTelefone]);

  // Salvar dados quando o modal fechar e houve alteração
  const salvarDadosUsuario = (nome: string, telefone: string) => {
    if (nome && typeof window !== 'undefined') {
      const userSalvo = localStorage.getItem("valente_user");
      if (userSalvo) {
        const user = JSON.parse(userSalvo);
        user.name = nome;
        user.telefone = telefone;
        localStorage.setItem("valente_user", JSON.stringify(user));
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const handleEnviarSolicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    // Salvar dados para futuras sessões
    salvarDadosUsuario(consumidor.nome, consumidor.telefone);

    const solicitacao = {
      id: Date.now().toString(),
      servico,
      categoria,
      consumidor: {
        nome: consumidor.nome,
        telefone: consumidor.telefone,
        descricao: consumidor.descricao
      },
      status: "pendente",
      data: new Date().toISOString()
    };

    const solicitacoes = localStorage.getItem("solicitacoes_servicos");
    const lista = solicitacoes ? JSON.parse(solicitacoes) : [];
    lista.push(solicitacao);
    localStorage.setItem("solicitacoes_servicos", JSON.stringify(lista));

    // Notificar admin
    const notificacoes = localStorage.getItem("admin_notificacoes_demandas");
    const notifLista = notificacoes ? JSON.parse(notificacoes) : [];
    notifLista.unshift({
      id: solicitacao.id,
      titulo: "📢 Nova Solicitação",
      mensagem: `${consumidor.nome} solicitou ${servico}`,
      data: new Date().toLocaleString(),
      lida: false,
      solicitacao
    });
    localStorage.setItem("admin_notificacoes_demandas", JSON.stringify(notifLista));

    setEnviando(false);
    setEnviado(true);
    toast.success("✅ Solicitação enviada! Responderemos em até 24h.");

    setTimeout(() => {
      onClose();
      setStep(1);
      setEnviado(false);
    }, 3000);
  };

  const handleCadastrarFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const novoFornecedor = {
      id: Date.now().toString(),
      ...fornecedor,
      servicos: fornecedor.servicos.split(",").map(s => s.trim()),
      categoria,
      status: "pendente",
      dataCadastro: new Date().toISOString()
    };

    SupplierStorage.add({
      ...novoFornecedor,
      servicos: novoFornecedor.servicos,
    });

    setEnviando(false);
    toast.success("✅ Cadastro enviado! Entraremos em contato.");
    
    setTimeout(() => {
      onClose();
      setStep(1);
      setFornecedor({ nomeEmpresa: "", telefone: "", email: "", servicos: "" });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white rounded-t-2xl sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">{servico}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!enviado ? (
          <>
            {/* Abas */}
            <div className="flex border-b border-gray-200">
              <button onClick={() => setStep(1)} className={`flex-1 py-3 text-center font-medium transition-all ${step === 1 ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50" : "text-gray-500"}`}>
                <User className="w-4 h-4 inline mr-1" />
                Sou Cliente
              </button>
              <button onClick={() => setStep(2)} className={`flex-1 py-3 text-center font-medium transition-all ${step === 2 ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50" : "text-gray-500"}`}>
                <Store className="w-4 h-4 inline mr-1" />
                Sou Fornecedor
              </button>
            </div>

            {/* Formulário do Consumidor */}
            {step === 1 && (
              <form onSubmit={handleEnviarSolicitacao} className="p-5 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm text-blue-700">
                    🔍 Você está procurando por <strong>{servico}</strong>?
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Seus dados serão enviados automaticamente.
                  </p>
                </div>

                {/* NOME - APENAS LEITURA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
                  <input
                    type="text"
                    value={consumidor.nome}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* WHATSAPP - APENAS LEITURA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={consumidor.telefone}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* DESCRIÇÃO - ÚNICO CAMPO EDITÁVEL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">O que você procura? *</label>
                  <textarea
                    value={consumidor.descricao}
                    onChange={(e) => setConsumidor({ ...consumidor, descricao: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: Procuro um restaurante que faça marmita fit..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                >
                  {enviando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Solicitação
                    </>
                  )}
                </button>

                <p className="text-base text-center text-gray-500 font-medium">
                  ⏰ Responderemos em até 24h pelo sistema ou WhatsApp
                </p>
              </form>
            )}

            {/* Formulário do Fornecedor */}
            {step === 2 && (
              <form onSubmit={handleCadastrarFornecedor} className="p-5 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-sm text-green-700">
                    🏢 Você é fornecedor de <strong>{servico}</strong>?
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Cadastre-se gratuitamente e comece a vender agora mesmo!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da empresa *</label>
                  <input
                    type="text"
                    value={fornecedor.nomeEmpresa}
                    onChange={(e) => setFornecedor({ ...fornecedor, nomeEmpresa: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Restaurante Sabor Caseiro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    value={fornecedor.telefone}
                    onChange={(e) => setFornecedor({ ...fornecedor, telefone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="(75) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={fornecedor.email}
                    onChange={(e) => setFornecedor({ ...fornecedor, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviços/produtos *</label>
                  <textarea
                    value={fornecedor.servicos}
                    onChange={(e) => setFornecedor({ ...fornecedor, servicos: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Marmitas fitness, comida caseira, congelados..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  {enviando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      Cadastrar como Fornecedor
                    </>
                  )}
                </button>

                <p className="text-base text-center text-gray-500 font-medium">
                  ✅ Após cadastro, você poderá criar seu catálogo completo
                </p>
              </form>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h3>
            <p className="text-gray-600 mb-4">
              Agradecemos seu interesse em <strong>{servico}</strong>.
            </p>
            <div className="bg-blue-50 rounded-xl p-3 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Próximos passos:</span>
              </div>
              <ol className="text-xs text-blue-600 space-y-1 ml-5 list-decimal">
                <li>Recebemos sua solicitação</li>
                <li>Buscamos fornecedores na região</li>
                <li>Você será avisado quando estiver disponível</li>
              </ol>
            </div>
            <p className="text-base text-center text-gray-500 font-medium mt-4">
              ⏰ Responderemos em até 24h pelo sistema ou WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}