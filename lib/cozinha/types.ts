export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  alt?: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  entityId?: string;
  entityType?: 'ingredient' | 'recipe';
  isThumbnail?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'alimento' | 'tempero' | 'bebida';
  unit: string;
  currentPrice: number;
  stock: number;
  minStock: number;
  supplier?: string;           // NOVO: nome do fornecedor
  image?: MediaFile;
  createdAt: string;
  updatedAt?: string;
  _syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'prato' | 'sobremesa' | 'bebida' | 'lanche';
  ingredients: RecipeIngredient[];
  images: MediaFile[];
  video?: MediaFile;
  preparationTime: number;
  servings: number;
  isAvailable: boolean;
  featured: boolean;
  tags: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt: string;
  updatedAt?: string;
  _syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'ingredient' | 'recipe' | 'media';
  entityId: string;
  data: any;
  timestamp: string;
  retries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SyncResult {
  success: number;
  failed: number;
  errors?: string[];
}

// Canonical aliases used by modules that already consume lib/cozinha/types.
export type ReceitaCanonica = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  imagem: string | null;
  status: 'ativo' | 'inativo';
  ingredientes: Array<{
    ingrediente_id: string;
    ingrediente_nome: string;
    quantidade: number;
    unidade: string;
    custo_unitario: number;
    custo_total: number;
  }>;
  rendimento: number;
  peso_final: number | null;
  porcoes: number;
  custo_receita: number;
  custo_por_unidade: number;
  margem_percentual: number;
  lucro: number;
  preco_sugerido: number;
  preco_venda: number;
  integracoes: {
    catalogo: boolean;
    cardapio: boolean;
    producao: boolean;
    estoque: boolean;
    compras: boolean;
  };
  created_at: string;
  updated_at: string;
};

export type CanonicalRecipe = ReceitaCanonica;


