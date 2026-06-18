// services/cozinha/ingredientsService.ts
// Responsabilidade: Buscar ingredientes da API real
// NÃO contém cores, textos ou estilos

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentPrice: number;
  stock: number;
  minStock: number;
  createdAt: string;
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  try {
    const response = await fetch('/api/cozinha/ingredients');
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error);
    return [];
  }
}

export async function getIngredientsStats(ingredients: Ingredient[]) {
  const total = ingredients.length;
  const totalValue = ingredients.reduce((sum, i) => sum + (i.currentPrice * i.stock), 0);
  const lowStock = ingredients.filter(i => i.stock <= i.minStock).length;
  const avgPrice = total > 0 ? ingredients.reduce((sum, i) => sum + i.currentPrice, 0) / total : 0;
  
  return { total, totalValue, lowStock, avgPrice };
}
