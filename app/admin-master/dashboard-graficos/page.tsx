"use client";

// Caminho: C:\valente_conecta\app\admin-master\dashboard-graficos\page.tsx
//
// Reescrita sobre dados reais — antes todo numero aqui era fixo no codigo
// (1.280 usuarios, R$47,9K de receita, avaliacao media 4.8, satisfacao 89%
// etc., nenhum vindo do banco). Reaproveita os mesmos graficos reais ja
// usados no Dashboard Geral (GraficosUsuarios.tsx) pra nao duplicar logica,
// e adiciona duas visualizacoes que o Dashboard Geral nao tem: evolucao
// semanal de cadastros (agregada a partir dos ultimos 30 dias reais) e
// ranking de cidades por usuarios. "Avaliacao media" e "satisfacao" foram
// removidos por nao existir nenhum sistema de avaliacao/pesquisa no
// projeto — mostrar um numero ali seria inventar dado, nao exibir dado real.

import { BarChart3, LineChart, MapPin, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  GraficoCadastrosPorDia,
  GraficoPorCidade,
  GraficoPorStatus,
  type MetricasUsuarios,
} from "../components/GraficosUsuarios";

interface StatsUsuarios {
  totalUsuarios: number;
  usuariosAtivos: number;
  totalIndicacoes: number;
  indicacoesValidadas: number;
  indicacoesPendentes: number;
}

interface Assinatura {
  status: string;
  valor: number;
  created_at: string;
}

function GraficoEvolucaoSemanal({ dados }: { dados: { label: string; valor: number }[] }) {
  const maxValue = Math.max(...dados.map((d) => d.valor), 1);
  const points = dados.map((d, idx) => `${(idx / Math.max(dados.length - 1, 1)) * 100},${100 - (d.valor / maxValue) * 80}`).join(" ");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <LineChart size={16} className="text-green-600" />
        Novos cadastros por semana (últimas {dados.length} semanas)
      </h3>
      {dados.every((d) => d.valor === 0) ? (
        <p className="text-sm text-gray-500 text-center py-14">Sem cadastros no período.</p>
      ) : (
        <>
          <svg viewBox="0 0 100 50" className="w-full h-32">
            <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" />
            {dados.map((d, idx) => (
              <circle key={idx} cx={(idx / Math.max(dados.length - 1, 1)) * 100} cy={100 - (d.valor / maxValue) * 80} r="2" fill="#10b981" />
            ))}
          </svg>
          <div className="flex justify-between mt-2">
            {dados.map((d, idx) => (
              <span key={idx} className="text-xs text-gray-500">{d.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardGraficos() {
  const [metricasUsuarios, setMetricasUsuarios] = useState<MetricasUsuarios | null>(null);
  const [statsUsuarios, setStatsUsuarios] = useState<StatsUsuarios | null>(null);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [metricasRes, statsRes, assinaturasRes] = await Promise.all([
        fetch("/api/admin-master/usuarios-metricas", { cache: "no-store" }),
        fetch("/api/admin-master/stats-usuarios", { cache: "no-store" }),
        fetch("/api/admin-master/assinaturas-planos", { cache: "no-store" }),
      ]);
      const metricasData = await metricasRes.json();
      setMetricasUsuarios(metricasData?.success ? metricasData.data : null);

      const statsData = await statsRes.json();
      setStatsUsuarios(statsData?.success ? statsData.data : null);

      const assinaturasData = await assinaturasRes.json();
      setAssinaturas(Array.isArray(assinaturasData?.data) ? assinaturasData.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();
  const receitaMes = assinaturas
    .filter((a) => ["ativo", "pago"].includes(a.status))
    .filter((a) => {
      const d = new Date(a.created_at);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((sum, a) => sum + Number(a.valor || 0), 0);
  const assinaturasAtivas = assinaturas.filter((a) => a.status === "ativo").length;

  const totalUsuarios = metricasUsuarios?.totalUsuarios ?? 0;
  const comPlanoAtivo = metricasUsuarios?.comPlanoAtivo ?? 0;
  const taxaConversao = totalUsuarios > 0 ? (comPlanoAtivo / totalUsuarios) * 100 : 0;
  const novosHoje = metricasUsuarios?.cadastrosPorDia?.[metricasUsuarios.cadastrosPorDia.length - 1]?.total ?? 0;

  // Agrega os 30 dias reais de cadastrosPorDia em blocos de 7 dias — mesma
  // fonte do grafico diario, so' que somada por semana.
  const evolucaoSemanal: { label: string; valor: number }[] = [];
  const dias = metricasUsuarios?.cadastrosPorDia ?? [];
  for (let i = 0; i < dias.length; i += 7) {
    const bloco = dias.slice(i, i + 7);
    const valor = bloco.reduce((sum, d) => sum + d.total, 0);
    evolucaoSemanal.push({ label: `${bloco[0]?.data ?? ""}–${bloco[bloco.length - 1]?.data ?? ""}`, valor });
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Gráficos</h1>
          <p className="text-sm text-gray-500">Métricas reais, direto do banco — mesmo critério usado no Dashboard Geral</p>
        </div>
        <button onClick={load} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 flex items-center gap-2 hover:bg-gray-50">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Usuários Totais</p>
          <p className="text-3xl font-bold">{totalUsuarios}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Receita de Assinaturas (mês)</p>
          <p className="text-3xl font-bold">R$ {receitaMes.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Taxa de Plano Ativo</p>
          <p className="text-3xl font-bold">{taxaConversao.toFixed(1)}%</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Indicações</p>
          <p className="text-3xl font-bold">{statsUsuarios?.totalIndicacoes ?? 0}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Novos Hoje</p>
          <p className="text-3xl font-bold">{novosHoje}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricasUsuarios ? (
          <>
            <GraficoCadastrosPorDia dados={metricasUsuarios.cadastrosPorDia} />
            <GraficoPorStatus status={metricasUsuarios.porStatus} />
          </>
        ) : (
          <p className="text-sm text-gray-500 col-span-2">Sem dados de usuários.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoEvolucaoSemanal dados={evolucaoSemanal} />
        {metricasUsuarios && <GraficoPorCidade dados={metricasUsuarios.porCidade} />}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-gray-800">{statsUsuarios?.usuariosAtivos ?? 0}</p>
          <p className="text-sm text-gray-500">Usuários Ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <BarChart3 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
          <p className="text-2xl font-bold text-gray-800">{assinaturasAtivas}</p>
          <p className="text-sm text-gray-500">Assinaturas Ativas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-2xl font-bold text-gray-800">{metricasUsuarios?.porCidade?.length ?? 0}</p>
          <p className="text-sm text-gray-500">Cidades Atendidas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-amber-600" />
          <p className="text-2xl font-bold text-gray-800">{metricasUsuarios?.totalAdmins ?? 0}</p>
          <p className="text-sm text-gray-500">Admins</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        Atualizado em: {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
}
