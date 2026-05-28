"use client";

import { useState, useEffect } from "react";

interface PerfilIA {
  id: number;
  user_id: string;
  nome: string;
  peso_atual: number;
  peso_meta: number;
  altura: number;
  idade: number;
  sexo: string;
  objetivo: string;
  nivel: string;
  freq_semanal: number;
  condicoes_fisicas: string[];
  tipo_exercicio: string[];
  ativo: boolean;
}

export function useAcademiaIA() {
  const [perfil, setPerfil] = useState<PerfilIA | null>(null);
  const [metricasHoje, setMetricasHoje] = useState<any>(null);
  const [planoHoje, setPlanoHoje] = useState<any>(null);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);
  const [scoreRecuperacao, setScoreRecuperacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const perfilSalvo = localStorage.getItem("academia_perfil_ia");
    if (perfilSalvo) {
      setPerfil(JSON.parse(perfilSalvo));
      
      // Gerar recomendações baseadas no perfil
      const imc = JSON.parse(perfilSalvo).peso_atual / ((JSON.parse(perfilSalvo).altura / 100) ** 2);
      
      // Score de recuperação simulado
      setScoreRecuperacao({
        valor: Math.floor(Math.random() * 40) + 60,
        classificacao: "Boa",
        recomendacao: "Continue com os treinos moderados hoje"
      });
      
      // Métricas de hoje
      setMetricasHoje({
        passos: Math.floor(Math.random() * 3000) + 2000,
        freq_cardiaca_media: Math.floor(Math.random() * 20) + 70,
        sono_horas: 7.5,
        tempo_ativo_minutos: Math.floor(Math.random() * 40) + 20
      });
      
      // Recomendações
      setRecomendacoes([
        { id: 1, titulo: "Beba mais água", mensagem: "Você está abaixo da meta de 2.5L hoje", prioridade: "media", tipo: "hidratacao" },
        { id: 2, titulo: "Treino de hoje", mensagem: "Seu treino está programado para às 18h", prioridade: "alta", tipo: "treino" }
      ]);
    }
    setLoading(false);
  };

  const gerarPlanoTreino = () => {
    setPlanoHoje({
      duracao_minutos: 45,
      calorias_estimadas: 350,
      intensidade: "moderado",
      foco_muscular: ["Peito", "Tríceps"],
      sugestao_principal: "Foque em exercícios compostos",
      sugestao_secundaria: "Não esqueça do alongamento pós-treino"
    });
  };

  const marcarRecomendacaoVisualizada = (id: number) => {
    setRecomendacoes(prev => prev.filter(r => r.id !== id));
  };

  return {
    perfil,
    metricasHoje,
    planoHoje,
    recomendacoes,
    scoreRecuperacao,
    loading,
    error,
    gerarPlanoTreino,
    marcarRecomendacaoVisualizada
  };
}
