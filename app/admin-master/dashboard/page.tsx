"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bike, Coins, RefreshCw, CreditCard, Users, Radio } from "lucide-react";
import { useUsuariosRealtime } from "@/lib/hooks/useUsuariosRealtime";
import { CardsResumoUsuarios, GraficoCadastrosPorDia, GraficoPorCidade, GraficoPorStatus, type MetricasUsuarios } from "../components/GraficosUsuarios";

interface MotoMetrics {
  activeDrivers: number;
  ridesToday: number;
  pendingPayment: number;
  revenueToday: number;
}

interface MCTransaction {
  valor: number;
  tipo: "pagar" | "receber";
}

interface PlanConfig {
  id: string;
  preco: number | null;
  ativo: boolean;
}

interface PlanosConfigSnapshot {
  settings: {
    unlockContactPrice: number;
    freePhotosPerItem: number;
    basicoPhotosPerItem: number;
    premiumPhotosPerItem: number;
  };
  plans: PlanConfig[];
  services: Array<{ id: string; enabledPlans: string[] }>;
}

interface RevenueProjection {
  basicoAssinantes: number;
  premiumAssinantes: number;
  basicoMensal: number;
  premiumMensal: number;
  totalMensal: number;
}

interface StatsUsuarios {
  totalUsuarios: number;
  usuariosAtivos: number;
  totalIndicacoes: number;
  indicacoesValidadas: number;
  indicacoesPendentes: number;
}

