"use client";

// Caminho: C:\valente_conecta\app\admin-master\components\GraficosUsuarios.tsx
//
// Graficos reais de usuarios (cadastros por dia, por cidade, por status),
// compartilhados entre Dashboard, tela de Metricas e tela de Usuarios —
// pra nao duplicar a mesma logica de grafico em 3 lugares. Segue a
// convencao de cor do skill de dataviz: magnitude (cadastros/cidade) usa
// um unico tom (azul, sequencial); status usa a paleta fixa de status
// (nunca reaproveitada como "serie categorica").

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface MetricasUsuarios {
  totalUsuarios: number;
  novosUltimos7Dias: number;
  comPlanoAtivo: number;
  totalAdmins: number;
  porStatus: { trial: number; viral: number; expirado: number };
  porCidade: { cidade: string; total: number }[];
  cadastrosPorDia: { data: string; total: number }[];
}

const COR_MAGNITUDE = "#2a78d6";
const CORES_STATUS: Record<string, string> = {
  "Trial ativo": "#fab219",
  "Viral ativo": "#0ca30c",
  Expirado: "#d03b3b",
};

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

export function GraficoCadastrosPorDia({ dados }: { dados: MetricasUsuarios["cadastrosPorDia"] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Cadastros por dia (últimos 30 dias)</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
            <XAxis dataKey="data" stroke="#898781" style={{ fontSize: 10 }} interval={4} />
            <YAxis stroke="#898781" style={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<TooltipPadrao />} />
            <Bar dataKey="total" name="Cadastros" fill={COR_MAGNITUDE} radius={[4, 4, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GraficoPorCidade({ dados }: { dados: MetricasUsuarios["porCidade"] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Usuários por cidade</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
            <XAxis type="number" stroke="#898781" style={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="cidade" stroke="#898781" style={{ fontSize: 11 }} width={90} />
            <Tooltip content={<TooltipPadrao />} />
            <Bar dataKey="total" name="Usuários" fill={COR_MAGNITUDE} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GraficoPorStatus({ status }: { status: MetricasUsuarios["porStatus"] }) {
  const dados = [
    { name: "Trial ativo", value: status.trial },
    { name: "Viral ativo", value: status.viral },
    { name: "Expirado", value: status.expirado },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Usuários por status</h3>
      {dados.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">Sem dados ainda.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dados} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {dados.map((d) => (
                  <Cell key={d.name} fill={CORES_STATUS[d.name]} stroke="#fcfcfb" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<TooltipPadrao />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function CardsResumoUsuarios({ metricas }: { metricas: MetricasUsuarios }) {
  const cards = [
    { label: "Total de usuários", valor: metricas.totalUsuarios },
    { label: "Novos (7 dias)", valor: metricas.novosUltimos7Dias },
    { label: "Com plano ativo", valor: metricas.comPlanoAtivo },
    { label: "Admins", valor: metricas.totalAdmins },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-lg font-bold text-gray-800">{c.valor}</p>
          <p className="text-sm text-gray-500">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
