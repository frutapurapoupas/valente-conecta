// ============================================
// TIPOS PARA SISTEMA DE ESTOQUE E COZINHA
// ============================================

export interface Supplier {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  currentPrice: number;
  createdAt: Date;
  updatedAt: Date;
  supplies?: IngredientSupplier[];
}

export interface IngredientSupplier {
  id: string;
  ingredientId: string;
  supplierId: string;
  price: number;
  isPrimary: boolean;
  ingredient?: Ingredient;
  supplier?: Supplier;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  costPrice?: number;
  profitMargin?: number;
  isActive: boolean;
  image?: string;
  preparationTime?: number;
  createdAt: Date;
  updatedAt: Date;
  recipeItems?: RecipeItem[];
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  cost?: number;
  ingredient?: Ingredient;
}

export interface MenuItem {
  id: string;
  recipeId: string;
  dayOfWeek?: number;
  period?: string;
  isAvailable: boolean;
  customPrice?: number;
  recipe?: Recipe;
}

export interface Purchase {
  id: string;
  supplierId: string;
  date: Date;
  status: string;
  totalAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  supplier?: Supplier;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  ingredientId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ingredient?: Ingredient;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId?: string;
  createdAt: Date;
  ingredient?: Ingredient;
}

export interface DashboardStats {
  lowStockItems: Ingredient[];
  lowStockCount: number;
  totalRecipes: number;
  activeRecipes: number;
  totalSuppliers: number;
  pendingPurchases: number;
}

export interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minStock: number;
  neededQuantity: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  estimatedCost: number;
}

