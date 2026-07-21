// app/empregos/hooks/useEmpregos.ts

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Vaga, Curriculo, Candidatura, FiltrosVaga } from "../types";

// ============================================================================
// HOOK PRINCIPAL - LÃ“GICA PURA
// ============================================================================

export function useEmpregos() {
  // ==========================================================================
  // ESTADOS
  // ==========================================================================

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [curriculos, setCurriculos] = useState<Curriculo[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosVaga>({});
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [curriculoAtivo, setCurriculoAtivo] = useState<Curriculo | null>(null);

  // ==========================================================================
  // CARREGAR DADOS
  // ==========================================================================

  const carregarVagas = useCallback(async () => {
    try {
      const response = await fetch('/api/empregos/vagas');
      const data = await response.json();
      if (data.success) {
        setVagas(data.data);
      } else {
        // Fallback para dados mock
        setVagas(mockVagas);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
      setVagas(mockVagas);
    }
  }, []);

  const carregarCurriculos = useCallback(async () => {
    try {
      const response = await fetch('/api/empregos/curriculos');
      const data = await response.json();
      if (data.success) {
        setCurriculos(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar currÃ­culos:", error);
    }
  }, []);

  const carregarCandidaturas = useCallback(async () => {
    try {
      const response = await fetch('/api/empregos/candidaturas');
      const data = await response.json();
      if (data.success) {
        setCandidaturas(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar candidaturas:", error);
    }
  }, []);

  // ==========================================================================
  // CRUD VAGAS
  // ==========================================================================

  const criarVaga = useCallback(async (vaga: Omit<Vaga, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const response = await fetch('/api/empregos/vagas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaga),
      });
      const data = await response.json();
      if (data.success) {
        setVagas(prev => [data.data, ...prev]);
        toast.success("âœ… Vaga criada com sucesso!");
        return data.data;
      }
      toast.error("Erro ao criar vaga");
      return null;
    } catch (error) {
      toast.error("Erro ao criar vaga");
      return null;
    }
  }, []);

  const atualizarVaga = useCallback(async (id: string, dados: Partial<Vaga>) => {
    try {
      const response = await fetch(`/api/empregos/vagas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const data = await response.json();
      if (data.success) {
        setVagas(prev => prev.map(v => v.id === id ? { ...v, ...dados } : v));
        toast.success("âœ… Vaga atualizada!");
        return data.data;
      }
      toast.error("Erro ao atualizar vaga");
      return null;
    } catch (error) {
      toast.error("Erro ao atualizar vaga");
      return null;
    }
  }, []);

  const excluirVaga = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/empregos/vagas/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setVagas(prev => prev.filter(v => v.id !== id));
        toast.success("ðŸ—‘ï¸ Vaga removida!");
        return true;
      }
      toast.error("Erro ao remover vaga");
      return false;
    } catch (error) {
      toast.error("Erro ao remover vaga");
      return false;
    }
  }, []);

  // ==========================================================================
  // CRUD CURRÃCULOS
  // ==========================================================================

  const criarCurriculo = useCallback(async (curriculo: Omit<Curriculo, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const response = await fetch('/api/empregos/curriculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curriculo),
      });
      const data = await response.json();
      if (data.success) {
        setCurriculos(prev => [data.data, ...prev]);
        setCurriculoAtivo(data.data);
        toast.success("âœ… CurrÃ­culo cadastrado!");
        return data.data;
      }
      toast.error("Erro ao criar currÃ­culo");
      return null;
    } catch (error) {
      toast.error("Erro ao criar currÃ­culo");
      return null;
    }
  }, []);

  // ==========================================================================
  // CANDIDATURA
  // ==========================================================================

  const candidatar = useCallback(async (vagaId: string, curriculoId?: string) => {
    try {
      const response = await fetch('/api/empregos/candidaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vagaId, curriculoId }),
      });
      const data = await response.json();
      if (data.success) {
        setCandidaturas(prev => [data.data, ...prev]);
        toast.success("âœ… Candidatura realizada com sucesso!");
        return data.data;
      }
      toast.error("Erro ao candidatar-se");
      return null;
    } catch (error) {
      toast.error("Erro ao candidatar-se");
      return null;
    }
  }, []);

  // ==========================================================================
  // FILTROS
  // ==========================================================================

  const aplicarFiltros = useCallback((novosFiltros: Partial<FiltrosVaga>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  // ==========================================================================
  // DADOS MOCK (FALLBACK)
  // ==========================================================================

  const mockVagas: Vaga[] = [
    {
      id: "1",
      titulo: "Desenvolvedor Full Stack Pleno",
      empresa: "Tech Solutions",
      descricao: "Desenvolvimento de aplicaÃ§Ãµes web com React, Next.js e Node.js",
      requisitos: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"],
      beneficios: ["Vale alimentaÃ§Ã£o", "Vale transporte", "Plano de saÃºde", "Home office"],
      tipo: "CLT",
      modalidade: "Remoto",
      nivel: "Pleno",
      salarioMin: 8000,
      salarioMax: 12000,
      localizacao: "Remoto",
      status: "aberta",
      dataPublicacao: new Date().toISOString(),
      criadoPor: "admin",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      candidatos: 15,
    },
    {
      id: "2",
      titulo: "UX/UI Designer SÃªnior",
      empresa: "Design Pro",
      descricao: "CriaÃ§Ã£o de interfaces e experiÃªncia para produtos digitais",
      requisitos: ["Figma", "Adobe XD", "Design System", "Pesquisa UX", "PrototipaÃ§Ã£o"],
      beneficios: ["Vale alimentaÃ§Ã£o", "Plano de saÃºde", "BÃ´nus anual"],
      tipo: "PJ",
      modalidade: "HÃ­brido",
      nivel: "SÃªnior",
      salarioMin: 10000,
      salarioMax: 15000,
      localizacao: "SÃ£o Paulo, SP",
      status: "aberta",
      dataPublicacao: new Date().toISOString(),
      criadoPor: "admin",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      candidatos: 8,
    },
    {
      id: "3",
      titulo: "Analista de Dados JÃºnior",
      empresa: "Data Insights",
      descricao: "AnÃ¡lise de dados, criaÃ§Ã£o de dashboards e relatÃ³rios",
      requisitos: ["SQL", "Python", "Power BI", "Excel", "EstatÃ­stica"],
      beneficios: ["Vale alimentaÃ§Ã£o", "Vale transporte", "Home office"],
      tipo: "CLT",
      modalidade: "Presencial",
      nivel: "JÃºnior",
      salarioMin: 4500,
      salarioMax: 6000,
      localizacao: "Belo Horizonte, MG",
      status: "em_andamento",
      dataPublicacao: new Date().toISOString(),
      criadoPor: "admin",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      candidatos: 22,
    },
  ];

  // ==========================================================================
  // INICIALIZAÃ‡ÃƒO
  // ==========================================================================

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await Promise.all([
        carregarVagas(),
        carregarCurriculos(),
        carregarCandidaturas(),
      ]);
      setLoading(false);
    };
    carregarDados();
  }, []);

  // ==========================================================================
  // RETORNO
  // ==========================================================================

  return {
    // Estados
    vagas,
    curriculos,
    candidaturas,
    loading,
    filtros,
    vagaSelecionada,
    curriculoAtivo,

    // AÃ§Ãµes
    carregarVagas,
    carregarCurriculos,
    carregarCandidaturas,
    criarVaga,
    atualizarVaga,
    excluirVaga,
    criarCurriculo,
    candidatar,
    aplicarFiltros,
    limparFiltros,
    setVagaSelecionada,
    setCurriculoAtivo,
  };
}

