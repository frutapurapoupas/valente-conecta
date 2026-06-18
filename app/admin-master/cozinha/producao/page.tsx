"use client";

import {
  Bell,
  CheckCircle,
  Clock,
  Eye,
  Factory,
  MapPin,
  Monitor,
  Package2,
  Phone,
  RefreshCw,
  Smartphone,
  Truck,
  User,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

interface PedidoProducao {
  id: string;
  cliente: string;
  telefone: string;
  endereco?: string;
  itens: { nome: string; quantidade: number; observacao?: string }[];
  total: number;
  tipo: "entrega" | "retirada" | "local";
  status: "pendente" | "preparando" | "pronto" | "saiu_entrega" | "entregue" | "cancelado";
  data: string;
  tempoPreparo?: number;
  observacao?: string;
}

export default function ProducaoCozinhaPage() {
  const [pedidos, setPedidos] = useState<PedidoProducao[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<"admin" | "cozinha">("admin");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [selectedPedido, setSelectedPedido] = useState<PedidoProducao | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState(30);

  useEffect(() => {
    carregarPedidos();
    const interval = setInterval(carregarPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  const carregarPedidos = () => {
    const vendas = JSON.parse(localStorage.getItem("cozinha_admin_vendas") || "[]");
    const pedidosConvertidos: PedidoProducao[] = vendas.map((v: any) => ({
      id: v.id,
      cliente: v.cliente,
      telefone: v.telefone || "(75) 99999-9999",
      itens: [{ nome: v.itens, quantidade: 1 }],
      total: v.valor,
      tipo: v.tipo || "entrega",
      status: v.status === "pago" ? "pendente" : v.status === "cancelado" ? "cancelado" : "pendente",
      data: v.data
    }));
    setPedidos(pedidosConvertidos);
  };

  const atualizarStatus = (id: string, novoStatus: PedidoProducao["status"]) => {
    const updated = pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p);
    setPedidos(updated);

    const vendas = JSON.parse(localStorage.getItem("cozinha_admin_vendas") || "[]");
    const vendasAtualizadas = vendas.map((v: any) => {
      if (v.id === id) {
        let novoStatusVenda = v.status;
        if (novoStatus === "entregue") novoStatusVenda = "pago";
        if (novoStatus === "cancelado") novoStatusVenda = "cancelado";
        return { ...v, status: novoStatusVenda };
      }
      return v;
    });
    localStorage.setItem("cozinha_admin_vendas", JSON.stringify(vendasAtualizadas));

    alert(`✅ Pedido #${id} atualizado para ${getStatusTexto(novoStatus)}`);
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case "pendente": return "📋 Pendente";
      case "preparando": return "🍳 Preparando";
      case "pronto": return "✅ Pronto";
      case "saiu_entrega": return "🚚 Saiu para entrega";
      case "entregue": return "📦 Entregue";
      case "cancelado": return "❌ Cancelado";
      default: return status;
    }
  };

  const getStatusCor = (status: string) => {
    switch (status) {
      case "pendente": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "preparando": return "bg-blue-100 text-blue-700 border-blue-200";
      case "pronto": return "bg-green-100 text-green-700 border-green-200";
      case "saiu_entrega": return "bg-purple-100 text-purple-700 border-purple-200";
      case "entregue": return "bg-gray-100 text-gray-700 border-gray-200";
      case "cancelado": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const pedidosFiltrados = pedidos.filter(p => filtroStatus === "todos" || p.status === filtroStatus);

  const stats = {
    pendentes: pedidos.filter(p => p.status === "pendente").length,
    preparando: pedidos.filter(p => p.status === "preparando").length,
    pronto: pedidos.filter(p => p.status === "pronto").length,
    entregues: pedidos.filter(p => p.status === "entregue").length
  };

  return (
    <div className="space-y-6">
      {/* Modal de Detalhes */}
      {showModal && selectedPedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalhes do Pedido #{selectedPedido.id}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><User size={18} /><span className="font-medium">Cliente:</span><span>{selectedPedido.cliente}</span></div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><Phone size={18} /><span className="font-medium">Telefone:</span><span>{selectedPedido.telefone}</span></div>
              {selectedPedido.endereco && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><MapPin size={18} /><span className="font-medium">Endereço:</span><span>{selectedPedido.endereco}</span></div>
              )}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><Package2 size={18} /><span className="font-medium">Itens:</span>
                <div>{selectedPedido.itens.map((i, idx) => (<p key={idx} className="text-sm">{i.quantidade}x {i.nome}</p>))}</div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"><Clock size={18} /><span className="font-medium">Total:</span><span className="font-bold text-green-600">R$ {selectedPedido.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Factory size={24} /> Produção - Cozinha Chef Neide
          </h1>
          <p className="text-sm text-gray-500">Acompanhe o fluxo dos pedidos em tempo real</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setModoVisualizacao("cozinha")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${modoVisualizacao === "cozinha" ? "bg-indigo-600 text-white" : "text-gray-600"}`}
            >
              <Monitor size={16} /> Modo Cozinha
            </button>
            <button
              onClick={() => setModoVisualizacao("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${modoVisualizacao === "admin" ? "bg-indigo-600 text-white" : "text-gray-600"}`}
            >
              <Smartphone size={16} /> Admin
            </button>
          </div>
          <button onClick={carregarPedidos} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
          <div className="text-xs text-gray-500">📋 Pendentes</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.preparando}</div>
          <div className="text-xs text-gray-500">🍳 Preparando</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.pronto}</div>
          <div className="text-xs text-gray-500">✅ Prontos</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border-l-4 border-gray-500">
          <div className="text-2xl font-bold text-gray-600">{stats.entregues}</div>
          <div className="text-xs text-gray-500">📦 Entregues</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="p-2 border rounded-lg text-sm bg-white"
        >
          <option value="todos">Todos os pedidos</option>
          <option value="pendente">📋 Pendentes</option>
          <option value="preparando">🍳 Preparando</option>
          <option value="pronto">✅ Prontos</option>
          <option value="saiu_entrega">🚚 Saiu entrega</option>
          <option value="entregue">📦 Entregues</option>
          <option value="cancelado">❌ Cancelados</option>
        </select>
        {modoVisualizacao === "cozinha" && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Bell size={16} /> Modo Cozinha ativo - Pareado com tablet
          </div>
        )}
      </div>

      {/* Modo Cozinha - Cards */}
      {modoVisualizacao === "cozinha" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pedidosFiltrados.map(p => (
            <div key={p.id} className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden ${getStatusCor(p.status).split(" ")[0]}`}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">Pedido #{p.id}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusCor(p.status)}`}>{getStatusTexto(p.status)}</span>
                </div>
                <p className="font-medium">{p.cliente}</p>
                <p className="text-sm text-gray-500">{p.tipo === "entrega" ? "🚚 Entrega" : p.tipo === "retirada" ? "🏪 Retirada" : "🍽️ Local"}</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold">Itens:</p>
                  {p.itens.map((i, idx) => (<p key={idx} className="text-xs text-gray-600">{i.quantidade}x {i.nome}</p>))}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-bold text-green-600">R$ {p.total.toFixed(2)}</span>
                  <button onClick={() => { setSelectedPedido(p); setShowModal(true); }} className="text-blue-500 text-sm">Detalhes</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.status === "pendente" && (
                    <button onClick={() => atualizarStatus(p.id, "preparando")} className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <Clock size={12} /> Iniciar Preparo
                    </button>
                  )}
                  {p.status === "preparando" && (
                    <button onClick={() => atualizarStatus(p.id, "pronto")} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> Finalizar
                    </button>
                  )}
                  {p.status === "pronto" && p.tipo === "entrega" && (
                    <button onClick={() => atualizarStatus(p.id, "saiu_entrega")} className="flex-1 bg-purple-600 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <Truck size={12} /> Saiu Entrega
                    </button>
                  )}
                  {p.status === "saiu_entrega" && (
                    <button onClick={() => atualizarStatus(p.id, "entregue")} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> Confirmar Entrega
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Modo Admin - Tabela */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">ID</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">Cliente</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">Itens</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">Valor</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-mono">{p.id}</td>
                    <td className="p-3">
                      <div><p className="font-medium">{p.cliente}</p><p className="text-xs text-gray-400">{p.telefone}</p></div>
                    </td>
                    <td className="p-3 text-sm">{p.itens.map(i => i.nome).join(", ")}</td>
                    <td className="p-3 font-semibold text-green-600">R$ {p.total.toFixed(2)}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${getStatusCor(p.status)}`}>{getStatusTexto(p.status)}</span></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedPedido(p); setShowModal(true); }} className="text-blue-500 hover:text-blue-700" title="Detalhes">
                          <Eye size={16} />
                        </button>
                        {p.status === "pendente" && (
                          <button onClick={() => atualizarStatus(p.id, "preparando")} className="text-blue-600 hover:text-blue-800" title="Iniciar preparo">
                            <Clock size={16} />
                          </button>
                        )}
                        {p.status === "preparando" && (
                          <button onClick={() => atualizarStatus(p.id, "pronto")} className="text-green-600 hover:text-green-800" title="Finalizar">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {p.status === "pronto" && p.tipo === "entrega" && (
                          <button onClick={() => atualizarStatus(p.id, "saiu_entrega")} className="text-purple-600 hover:text-purple-800" title="Saiu para entrega">
                            <Truck size={16} />
                          </button>
                        )}
                        {p.status === "saiu_entrega" && (
                          <button onClick={() => atualizarStatus(p.id, "entregue")} className="text-green-600 hover:text-green-800" title="Confirmar entrega">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => atualizarStatus(p.id, "cancelado")} className="text-red-500 hover:text-red-700" title="Cancelar">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pedidosFiltrados.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </div>
      )}

      {/* Dicas do Modo Cozinha */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
          <Truck size={16} /> Modo Cozinha / Pareamento com Tablet
        </h4>
        <p className="text-xs text-blue-700">
          O modo "Cozinha" exibe os pedidos em cards otimizados para tablets, perfeito para a equipe de produção.
          Para parear um tablet na cozinha, basta acessar esta mesma URL em um tablet e ativar o modo "Cozinha".
        </p>
      </div>
    </div>
  );
}