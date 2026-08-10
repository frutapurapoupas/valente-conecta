// utils/financeiroUtils.ts
// ??? FUNÇÕES AUXILIARES - Cálculos, filtros e formatação

import { Transacao } from '@/services/financeiroService';

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  margem: number;
  totalRegistros: number;
}

// Calcular totais, saldo e margem
export const calcularResumo = (transacoes: Transacao[]): ResumoFinanceiro => {
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const saldo = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;

  return {
    totalReceitas,
    totalDespesas,
    saldo,
    margem,
    totalRegistros: transacoes.length,
  };
};

// Filtrar transações por período e tipo
export const filtrarTransacoes = (
  transacoes: Transacao[],
  filtroPeriodo: string,
  filtroTipo: string
): Transacao[] => {
  let filtradas = [...transacoes];

  // Filtro por período
  if (filtroPeriodo !== 'todos') {
    const hoje = new Date();
    const inicio = new Date();
    
    if (filtroPeriodo === 'hoje') {
      filtradas = filtradas.filter(t => 
        new Date(t.data).toDateString() === hoje.toDateString()
      );
    } else if (filtroPeriodo === 'semana') {
      inicio.setDate(hoje.getDate() - 7);
      filtradas = filtradas.filter(t => new Date(t.data) >= inicio);
    } else if (filtroPeriodo === 'mes') {
      inicio.setMonth(hoje.getMonth() - 1);
      filtradas = filtradas.filter(t => new Date(t.data) >= inicio);
    }
  }

  // Filtro por tipo
  if (filtroTipo !== 'todos') {
    filtradas = filtradas.filter(t => t.tipo === filtroTipo);
  }

  return filtradas;
};

// Formatar valor em moeda
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

// Formatar data
export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Formatar data completa
export const formatarDataCompleta = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Opções de recorrência
export const opcoesRecorrencia = [
  { value: 'nenhuma', label: 'Nenhuma' },
  { value: 'diária', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual', label: 'Anual' },
];

// Categorias padrão
export const categoriasPadrao = [
  'Vendas', 'Compras', 'Folha', 'Aluguel', 'Contas', 'Outros'
];

// Formas de pagamento
export const formasPagamento = [
  'PIX', 'Dinheiro', 'Cartão', 'Boleto', 'Transferência'
];

// Opções de período para filtro
export const opcoesPeriodo = [
  { value: 'todos', label: 'Todos os períodos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Últimos 7 dias' },
  { value: 'mes', label: 'Último mês' },
];

// Opções de tipo para filtro
export const opcoesTipo = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'receita', label: 'Receitas' },
  { value: 'despesa', label: 'Despesas' },
];

