"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, Building2, CreditCard, Wallet, Users } from "lucide-react";
import { useAcademiaMaster } from "./hooks/useAcademiaMaster";
import OverviewTab from "./components/OverviewTab";
import EmpresasTab from "./components/EmpresasTab";
import PlanosTab from "./components/PlanosTab";
import CobrancasTab from "./components/CobrancasTab";
import AlunosTab from "./components/AlunosTab";

type TabId = "overview" | "empresas" | "planos" | "cobrancas" | "alunos";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Visão geral", icon: <LayoutDashboard size={15} /> },
  { id: "empresas", label: "Academias", icon: <Building2 size={15} /> },
  { id: "planos", label: "Planos", icon: <CreditCard size={15} /> },
  { id: "cobrancas", label: "Cobranças", icon: <Wallet size={15} /> },
  { id: "alunos", label: "Alunos", icon: <Users size={15} /> },
];

function AcademiaMasterContent() {
  const searchParams = useSearchParams();
  const tabInicial = (searchParams?.get("tab") as TabId) || "overview";
  const [aba, setAba] = useState<TabId>(TABS.some((t) => t.id === tabInicial) ? tabInicial : "overview");

  const {
    metrics, empresas, alunos, planos, funcionalidades, cobrancas, loading,
    aprovarEmpresa, definirPlanoEmpresa,
    criarPlano, atualizarPlano, alternarFuncionalidadePlano,
    marcarCobrancaStatus, criarCobranca,
  } = useAcademiaMaster();

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando Academia...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Academia — Admin Master</h1>
        <p className="text-gray-500 text-sm">Gestão completa do SaaS de academias: academias parceiras, planos gratuitos e pagos, cobranças e alunos.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === tab.id ? "border-slate-800 text-slate-800" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {aba === "overview" && <OverviewTab metrics={metrics} />}

      {aba === "empresas" && (
        <EmpresasTab empresas={empresas} planos={planos} aprovarEmpresa={aprovarEmpresa} definirPlanoEmpresa={definirPlanoEmpresa} />
      )}

      {aba === "planos" && (
        <PlanosTab
          planos={planos}
          funcionalidades={funcionalidades}
          criarPlano={criarPlano}
          atualizarPlano={atualizarPlano}
          alternarFuncionalidadePlano={alternarFuncionalidadePlano}
        />
      )}

      {aba === "cobrancas" && (
        <CobrancasTab cobrancas={cobrancas} empresas={empresas} marcarCobrancaStatus={marcarCobrancaStatus} criarCobranca={criarCobranca} />
      )}

      {aba === "alunos" && <AlunosTab alunos={alunos} empresas={empresas} />}
    </div>
  );
}

export default function AcademiaMasterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Carregando Academia...</div>}>
      <AcademiaMasterContent />
    </Suspense>
  );
}
