"use client";

// Caminho: C:\valente_conecta\app\admin-master\moeda-conecta\transacoes\page.tsx
//
// Moderacao real da Moeda Conecta: aprova/recusa transferencias entre
// cidades diferentes (retidas pra evitar fuga de capital sem
// acompanhamento, ver 031_moeda_conecta_real.sql), estorna qualquer
// transacao, credita saldo administrativamente, e mostra o fluxo liquido
// entre cidades.

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, RefreshCw, Printer, Check, Ban, Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";

interface MCTransacao {
  id: string;
  tipo: string;
  remetente_id: string;
  remetente_nome: string;
  destinatario_id: string;
  destinatario_nome: string;
  cidade: string;
  cidade_destino: string;
  valor: number;
  descricao: string;
  status: "concluida" | "pendente_moderacao" | "estornada";
  moderado_por: string | null;
  moderado_em: string | null;
  created_at: string;
}

interface FluxoCidade {
  origem: string;
  destino: string;
  total: number;
  quantidade: number;
}

export default function MoedaConectaTransacoesPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [transactions, setTransactions] = useState<MCTransacao[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState("TODAS");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [fluxo, setFluxo] = useState<{ fluxo: FluxoCidade[]; pendentesModeracao: number; pendentesModeracaoValor: number } | null>(null);
  const [moderandoId, setModerandoId] = useState<string | null>(null);

  const [buscaCredito, setBuscaCredito] = useState("");
  const [resultadosCredito, setResultadosCredito] = useState<any[]>([]);
  const [destinatarioCredito, setDestinatarioCredito] = useState<any>(null);
  const [valorCredito, setValorCredito] = useState(0);
  const [descricaoCredito, setDescricaoCredito] = useState("");
  const [creditando, setCreditando] = useState(false);

  useEffect(() => {
    setAdmin(getCurrentUser());
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cidadeFiltro !== "TODAS") params.set("cidadeBase", cidadeFiltro);
      if (statusFiltro !== "TODOS") params.set("status", statusFiltro);
      const [res, fluxoRes] = await Promise.all([
        fetch(`/api/moeda-conecta/transactions?${params}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin-master/moeda-conecta/fluxo-cidades", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setTransactions(Array.isArray(res?.data) ? res.data : []);
      if (fluxoRes.success) setFluxo(fluxoRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidadeFiltro, statusFiltro]);

  const cidades = useMemo(() => {
    const all = Array.from(new Set(transactions.flatMap((item) => [item.cidade, item.cidade_destino]).filter(Boolean)));
    return ["TODAS", ...all];
  }, [transactions]);

  const totais = useMemo(() => {
    const concluidas = transactions.filter((t) => t.status === "concluida");
    const total = concluidas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
    const pendentes = transactions.filter((t) => t.status === "pendente_moderacao").length;
    return { total, quantidade: concluidas.length, pendentes };
  }, [transactions]);

  const moderar = async (transacaoId: string, acao: "aprovar" | "estornar") => {
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder moderar");
      return;
    }
    if (acao === "estornar" && !confirm("Confirma o estorno dessa transação?")) return;

    setModerandoId(transacaoId);
    try {
      const resp = await fetch("/api/admin-master/moeda-conecta/moderar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transacaoId, adminId: admin.id, acao }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "aprovar" ? "Transferência aprovada" : "Transação estornada");
      load();
    } catch (error: any) {
      toast.error(error.message || "Erro ao moderar");
    } finally {
      setModerandoId(null);
    }
  };

  const buscarUsuario = async () => {
    if (!buscaCredito.trim()) return;
    const resp = await fetch(`/api/admin-master/usuarios-lista?busca=${encodeURIComponent(buscaCredito)}`).then((r) => r.json());
    setResultadosCredito(resp.success ? resp.data.slice(0, 8) : []);
  };

  const creditar = async () => {
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder creditar");
      return;
    }
    if (!destinatarioCredito) {
      toast.error("Escolha um usuário");
      return;
    }
    if (!Number.isFinite(valorCredito) || valorCredito <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setCreditando(true);
    try {
      const resp = await fetch("/api/admin-master/moeda-conecta/creditar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          destinatarioId: destinatarioCredito.id,
          valor: valorCredito,
          descricao: descricaoCredito.trim() || undefined,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`${valorCredito.toFixed(2)} MC creditado pra ${destinatarioCredito.nome}`);
      setDestinatarioCredito(null);
      setBuscaCredito("");
      setResultadosCredito([]);
      setValorCredito(0);
      setDescricaoCredito("");
      load();
    } catch (error: any) {
      toast.error(error.message || "Erro ao creditar");
    } finally {
      setCreditando(false);
    }
  };

  const imprimir = () => window.print();

  const exportarPdf = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Relatorio de Transacoes - Moeda Conecta", 14, 16);
    doc.setFontSize(10);
    doc.text(`Cidade filtro: ${cidadeFiltro} | Status: ${statusFiltro}`, 14, 24);
    doc.text(`Total concluido: R$ ${totais.total.toFixed(2)} | ${totais.quantidade} transacoes`, 14, 30);

    const rows = transactions.map((item) => [
      new Date(item.created_at).toLocaleString("pt-BR"),
      item.tipo,
      item.remetente_nome,
      item.destinatario_nome,
      `${item.cidade}${item.cidade !== item.cidade_destino ? ` → ${item.cidade_destino}` : ""}`,
      `R$ ${Number(item.valor || 0).toFixed(2)}`,
      item.status,
    ]);

    autoTable(doc, {
      startY: 36,
      head: [["Data", "Tipo", "Remetente", "Destinatario", "Cidade", "Valor", "Status"]],
      body: rows,
      styles: { fontSize: 8 },
    });

    doc.save(`moeda-conecta-transacoes-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Moeda Conecta — Transações</h1>
          <p className="text-sm text-gray-500">Moderação, estorno e crédito administrativo.</p>
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

      {fluxo && fluxo.fluxo.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-800 mb-3">Fluxo líquido entre cidades (concluído)</p>
          <div className="space-y-1.5">
            {fluxo.fluxo.map((f) => (
              <div key={`${f.origem}-${f.destino}`} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{f.origem}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">{f.destino}</span>
                <span className="text-gray-500 ml-auto">R$ {f.total.toFixed(2)} · {f.quantidade} transação(ões)</span>
              </div>
            ))}
          </div>
          {fluxo.pendentesModeracao > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              +{fluxo.pendentesModeracao} transação(ões) entre cidades esperando aprovação (R$ {fluxo.pendentesModeracaoValor.toFixed(2)})
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Plus size={16} /> Crédito administrativo
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            value={buscaCredito}
            onChange={(e) => setBuscaCredito(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarUsuario()}
            placeholder="Buscar usuário por nome ou WhatsApp"
            className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={buscarUsuario} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
            Buscar
          </button>
        </div>
        {resultadosCredito.length > 0 && !destinatarioCredito && (
          <div className="border rounded-lg divide-y mb-2 max-h-40 overflow-auto">
            {resultadosCredito.map((u) => (
              <button
                key={u.id}
                onClick={() => setDestinatarioCredito(u)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {u.nome} · {u.whatsapp} · {u.cidade_base}
              </button>
            ))}
          </div>
        )}
        {destinatarioCredito && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              {destinatarioCredito.nome} ({destinatarioCredito.cidade_base})
            </span>
            <button onClick={() => setDestinatarioCredito(null)} className="text-xs text-gray-400 underline">trocar</button>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={valorCredito || ""}
              onChange={(e) => setValorCredito(parseFloat(e.target.value))}
              placeholder="Valor MC"
              className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            />
            <input
              value={descricaoCredito}
              onChange={(e) => setDescricaoCredito(e.target.value)}
              placeholder="Descrição (opcional)"
              className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            />
            <button
              onClick={creditar}
              disabled={creditando}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
            >
              {creditando ? "Creditando..." : "Creditar"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={14} /> Filtros
          </div>
          <div className="flex gap-2">
            <select value={cidadeFiltro} onChange={(e) => setCidadeFiltro(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="TODOS">Todos os status</option>
              <option value="concluida">Concluída</option>
              <option value="pendente_moderacao">Aguardando aprovação</option>
              <option value="estornada">Estornada</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-emerald-700">Total concluído</p>
            <p className="font-bold text-emerald-800">R$ {totais.total.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-700">Transações concluídas</p>
            <p className="font-bold text-slate-800">{totais.quantidade}</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-amber-700">Aguardando aprovação</p>
            <p className="font-bold text-amber-800">{totais.pendentes}</p>
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
                <th className="text-left px-3 py-2">Destinatário</th>
                <th className="text-left px-3 py-2">Cidade</th>
                <th className="text-left px-3 py-2">Descrição</th>
                <th className="text-left px-3 py-2">Valor</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-gray-500">Carregando...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-gray-500">Sem transações para os filtros atuais.</td></tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(item.created_at).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2">{item.tipo}</td>
                    <td className="px-3 py-2">{item.remetente_nome}</td>
                    <td className="px-3 py-2">{item.destinatario_nome}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item.cidade}{item.cidade !== item.cidade_destino && ` → ${item.cidade_destino}`}
                    </td>
                    <td className="px-3 py-2">{item.descricao}</td>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">R$ {Number(item.valor || 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                          item.status === "concluida"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "pendente_moderacao"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status === "concluida" ? "Concluída" : item.status === "pendente_moderacao" ? "Aguardando" : "Estornada"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {item.status === "pendente_moderacao" && (
                          <button
                            onClick={() => moderar(item.id, "aprovar")}
                            disabled={moderandoId === item.id}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg disabled:opacity-50"
                            title="Aprovar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status !== "estornada" && (
                          <button
                            onClick={() => moderar(item.id, "estornar")}
                            disabled={moderandoId === item.id}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg disabled:opacity-50"
                            title="Estornar"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
