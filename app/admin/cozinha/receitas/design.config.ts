export const recipesDesign = {
  titles: {
    main: "📋 Receitas",
    subtitle: "Gerencie os pratos, bolos e doces",
    buttonNew: "+ Nova Receita",
    searchPlaceholder: "Buscar receita...",
    emptyState: "📭 Nenhuma receita encontrada",
    edit: "Editar",
    delete: "Excluir",
    save: "Salvar",
    cancel: "Cancelar",
    editPrice: "Editar Preço"
  },
  
  colors: {
    primary: "#8b5cf6",
    danger: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6"
  },
  
  classes: {
    container: "p-6 bg-gray-50 min-h-screen",
    card: "bg-white rounded-lg shadow-md p-6",
    tableContainer: "overflow-x-auto max-w-full",
    table: "min-w-[800px] divide-y divide-gray-200",
    thead: "bg-gray-50",
    
    // Coluna NOME fixada
    thNome: "sticky left-0 bg-gray-50 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    tdNome: "sticky left-0 bg-white z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900",
    
    // Coluna AÇÕES fixada
    thAcoes: "sticky right-0 bg-gray-50 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    tdAcoes: "sticky right-0 bg-white z-10 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]",
    
    // Demais colunas
    th: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
    td: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
    
    // Botões e inputs
    editPriceButton: "text-blue-600 hover:text-blue-800 text-sm mr-2",
    priceInput: "w-24 border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-purple-500",
    priceDisplay: "cursor-pointer hover:bg-gray-100 px-2 py-1 rounded",
    
    badgeNormal: "px-2 py-1 text-xs rounded-full bg-green-100 text-green-800",
    searchInput: "border border-gray-300 rounded-lg px-4 py-2 w-64"
  },
  
  tableColumns: [
    { key: "name", label: "Nome", stickyLeft: true, width: "250px" },
    { key: "category", label: "Categoria", width: "120px" },
    { key: "price", label: "Preço", width: "120px" },
    { key: "ingredients", label: "Ingredientes", width: "100px" },
    { key: "actions", label: "Ações", stickyRight: true, width: "150px" }
  ],
  
  categoryOptions: [
    { value: "prato", label: "Prato Principal" },
    { value: "sobremesa", label: "Sobremesa" },
    { value: "lanche", label: "Lanche" },
    { value: "bebida", label: "Bebida" }
  ],
  
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
};

export type RecipesDesign = typeof recipesDesign;
