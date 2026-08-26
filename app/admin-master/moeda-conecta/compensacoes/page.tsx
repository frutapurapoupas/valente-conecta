"use client";

// Caminho: C:\valente_conecta\app\admin-master\moeda-conecta\compensacoes\page.tsx
//
// Compensacoes em real pra fornecedores que ainda nao sao usuarios: o
// portador do credito pediu (o saldo dele em Moeda Conecta ja saiu na
// hora), e o admin master confirma aqui depois de ter pago o fornecedor
// via PIX fora do sistema — ou recusa, devolvendo o saldo pro portador.
// Ver 036_bonus_indicacao_e_compensacao.sql.

import { useEffect, useState } from "react";
import { Check, Store, Ban, RefreshCw, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";

interface Compensacao {
  id: string;
  portador_id: string;
  cidade: string;
  fornecedor_nome: string;
  fornecedor_whatsapp: string | null;
  valor: number;
  descricao: string | null;
  mes_referencia: string;
  status: "solicitada" | "paga" | "recusada";
  created_at: string;
  portador?: { nome: string; whatsapp: string } | null;
}

export default function CompensacoesFornecedorPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [compensacoes, setCompensacoes] = useState<Compensacao[]>([]);
  const [statusFiltro, setStatusFiltro] = useState("solicitada");
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    setAdmin(getCurrentUser());
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFiltro !== "TODOS") params.set("status", statusFiltro);
      const resp = await fetch(`/api/admin-master/moeda-conecta/compensacoes?${params}`, { cache: "no-store" }).then((r) => r.json());
      setCompensacoes(resp.success ? resp.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFiltro]);

  const processar = async (id: string, acao: "confirmar" | "recusar") => {
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder processar");
      return;
    }
    let motivo: string | null = null;
    if (acao === "recusar") {
      motivo = prompt("Motivo da recusa (opcional):") || "";
      if (motivo === null) return;
    } else if (!confirm("Confirma que já pagou o fornecedor em real via PIX? Isso marca a solicitação como paga.")) {
      return;
    }

    setProcessandoId(id);
    try {
      const resp = await fetch("/api/admin-master/moeda-conecta/compensacoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compensacaoId: id, adminId: admin.id, acao, motivo }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(acao === "confirmar" ? "Compensação marcada como paga" : "Compensação recusada — saldo devolvido ao portador");
      load();
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar");
    } finally {
      setProcessandoId(null);
    }
  };

  const totalPendente = compensacoes.filter((c) => c.status === "solicitada").reduce((sum, c) => sum + Number(c.valor || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600" /> Compensações a fornecedores
          </h1>
          <p className="text-sm text-gray-500">
            Portador do crédito comprou com um fornecedor que ainda não é usuário — o fornecedor recebe o valor em real, quando o admin master confirma o pagamento manual.
          </p>
        </div>
        <button onClick={load} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-sm flex items-center gap-2 self-start">
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter size={14} /> Filtro por status
        </div>
        <div className="flex gap-2">
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="solicitada">Aguardando pagamento</option>
            <option value="paga">Já pagas</option>
            <option value="recusada">Recusadas</option>
            <option value="TODOS">Todas</option>
          </select>
        </div>
      </div>

      {statusFiltro === "solicitada" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>{compensacoes.length}</strong> solicitação(ões) aguardando pagamento em real, somando <strong>R$ {totalPendente.toFixed(2)}</strong>.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Data</th>
                <th className="text-left px-3 py-2">Mês ref.</th>
                <th className="text-left px-3 py-2">Portador do crédito</th>
                <th className="text-left px-3 py-2">Fornecedor</th>
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
              ) : compensacoes.length === 0 ? (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-gray-500">Nenhuma solicitação para esse filtro.</td></tr>
              ) : (
                compensacoes.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.mes_referencia}</td>
                    <td className="px-3 py-2">{c.portador?.nome || "—"}<br /><span className="text-sm text-gray-500">{c.portador?.whatsapp}</span></td>
                    <td className="px-3 py-2">{c.fornecedor_nome}<br /><span className="text-sm text-gray-500">{c.fornecedor_whatsapp}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.cidade}</td>
                    <td className="px-3 py-2">{c.descricao}</td>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">R$ {Number(c.valor || 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm whitespace-nowrap ${
                          c.status === "paga" ? "bg-emerald-100 text-emerald-700" : c.status === "solicitada" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status === "paga" ? "Paga" : c.status === "solicitada" ? "Aguardando" : "Recusada"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {c.status === "solicitada" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => processar(c.id, "confirmar")}
                            disabled={processandoId === c.id}
                            className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg disabled:opacity-50"
                            title="Marcar como paga"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => processar(c.id, "recusar")}
                            disabled={processandoId === c.id}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg disabled:opacity-50"
                            title="Recusar"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
