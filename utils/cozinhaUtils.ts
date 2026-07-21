// utils/cozinhaUtils.ts

import { CompraItem, DashboardStats, Receita, IngredienteReceita, TotaisReceita, DashboardStatsCalculated } from '@/types/cozinha';

// ============================================================
// EXPORTAÇÕES DE TIPOS
// ============================================================
export type { 
  Receita, 
  IngredienteReceita, 
  TotaisReceita,
  DashboardStats,
  DashboardStatsCalculated
};

// ============================================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================================

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

// ============================================================
// FUNÇÕES DE CÁLCULO DE PROGRESSO
// ============================================================

export function calcularProgressoPeso(quantidade: number, meta: number): { percentual: number; falta: number; sobrando: number } {
  if (meta <= 0) return { percentual: 0, falta: 0, sobrando: 0 };
  
  const percentual = (quantidade / meta) * 100;
  const falta = Math.max(0, meta - quantidade);
  const sobrando = Math.max(0, quantidade - meta);
  
  return {
    percentual: Math.min(percentual, 100),
    falta,
    sobrando
  };
}

// ============================================================
// FUNÇÃO DE CÁLCULO DE PORÇÕES
// ============================================================

export function calcularPorcoes(receita: Receita, quantidadePorcoes: number) {
  if (!receita || quantidadePorcoes <= 0) return null;
  
  const ingredientes = receita.ingredientes.map((ing: IngredienteReceita) => ({
    nome: ing.ingrediente_nome,
    quantidade: ing.quantidade * quantidadePorcoes,
    unidade: ing.unidade,
    custo_total: ing.custo_total * quantidadePorcoes
  }));

  const custoTotal = ingredientes.reduce((sum: number, ing: any) => sum + ing.custo_total, 0);

  return {
    porcoes: quantidadePorcoes,
    ingredientes,
    custoTotal,
    custoPorPorcao: custoTotal / quantidadePorcoes
  };
}

// ============================================================
// FUNÇÃO DE CÁLCULO DO DASHBOARD
// ============================================================

export function calcularStatsDashboard(
  pratos: any[],
  insumos: any[],
  producoes: any[],
  financeiro: any
): DashboardStatsCalculated {
  const pratosAtivos = pratos.filter(p => p.ativo !== false).length;
  const pratosInativos = pratos.length - pratosAtivos;
  
  const insumosBaixos = insumos.filter(i => (i.quantidade || 0) < (i.estoque_minimo || 5)).length;
  const totalInsumos = insumos.length;
  
  const producaoPendente = producoes.filter(p => p.status !== 'concluido' && p.status !== 'cancelado').length;
  const producaoConcluida = producoes.filter(p => p.status === 'concluido').length;
  const producaoHoje = producoes.filter(p => {
    const hoje = new Date().toDateString();
    return new Date(p.data_producao).toDateString() === hoje;
  }).length;
  
  const receitaMes = financeiro?.receita_mes || 0;
  const despesaMes = financeiro?.despesa_mes || 0;
  const lucroMes = receitaMes - despesaMes;
  const margem = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0;
  
  return {
    pratosAtivos,
    pratosInativos,
    totalPratos: pratos.length,
    totalInsumos,
    insumosBaixos,
    insumosCriticos: insumos.filter(i => (i.quantidade || 0) < (i.estoque_minimo || 5) / 2).length,
    producaoHoje,
    producaoPendente,
    producaoConcluida,
    receitaMes,
    despesaMes,
    lucroMes,
    margem,
    custoTotal: financeiro?.custo_total || 0,
    precoTotal: financeiro?.preco_total || 0,
    vendasHoje: financeiro?.vendas_hoje || 0,
    vendasMes: financeiro?.vendas_mes || 0,
    ticketMedio: financeiro?.ticket_medio || 0,
    timestamp: new Date()
  };
}

// ============================================================
// FUNÇÃO DE CÁLCULO DE TOTAIS DA RECEITA
// ============================================================

export function calcularTotaisReceita(receita: Receita): TotaisReceita {
  const custoTotal = receita.ingredientes.reduce((sum, ing) => sum + (ing.custo_total || 0), 0);
  const custoPorPorcao = receita.porcoes > 0 ? custoTotal / receita.porcoes : 0;
  const precoTotal = receita.preco_sugerido || 0;
  const lucroTotal = precoTotal - custoTotal;
  const margem = precoTotal > 0 ? (lucroTotal / precoTotal) * 100 : 0;
  
  return {
    custoTotal,
    custoPorPorcao,
    precoTotal,
    lucroTotal,
    margem
  };
}

