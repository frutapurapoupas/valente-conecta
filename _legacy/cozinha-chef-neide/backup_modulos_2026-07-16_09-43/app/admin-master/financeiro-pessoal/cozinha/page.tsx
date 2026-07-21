"use client";

import {
  CheckCircle,
  Edit,
  Plus,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

interface VendaCozinha {
  id: string;
  cliente: string;
  telefone: string;
  itens: string;
  valor: number;
  tipo: "entrega" | "retirada" | "local";
  data: string;
  status: "pendente" | "pago" | "cancelado";
  taxaEntrega?: number;
}

export default function AdminCozinhaPage() {
  const [vendas, setVendas] = useState<VendaCozinha[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth());
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    cliente: "",
    telefone: "",
    itens: "",
    valor: 0,
    tipo: "entrega" as "entrega" | "retirada" | "local",
    data: new Date().toISOString().split("T")[0],
    status: "pendente" as "pendente" | "pago" | "cancelado",
    taxaEntrega: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem("cozinha_admin_vendas");
    if (stored) {
      setVendas(JSON.parse(stored));
    } else {
      const mock: VendaCozinha[] = [
        { id: "1", cliente: "JoÃ£o Silva", telefone: "(75) 99999-1111", itens: "2x Marmita Frango + Suco", valor: 64.80, tipo: "entrega", data: new Date().toISOString(), status: "pago", taxaEntrega: 5 },
        { id: "2", cliente: "Maria Santos", telefone: "(75) 99999-2222", itens: "Marmita Vegetariana", valor: 26.90, tipo: "retirada", data: new Date().toISOString(), status: "pendente" }
      ];
      setVendas(mock);
      localStorage.setItem("cozinha_admin_vendas", JSON.stringify(mock));
    }
  }, []);

  const salvarVendas = (novas: VendaCozinha[]) => {
    setVendas(novas);
    localStorage.setItem("cozinha_admin_vendas", JSON.stringify(novas));
  };

  const handleSave = () => {
    if (!formData.cliente || formData.valor <= 0) {
      alert("Preencha cliente e valor!");
      return;
    }

    const novaVenda: VendaCozinha = {
      id: editingId || Date.now().toString(),
      cliente: formData.cliente,
      telefone: formData.telefone,
      itens: formData.itens,
      valor: formData.valor + (formData.tipo === "entrega" ? formData.taxaEntrega : 0),
      tipo: formData.tipo,
      data: formData.data,
      status: formData.status,
      taxaEntrega: formData.tipo === "entrega" ? formData.taxaEntrega : undefined
    };

    let novas: VendaCozinha[];
    if (editingId) {
      novas = vendas.map(v => v.id === editingId ? novaVenda : v);
    } else {
      novas = [novaVenda, ...vendas];
    }
    salvarVendas(novas);
    closeModal();
    alert("âœ… Venda salva!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir esta venda?")) {
      salvarVendas(vendas.filter(v => v.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, novoStatus: "pendente" | "pago" | "cancelado") => {
    salvarVendas(vendas.map(v => v.id === id ? { ...v, status: novoStatus } : v));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      cliente: "",
      telefone: "",
      itens: "",
      valor: 0,
      tipo: "entrega",
      data: new Date().toISOString().split("T")[0],
      status: "pendente",
      taxaEntrega: 0
    });
  };

  const vendasFiltradas = vendas.filter(v => {
    const data = new Date(v.data);
    const matchMes = data.getMonth() === filtroMes && data.getFullYear() === filtroAno;
    const matchStatus = filtroStatus === "todas" || v.status === filtroStatus;
    return matchMes && matchStatus;
  });

  const totalVendas = vendasFiltradas.reduce((acc, v) => acc + v.valor, 0);
  const totalPago = vendasFiltradas.filter(v => v.status === "pago").reduce((acc, v) => acc + v.valor, 0);
  const totalPendente = vendasFiltradas.filter(v => v.status === "pendente").reduce((acc, v) => acc + v.valor, 0);

  const meses = ["Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingId ? "âœï¸ Editar" : "âž• Nova"} Venda</h3>
            <div className="space-y-3">
              <input type="text" value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} placeholder="Cliente" className="w-full p-2 border rounded-lg" />
              <input type="tel" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} placeholder="Telefone" className="w-full p-2 border rounded-lg" />
              <textarea value={formData.itens} onChange={(e) => setFormData({ ...formData, itens: e.target.value })} placeholder="Itens do pedido" className="w-full p-2 border rounded-lg h-20" />
              <input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })} placeholder="Valor (R$)" className="w-full p-2 border rounded-lg" />
              <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as "entrega" | "retirada" | "local" })} className="w-full p-2 border rounded-lg">
                <option value="entrega">ðŸšš Entrega</option>
                <option value="retirada">ðŸª Retirada</option>
                <option value="local">ðŸ½ï¸ Local</option>
              </select>
              {formData.tipo === "entrega" && (
                <input type="number" step="0.01" value={formData.taxaEntrega} onChange={(e) => setFormData({ ...formData, taxaEntrega: parseFloat(e.target.value) })} placeholder="Taxa de entrega" className="w-full p-2 border rounded-lg" />
              )}
              <input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full p-2 border rounded-lg" />
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as "pendente" | "pago" | "cancelado" })} className="w-full p-2 border rounded-lg">
                <option value="pendente">â³ Pendente</option>
                <option value="pago">âœ… Pago</option>
                <option value="cancelado">âŒ Cancelado</option>
              </select>
              <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Salvar</button>
              <button onClick={closeModal} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Utensils size={24} /> Cozinha Chef Neide</h1><p className="text-sm text-gray-500">GestÃ£o financeira da cozinha</p></div>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Nova Venda</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500"><p className="text-xs text-gray-500">Total de Vendas</p><p className="text-2xl font-bold text-green-600">R$ {totalVendas.toFixed(2)}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500"><p className="text-xs text-gray-500">Recebido</p><p className="text-2xl font-bold text-blue-600">R$ {totalPago.toFixed(2)}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500"><p className="text-xs text-gray-500">Pendente</p><p className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toFixed(2)}</p></div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
          <button onClick={() => { let m = filtroMes - 1; if (m < 0) { m = 11; setFiltroAno(filtroAno - 1) } setFiltroMes(m) }} className="p-1 hover:bg-gray-100 rounded">â—€</button>
          <span className="text-sm px-2">{meses[filtroMes]} {filtroAno}</span>
          <button onClick={() => { let m = filtroMes + 1; if (m > 11) { m = 0; setFiltroAno(filtroAno + 1) } setFiltroMes(m) }} className="p-1 hover:bg-gray-100 rounded">â–¶</button>
        </div>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
          <option value="todas">Todos</option>
          <option value="pago">Pagos</option>
          <option value="pendente">Pendentes</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-xs">Cliente</th>
                <th className="p-3 text-left text-xs">Itens</th>
                <th className="p-3 text-left text-xs">Data</th>
                <th className="p-3 text-left text-xs">Valor</th>
                <th className="p-3 text-left text-xs">Status</th>
                <th className="p-3 text-left text-xs">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map(v => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm"><div><p className="font-medium">{v.cliente}</p><p className="text-xs text-gray-400">{v.telefone}</p></div></td>
                  <td className="p-3 text-sm max-w-xs truncate">{v.itens}</td>
                  <td className="p-3 text-sm">{new Date(v.data).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-semibold text-green-600">R$ {v.valor.toFixed(2)}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "pago" ? "bg-green-100 text-green-700" : v.status === "pendente" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{v.status === "pago" ? "âœ… Pago" : v.status === "pendente" ? "â³ Pendente" : "âŒ Cancelado"}</span></td>
                  <td className="p-3"><div className="flex gap-2"><button onClick={() => { setEditingId(v.id); setFormData({ cliente: v.cliente, telefone: v.telefone, itens: v.itens, valor: v.valor - (v.taxaEntrega || 0), tipo: v.tipo, data: v.data.split("T")[0], status: v.status, taxaEntrega: v.taxaEntrega || 0 }); setShowModal(true); }} className="text-blue-500"><Edit size={16} /></button><button onClick={() => handleDelete(v.id)} className="text-red-500"><Trash2 size={16} /></button>{v.status === "pendente" && <button onClick={() => handleUpdateStatus(v.id, "pago")} className="text-green-500"><CheckCircle size={16} /></button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Utensils(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8v4" />
      <path d="M12 2v2" />
      <path d="M12 4v4" />
      <path d="M4 12h16" />
      <path d="M18 12v8H6v-8" />
      <path d="M8 20h8" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

