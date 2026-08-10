"use client";

import { useCallback, useEffect, useState } from "react";

export interface Metrics {
  totalEmpresas: number;
  empresasAtivas: number;
  empresasInadimplentes: number;
  totalAlunos: number;
  alunosAtivos: number;
  receitaMesAtual: number;
  cobrancasPendentesMesAtual: number;
}

export interface AcademiaPlano {
  id: string;
}

export interface Empresa {
  id: string;
  nome: string;
  responsavel: string;
  cidade: string;
  contato: string;
  endereco: string;
  alunos: number;
  ativa: boolean;
  plano_id: string | null;
  dono_nome: string;
  dono_email: string | null;
  dono_telefone: string;
  status_assinatura: string;
  academia_planos?: { id: string; nome: string } | { id: string; nome: string }[] | null;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  plano: string;
  status: string;
  gym_unit_id: string | null;
}

export interface FuncionalidadePivot {
  plano_id: string;
  incluida: boolean;
  gym_funcionalidades: { id: string; label: string } | null;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string | null;
  preco_mensal: number;
  limite_alunos: number | null;
  limite_usuarios_adicionais: number;
  ordem_exibicao: number;
  funcionalidades: FuncionalidadePivot[];
}

export interface Funcionalidade {
  id: string;
  label: string;
}

export interface Cobranca {
  id: string;
  gym_unit_id: string;
  referencia_mes: string;
  valor: number;
  vencimento: string;
  status: string;
  pago_em: string | null;
}

async function chamarApi(body: any) {
  const res = await fetch("/api/academia", {
    method: body.__method || "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data?.success) throw new Error(data?.error || "Erro na operação.");
  return data.data;
}

export function useAcademiaMaster() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, empresasRes, alunosRes, planosRes, funcionalidadesRes, cobrancasRes] = await Promise.all([
        fetch("/api/academia?recurso=metrics", { cache: "no-store" }),
        fetch("/api/academia?recurso=empresas", { cache: "no-store" }),
        fetch("/api/academia?recurso=alunos", { cache: "no-store" }),
        fetch("/api/academia?recurso=planos", { cache: "no-store" }),
        fetch("/api/academia?recurso=funcionalidades", { cache: "no-store" }),
        fetch("/api/academia?recurso=cobrancas", { cache: "no-store" }),
      ]);
      const [metricsData, empresasData, alunosData, planosData, funcionalidadesData, cobrancasData] = await Promise.all([
        metricsRes.json(), empresasRes.json(), alunosRes.json(), planosRes.json(), funcionalidadesRes.json(), cobrancasRes.json(),
      ]);
      setMetrics(metricsData?.data || null);
      setEmpresas(Array.isArray(empresasData?.data) ? empresasData.data : []);
      setAlunos(Array.isArray(alunosData?.data) ? alunosData.data : []);
      setPlanos(Array.isArray(planosData?.data) ? planosData.data : []);
      setFuncionalidades(Array.isArray(funcionalidadesData?.data) ? funcionalidadesData.data : []);
      setCobrancas(Array.isArray(cobrancasData?.data) ? cobrancasData.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const aprovarEmpresa = async (id: string, ativa: boolean) => {
    await chamarApi({ __method: "PUT", recurso: "empresa", id, patch: { ativa } });
    await carregarTudo();
  };

  const definirPlanoEmpresa = async (gymUnitId: string, planoId: string, statusAssinatura?: string) => {
    await chamarApi({ __method: "PUT", recurso: "empresa_plano", gymUnitId, planoId, statusAssinatura });
    await carregarTudo();
  };

  const criarPlano = async (payload: { nome: string; descricao?: string; preco_mensal: number; limite_alunos?: number | null; limite_usuarios_adicionais?: number; ordem_exibicao?: number }) => {
    await chamarApi({ recurso: "planos", ...payload });
    await carregarTudo();
  };

  const atualizarPlano = async (id: string, patch: Partial<Plano>) => {
    await chamarApi({ __method: "PUT", recurso: "plano", id, patch });
    await carregarTudo();
  };

  const alternarFuncionalidadePlano = async (planoId: string, funcionalidadeId: string, incluida: boolean) => {
    await chamarApi({ __method: "PUT", recurso: "funcionalidade_plano", planoId, funcionalidadeId, incluida });
    await carregarTudo();
  };

  const marcarCobrancaStatus = async (cobrancaId: string, status: string) => {
    await chamarApi({ __method: "PUT", recurso: "cobranca_status", cobrancaId, status });
    await carregarTudo();
  };

  const criarCobranca = async (payload: { gym_unit_id: string; referencia_mes: string; valor: number; vencimento: string }) => {
    await chamarApi({ recurso: "cobrancas", ...payload });
    await carregarTudo();
  };

  return {
    metrics, empresas, alunos, planos, funcionalidades, cobrancas, loading,
    recarregar: carregarTudo,
    aprovarEmpresa, definirPlanoEmpresa,
    criarPlano, atualizarPlano, alternarFuncionalidadePlano,
    marcarCobrancaStatus, criarCobranca,
  };
}
