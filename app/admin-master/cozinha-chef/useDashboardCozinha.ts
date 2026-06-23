"use client";

import { useEffect, useState } from 'react';

export type PratoFinanceiro = {
  id: string;
  nome: string;
  preco: number;
  custoIngredientes: number;
  custosFixos: number;
  enviadoProducao: number;
};

export function useDashboardCozinha() {
  const [pratos, setPratos] = useState<PratoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [faturamentoBruto, setFaturamentoBruto] = useState(0);
  const [custoTotal, setCustoTotal] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [rentabilidadeGeral, setRentabilidadeGeral] = useState(0);

  useEffect(() => {
    fetch('/api/cozinha/pratos')
      .then(res => res.json())
      .then((data: PratoFinanceiro[]) => {
        setPratos(data);
        
        // MATEMÁTICA FINANCEIRA ISOLADA
        const totalFaturamento = data.reduce((acc, prato) => acc + (prato.preco * prato.enviadoProducao), 0);
        const totalCustos = data.reduce((acc, prato) => acc + ((prato.custoIngredientes + prato.custosFixos) * prato.enviadoProducao), 0);
        const totalLucro = totalFaturamento - totalCustos;
        const porcentagemRentabilidade = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;

        setFaturamentoBruto(totalFaturamento);
        setCustoTotal(totalCustos);
        setLucroLiquido(totalLucro);
        setRentabilidadeGeral(porcentagemRentabilidade);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro na lógica do Dashboard:", err);
        setLoading(false);
      });
  }, []);

  return {
    pratos,
    loading,
    faturamentoBruto,
    custoTotal,
    lucroLiquido,
    rentabilidadeGeral
  };
}
