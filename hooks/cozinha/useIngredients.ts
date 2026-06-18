'use client';

import { useHybridData } from './useHybridData';
import { Ingredient } from '@/lib/cozinha/types';

export interface IngredientWithTotal extends Ingredient {
  totalValue: number;
}

export function useIngredients() {
  const { data, loading, error, create, update, delete: remove, reload } = useHybridData<Ingredient>('ingredients');
  
  // Adicionar campo totalValue a cada ingrediente
  const ingredientsWithTotal: IngredientWithTotal[] = (data || []).map(ing => ({
    ...ing,
    totalValue: (ing.currentPrice || 0) * (ing.stock || 0)
  }));
  
  const getLowStock = () => ingredientsWithTotal.filter(i => i.stock <= i.minStock);
  const getByCategory = (category: string) => ingredientsWithTotal.filter(i => i.category === category);
  const getBySupplier = (supplier: string) => ingredientsWithTotal.filter(i => i.supplier === supplier);
  const getTotalValue = () => ingredientsWithTotal.reduce((sum, i) => sum + i.totalValue, 0);
  
  // Lista única de fornecedores para filtro
  const getSuppliers = () => {
    const suppliers = new Set<string>();
    ingredientsWithTotal.forEach(i => {
      if (i.supplier) suppliers.add(i.supplier);
    });
    return Array.from(suppliers).sort();
  };
  
  return {
    ingredients: ingredientsWithTotal,
    loading,
    error,
    lowStock: getLowStock(),
    totalValue: getTotalValue(),
    suppliers: getSuppliers(),
    create,
    update,
    delete: remove,
    reload,
    getByCategory,
    getBySupplier
  };
}
