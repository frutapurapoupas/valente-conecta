// hooks/cozinha/useFinanceiroPessoal.ts
// 🪝 Lógica de estado - Financeiro Pessoal (TODAS as transações)

import { useState, useEffect, useMemo } from 'react';
import { useFinanceiro } from './useFinanceiro';

export const useFinanceiroPessoal = () => {
  const { transacoes, loading, carregar, criar, atualizar, excluir } = useFinanceiro();
  
  // ✅ REMOVER FILTRO DE CATEGORIA - MOSTRAR TODAS AS TRANSAÇÕES
  const transacoesPessoais = useMemo(() => {
    return transacoes; // ✅ TODAS as transações, sem filtro de categoria
  }, [transacoes]);

  // Calcular totais
  const totais = useMemo(() => {
    const receitas = transacoesPessoais.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
    const despesas = transacoesPessoais.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoesPessoais]);

  // Agrupar por categoria
  const porCategoria = useMemo(() => {
    const grupos: Record<string, number> = {};
    transacoesPessoais.forEach(t => {
      const cat = t.categoria || 'Outros';
      grupos[cat] = (grupos[cat] || 0) + t.valor;
    });
    return grupos;
  }, [transacoesPessoais]);

  // Agrupar por mês
  const porMes = useMemo(() => {
    const meses: Record<string, { receitas: number; despesas: number }> = {};
    transacoesPessoais.forEach(t => {
      const mes = new Date(t.data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!meses[mes]) meses[mes] = { receitas: 0, despesas: 0 };
      if (t.tipo === 'receita') meses[mes].receitas += t.valor;
      else meses[mes].despesas += t.valor;
    });
    return meses;
  }, [transacoesPessoais]);

  return {
    transacoes: transacoesPessoais,
    loading,
    carregar,
    criar,
    atualizar,
    excluir,
    totais,
    porCategoria,
    porMes,
  };
};

