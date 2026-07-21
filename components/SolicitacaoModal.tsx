"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  servico: string;
  categoria: string;
}

export default function SolicitacaoModal({ isOpen, onClose, servico, categoria }: SolicitacaoModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [consumidor, setConsumidor] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    observacao: ""
  });

  const [fornecedor, setFornecedor] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    observacao: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const userSalvo = localStorage.getItem("valente_user");
      if (userSalvo) {
        try {
          const user = JSON.parse(userSalvo);
          setConsumidor(prev => ({
            ...prev,
            nome: user.nome || "",
            telefone: user.whatsapp || user.telefone || ""
          }));
        } catch (e) {
          console.error("Erro ao carregar usuÃ¡rio:", e);
        }
      }
    }
  }, [mounted]);

  if (!isOpen) return null;

  const handleSubmitConsumidor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumidor.nome || !consumidor.telefone) {
      toast.error("Preencha nome e telefone");
      return;
    }
    setStep(2);
  };

  const handleSubmitFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedor.nome || !fornecedor.telefone) {
      toast.error("Preencha nome e telefone do fornecedor");
      return;
    }

    setEnviando(true);

    try {
      const solicitacoes = localStorage.getItem("solicitacoes_servicos");
      const lista = solicitacoes ? JSON.parse(solicitacoes) : [];
      
      const novaSolicitacao = {
        id: Date.now(),
        servico: servico,
        categoria: categoria,
        cliente: consumidor,
        fornecedor: fornecedor,
        status: "pendente",
        data: new Date().toISOString()
      };

      localStorage.setItem("solicitacoes_servicos", JSON.stringify([novaSolicitacao, ...lista]));

      const notificacoes = localStorage.getItem("admin_notificacoes_demandas");
      const notifLista = notificacoes ? JSON.parse(notificacoes) : [];
      notifLista.push({
        id: Date.now(),
        mensagem: `ðŸ“‹ Nova solicitaÃ§Ã£o de ${servico} - ${consumidor.nome}`,
        importancia: "alta",
        data: new Date().toLocaleDateString(),
        lida: false
      });
      localStorage.setItem("admin_notificacoes_demandas", JSON.stringify(notifLista));

      setEnviado(true);
      toast.success("âœ… SolicitaÃ§Ã£o enviada com sucesso!");

      setTimeout(() => {
        onClose();
        setStep(1);
        setEnviado(false);
        setConsumidor({ nome: "", telefone: "", endereco: "", observacao: "" });
        setFornecedor({ nome: "", telefone: "", endereco: "", observacao: "" });
        setEnviando(false);
      }, 2000);

    } catch (error) {
      console.error("Erro ao enviar solicitaÃ§Ã£o:", error);
      toast.error("Erro ao enviar solicitaÃ§Ã£o");
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {step === 1 ? "ðŸ“‹ Solicitar ServiÃ§o" : "ðŸ‘¤ Indicar Fornecedor"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {enviado ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">âœ…</div>
            <h3 className="text-xl font-bold text-green-600">SolicitaÃ§Ã£o Enviada!</h3>
            <p className="text-gray-500 mt-2">Aguarde o contato de um fornecedor</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex gap-2 mb-6">
              <div className={`flex-1 text-center py-2 rounded-lg ${step === 1 ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                Passo 1
              </div>
              <div className={`flex-1 text-center py-2 rounded-lg ${step === 2 ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                Passo 2
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSubmitConsumidor} className="space-y-4">
                <p className="text-sm text-gray-500">
                  VocÃª estÃ¡ solicitando: <strong>{servico}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    value={consumidor.nome}
                    onChange={(e) => setConsumidor({ ...consumidor, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={consumidor.telefone}
                    onChange={(e) => setConsumidor({ ...consumidor, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Continuar â†’
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitFornecedor} className="space-y-4">
                <p className="text-sm text-gray-500">
                  Indique um fornecedor para <strong>{servico}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Fornecedor *</label>
                  <input
                    type="text"
                    value={fornecedor.nome}
                    onChange={(e) => setFornecedor({ ...fornecedor, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={fornecedor.telefone}
                    onChange={(e) => setFornecedor({ ...fornecedor, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {enviando ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Enviar SolicitaÃ§Ã£o"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

