"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, RefreshCw, Printer } from "lucide-react";

interface MCTransaction {
  id: string;
  tipo: "pagar" | "receber";
  valor: number;
  remetenteId: string;
  remetenteNome: string;
  destinatarioQr: string;
  destinatarioId: string;
  cidadeBase: string;
  descricao: string;
  status: "concluida" | "pendente" | "cancelada";
  createdAt: string;
}

export default function MoedaConectaTransacoesPage() {
  const [transactions, setTransactions] = useState<MCTransaction[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState("TODAS");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const query = cidadeFiltro !== "TODAS" ? `?cidadeBase=${encodeURIComponent(cidadeFiltro)}` : "";
      const res = await fetch(`/api/moeda-conecta/transactions${query}`, { cache: "no-store" });
      const data = await res.json();
      setTransactions(Array.isArray(data?.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [cidadeFiltro]);

  const cidades = useMemo(() => {
    const all = Array.from(new Set(transactions.map((item) => String(item.cidadeBase || "").toUpperCase()).filter(Boolean)));
    return ["TODAS", ...all];
  }, [transactions]);

  const totais = useMemo(() => {
    const entradas = transactions.filter((item) => item.tipo === "receber").reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const saidas = transactions.filter((item) => item.tipo === "pagar").reduce((sum, item) => sum + Number(item.valor || 0), 0);
    return {
      entradas,
      saidas,
      liquido: entradas - saidas
    };
  }, [transactions]);

  const imprimir = () => {
    window.print();
  };

  const exportarPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Relatorio de Transacoes - Moeda Conecta", 14, 16);

    doc.setFontSize(10);
    doc.text(`Cidade filtro: ${cidadeFiltro}`, 14, 24);
    doc.text(`Entradas: R$ ${totais.entradas.toFixed(2)} | Saidas: R$ ${totais.saidas.toFixed(2)} | Liquido: R$ ${totais.liquido.toFixed(2)}`, 14, 30);

    const rows = transactions.map((item) => [
      new Date(item.createdAt).toLocaleString("pt-BR"),
      item.tipo,
      item.remetenteNome,
      item.destinatarioId,
      item.cidadeBase,
      `R$ ${Number(item.valor || 0).toFixed(2)}`,
      item.status
    ]);

    autoTable(doc, {
      startY: 36,
      head: [["Data", "Tipo", "Remetente", "Destinatario", "Cidade", "Valor", "Status"]],
      body: rows,
      styles: { fontSize: 8 }
    });

    doc.save(`moeda-conecta-transacoes-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Moeda Conecta - Transacoes</h1>
          <p className="text-sm text-gray-500">Pagamentos e recebimentos via QR exclusivo dos usuarios logados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm flex items-center gap-2">
            <RefreshCw size={14} /> Atualizar
          </button>
          <button onClick={exportarPdf} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm flex items-center gap-2">
            <FileText size={14} /> PDF
          </button>
          <button onClick={imprimir} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2">
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={14} /> Filtro por cidade-base
          </div>
          <select
            value={cidadeFiltro}
            onChange={(e) => setCidadeFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-emerald-700">Entradas</p>
            <p className="font-bold text-emerald-800">R$ {totais.entradas.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
            <p className="text-rose-700">Saidas</p>
            <p className="font-bold text-rose-800">R$ {totais.saidas.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-700">Liquido</p>
            <p className="font-bold text-slate-800">R$ {totais.liquido.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Data</th>
                <th className="text-left px-3 py-2">Tipo</th>
                <th className="text-left px-3 py-2">Remetente</th>
                <th className="text-left px-3 py-2">Destinatario</th>
                <th className="text-left px-3 py-2">Cidade</th>
                <th className="text-left px-3 py-2">Descricao</th>
                <th className="text-left px-3 py-2">Valor</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-gray-500">Sem transacoes para os filtros atuais.</td>
                </tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2 uppercase">{item.tipo}</td>
                    <td className="px-3 py-2">{item.remetenteNome}</td>
                    <td className="px-3 py-2">{item.destinatarioId}</td>
                    <td className="px-3 py-2">{item.cidadeBase}</td>
                    <td className="px-3 py-2">{item.descricao}</td>
                    <td className="px-3 py-2 font-semibold">R$ {Number(item.valor || 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.status === "concluida" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

