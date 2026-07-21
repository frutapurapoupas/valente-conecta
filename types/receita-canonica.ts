export type ReceitaStatus = 'ativo' | 'inativo';

export interface ReceitaIngredienteCanonico {
  ingrediente_id: string;
  ingrediente_nome: string;
  quantidade: number;
  unidade: string;
  custo_unitario: number;
  custo_total: number;
}

export interface ReceitaIntegracoesCanonicas {
  catalogo: boolean;
  cardapio: boolean;
  producao: boolean;
  estoque: boolean;
  compras: boolean;
}

export interface ReceitaCanonica {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string | null;
  status: ReceitaStatus;
  ingredientes: ReceitaIngredienteCanonico[];
  rendimento: number;
  peso_final: number | null;
  porcoes: number;
  custo_receita: number;
  custo_por_unidade: number;
  margem_percentual: number;
  lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  integracoes: ReceitaIntegracoesCanonicas;
  created_at: string;
  updated_at: string;
}

// Alias em ingles para compatibilidade de naming entre modulos.
export type CanonicalRecipe = ReceitaCanonica;
export type CanonicalRecipeIngredient = ReceitaIngredienteCanonico;

// Contrato de compatibilidade para campos legados durante transicao.
export interface ReceitaCanonicaCompat extends ReceitaCanonica {
  preco?: number;
  custo_total?: number;
  margem?: number;
  ativo?: boolean;
  images?: string[];
  ingredients?: Array<{
    ingredientId?: string;
    ingredientName?: string;
    quantity?: number;
    unit?: string;
    cost?: number;
  }>;
  servings?: number;
  isAvailable?: boolean;
}
