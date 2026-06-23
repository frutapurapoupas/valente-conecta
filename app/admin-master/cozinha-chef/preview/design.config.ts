export const previewDesign = {
  // TÍTULOS E TEXTOS
  titles: {
    main: "📅 Preview Cardápio",
    subtitle: "Gerencie o cardápio que os clientes veem",
    emptyDia: "Nenhum item no cardápio para ",
    addTitle: "➕ Adicionar ao Cardápio - ",
    legend: "💡 Este é o cardápio que os clientes veem em /cozinha",
    verPublico: "👁️ Ver Público",
    disponiveis: "receitas disponíveis",
    itensNoCardapio: "itens no cardápio",
    periodoLabel: "Período",
    precoLabel: "Preço (opcional)",
    selectReceita: "Selecione uma receita",
    precoPlaceholder: "Deixe em branco para usar o padrão",
    todosAdicionados: "✅ Todas as receitas já estão no cardápio deste dia"
  },

  // LABELS DOS DIAS
  diasSemana: [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' }
  ],

  // CORES
  colors: {
    primary: "#3b82f6",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
    background: "#f9fafb",
    cardBg: "#ffffff",
    text: "#1f2937",
    textLight: "#6b7280",
    border: "#e5e7eb"
  },

  // CLASSES CSS (Tailwind)
  classes: {
    container: "p-6 bg-gray-50 min-h-screen",
    maxWidth: "max-w-6xl mx-auto",
    
    // Header
    header: "flex justify-between items-center mb-8",
    title: "text-3xl font-bold text-gray-900",
    subtitle: "text-gray-600 mt-1",
    metaInfo: "text-sm text-gray-400 mt-1",
    btnVerPublico: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors",
    
    // Seletor de dia
    diaSelector: "bg-white rounded-lg shadow-md p-6 mb-6",
    diaSelectorLabel: "font-semibold text-gray-700 mr-2",
    diaButton: "px-4 py-2 rounded-lg transition-colors",
    diaButtonActive: "bg-blue-600 text-white",
    diaButtonInactive: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    
    // Formulário de adição
    formContainer: "bg-white rounded-lg shadow-md p-6 mb-6",
    formTitle: "text-xl font-semibold mb-4",
    formGrid: "grid grid-cols-1 md:grid-cols-4 gap-4",
    formLabel: "block text-sm font-medium text-gray-700 mb-1",
    formSelect: "w-full border border-gray-300 rounded-lg px-4 py-2",
    formInput: "w-full border border-gray-300 rounded-lg px-4 py-2",
    btnAdicionar: "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50",
    
    // Lista do cardápio
    cardapioContainer: "bg-white rounded-lg shadow-md p-6",
    cardapioHeader: "flex justify-between items-center mb-4",
    cardapioTitle: "text-xl font-semibold",
    cardapioCount: "text-sm text-gray-400",
    
    // Cards
    cardGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    cardItem: "border rounded-lg p-4 hover:shadow-md transition",
    cardHeader: "flex justify-between items-start",
    cardNome: "font-semibold text-lg",
    cardDesc: "text-sm text-gray-600 mt-1",
    cardFooter: "mt-3 flex justify-between items-center",
    cardPreco: "text-lg font-bold text-green-600",
    cardPeriodo: "text-xs bg-gray-100 px-2 py-1 rounded",
    
    // Botão remover
    btnRemover: "text-red-400 hover:text-red-600",
    
    // Empty state
    emptyState: "text-center py-12 text-gray-500",
    emptyStateSub: "text-sm mt-2",
    
    // Legenda
    legendContainer: "mt-4 text-sm text-gray-500 text-center border-t pt-4"
  },

  // OPÇÕES DE PERÍODO
  periodos: [
    { value: "almoco", label: "Almoço" },
    { value: "jantar", label: "Jantar" },
    { value: "lanche", label: "Lanche" }
  ],

  // FORMATAÇÃO
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
};

export type PreviewDesign = typeof previewDesign;