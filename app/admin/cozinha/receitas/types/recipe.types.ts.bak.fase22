export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentPrice: number;
  stock: number;
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