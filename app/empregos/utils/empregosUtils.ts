// app/empregos/utils/empregosUtils.ts

import { Vaga, Candidatura, StatusVaga, StatusCandidatura, TipoVaga, Modalidade, NivelExperiencia } from "../types";

// ============================================================================
// FORMATAÇÃO
// ============================================================================

export const formatarSalario = (min?: number, max?: number): string => {
  if (!min && !max) return "A combinar";
  if (min && max) return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`;
  if (min) return `A partir de R$ ${min.toFixed(2)}`;
  return `Até R$ ${max!.toFixed(2)}`;
};

export const formatarData = (data: string): string => {
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

export const formatarDataRelativa = (data: string): string => {
  try {
    const diff = Date.now() - new Date(data).getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Ontem";
    if (dias < 7) return `${dias} dias atrás`;
    if (dias < 30) return `${Math.floor(dias / 7)} semanas atrás`;
    if (dias < 365) return `${Math.floor(dias / 30)} meses atrás`;
    return `${Math.floor(dias / 365)} anos atrás`;
  } catch {
    return data;
  }
};

// ============================================================================
// CORES E BADGES
// ============================================================================

export const getStatusVagaCor = (status: StatusVaga): string => {
  const cores = {
    aberta: "bg-green-100 text-green-700",
    fechada: "bg-red-100 text-red-700",
    em_andamento: "bg-yellow-100 text-yellow-700"
  };
  return cores[status] || "bg-gray-100 text-gray-700";
};

export const getStatusVagaLabel = (status: StatusVaga): string => {
  const labels = {
    aberta: "🟢 Aberta",
    fechada: "🔴 Fechada",
    em_andamento: "🟡 Em andamento"
  };
  return labels[status] || status;
};

export const getStatusCandidaturaCor = (status: StatusCandidatura): string => {
  const cores = {
    pendente: "bg-yellow-100 text-yellow-700",
    analise: "bg-blue-100 text-blue-700",
    aprovada: "bg-green-100 text-green-700",
    rejeitada: "bg-red-100 text-red-700"
  };
  return cores[status] || "bg-gray-100 text-gray-700";
};

export const getStatusCandidaturaLabel = (status: StatusCandidatura): string => {
  const labels = {
    pendente: "⏳ Pendente",
    analise: "🔍 Em análise",
    aprovada: "✅ Aprovada",
    rejeitada: "❌ Rejeitada"
  };
  return labels[status] || status;
};

export const getTipoVagaBadge = (tipo: TipoVaga): string => {
  const badges = {
    CLT: "bg-blue-100 text-blue-700",
    PJ: "bg-purple-100 text-purple-700",
    Freelancer: "bg-orange-100 text-orange-700",
    "Estágio": "bg-green-100 text-green-700",
    "Temporário": "bg-gray-100 text-gray-700"
  };
  return badges[tipo] || "bg-gray-100 text-gray-700";
};

export const getModalidadeBadge = (modalidade: Modalidade): string => {
  const badges = {
    Presencial: "bg-blue-100 text-blue-700",
    Remoto: "bg-green-100 text-green-700",
    Hibrido: "bg-purple-100 text-purple-700"
  };
  return badges[modalidade] || "bg-gray-100 text-gray-700";
};

export const getNivelBadge = (nivel: NivelExperiencia): string => {
  const badges = {
    "Estagiário": "bg-gray-100 text-gray-700",
    "Júnior": "bg-blue-100 text-blue-700",
    "Pleno": "bg-green-100 text-green-700",
    "Sênior": "bg-orange-100 text-orange-700",
    "Especialista": "bg-red-100 text-red-700"
  };
  return badges[nivel] || "bg-gray-100 text-gray-700";
};

// ============================================================================
// FILTROS
// ============================================================================

export const filtrarVagas = (vagas: Vaga[], filtros: any): Vaga[] => {
  return vagas.filter(vaga => {
    // Busca por texto
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      const matchTitulo = vaga.titulo.toLowerCase().includes(termo);
      const matchEmpresa = vaga.empresa.toLowerCase().includes(termo);
      const matchDescricao = vaga.descricao.toLowerCase().includes(termo);
      if (!matchTitulo && !matchEmpresa && !matchDescricao) return false;
    }

    // Filtro por tipo
    if (filtros.tipo && vaga.tipo !== filtros.tipo) return false;

    // Filtro por modalidade
    if (filtros.modalidade && vaga.modalidade !== filtros.modalidade) return false;

    // Filtro por nível
    if (filtros.nivel && vaga.nivel !== filtros.nivel) return false;

    // Filtro por status
    if (filtros.status && vaga.status !== filtros.status) return false;

    // Filtro por localização
    if (filtros.localizacao && !vaga.localizacao.toLowerCase().includes(filtros.localizacao.toLowerCase())) return false;

    // Filtro por salário
    if (filtros.salarioMin && (vaga.salarioMax || 0) < filtros.salarioMin) return false;
    if (filtros.salarioMax && (vaga.salarioMin || 0) > filtros.salarioMax) return false;

    return true;
  });
};

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export const calcularEstatisticasVagas = (vagas: Vaga[]) => {
  const abertas = vagas.filter(v => v.status === "aberta").length;
  const emAndamento = vagas.filter(v => v.status === "em_andamento").length;
  const fechadas = vagas.filter(v => v.status === "fechada").length;
  const totalCandidatos = vagas.reduce((acc, v) => acc + (v.candidatos || 0), 0);

  return {
    total: vagas.length,
    abertas,
    emAndamento,
    fechadas,
    totalCandidatos,
    mediaCandidatos: vagas.length > 0 ? Math.round(totalCandidatos / vagas.length) : 0,
  };
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================

export const validarVaga = (vaga: Partial<Vaga>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];

  if (!vaga.titulo?.trim()) erros.push("Título é obrigatório");
  if (!vaga.empresa?.trim()) erros.push("Empresa é obrigatória");
  if (!vaga.descricao?.trim()) erros.push("Descrição é obrigatória");
  if (!vaga.tipo) erros.push("Tipo de vaga é obrigatório");
  if (!vaga.modalidade) erros.push("Modalidade é obrigatória");
  if (!vaga.nivel) erros.push("Nível de experiência é obrigatório");
  if (!vaga.localizacao?.trim()) erros.push("Localização é obrigatória");
  if (!vaga.status) erros.push("Status é obrigatório");

  return {
    valido: erros.length === 0,
    erros,
  };
};

export const validarCurriculo = (curriculo: Partial<any>): { valido: boolean; erros: string[] } => {
  const erros: string[] = [];

  if (!curriculo.nome?.trim()) erros.push("Nome é obrigatório");
  if (!curriculo.email?.trim()) erros.push("Email é obrigatório");
  if (!curriculo.telefone?.trim()) erros.push("Telefone é obrigatório");
  if (!curriculo.objetivo?.trim()) erros.push("Objetivo é obrigatório");

  return {
    valido: erros.length === 0,
    erros,
  };
};

