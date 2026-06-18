// services/cozinha/dashboardCalculator.ts
// Responsabilidade: Unificar dados e calcular métricas do dashboard

import { Ingredient } from '@/lib/cozinha/types';

export interface DashboardMetrics {
  totalIngredientes: number;
  valorEstoque: number;
  itensEstoqueBaixo: number;
  precoMedioIngredientes: number;
  faturamentoHoje: number;
  faturamentoMes: number;
  totalPedidosHoje: number;
  totalPedidosMes: number;
  ticketMedio: number;
  topProdutos: Array<{ nome: string; quantidade: number; receita: number }>;
  vendasPorDia: Array<{ name: string; vendas: number }>;
  paymentStats: any;
  pagamentosParaGrafico: Array<{ name: string; valor: number; quantidade: number; cor: string }>;
  totalClientes: number;
  totalGastoClientes: number;
  ticketMedioCliente: number;
  topClientes: Array<{ nome: string; totalGasto: number; pedidos: number }>;
  alerts: Array<{ type: string; message: string }>;
}

export async function getIngredientsStats(ingredients: Ingredient[]) {
  const total = ingredients.length;
  const totalValue = ingredients.reduce((sum, i) => sum + (i.currentPrice * i.stock), 0);
  const lowStock = ingredients.filter(i => i.stock <= i.minStock).length;
  const avgPrice = total > 0 ? ingredients.reduce((sum, i) => sum + i.currentPrice, 0) / total : 0;
  return { total, totalValue, lowStock, avgPrice };
}

export async function getPaymentStats(sales: any[]) {
  const stats = {
    pix: { total: 0, quantidade: 0 },
    dinheiro: { total: 0, quantidade: 0 },
    debito: { total: 0, quantidade: 0 },
    credito: { total: 0, quantidade: 0 },
    fiado: { total: 0, quantidade: 0 }
  };
  
  sales.forEach(sale => {
    const method = sale.paymentMethod?.type;
    const valor = sale.paymentMethod?.valor || sale.valor;
    if (method && stats[method]) {
      stats[method].total += valor;
      stats[method].quantidade += 1;
    }
  });
  
  return stats;
}

export async function getSalesStats(sales: any[]) {
  const hoje = new Date().toISOString().split('T')[0];
  
  const vendasHoje = sales.filter(s => s.data?.split('T')[0] === hoje);
  const faturamentoHoje = vendasHoje.reduce((sum, s) => sum + s.valor, 0);
  const totalPedidosHoje = vendasHoje.length;
  
  const vendasMes = sales.filter(s => {
    const data = new Date(s.data);
    const agora = new Date();
    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
  });
  const faturamentoMes = vendasMes.reduce((sum, s) => sum + s.valor, 0);
  const totalPedidosMes = vendasMes.length;
  const ticketMedio = totalPedidosHoje > 0 ? faturamentoHoje / totalPedidosHoje : 0;
  
  const vendasPorDia = [
    { name: 'Dom', vendas: 0 }, { name: 'Seg', vendas: 0 }, { name: 'Ter', vendas: 0 },
    { name: 'Qua', vendas: 0 }, { name: 'Qui', vendas: 0 }, { name: 'Sex', vendas: 0 },
    { name: 'Sab', vendas: 0 }
  ];
  
  sales.forEach(sale => {
    const dia = new Date(sale.data).getDay();
    vendasPorDia[dia].vendas += sale.valor;
  });
  
  return {
    faturamentoHoje,
    faturamentoMes,
    totalPedidosHoje,
    totalPedidosMes,
    ticketMedio,
    topProdutos: [],
    vendasPorDia
  };
}

export async function getClientsStats(clients: any[]) {
  const total = clients.length;
  const totalGasto = clients.reduce((sum, c) => sum + (c.totalGasto || 0), 0);
  const ticketMedioCliente = total > 0 ? totalGasto / total : 0;
  const topClientes = [...clients].sort((a, b) => (b.totalGasto || 0) - (a.totalGasto || 0)).slice(0, 5);
  
  return { total, totalGasto, ticketMedioCliente, topClientes };
}

export async function calculateDashboardMetrics(
  ingredients: Ingredient[],
  sales: any[],
  clients: any[]
): Promise<DashboardMetrics> {
  const ingredientsStats = await getIngredientsStats(ingredients);
  const salesStats = await getSalesStats(sales);
  const paymentStats = await getPaymentStats(sales);
  const clientsStats = await getClientsStats(clients);
  
  const pagamentosParaGrafico = [
    { name: 'PIX', valor: paymentStats.pix.total, quantidade: paymentStats.pix.quantidade, cor: '#10b981' },
    { name: 'Dinheiro', valor: paymentStats.dinheiro.total, quantidade: paymentStats.dinheiro.quantidade, cor: '#f59e0b' },
    { name: 'Débito', valor: paymentStats.debito.total, quantidade: paymentStats.debito.quantidade, cor: '#3b82f6' },
    { name: 'Crédito', valor: paymentStats.credito.total, quantidade: paymentStats.credito.quantidade, cor: '#8b5cf6' },
    { name: 'Fiado', valor: paymentStats.fiado.total, quantidade: paymentStats.fiado.quantidade, cor: '#ef4444' }
  ];
  
  const alerts: Array<{ type: string; message: string }> = [];
  if (ingredientsStats.lowStock > 0) {
    alerts.push({ type: 'warning', message: `${ingredientsStats.lowStock} ingrediente(s) com estoque baixo` });
  }
  
  return {
    totalIngredientes: ingredientsStats.total,
    valorEstoque: ingredientsStats.totalValue,
    itensEstoqueBaixo: ingredientsStats.lowStock,
    precoMedioIngredientes: ingredientsStats.avgPrice,
    faturamentoHoje: salesStats.faturamentoHoje,
    faturamentoMes: salesStats.faturamentoMes,
    totalPedidosHoje: salesStats.totalPedidosHoje,
    totalPedidosMes: salesStats.totalPedidosMes,
    ticketMedio: salesStats.ticketMedio,
    topProdutos: salesStats.topProdutos,
    vendasPorDia: salesStats.vendasPorDia,
    paymentStats,
    pagamentosParaGrafico,
    totalClientes: clientsStats.total,
    totalGastoClientes: clientsStats.totalGasto,
    ticketMedioCliente: clientsStats.ticketMedioCliente,
    topClientes: clientsStats.topClientes,
    alerts
  };
}
