// ============================================
// TYPES - MÃ“DULO COZINHA DONA NEIDE
// ============================================

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentPrice: number;
  stock: number;
  category?: string;
  volumeMl?: number;
  minStock?: number;
}

export interface RecipeItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  category: string;
  ingredients: RecipeItem[];
  descontoParceiro?: number;
  descontoAssinante?: number;
  image?: string;
  preparationTime?: number;
  isActive?: boolean;
}

export interface IngredienteCalculado {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  neededQuantity: number;
  currentStock: number;
  falta: number;
  unitPrice: number;
  totalCost: number;
}

export interface ListaCompraItem {
  id: string;
  recipeName: string;
  ingredientId: string;
  ingredientName: string;
  quantidade: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  currentStock: number;
  status: 'pendente' | 'aprovado' | 'comprado';
  selected: boolean;
  createdAt: string;
}

export interface PurchaseList {
  id: string;
  name: string;
  recipeId: string;
  recipeName: string;
  quantidadeProducao: number;
  createdAt: string;
  status: 'rascunho' | 'aprovado' | 'enviado' | 'comprado';
  items: ListaCompraItem[];
  totalCost: number;
  approvedAt?: string;
  sentAt?: string;
  purchasedAt?: string;
  supplier?: string;
  invoiceNumber?: string;
  purchaseDate?: string;
}

export interface Fornecedor {
  id: string;
  name: string;
  contato?: string;
  telefone?: string;
  email?: string;
}

export type PeriodoType = 'semana' | 'mes' | 'total';

