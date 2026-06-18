// app/admin/cozinha/dashboard/design.config.ts
// Responsabilidade: Apenas cores, textos, classes CSS e formatação
// NÃO contém lógica de dados

export const dashboardDesign = {
  // TÍTULOS E TEXTOS
  titles: {
    main: "Dashboard Cozinha",
    subtitle: "Visão executiva da cozinha",
    refresh: "Atualizar",
    loading: "Carregando dados...",
    error: "Erro ao carregar dados.",
    retry: "Tentar novamente"
  },
  
  // RÓTULOS DOS CARDS
  labels: {
    // Ingredientes
    totalIngredients: "Total Ingredientes",
    lowStock: "Estoque Baixo",
    stockValue: "Valor em Estoque",
    avgPrice: "Preço Médio",
    
    // Vendas
    revenueToday: "Faturamento Hoje",
    revenueMonth: "Faturamento do Mês",
    ordersToday: "Pedidos Hoje",
    ordersMonth: "Pedidos no Mês",
    averageTicket: "Ticket Médio",
    topProducts: "Produtos Mais Vendidos",
    salesByDay: "Vendas por Dia",
    
    // Pagamentos
    paymentMethods: "Métodos de Pagamento",
    paymentByValue: "Pagamentos por Valor (R$)",
    paymentByCount: "Pagamentos por Quantidade",
    pix: "PIX",
    dinheiro: "Dinheiro",
    debito: "Débito",
    credito: "Crédito",
    fiado: "Fiado",
    
    // Clientes
    totalClients: "Total Clientes",
    clientSpending: "Total Gasto por Clientes",
    clientAverageTicket: "Ticket Médio por Cliente",
    topClients: "Clientes que Mais Gastam",
    
    // Alertas
    alerts: "Alertas do Sistema",
    
    // Tabelas
    product: "Produto",
    quantity: "Quantidade",
    revenue: "Receita",
    client: "Cliente",
    spent: "Gasto Total",
    method: "Método",
    amount: "Valor",
    count: "Quantidade",
    
    // Status
    inStock: "em estoque",
    units: "unidades"
  },
  
  // CORES DOS GRADIENTES DOS CARDS
  cardColors: {
    ingredients: "from-green-500 to-green-600",
    lowStock: "from-red-500 to-red-600",
    stockValue: "from-blue-500 to-blue-600",
    avgPrice: "from-teal-500 to-teal-600",
    revenueToday: "from-emerald-500 to-emerald-600",
    revenueMonth: "from-cyan-500 to-cyan-600",
    ordersToday: "from-indigo-500 to-indigo-600",
    averageTicket: "from-purple-500 to-purple-600",
    totalClients: "from-pink-500 to-pink-600"
  },
  
  // CORES DOS GRÁFICOS
  chartColors: {
    primary: "#10b981",
    barFill: "#10b981",
    pieColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
    paymentColors: {
      pix: "#10b981",
      dinheiro: "#f59e0b",
      debito: "#3b82f6",
      credito: "#8b5cf6",
      fiado: "#ef4444"
    }
  },
  
  // CLASSES CSS (Tailwind)
  classes: {
    container: "p-6 bg-gray-50 min-h-screen",
    header: "flex justify-between items-center mb-6",
    card: "rounded-2xl shadow-lg p-6 text-white",
    cardIcon: "bg-white/20 rounded-full p-3",
    refreshButton: "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition",
    chartContainer: "bg-white rounded-2xl shadow-lg p-6",
    chartTitle: "text-lg font-semibold mb-4",
    alertContainer: "mt-6 bg-white rounded-2xl shadow-lg p-6",
    alertBox: "p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800",
    tableContainer: "overflow-x-auto",
    table: "min-w-full divide-y divide-gray-200",
    th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    td: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    grid4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
    grid2: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8",
    grid3: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8",
    topItem: "flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg",
    topItemNumber: "w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold",
    topItemName: "font-medium",
    topItemQuantity: "text-sm text-gray-500",
    topItemValue: "font-bold text-green-600",
    topItemLabel: "text-xs text-gray-400",
    paymentItem: "flex items-center justify-between p-3 rounded-lg",
    paymentBadge: "px-2 py-1 text-xs rounded-full",
    miniCard: "bg-white rounded-lg shadow p-4 text-center"
  },
  
  // FORMATAÇÃO
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },
  
  formatNumber: (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  },
  
  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  },
  
  formatPercent: (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }
};

export type DashboardDesign = typeof dashboardDesign;
