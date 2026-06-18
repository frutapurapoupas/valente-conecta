import { Ingredient, Recipe, MediaFile, SyncResult } from '@/lib/cozinha/types';

export interface IStorageAdapter {
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | null>;
  createIngredient(ing: Omit<Ingredient, 'id' | 'createdAt'>): Promise<Ingredient>;
  updateIngredient(id: string, ing: Partial<Ingredient>): Promise<Ingredient>;
  deleteIngredient(id: string): Promise<void>;
  
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | null>;
  createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
  
  uploadImage(file: File, entityType: string, entityId?: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
  getMediaByEntity(entityId: string, entityType: string): Promise<MediaFile[]>;
  
  isOnline(): Promise<boolean>;
  sync(): Promise<SyncResult>;
  getPendingSyncCount(): Promise<number>;
}

export type StorageMode = 'local' | 'supabase' | 'hybrid';
