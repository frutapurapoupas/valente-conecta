// ============================================
// CONSTANTES - MÓDULO INGREDIENTES
// ============================================

export const textosIngredientes = {
  // Títulos da página
  pagina: {
    titulo: 'Ingredientes',
    subtitulo: 'Gerencie os insumos da cozinha'
  },
  
  // Botões
  botoes: {
    novo: 'Novo Ingrediente',
    editar: 'Editar Ingrediente',
    cancelar: 'Cancelar',
    salvar: 'Salvar',
    criar: 'Criar Ingrediente',
    atualizar: 'Atualizar Ingrediente'
  },
  
  // Placeholders
  placeholders: {
    buscar: 'Buscar...',
    nome: 'Ex: Tomate, Arroz, Oleo, Coentro, Ovo'
  },
  
  // Labels dos campos
  labels: {
    nome: 'Nome do Ingrediente',
    categoria: 'Categoria',
    unidade: 'Unidade de Medida',
    preco: 'Preco de Compra (R$)',
    precoAjuda: 'Valor pago por kg',
    estoque: 'Estoque Atual',
    estoqueAjuda: 'Quantidade em estoque',
    estoqueMinimo: 'Estoque Minimo',
    estoqueMinimoAjuda: 'Quando atingir este valor, sera sugerida compra'
  },
  
  // Cabeçalhos da tabela
  tabela: {
    nome: 'Nome',
    categoria: 'Categoria',
    estoque: 'Estoque',
    minimo: 'Minimo',
    preco: 'Preco',
    status: 'Status',
    acoes: 'Acoes'
  },
  
  // Categorias disponíveis
  categorias: {
    alimento: 'Alimento',
    bebida: 'Bebida',
    tempero: 'Tempero'
  },
  
  // Unidades de medida
  unidades: {
    kg: 'Quilograma (kg) - Para pesos grandes',
    g: 'Grama (g) - Para pequenas quantidades',
    L: 'Litro (L) - Para liquidos',
    unidade: 'Unidade - Para itens contados'
  },
  
  // Status do estoque
  status: {
    esgotado: 'Esgotado',
    baixo: 'Baixo',
    normal: 'Normal'
  },
  
  // Mensagens do sistema
  mensagens: {
    erroCarregar: 'Erro ao carregar ingredientes',
    erroSalvar: 'Erro ao salvar ingrediente',
    erroExcluir: 'Erro ao excluir ingrediente',
    sucessoCriar: 'Ingrediente criado com sucesso!',
    sucessoAtualizar: 'Ingrediente atualizado com sucesso!',
    sucessoExcluir: 'Ingrediente excluido com sucesso!',
    confirmarExcluir: 'Tem certeza que deseja excluir este ingrediente?',
    nomeObrigatorio: 'O nome do ingrediente e obrigatorio',
    precoMaiorZero: 'O preco deve ser maior que zero'
  },
  
  // Checkbox
  checkbox: {
    apenasEstoqueBaixo: 'Apenas itens com estoque baixo'
  },
  
  // Ajudas (tooltips)
  ajudas: {
    preco: 'Valor pago por unidade de medida',
    estoque: 'Quantidade atual em estoque',
    estoqueMinimo: 'Quando o estoque atingir este valor, o sistema sugerira compra'
  }
};

// Categorias para selects (array)
export const categoriasList = [
  { value: 'alimento', label: textosIngredientes.categorias.alimento },
  { value: 'bebida', label: textosIngredientes.categorias.bebida },
  { value: 'tempero', label: textosIngredientes.categorias.tempero }
];

// Unidades para selects (array)
export const unidadesList = [
  { value: 'kg', label: textosIngredientes.unidades.kg },
  { value: 'g', label: textosIngredientes.unidades.g },
  { value: 'L', label: textosIngredientes.unidades.L },
  { value: 'unidade', label: textosIngredientes.unidades.unidade }
];