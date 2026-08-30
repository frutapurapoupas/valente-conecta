"use client";

// Caminho: C:\valente_conecta\app\admin-master\cozinha-chef\pedidos\page.tsx
//
// Reescrita total -- a versao anterior lia de useDashboard (tabela
// `pedidos` generica que nunca existiu no banco, so' mostrava vazio). Agora
// consome /api/cozinha/pedidos de verdade (usePedidos.ts).

import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Ban, CheckCircle2, Package, X } from "lucide-react";
import { usePedidos } from "../hooks/usePedidos";

const ORDEM_ENTREGA = ["aguardando_confirmacao", "confirmado", "em_producao", "saiu_para_entrega", "entregue"];
const ORDEM_RETIRADA = ["aguardando_confirmacao", "confirmado", "em_producao", "pronto_para_retirada", "entregue"];

const LABEL_STATUS: Record<string, string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmado: "Confirmado",
  em_producao: "Em produção",
  pronto_para_retirada: "Pronto pra retirada",
  saiu_para_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const ABAS = ["todos", "aguardando_confirmacao", "confirmado", "em_producao", "saiu_para_entrega", "entregue", "cancelado"];

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function proximoStatus(pedido: { status: string; tipo_entrega: string }) {
  const ordem = pedido.tipo_entrega === "entrega" ? ORDEM_ENTREGA : ORDEM_RETIRADA;
  const indice = ordem.indexOf(pedido.status);
  if (indice === -1 || indice === ordem.length - 1) return null;
  return ordem[indice + 1];
}

export default function PedidosCozinhaPage() {
  const [aba, setAba] = useState("aguardando_confirmacao");
  const { pedidos, loading, avancarStatus, cancelar } = usePedidos(aba);
  const [processando, setProcessando] = useState<string | null>(null);
  const [modalEntrega, setModalEntrega] = useState<{ id: string; novoStatus: string } | null>(null);
  const [recebidoPor, setRecebidoPor] = useState("");

  const processar = async (id: string, novoStatus: string) => {
    if (novoStatus === "entregue") {
      setModalEntrega({ id, novoStatus });
      return;
    }
    setProcessando(id);
    try {
      await avancarStatus(id, novoStatus);
      toast.success(`Pedido atualizado: ${LABEL_STATUS[novoStatus]}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setProcessando(null);
    }
  };

  const confirmarEntrega = async () => {
    if (!modalEntrega) return;
    if (!recebidoPor.trim()) {
      toast.error("Informe quem recebeu o pedido");
      return;
    }
    setProcessando(modalEntrega.id);
    try {
      await avancarStatus(modalEntrega.id, "entregue", recebidoPor.trim());
      toast.success("Pedido marcado como entregue!");
      setModalEntrega(null);
      setRecebidoPor("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar entrega");
    } finally {
      setProcessando(null);
    }
  };

  const processarCancelar = async (id: string) => {
    setProcessando(id);
    try {
      await cancelar(id);
      toast.success("Pedido cancelado");
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar");
    } finally {
      setProcessando(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-orange-600" /> Pedidos</h1>

      <div className="flex flex-wrap gap-2 mb-5 border-b border-gray-200">
        {ABAS.map((s) => (
          <button
            key={s}
            onClick={() => setAba(s)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${aba === s ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
          >
            {s === "todos" ? "Todos" : LABEL_STATUS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500 text-sm">Nenhum pedido por aqui.</div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const proximo = proximoStatus(pedido);
            return (
              <div key={pedido.id} className="bg-white border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{pedido.cliente_nome} <span className="text-gray-400 font-normal">· {pedido.cliente_whatsapp}</span></p>
                    <p className="text-xs text-gray-400">
                      #{pedido.id.slice(0, 8)} · {new Date(pedido.created_at).toLocaleString("pt-BR")} · {pedido.tipo_entrega === "entrega" ? "Entrega" : "Retirada"}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700 whitespace-nowrap">{LABEL_STATUS[pedido.status]}</span>
                </div>

                <div className="text-sm text-gray-600 space-y-0.5 mb-3">
                  {(pedido.itens || []).map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.quantidade}x {item.titulo}</span>
                      <span>{formatarMoeda(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{formatarMoeda(Number(pedido.total))}</span>
                  <div className="flex gap-2">
                    {pedido.status !== "entregue" && pedido.status !== "cancelado" && (
                      <button
                        onClick={() => processarCancelar(pedido.id)}
                        disabled={processando === pedido.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium disabled:opacity-60"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    )}
                    {proximo && (
                      <button
                        onClick={() => processar(pedido.id, proximo)}
                        disabled={processando === pedido.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-60"
                      >
                        {proximo === "entregue" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        {proximo === "saiu_para_entrega" ? "Despachar entrega" : `Avançar: ${LABEL_STATUS[proximo]}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalEntrega && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800">Confirmar entrega</h2>
              <button onClick={() => setModalEntrega(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Quem recebeu o pedido no local?</p>
            <input
              value={recebidoPor}
              onChange={(e) => setRecebidoPor(e.target.value)}
              placeholder="Nome de quem recebeu"
              className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
              autoFocus
            />
            <button
              onClick={confirmarEntrega}
              disabled={processando === modalEntrega.id}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
