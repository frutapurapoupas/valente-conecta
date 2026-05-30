"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Wallet, 
  CreditCard, QrCode, Copy, Check, Eye, EyeOff,
  Calendar, Download, Filter, Search, RefreshCw,
  Bell, X, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import toast from "react-hot-toast";

interface Transacao {
  id: string;
  tipo: "recarga" | "pagamento" | "saque" | "cashback" | "indicacao";
  valor: number;
  status: "pendente" | "concluido" | "falhou" | "cancelado";
  descricao: string;
  data: string;
  metodo: "pix" | "credito" | "debito" | "wallet";
  pix_qr_code?: string;
  pix_copia_cola?: string;
}

interface Saldo {
  total: number;
  bloqueado: number;
  disponivel: number;
  ultima_atualizacao: string;
}

export default function AdminFinanceiroPage() {
  const router = useRouter();
  const { isAdmin, user } = useApp();
  
  const [saldo, setSaldo] = useState<Saldo>({
    total: 152.50,
    bloqueado: 0,
    disponivel: 152.50,
    ultima_atualizacao: new Date().toISOString()
  });
  
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"extrato" | "recarga" | "saque">("extrato");
  const [showRecargaModal, setShowRecargaModal] = useState(false);
  const [recargaValor, setRecargaValor] = useState(10);
  const [qrCodeGerado, setQrCodeGerado] = useState<{ qrCode: string; copiaCola: string } | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [showPopupPagamento, setShowPopupPagamento] = useState<{ show: boolean; transacao?: Transacao }>({ show: false });

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    setLoading(true);
    try {
      // Carregar saldo do localStorage
      const saldoSalvo = localStorage.getItem("wallet_saldo");
      if (saldoSalvo) {
        setSaldo(JSON.parse(saldoSalvo));
      }
      
      // Carregar transações do localStorage
      const transacoesSalvas = localStorage.getItem("wallet_transacoes");
      if (transacoesSalvas) {
        setTransacoes(JSON.parse(transacoesSalvas));
      } else {
        // Dados de exemplo
        const exemplos: Transacao[] = [
          {
            id: "1",
            tipo: "recarga",
            valor: 50,
            status: "concluido",
            descricao: "Recarga via PIX",
            data: new Date().toISOString(),
            metodo: "pix"
          },
          {
            id: "2",
            tipo: "pagamento",
            valor: 25.90,
            status: "concluido",
            descricao: "Marmita da Cozinha",
            data: new Date(Date.now() - 86400000).toISOString(),
            metodo: "wallet"
          },
          {
            id: "3",
            tipo: "indicacao",
            valor: 5,
            status: "concluido",
            descricao: "Bônus por indicação - João Silva",
            data: new Date(Date.now() - 172800000).toISOString(),
            metodo: "wallet"
          },
          {
            id: "4",
            tipo: "cashback",
            valor: 2.50,
            status: "concluido",
            descricao: "Cashback - Compra na Farmácia",
            data: new Date(Date.now() - 259200000).toISOString(),
            metodo: "wallet"
          }
        ];
        setTransacoes(exemplos);
        localStorage.setItem("wallet_transacoes", JSON.stringify(exemplos));
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarQRCodePIX = async () => {
    if (recargaValor < 1) {
      toast.error("Valor mínimo de recarga é R$ 1,00");
      return;
    }
    
    setLoading(true);
    try {
      // Simular geração de QR Code PIX
      // Em produção, isso chamaria uma API real (Mercado Pago, Asaas, etc)
      const qrCodeSimulado = `00020126360014BR.GOV.BCB.PIX0114${user?.email || "cliente@email.com"}5204000053039865405${recargaValor.toFixed(2)}5802BR5909ValenteConecta6008ValenteBA62240520RECARGA${Date.now()}6304XXXX`;
      
      setQrCodeGerado({
        qrCode: qrCodeSimulado,
        copiaCola: qrCodeSimulado
      });
      
      toast.success("QR Code gerado! Faça o PIX para recarregar.");
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      toast.error("Erro ao gerar QR Code");
    } finally {
      setLoading(false);
    }
  };

  const simularPagamentoPIX = (transacaoId: string) => {
    // Simular confirmação de pagamento
    const transacao = transacoes.find(t => t.id === transacaoId);
    if (transacao && transacao.status === "pendente") {
      const novas = transacoes.map(t =>
        t.id === transacaoId ? { ...t, status: "concluido" as const } : t
      );
      setTransacoes(novas);
      localStorage.setItem("wallet_transacoes", JSON.stringify(novas));
      
      // Atualizar saldo
      const novoSaldo = { ...saldo, total: saldo.total + transacao.valor, disponivel: saldo.disponivel + transacao.valor };
      setSaldo(novoSaldo);
      localStorage.setItem("wallet_saldo", JSON.stringify(novoSaldo));
      
      // Mostrar popup de confirmação
      setShowPopupPagamento({ show: true, transacao });
      setTimeout(() => setShowPopupPagamento({ show: false }), 5000);
      
      toast.success(`Pagamento de R$ ${transacao.valor.toFixed(2)} confirmado!`);
    }
  };

  const copiarCopiaCola = () => {
    if (qrCodeGerado?.copiaCola) {
      navigator.clipboard.writeText(qrCodeGerado.copiaCola);
      toast.success("Código PIX copiado!");
    }
  };

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case "recarga": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "pagamento": return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "saque": return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case "cashback": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "indicacao": return <Users className="w-4 h-4 text-blue-500" />;
      default: return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      recarga: "Recarga",
      pagamento: "Pagamento",
      saque: "Saque",
      cashback: "Cashback",
      indicacao: "Indicação"
    };
    return tipos[tipo] || tipo;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-100 text-green-700";
      case "pendente": return "bg-yellow-100 text-yellow-700";
      case "falhou": return "bg-red-100 text-red-700";
      case "cancelado": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      concluido: "✅ Concluído",
      pendente: "⏳ Pendente",
      falhou: "❌ Falhou",
      cancelado: "🚫 Cancelado"
    };
    return statuses[status] || status;
  };

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
    if (filtroStatus !== "todos" && t.status !== filtroStatus) return false;
    return true;
  });

  const totalRecargas = transacoes.filter(t => t.tipo === "recarga" && t.status === "concluido").reduce((sum, t) => sum + t.valor, 0);
  const totalPagamentos = transacoes.filter(t => t.tipo === "pagamento" && t.status === "concluido").reduce((sum, t) => sum + t.valor, 0);
  const totalCashback = transacoes.filter(t => t.tipo === "cashback" && t.status === "concluido").reduce((sum, t) => sum + t.valor, 0);

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
      <header className="bg-gradient-to-r from-green-500 to-emerald-700 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Wallet className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">💰 Financeiro</h1>
        <button onClick={carregarDados} className="ml-auto text-white/80 hover:text-white">
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Cards de Saldo */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-90">Saldo Total</p>
            <p className="text-2xl font-bold">R$ {saldo.total.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-90">Disponível</p>
            <p className="text-2xl font-bold">R$ {saldo.disponivel.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
            <p className="text-sm opacity-90">Bloqueado</p>
            <p className="text-2xl font-bold">R$ {saldo.bloqueado.toFixed(2)}</p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-400">Total Recargas</p>
            <p className="text-lg font-bold text-green-400">R$ {totalRecargas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-400">Total Pagamentos</p>
            <p className="text-lg font-bold text-red-400">R$ {totalPagamentos.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-400">Cashback</p>
            <p className="text-lg font-bold text-emerald-400">R$ {totalCashback.toFixed(2)}</p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowRecargaModal(true)}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Recarregar Saldo
          </button>
          <button
            onClick={() => setActiveTab("extrato")}
            className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Ver Extrato
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("extrato")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "extrato"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            📋 Extrato
          </button>
          <button
            onClick={() => setActiveTab("recarga")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "recarga"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            💳 Recarga PIX
          </button>
          <button
            onClick={() => setActiveTab("saque")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "saque"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            🏦 Saque
          </button>
        </div>

        {/* Extrato */}
        {activeTab === "extrato" && (
          <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="text-white font-bold text-lg">Histórico de Transações</h3>
              <div className="flex gap-2">
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm border border-gray-600"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="recarga">Recargas</option>
                  <option value="pagamento">Pagamentos</option>
                  <option value="cashback">Cashback</option>
                  <option value="indicacao">Indicações</option>
                </select>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm border border-gray-600"
                >
                  <option value="todos">Todos os status</option>
                  <option value="concluido">Concluídos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="falhou">Falhas</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-auto">
              {transacoesFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              ) : (
                transacoesFiltradas.map((transacao) => (
                  <div key={transacao.id} className="bg-gray-700 rounded-xl p-3 hover:bg-gray-650 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {getTipoIcone(transacao.tipo)}
                        <div>
                          <p className="text-white font-medium">{getTipoLabel(transacao.tipo)}</p>
                          <p className="text-gray-400 text-xs">{transacao.descricao}</p>
                          <p className="text-gray-500 text-[10px] mt-1">
                            {new Date(transacao.data).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transacao.tipo === "recarga" || transacao.tipo === "cashback" || transacao.tipo === "indicacao"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}>
                          {transacao.tipo === "recarga" || transacao.tipo === "cashback" || transacao.tipo === "indicacao"
                            ? `+ R$ ${transacao.valor.toFixed(2)}`
                            : `- R$ ${transacao.valor.toFixed(2)}`}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transacao.status)}`}>
                          {getStatusLabel(transacao.status)}
                        </span>
                      </div>
                    </div>
                    {transacao.status === "pendente" && transacao.metodo === "pix" && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <button
                          onClick={() => simularPagamentoPIX(transacao.id)}
                          className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Simular confirmação de pagamento
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recarga PIX */}
        {activeTab === "recarga" && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-400" />
              Recarregar com PIX
            </h3>
            
            {!qrCodeGerado ? (
              <div className="space-y-4">
                <div className="flex gap-3 items-center justify-between flex-wrap">
                  <p className="text-gray-300">Valor da recarga:</p>
                  <div className="flex gap-2">
                    {[10, 20, 50, 100].map((valor) => (
                      <button
                        key={valor}
                        onClick={() => setRecargaValor(valor)}
                        className={`px-4 py-2 rounded-xl transition ${
                          recargaValor === valor
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        R$ {valor}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={recargaValor}
                      onChange={(e) => setRecargaValor(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-gray-700 text-white px-3 py-2 rounded-xl text-center"
                      placeholder="Outro"
                    />
                  </div>
                </div>
                <button
                  onClick={gerarQRCodePIX}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <QrCode className="w-5 h-5" />
                  )}
                  Gerar QR Code PIX
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                  {/* Simulação de QR Code - Em produção seria uma imagem real */}
                  <div className="w-48 h-48 bg-black flex items-center justify-center rounded-xl">
                    <QrCode className="w-32 h-32 text-white" />
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Escaneie o QR Code com seu banco ou use o código copia e cola
                </p>
                <div className="bg-gray-700 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-2">Código copia e cola:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrCodeGerado.copiaCola}
                      readOnly
                      className="flex-1 bg-gray-600 text-white text-xs px-3 py-2 rounded-lg font-mono"
                    />
                    <button
                      onClick={copiarCopiaCola}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setQrCodeGerado(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Voltar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Saque */}
        {activeTab === "saque" && (
          <div className="bg-gray-800 rounded-2xl p-6 text-center">
            <p className="text-gray-400">Módulo em desenvolvimento</p>
            <p className="text-sm text-gray-500 mt-2">Em breve você poderá solicitar saques</p>
          </div>
        )}
      </main>

      {/* Modal de Recarga */}
      {showRecargaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-green-400" />
                Recarregar Saldo
              </h2>
              <button onClick={() => setShowRecargaModal(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">Escolha o valor da recarga:</p>
              <div className="grid grid-cols-4 gap-3">
                {[10, 20, 50, 100].map((valor) => (
                  <button
                    key={valor}
                    onClick={() => {
                      setRecargaValor(valor);
                      setShowRecargaModal(false);
                      setTimeout(() => gerarQRCodePIX(), 100);
                    }}
                    className="bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition"
                  >
                    R$ {valor}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={recargaValor}
                  onChange={(e) => setRecargaValor(parseFloat(e.target.value) || 0)}
                  placeholder="Outro valor"
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl"
                />
                <button
                  onClick={() => {
                    if (recargaValor >= 1) {
                      setShowRecargaModal(false);
                      setTimeout(() => gerarQRCodePIX(), 100);
                    } else {
                      toast.error("Valor mínimo é R$ 1,00");
                    }
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Recarregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Confirmação de Pagamento */}
      {showPopupPagamento.show && showPopupPagamento.transacao && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-8 h-8" />
              <div className="flex-1">
                <p className="font-bold text-lg">Pagamento confirmado!</p>
                <p className="text-sm opacity-90">R$ {showPopupPagamento.transacao.valor.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-1">{showPopupPagamento.transacao.descricao}</p>
              </div>
              <button onClick={() => setShowPopupPagamento({ show: false })} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ícone Users (não estava no import)
function Users(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}