export default function AdminDashboardPage() {
  const [statsUsuarios, setStatsUsuarios] = useState<StatsUsuarios | null>(null);
  const [metricasUsuarios, setMetricasUsuarios] = useState<MetricasUsuarios | null>(null);
  const [motoMetrics, setMotoMetrics] = useState<MotoMetrics | null>(null);
  const [mcMetrics, setMcMetrics] = useState({ entradas: 0, saidas: 0, liquido: 0, total: 0 });
  const [planosSnapshot, setPlanosSnapshot] = useState<PlanosConfigSnapshot | null>(null);
  const [projection, setProjection] = useState<RevenueProjection>({
    basicoAssinantes: 0,
    premiumAssinantes: 0,
    basicoMensal: 0,
    premiumMensal: 0,
    totalMensal: 0
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, motoRes, mcRes, planosRes, profissionaisRes, driversRes, metricasUsuariosRes] = await Promise.all([
        fetch("/api/admin-master/stats-usuarios", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=metrics", { cache: "no-store" }),
        fetch("/api/moeda-conecta/transactions?limit=400", { cache: "no-store" }),
        fetch("/api/planos-config", { cache: "no-store" }),
        fetch("/api/profissionais", { cache: "no-store" }),
        fetch("/api/mototaxi?recurso=drivers", { cache: "no-store" }),
        fetch("/api/admin-master/usuarios-metricas", { cache: "no-store" })
      ]);

      const statsData = await statsRes.json();
      setStatsUsuarios(statsData?.success ? statsData.data : null);

      const metricasUsuariosData = await metricasUsuariosRes.json();
      setMetricasUsuarios(metricasUsuariosData?.success ? metricasUsuariosData.data : null);

      const motoData = await motoRes.json();
      const mcData = await mcRes.json();
      const planosData = await planosRes.json();
      const profissionaisData = await profissionaisRes.json();
      const driversData = await driversRes.json();

      setMotoMetrics(motoData?.data || null);
      setPlanosSnapshot(planosData?.success ? planosData.data : null);

      const txs: MCTransaction[] = Array.isArray(mcData?.data) ? mcData.data : [];
      const entradas = txs.filter((t) => t.tipo === "receber").reduce((sum, t) => sum + Number(t.valor || 0), 0);
      const saidas = txs.filter((t) => t.tipo === "pagar").reduce((sum, t) => sum + Number(t.valor || 0), 0);
      setMcMetrics({
        entradas,
        saidas,
        liquido: entradas - saidas,
        total: txs.length
      });

      const profissionais = Array.isArray(profissionaisData?.data) ? profissionaisData.data : [];
      const drivers = Array.isArray(driversData?.data) ? driversData.data : [];
      const assinantes = [...profissionais, ...drivers];

      const basicoAssinantes = assinantes.filter((item: any) => String(item?.plano || "").toLowerCase() === "basico").length;
      const premiumAssinantes = assinantes.filter((item: any) => String(item?.plano || "").toLowerCase() === "premium").length;
      const basicoPreco = Number((planosData?.data?.plans || []).find((p: any) => p.id === "basico")?.preco || 0);
      const premiumPreco = Number((planosData?.data?.plans || []).find((p: any) => p.id === "premium")?.preco || 0);

      const basicoMensal = Number((basicoAssinantes * basicoPreco).toFixed(2));
      const premiumMensal = Number((premiumAssinantes * premiumPreco).toFixed(2));
      const totalMensal = Number((basicoMensal + premiumMensal).toFixed(2));

      setProjection({
        basicoAssinantes,
        premiumAssinantes,
        basicoMensal,
        premiumMensal,
        totalMensal
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useUsuariosRealtime(load);

  const planoById = (planId: string) => planosSnapshot?.plans?.find((p) => p.id === planId) || null;
  const basico = planoById("basico");
  const premium = planoById("premium");
  const ativos = (planosSnapshot?.plans || []).filter((p) => p.ativo).length;
  const servicos = (planosSnapshot?.services || []).length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Geral</h1>
          <p className="text-sm text-gray-500">Resumo para tomada de decisão do Admin Master</p>
        </div>
        <button onClick={load} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Carregando métricas...</div>
      ) : (
        <>
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
              <Users size={16} /> Usuários e Indicações
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <MetricCard label="Total de usuários" value={statsUsuarios?.totalUsuarios ?? 0} />
              <MetricCard label="Usuários ativos" value={statsUsuarios?.usuariosAtivos ?? 0} />
              <MetricCard label="Total de indicações" value={statsUsuarios?.totalIndicacoes ?? 0} />
              <MetricCard label="Indicações validadas" value={statsUsuarios?.indicacoesValidadas ?? 0} />
              <MetricCard label="Indicações pendentes" value={statsUsuarios?.indicacoesPendentes ?? 0} />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              "Ativo" = trial dentro do prazo, viral ativo dentro do prazo, ou admin. "Validada" = quem foi
              indicado ainda está com acesso ativo (mesmo critério usado no extrato de indicações do usuário).
            </p>
          </section>

          {metricasUsuarios && (
            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <Users size={16} /> Cadastros em detalhe
                </div>
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <Radio className="w-3 h-3 animate-pulse" /> Ao vivo
                </span>
              </div>
              <CardsResumoUsuarios metricas={metricasUsuarios} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <GraficoCadastrosPorDia dados={metricasUsuarios.cadastrosPorDia} />
                <GraficoPorCidade dados={metricasUsuarios.porCidade} />
                <GraficoPorStatus status={metricasUsuarios.porStatus} />
              </div>
              <Link href="/admin-master/usuarios" className="text-xs text-blue-600 hover:underline mt-3 inline-block">
                Ver lista completa de usuários
              </Link>
            </section>
          )}

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
              <Bike size={16} /> Moto Táxi
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <MetricCard label="Motoristas ativos" value={motoMetrics?.activeDrivers || 0} />
              <MetricCard label="Corridas hoje" value={motoMetrics?.ridesToday || 0} />
              <MetricCard label="Pag. pendentes" value={motoMetrics?.pendingPayment || 0} />
              <MetricCard label="Receita hoje" value={`R$ ${Number(motoMetrics?.revenueToday || 0).toFixed(2)}`} />
            </div>
            <div className="mt-3">
              <Link href="/admin-master/mototaxi" className="text-xs text-blue-600 hover:underline">Abrir gestão completa do Moto Táxi</Link>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
              <Coins size={16} /> Moeda Conecta
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <MetricCard label="Transações" value={mcMetrics.total} />
              <MetricCard label="Entradas" value={`R$ ${mcMetrics.entradas.toFixed(2)}`} />
              <MetricCard label="Saídas" value={`R$ ${mcMetrics.saidas.toFixed(2)}`} />
              <MetricCard label="Líquido" value={`R$ ${mcMetrics.liquido.toFixed(2)}`} />
            </div>
            <div className="mt-3">
              <Link href="/admin-master/moeda-conecta/transacoes" className="text-xs text-blue-600 hover:underline">Abrir relatório com PDF</Link>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
              <CreditCard size={16} /> Planos e Assinaturas
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <MetricCard label="Planos ativos" value={ativos} />
              <MetricCard label="Serviços mapeados" value={servicos} />
              <MetricCard label="Basico" value={`R$ ${Number(basico?.preco || 0).toFixed(2)}`} />
              <MetricCard label="Premium" value={`R$ ${Number(premium?.preco || 0).toFixed(2)}`} />
              <MetricCard label="Desbloqueio" value={`R$ ${Number(planosSnapshot?.settings?.unlockContactPrice || 0).toFixed(2)}`} />
            </div>

            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-800">Projecao Mensal de Receita (assinaturas)</p>
              <p className="text-xs text-emerald-700 mt-0.5">Calculo: quantidade de assinantes por plano x valor do plano configurado.</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <MetricCard label={`Basico (${projection.basicoAssinantes} assinantes)`} value={`R$ ${projection.basicoMensal.toFixed(2)}`} />
                <MetricCard label={`Premium (${projection.premiumAssinantes} assinantes)`} value={`R$ ${projection.premiumMensal.toFixed(2)}`} />
                <MetricCard label="Receita mensal prevista" value={`R$ ${projection.totalMensal.toFixed(2)}`} />
              </div>
              <p className="text-[11px] text-emerald-700 mt-2">
                Base atual considerada: profissionais + motoristas cadastrados com plano basico/premium.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              <Link href="/admin-master/planos" className="text-xs text-blue-600 hover:underline">Controlar planos liberados por serviço</Link>
              <Link href="/planos" className="text-xs text-blue-600 hover:underline">Abrir visão pública de planos</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-lg font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

