"use client";

// Caminho: C:\valente_conecta\app\pdv\caixa\page.tsx
//
// Livro caixa do comerciante — controle manual de entradas/saidas,
// escopado por usuario_id (getCurrentUser(), mesma identidade real usada
// em /pdv/estoque). Ver app/api/pdv/caixa/route.ts e migration
// 044_pdv_caixa.sql.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, Trash2, Calendar, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";

interface Lancamento {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string | null;
  forma_pagamento: string;
  data: string;
  observacoes: string | null;
}

const FORMAS_PAGAMENTO = [
  { id: "dinheiro", nome: "Dinheiro" },
  { id: "pix", nome: "PIX" },
  { id: "cartao", nome: "Cartão" },
  { id: "fiado", nome: "Fiado" },
  { id: "outro", nome: "Outro" },
];

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export default function PdvCaixaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [totais, setTotais] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [formAberto, setFormAberto] = useState<"entrada" | "saida" | null>(null);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number | "">("");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [salvando, setSalvando] = useState(false);

  const carregar = async (usuarioId: string, inicio: string, fim: string) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/pdv/caixa?usuarioId=${usuarioId}&dataInicio=${inicio}&dataFim=${fim}`, { cache: "no-store" }).then((r) => r.json());
      if (resp.success) {
        setLancamentos(resp.data.lancamentos);
        setTotais(resp.data.totais);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u) carregar(u.id, dataInicio, dataFim);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (usuario) carregar(usuario.id, dataInicio, dataFim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim]);

  const aplicarAtalho = (dias: number) => {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (dias - 1));
    setDataInicio(inicio.toISOString().slice(0, 10));
    setDataFim(fim.toISOString().slice(0, 10));
  };

  const lancar = async () => {
    if (!usuario || !formAberto) return;
    if (!descricao.trim() || !valor || Number(valor) <= 0) {
      toast.error("Preencha descrição e valor.");
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch("/api/pdv/caixa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          tipo: formAberto,
          descricao: descricao.trim(),
          valor: Number(valor),
          formaPagamento,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(formAberto === "entrada" ? "Entrada lançada!" : "Saída lançada!");
      setDescricao("");
      setValor("");
      setFormaPagamento("dinheiro");
      setFormAberto(null);
      carregar(usuario.id, dataInicio, dataFim);
    } catch (err: any) {
      toast.error(err.message || "Erro ao lançar");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: string) => {
    if (!usuario) return;
    await fetch(`/api/pdv/caixa?id=${id}`, { method: "DELETE" });
    carregar(usuario.id, dataInicio, dataFim);
  };

  if (!loading && !usuario) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-gray-500">
        Complete seu cadastro no app pra usar o livro caixa.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
          <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-600" /> Livro Caixa</h1>
        </div>
      </header>
      <PdvSubNav ativa="caixa" />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="px-2 py-1.5 border rounded-lg text-sm" />
            <span className="text-gray-400 text-sm">até</span>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="px-2 py-1.5 border rounded-lg text-sm" />
            <div className="flex gap-1 ml-auto">
              <button onClick={() => aplicarAtalho(1)} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full">Hoje</button>
              <button onClick={() => aplicarAtalho(7)} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full">7 dias</button>
              <button onClick={() => aplicarAtalho(30)} className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full">30 dias</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-emerald-700 flex items-center justify-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Entradas</p>
              <p className="font-bold text-emerald-700">{formatarMoeda(totais.entradas)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-[11px] text-red-700 flex items-center justify-center gap-1"><TrendingDown className="w-3.5 h-3.5" /> Saídas</p>
              <p className="font-bold text-red-700">{formatarMoeda(totais.saidas)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${totais.saldo >= 0 ? "bg-blue-50" : "bg-amber-50"}`}>
              <p className={`text-[11px] flex items-center justify-center gap-1 ${totais.saldo >= 0 ? "text-blue-700" : "text-amber-700"}`}>Saldo</p>
              <p className={`font-bold ${totais.saldo >= 0 ? "text-blue-700" : "text-amber-700"}`}>{formatarMoeda(totais.saldo)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setFormAberto("entrada")} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Entrada
          </button>
          <button onClick={() => setFormAberto("saida")} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Saída
          </button>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Carregando...</p>
        ) : lancamentos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-400">Nenhum lançamento no período.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow divide-y">
            {lancamentos.map((l) => (
              <div key={l.id} className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${l.tipo === "entrada" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {l.tipo === "entrada" ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{l.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")} · {FORMAS_PAGAMENTO.find((f) => f.id === l.forma_pagamento)?.nome || l.forma_pagamento}
                  </p>
                </div>
                <p className={`font-bold text-sm ${l.tipo === "entrada" ? "text-emerald-600" : "text-red-600"}`}>
                  {l.tipo === "entrada" ? "+" : "-"} {formatarMoeda(Number(l.valor))}
                </p>
                <button onClick={() => excluir(l.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </main>

      {formAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">{formAberto === "entrada" ? "Nova entrada" : "Nova saída"}</h2>
              <button onClick={() => setFormAberto(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={formAberto === "entrada" ? "Ex: Venda no balcão" : "Ex: Compra de mercadoria"} className="w-full px-3 py-2 border rounded-lg text-sm" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value === "" ? "" : parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Forma de pagamento</label>
                <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {FORMAS_PAGAMENTO.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
              <button
                onClick={lancar}
                disabled={salvando}
                className={`w-full py-2.5 rounded-xl font-semibold text-white disabled:opacity-60 ${formAberto === "entrada" ? "bg-emerald-600" : "bg-red-600"}`}
              >
                {salvando ? "Salvando..." : "Lançar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
