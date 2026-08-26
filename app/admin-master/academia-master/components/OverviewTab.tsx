"use client";

import { Building2, Users, DollarSign, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { Metrics } from "../hooks/useAcademiaMaster";

function CardMetric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className={`mb-1 ${tone || "text-slate-500"}`}>{icon}</div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function OverviewTab({ metrics }: { metrics: Metrics | null }) {
  if (!metrics) return <p className="text-sm text-gray-500">Sem dados de métricas ainda.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <CardMetric icon={<Building2 size={16} />} label="Academias" value={metrics.totalEmpresas} />
        <CardMetric icon={<CheckCircle2 size={16} />} label="Academias ativas" value={metrics.empresasAtivas} tone="text-green-600" />
        <CardMetric icon={<AlertTriangle size={16} />} label="Inadimplentes" value={metrics.empresasInadimplentes} tone="text-red-600" />
        <CardMetric icon={<Users size={16} />} label="Alunos" value={metrics.totalAlunos} />
        <CardMetric icon={<Users size={16} />} label="Alunos ativos" value={metrics.alunosAtivos} tone="text-green-600" />
        <CardMetric icon={<DollarSign size={16} />} label="Receita do mês" value={`R$ ${Number(metrics.receitaMesAtual || 0).toFixed(2)}`} tone="text-emerald-600" />
        <CardMetric icon={<Clock size={16} />} label="Cobranças pendentes" value={metrics.cobrancasPendentesMesAtual} tone="text-yellow-600" />
      </div>
    </div>
  );
}
