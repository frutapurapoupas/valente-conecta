"use client";

// Caminho: C:\valente_conecta\app\pdv\relatorios\page.tsx
//
// Relatorio de vendas de verdade do comerciante (antes era um stub "Área
// em construção", nem aparecia no menu). Le' de app/api/pdv/relatorios,
// que agrega pdv_vendas/pdv_vendas_itens ja gravados pelo caixa real
// (pdv_registrar_venda_v1, 067_pdv_vendas.sql) -- sem dado nenhum ficticio.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, BarChart3, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";

const LABEL_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
  fiado: "Fiado",
};

const PERIODOS = [
  { chave: "hoje", label: "Hoje", dias: 1 },
  { chave: "7dias", label: "7 dias", dias: 7 },
  { chave: "30dias", label: "30 dias", dias: 30 },
] as const;

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatarDiaCurto(iso: string) {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

interface RelatorioData {
  faturamentoTotal: number;
  numeroVendas: number;
  ticketMedio: number;
  variacaoPercentual: number | null;
  porFormaPagamento: Record<string, { total: number; quantidade: number }>;
  serieDiaria: { dia: string; total: number }[];
  maisVendidosPorValor: { nome: string; valor: number; quantidade: number }[];
  maisVendidosPorQuantidade: { nome: string; valor: number; quantidade: number }[];
}

function TooltipPadrao({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200 text-sm">
      {label && <p className="font-semibold text-gray-800 mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || entry.payload?.fill }}>
          Faturamento: <span className="font-bold">{formatarMoeda(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function RelatoriosPdvPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]["chave"] | "personalizado">("30dias");
  const [inicioPersonalizado, setInicioPersonalizado] = useState("");
  const [fimPersonalizado, setFimPersonalizado] = useState("");
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);

  const { inicio, fim } = useMemo(() => {
    if (periodo === "personalizado" && inicioPersonalizado && fimPersonalizado) {
      return { inicio: inicioPersonalizado, fim: fimPersonalizado };
    }
    const def = PERIODOS.find((p) => p.chave === periodo) || PERIODOS[2];
    const fimData = new Date();
    const inicioData = new Date(fimData.getTime() - (def.dias - 1) * 24 * 60 * 60 * 1000);
    return { inicio: inicioData.toISOString().slice(0, 10), fim: fimData.toISOString().slice(0, 10) };
  }, [periodo, inicioPersonalizado, fimPersonalizado]);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (!u) setLoading(false);
  }, []);

  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    fetch(`/api/pdv/relatorios?usuarioId=${usuario.id}&inicio=${inicio}&fim=${fim}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((resp) => { if (resp.success) setRelatorio(resp.data); })
      .finally(() => setLoading(false));
  }, [usuario, inicio, fim]);

  if (usuario === null && !loading) {
    return <div className="max-w-md mx-auto p-6 text-center text-gray-500">Complete seu cadastro no app pra usar essa área.</div>;
  }

  if (operador && !temPermissao(operador, "relatorios")) {
    return <SemPermissaoPdv />;
  }

  const variacao = relatorio?.variacaoPercentual;
  const serieDados = (relatorio?.serieDiaria || []).map((p) => ({ ...p, diaCurto: formatarDiaCurto(p.dia) }));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" /> Relatórios</h1>
      </header>
      <PdvSubNav ativa="relatorios" operador={operador} />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {PERIODOS.map((p) => (
            <button
              key={p.chave}
              onClick={() => setPeriodo(p.chave)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border ${
                periodo === p.chave ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 text-sm">
            <input type="date" value={inicioPersonalizado} onChange={(e) => { setInicioPersonalizado(e.target.value); setPeriodo("personalizado"); }} className="border rounded-lg px-2 py-1" />
            <span className="text-gray-400">até</span>
            <input type="date" value={fimPersonalizado} onChange={(e) => { setFimPersonalizado(e.target.value); setPeriodo("personalizado"); }} className="border rounded-lg px-2 py-1" />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-gray-500 py-8">Carregando...</p>
        ) : !relatorio || relatorio.numeroVendas === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow text-gray-500">Nenhuma venda registrada nesse período.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><DollarSign className="w-4 h-4" /> Faturamento</div>
                <p className="text-2xl font-bold text-gray-800">{formatarMoeda(relatorio.faturamentoTotal)}</p>
                {typeof variacao === "number" && (
                  <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${variacao >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {variacao >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(variacao).toFixed(1)}% vs período anterior
                  </p>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Receipt className="w-4 h-4" /> Vendas</div>
                <p className="text-2xl font-bold text-gray-800">{relatorio.numeroVendas}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><TrendingUp className="w-4 h-4" /> Ticket médio</div>
                <p className="text-2xl font-bold text-gray-800">{formatarMoeda(relatorio.ticketMedio)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Faturamento por dia</h2>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={serieDados}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="diaCurto" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<TooltipPadrao />} />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Faturamento por forma de pagamento</h2>
              <div className="space-y-2">
                {Object.entries(relatorio.porFormaPagamento).map(([forma, dados]) => (
                  <div key={forma} className="flex justify-between text-sm">
                    <span className="text-gray-600">{LABEL_PAGAMENTO[forma] || forma} <span className="text-gray-400">({dados.quantidade})</span></span>
                    <span className="font-semibold text-gray-800">{formatarMoeda(dados.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Mais vendidos (por valor)</h2>
              <div className="space-y-2">
                {relatorio.maisVendidosPorValor.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">{p.nome} <span className="text-gray-400">× {p.quantidade}</span></span>
                    <span className="font-semibold text-gray-800 ml-2">{formatarMoeda(p.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
