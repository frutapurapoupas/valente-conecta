"use client";

import {
  Calculator,
  Calendar,
  Clock,
  Factory,
  List,
  Printer,
  RefreshCw,
  ShoppingCart,
  Smartphone, Tablet,
  Utensils,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

interface Agendamento {
  id: string;
  cliente: string;
  tipo: "geral" | "parceiro";
  pratos: string[];
  data: string;
  status: "pendente" | "confirmado" | "entregue";
  total: number;
}

interface ItemCompra {
  nome: string;
  quantidade: number;
  unidade: string;
}

interface ExtratoParceiro {
  cliente: string;
  data: string;
  total: number;
  status: string;
  comissao: number;
}

export default function CozinhaDashboardPage() {
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [agendamentosSemana, setAgendamentosSemana] = useState<Agendamento[]>([]);
  const [modoPareamento, setModoPareamento] = useState(false);
  const [codigoPareamento, setCodigoPareamento] = useState("");
  const [showListaCompras, setShowListaCompras] = useState(false);
  const [itensCompra, setItensCompra] = useState<ItemCompra[]>([]);
  const [extratoParceiros, setExtratoParceiros] = useState<ExtratoParceiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const vendas = JSON.parse(localStorage.getItem("cozinha_admin_vendas") || "[]");
    const hoje = new Date().toISOString().split("T")[0];
    const semana = new Date();
    semana.setDate(semana.getDate() + 7);

    const hojeAgendamentos = vendas.filter((v: any) => v.data.split("T")[0] === hoje);
    const semanaAgendamentos = vendas.filter((v: any) => v.data >= hoje && v.data <= semana.toISOString());

    setAgendamentosHoje(hojeAgendamentos);
    setAgendamentosSemana(semanaAgendamentos);
    setLoading(false);
  };

  const handleParearTablet = () => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoPareamento(codigo);
    localStorage.setItem("cozinha_pareamento", codigo);
    setModoPareamento(true);
    alert(`✅ Código de pareamento: ${codigo}\nUse no tablet para sincronizar.`);
  };

  const calcularListaCompras = () => {
    const receitas = JSON.parse(localStorage.getItem("cozinha_receitas") || "[]");
    const necessidade: Record<string, ItemCompra> = {};

    receitas.forEach((receita: any) => {
      receita.itens?.forEach((item: any) => {
        if (!necessidade[item.nome]) {
          necessidade[item.nome] = { nome: item.nome, quantidade: 0, unidade: item.unidade };
        }
        necessidade[item.nome].quantidade += item.quantidade;
      });
    });

    setItensCompra(Object.values(necessidade));
    setShowListaCompras(true);
  };

  const gerarExtratoParceiros = () => {
    const vendas = JSON.parse(localStorage.getItem("cozinha_admin_vendas") || "[]");
    const parceiros = vendas.filter((v: any) => v.tipo === "parceiro");
    const extrato = parceiros.map((p: any) => ({
      cliente: p.cliente,
      data: p.data,
      total: p.valor,
      status: p.status,
      comissao: p.valor * 0.1
    }));
    setExtratoParceiros(extrato);

    // Gerar PDF em nova janela
    const html = gerarPDFExtrato(extrato);
    const win = window.open();
    win?.document.write(html);
  };

  const gerarPDFExtrato = (extrato: ExtratoParceiro[]) => {
    const totalGeral = extrato.reduce((acc, e) => acc + e.total, 0);
    const totalComissao = extrato.reduce((acc, e) => acc + e.comissao, 0);

    return `
      <html>
        <head>
          <title>Extrato Parceiros - Cozinha Chef Neide</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { margin-top: 20px; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>📊 Extrato de Parceiros - Cozinha Chef Neide</h1>
          <p>Data de emissão: ${new Date().toLocaleDateString()}</p>
          <p>Período: Todas as vendas</p>
          
          <table>
            <thead>
              <tr><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Comissão (10%)</th></tr>
            </thead>
            <tbody>
              ${extrato.map(e => `
                <tr>
                  <td>${e.cliente}</td>
                  <td>${new Date(e.data).toLocaleDateString()}</td>
                  <td>R$ ${e.total.toFixed(2)}</td>
                  <td>${e.status}</td>
                  <td>R$ ${e.comissao.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="total">
            <p><strong>Total Geral: R$ ${totalGeral.toFixed(2)}</strong></p>
            <p><strong>Total Comissões: R$ ${totalComissao.toFixed(2)}</strong></p>
          </div>
          
          <div class="footer">
            <p>Documento gerado automaticamente pelo Valente Conecta</p>
            <p>Cozinha Chef Neide - ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  const stats = {
    agendadosHoje: agendamentosHoje.length,
    agendadosSemana: agendamentosSemana.length,
    parceirosHoje: agendamentosHoje.filter((a: any) => a.tipo === "parceiro").length,
    geraisHoje: agendamentosHoje.filter((a: any) => a.tipo !== "parceiro").length,
    faturamentoHoje: agendamentosHoje.reduce((acc, a: any) => acc + a.total, 0),
    faturamentoSemana: agendamentosSemana.reduce((acc, a: any) => acc + a.total, 0)
  };

  // Agrupamento de pedidos por dia da semana
  const pedidosPorDia = [0, 0, 0, 0, 0, 0, 0];
  agendamentosSemana.forEach((a: any) => {
    const dia = new Date(a.data).getDay();
    pedidosPorDia[dia]++;
  });

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal Lista de Compras */}
      {showListaCompras && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">🛒 Lista de Compras</h3>
              <button onClick={() => setShowListaCompras(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="p-2 text-left text-xs font-semibold text-gray-600">Item</th><th className="p-2 text-left text-xs font-semibold text-gray-600">Quantidade</th><th className="p-2 text-left text-xs font-semibold text-gray-600">Unidade</th></tr>
                </thead>
                <tbody>
                  {itensCompra.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhum item calculado</td></tr>
                  ) : (
                    itensCompra.map((i, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-700">{i.nome}</td>
                        <td className="p-2 font-semibold text-orange-600">{i.quantidade.toFixed(1)}</td>
                        <td className="p-2 text-gray-500">{i.unidade}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowListaCompras(false)} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 font-semibold hover:bg-blue-700">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Utensils size={24} className="text-orange-600" /> Cozinha Chef Neide
          </h1>
          <p className="text-sm text-gray-500">Gestão completa da cozinha</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleParearTablet} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition">
            <Tablet size={16} /> Parear Tablet
          </button>
          <button onClick={gerarExtratoParceiros} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition">
            <Printer size={16} /> Extrato Parceiros
          </button>
          <button onClick={carregarDados} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-700 transition">
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      {/* Código de Pareamento */}
      {modoPareamento && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
            <Smartphone size={16} /> Código de Pareamento
          </p>
          <p className="text-3xl font-bold text-green-600 font-mono tracking-wider mt-1">{codigoPareamento}</p>
          <p className="text-xs text-green-600 mt-1">Use este código no tablet para sincronizar a produção</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500">Pedidos Hoje</p>
          <p className="text-2xl font-bold text-gray-800">{stats.agendadosHoje}</p>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-green-600">👤 Geral: {stats.geraisHoje}</span>
            <span className="text-purple-600">🤝 Parceiros: {stats.parceirosHoje}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500">Pedidos Semana</p>
          <p className="text-2xl font-bold text-gray-800">{stats.agendadosSemana}</p>
          <p className="text-xs text-gray-400 mt-1">📅 Próximos 7 dias</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-xs text-gray-500">Faturamento Hoje</p>
          <p className="text-2xl font-bold text-green-600">R$ {stats.faturamentoHoje.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <p className="text-xs text-gray-500">Faturamento Semana</p>
          <p className="text-2xl font-bold text-orange-600">R$ {stats.faturamentoSemana.toFixed(2)}</p>
        </div>
      </div>

      {/* Botões de Ação Rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={calcularListaCompras} className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-xl flex items-center justify-center gap-2 transition">
          <ShoppingCart size={18} /> Calcular Compras
        </button>
        <button onClick={() => window.location.href = "/admin-master/cozinha/producao"} className="bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 transition">
          <Factory size={18} /> Produção
        </button>
        <button onClick={() => window.location.href = "/admin-master/cozinha/lista-compras"} className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-3 rounded-xl flex items-center justify-center gap-2 transition">
          <Calculator size={18} /> Lista de Compras
        </button>
        <button onClick={() => window.location.href = "/admin-master/cozinha/receitas"} className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-3 rounded-xl flex items-center justify-center gap-2 transition">
          <List size={18} /> Receitas
        </button>
      </div>

      {/* Pedidos de Hoje */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Clock size={18} /> Pedidos Programados para Hoje</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr><th className="p-3 text-left text-xs font-semibold text-gray-600">Cliente</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Tipo</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Pratos</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Status</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Valor</th></tr>
            </thead>
            <tbody>
              {agendamentosHoje.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum pedido agendado para hoje</td></tr>
              ) : (
                agendamentosHoje.map((a: any) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium text-gray-800">{a.cliente}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.tipo === "parceiro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {a.tipo === "parceiro" ? "🤝 Parceiro" : "👤 Geral"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{a.itens || "-"}</td>
                    <td className="p-3"><span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ Pendente</span></td>
                    <td className="p-3 font-semibold text-green-600">R$ {a.total?.toFixed(2) || "0,00"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo da Semana */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18} /> Resumo da Semana</h3>
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map((dia, idx) => (
            <div key={dia} className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600">{dia}</p>
              <p className="text-xl font-bold text-indigo-600">{pedidosPorDia[idx]}</p>
              <p className="text-[10px] text-gray-400">pedidos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}