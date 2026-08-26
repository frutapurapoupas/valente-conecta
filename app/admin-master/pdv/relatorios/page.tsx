"use client";

// Caminho: C:\valente_conecta\app\admin-master\pdv\relatorios\page.tsx
// Relatorio do catalogo colaborativo do PDV pro admin master (ver
// app/api/admin-master/pdv/relatorio-catalogo/route.ts).

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Package, Barcode, Store, Boxes, Search, Users } from "lucide-react";

const COR_MAGNITUDE = "#2a78d6";

const LABEL_SEGMENTO: Record<string, string> = {
  mercado: "Mercado",
  farmacia: "Farmácia",
  auto_pecas: "Auto Peças",
  acougue: "Açougue",
  moda: "Moda",
  papelaria: "Papelaria",
  geral: "Geral",
};

interface Produto {
  id: string;
  nome: string;
  ean: string | null;
  sku: string;
  segmento: string;
  foto_url: string | null;
  comerciantes: number;
  created_at: string;
}

interface Relatorio {
  totais: {
    totalProdutos: number;
    totalComEan: number;
    totalSemEan: number;
    comerciantesAtivos: number;
    totalItensEstoque: number;
  };
  porSegmento: { segmento: string; quantidade: number }[];
  maisReutilizados: Produto[];
  produtos: Produto[];
}

function TooltipPadrao({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-2.5 rounded-lg shadow-lg border border-gray-200 text-sm">
      {label && <p className="font-semibold text-gray-800 mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color || entry.payload?.fill }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function RelatorioCatalogoPage() {
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  const carregar = (termo: string) => {
    fetch(`/api/admin-master/pdv/relatorio-catalogo${termo ? `?busca=${encodeURIComponent(termo)}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setRelatorio(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(""); }, []);

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  if (loading && !relatorio) return <p className="p-6 text-gray-500 text-sm">Carregando...</p>;
  if (!relatorio) return <p className="p-6 text-gray-500 text-sm">Nenhum dado ainda.</p>;

  const { totais, porSegmento, maisReutilizados, produtos } = relatorio;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" /> Catálogo Colaborativo do PDV
        </h1>
        <p className="text-sm text-gray-500">Produtos compartilhados entre todos os comerciantes que usam o PDV.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardStat icone={<Package className="w-4 h-4" />} label="Produtos no catálogo" valor={totais.totalProdutos} />
        <CardStat icone={<Barcode className="w-4 h-4" />} label="Com EAN oficial" valor={totais.totalComEan} />
        <CardStat icone={<Boxes className="w-4 h-4" />} label="SKU gerado (sem EAN)" valor={totais.totalSemEan} />
        <CardStat icone={<Store className="w-4 h-4" />} label="Comerciantes ativos" valor={totais.comerciantesAtivos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Produtos por segmento</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSegmento.map((s) => ({ ...s, label: LABEL_SEGMENTO[s.segmento] || s.segmento }))} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
                <XAxis type="number" stroke="#898781" style={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="label" stroke="#898781" style={{ fontSize: 11 }} width={90} />
                <Tooltip content={<TooltipPadrao />} />
                <Bar dataKey="quantidade" name="Produtos" fill={COR_MAGNITUDE} radius={[0, 4, 4, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" /> Mais reutilizados entre comerciantes
          </h3>
          {maisReutilizados.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              Nenhum produto ainda reutilizado por mais de um comerciante — a colaboração aparece aqui conforme o catálogo cresce.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {maisReutilizados.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                    {p.foto_url && <img src={p.foto_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 truncate text-gray-700">{p.nome}</span>
                  <span className="text-sm font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                    {p.comerciantes} lojas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-800">Todos os produtos ({produtos.length})</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, SKU ou EAN..."
              className="pl-8 pr-3 py-1.5 border rounded-lg text-sm w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-2 pr-2">Produto</th>
                <th className="pb-2 pr-2">Segmento</th>
                <th className="pb-2 pr-2">SKU</th>
                <th className="pb-2 pr-2">EAN</th>
                <th className="pb-2 text-right">Lojas</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                      {p.foto_url && <img src={p.foto_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-gray-700">{p.nome}</span>
                  </td>
                  <td className="py-2 pr-2 text-gray-500">{LABEL_SEGMENTO[p.segmento] || p.segmento}</td>
                  <td className="py-2 pr-2 text-gray-500 font-mono text-sm">{p.sku}</td>
                  <td className="py-2 pr-2 text-gray-500 font-mono text-sm">{p.ean || "—"}</td>
                  <td className="py-2 text-right text-gray-700 font-medium">{p.comerciantes}</td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CardStat({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">{icone} {label}</div>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
    </div>
  );
}
