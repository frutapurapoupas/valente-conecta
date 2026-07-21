export interface Ingredient {
  id: string;
  name: string;
  category: 'alimento' | 'tempero' | 'bebida';
  unit: string;
  currentPrice: number;
  stock: number;
  minStock: number;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'prato' | 'sobremesa' | 'bebida' | 'lanche';
  ingredients: RecipeIngredient[];
  images: string[];
  video?: string;
  preparationTime: number;
  servings: number;
  isAvailable: boolean;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

