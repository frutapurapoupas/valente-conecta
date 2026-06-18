export const ingredientsDesign = {
  titles: {
    main: "🍳 Ingredientes",
    subtitle: "Gerencie todos os insumos da cozinha",
    buttonNew: "+ Novo Ingrediente",
    searchPlaceholder: "Buscar ingrediente...",
    emptyState: "📭 Nenhum ingrediente encontrado",
    edit: "Editar",
    delete: "Excluir",
    save: "Salvar",
    cancel: "Cancelar"
  },
  
  colors: {
    primary: "#10b981",
    danger: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6"
  },
  
  classes: {
    container: "p-6 bg-gray-50 min-h-screen",
    card: "bg-white rounded-lg shadow-md p-6",
    
    // Container com scroll horizontal
    tableContainer: "overflow-x-auto max-w-full",
    
    table: "min-w-[1300px] divide-y divide-gray-200",
    
    // Cabeçalho fixo
    thead: "bg-gray-50",
    
    // Coluna NOME FIXADA (sticky esquerda)
    thNome: "sticky left-0 bg-gray-50 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    tdNome: "sticky left-0 bg-white z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
    
    // Coluna AÇÕES FIXADA (sticky direita)
    thAcoes: "sticky right-0 bg-gray-50 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    tdAcoes: "sticky right-0 bg-white z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]",
    
    // Demais colunas normais
    th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    td: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    
    badgeNormal: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800",
    badgeLow: "px-2 py-1 text-xs rounded-full bg-red-100 text-red-800",
    searchInput: "border border-gray-300 rounded-lg px-4 py-2 w-64"
  },
  
  // COLUNAS DA TABELA
  tableColumns: [
    { key: "name", label: "Nome", sortable: true, stickyLeft: true, width: "200px" },
    { key: "category", label: "Categoria", sortable: true, width: "120px" },
    { key: "supplier", label: "Fornecedor", sortable: true, width: "150px" },
    { key: "stock", label: "Estoque", sortable: true, width: "100px" },
    { key: "unit", label: "Unidade", sortable: true, width: "100px" },
    { key: "currentPrice", label: "Preço Unit.", sortable: true, width: "110px" },
    { key: "totalValue", label: "Total (R$)", sortable: true, width: "110px" },
    { key: "status", label: "Status", sortable: false, width: "100px" },
    { key: "actions", label: "Ações", sortable: false, stickyRight: true, width: "120px" }
  ],
  
  // LABELS PARA O FORMULÁRIO
  formLabels: {
    name: "Nome do Ingrediente",
    category: "Categoria",
    unit: "Unidade de Medida",
    currentPrice: "Preço Unitário (R$)",
    stock: "Quantidade em Estoque",
    minStock: "Estoque Mínimo",
    supplier: "Fornecedor"
  },
  
  // OPCÕES PARA SELECTS
  categoryOptions: [
    { value: "alimento", label: "Alimento" },
    { value: "tempero", label: "Tempero" },
    { value: "bebida", label: "Bebida" }
  ],
  
  unitOptions: [
    { value: "kg", label: "Quilograma (kg)" },
    { value: "g", label: "Grama (g)" },
    { value: "L", label: "Litro (L)" },
    { value: "ml", label: "Mililitro (ml)" },
    { value: "unidade", label: "Unidade" },
    { value: "pacote", label: "Pacote" },
    { value: "caixa", label: "Caixa" }
  ],
  
  // FORMATAÇÃO
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },
  
  formatNumber: (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  },
  
  calculateTotalValue: (price: number, stock: number): number => {
    return (price || 0) * (stock || 0);
  }
};

export type IngredientsDesign = typeof ingredientsDesign;
