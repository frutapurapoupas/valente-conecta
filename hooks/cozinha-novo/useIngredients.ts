'use client';

import { useCozinhaData } from './useCozinhaData';

export function useIngredients() {
  const { data, loading, error, create, update, delete: remove, reload } = useCozinhaData<any>('ingredients');
  
  return {
    ingredients: data,
    loading,
    error,
    create,
    update,
    delete: remove,
    reload
  };
}

