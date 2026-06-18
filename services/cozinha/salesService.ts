// services/cozinha/salesService.ts
// Responsabilidade: Buscar vendas/pedidos da API real
// NÃO contém cores, textos ou estilos

export interface PaymentMethod {
  type: 'pix' | 'dinheiro' | 'debito' | 'credito' | 'fiado';
  valor: number;
}

export interface Sale {
  id: string;
  clienteId: string;
  clienteNome: string;
  valor: number;
  data: string;
  status: 'pendente' | 'preparando' | 'entregue' | 'cancelado';
  paymentMethod: PaymentMethod;
  items: Array<{ produtoId: string; nome: string; quantidade: number; preco: number }>;
}

export interface PaymentStats {
  pix: { total: number; quantidade: number };
  dinheiro: { total: number; quantidade: number };
  debito: { total: number; quantidade: number };
  credito: { total: number; quantidade: number };
  fiado: { total: number; quantidade: number };
}

export async function fetchSales(): Promise<Sale[]> {
  try {
    const response = await fetch('/api/cozinha/pedidos');
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
}

export async function getPaymentStats(sales: Sale[]): Promise<PaymentStats> {
  const stats: PaymentStats = {
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

export async function getSalesStats(sales: Sale[]) {
  const hoje = new Date().toISOString().split('T')[0];
  
  const vendasHoje = sales.filter(s => s.data.split('T')[0] === hoje);
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
  
  // Produtos mais vendidos
  const produtosVendidos = new Map<string, { nome: string; quantidade: number; receita: number }>();
  sales.forEach(sale => {
    sale.items?.forEach(item => {
      const existente = produtosVendidos.get(item.produtoId);
      if (existente) {
        existente.quantidade += item.quantidade;
        existente.receita += item.quantidade * item.preco;
      } else {
        produtosVendidos.set(item.produtoId, {
          nome: item.nome,
          quantidade: item.quantidade,
          receita: item.quantidade * item.preco
        });
      }
    });
  });
  
  const topProdutos = Array.from(produtosVendidos.values())
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);
  
  // Vendas por dia da semana
  const vendasPorDia = [0, 0, 0, 0, 0, 0, 0];
  sales.forEach(sale => {
    const dia = new Date(sale.data).getDay();
    vendasPorDia[dia] += sale.valor;
  });
  
  return {
    faturamentoHoje,
    faturamentoMes,
    totalPedidosHoje,
    totalPedidosMes,
    ticketMedio,
    topProdutos,
    vendasPorDia: [
      { name: 'Dom', vendas: vendasPorDia[0] },
      { name: 'Seg', vendas: vendasPorDia[1] },
      { name: 'Ter', vendas: vendasPorDia[2] },
      { name: 'Qua', vendas: vendasPorDia[3] },
      { name: 'Qui', vendas: vendasPorDia[4] },
      { name: 'Sex', vendas: vendasPorDia[5] },
      { name: 'Sab', vendas: vendasPorDia[6] }
    ]
  };
}
