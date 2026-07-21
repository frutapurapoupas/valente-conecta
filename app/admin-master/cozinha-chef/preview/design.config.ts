export const previewDesign = {
  // TITULOS E TEXTOS
  titles: {
    main: 'Preview Cardápio',
    subtitle: 'Gerencie o cardápio que os clientes visualizam',
    emptyDia: 'Nenhum item no cardápio para ',
    addTitle: 'Adicionar ao Cardápio - ',
    legend: 'Este é o cardápio que os clientes visualizam no catálogo público.',
    verPublico: 'Ver Público',
    disponiveis: 'receitas disponíveis',
    itensNoCardapio: 'itens no cardápio',
    periodoLabel: 'Período',
    precoLabel: 'Preço (opcional)',
    diaLabel: 'Dia',
    selectReceita: 'Selecionar receita',
    precoPlaceholder: 'Deixe em branco para usar o preço padrão',
    precoHint: 'Se ficar vazio, será usado o preço padrão da receita.',
    todosAdicionados: 'Todas as receitas já estão no cardápio deste dia',
    addButton: 'Adicionar',
    areaPrincipal: 'O que o cliente verá',
    areaSecundaria: 'Como o administrador altera',
    emptyHint: 'Adicione receitas usando o formulário acima',
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
    container: 'bg-gray-50 min-h-screen px-4 py-4 sm:px-6 sm:py-6',
    maxWidth: 'max-w-7xl mx-auto',

    // Header
    header: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6',
    title: 'text-2xl sm:text-3xl font-bold text-gray-900 leading-tight',
    subtitle: 'text-gray-600 mt-1 text-sm sm:text-base',
    metaInfo: 'text-sm text-gray-500 mt-2',
    btnVerPublico: 'inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium',

    contentGrid: 'grid grid-cols-1 xl:grid-cols-12 gap-6',
    principalCol: 'xl:col-span-8 space-y-4',
    secondaryCol: 'xl:col-span-4',

    sectionLabel: 'inline-flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2',

    // Seletor de dia
    diaSelector: 'bg-white rounded-xl border border-gray-200 p-4 shadow-sm',
    diaSelectorLabel: 'font-semibold text-gray-700',
    diaButton: 'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
    diaButtonActive: 'bg-blue-600 border-blue-600 text-white shadow-sm',
    diaButtonInactive: 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700',

    // Formulario de adicao
    formContainer: 'bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4',
    formTitle: 'text-lg font-semibold text-gray-900',
    formGrid: 'grid grid-cols-1 gap-4',
    formLabel: 'block text-sm font-medium text-gray-700 mb-1',
    formSelect: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    formInput: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    btnAdicionar: 'w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium',

    periodosWrap: 'flex flex-wrap gap-2',
    periodoButton: 'px-3 py-2 rounded-lg text-sm border font-medium transition-colors',
    periodoButtonActive: 'bg-blue-600 border-blue-600 text-white',
    periodoButtonInactive: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100',

    // Lista do cardapio
    cardapioContainer: 'bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm',
    cardapioHeader: 'flex justify-between items-center mb-4 gap-2',
    cardapioTitle: 'text-lg sm:text-xl font-semibold text-gray-900',
    cardapioCount: 'text-sm text-gray-500',

    // Cards
    cardGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    cardItem: 'border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition bg-white',
    cardHeader: 'flex justify-between items-start gap-3',
    cardNome: 'font-semibold text-base sm:text-lg text-gray-900 break-words',
    cardDesc: 'text-sm text-gray-600 mt-1 line-clamp-2',
    cardFooter: 'mt-3 flex justify-between items-center gap-2',
    cardPreco: 'text-base sm:text-lg font-bold text-green-600',
    cardPeriodo: 'text-xs bg-gray-100 px-2 py-1 rounded capitalize text-gray-700',

    // Botao remover
    btnRemover: 'text-red-500 hover:text-red-700 p-1 rounded',

    // Empty state
    emptyState: 'text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50',
    emptyStateSub: 'text-sm mt-1',

    // Legenda
    legendContainer: 'mt-4 text-sm text-gray-500 border-t pt-3',
  },

  // OPCOES DE PERIODO
  periodos: [
    { value: 'almoco', label: 'Almoço' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'lanche', label: 'Lanche' },
  ],

  // FORMATACAO
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },
};

export type PreviewDesign = typeof previewDesign;

