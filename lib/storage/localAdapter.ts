import { IStorageAdapter, SyncResult } from './index';
import { Ingredient, Recipe, MediaFile } from '@/lib/cozinha/types';
import fs from 'fs';
import path from 'path';

export class LocalAdapter implements IStorageAdapter {
  private dataPath: string;
  
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data');
  }
  
  async getIngredients(): Promise<Ingredient[]> {
    const filePath = path.join(this.dataPath, 'ingredientes.json');
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  
  async getIngredient(id: string): Promise<Ingredient | null> {
    const ingredients = await this.getIngredients();
    return ingredients.find(i => i.id === id) || null;
  }
  
  async createIngredient(ing: Omit<Ingredient, 'id' | 'createdAt'>): Promise<Ingredient> {
    const ingredients = await this.getIngredients();
    const newIngredient: Ingredient = {
      ...ing,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    ingredients.push(newIngredient);
    const filePath = path.join(this.dataPath, 'ingredientes.json');
    fs.writeFileSync(filePath, JSON.stringify(ingredients, null, 2));
    return newIngredient;
  }
  
  async updateIngredient(id: string, ing: Partial<Ingredient>): Promise<Ingredient> {
    const ingredients = await this.getIngredients();
    const index = ingredients.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Ingrediente não encontrado');
    ingredients[index] = { ...ingredients[index], ...ing, updatedAt: new Date().toISOString() };
    const filePath = path.join(this.dataPath, 'ingredientes.json');
    fs.writeFileSync(filePath, JSON.stringify(ingredients, null, 2));
    return ingredients[index];
  }
  
  async deleteIngredient(id: string): Promise<void> {
    const ingredients = await this.getIngredients();
    const filtered = ingredients.filter(i => i.id !== id);
    const filePath = path.join(this.dataPath, 'ingredientes.json');
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
  }
  
  async getRecipes(): Promise<Recipe[]> {
    const filePath = path.join(this.dataPath, 'receitas.json');
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  
  async getRecipe(id: string): Promise<Recipe | null> {
    const recipes = await this.getRecipes();
    return recipes.find(r => r.id === id) || null;
  }
  
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const recipes = await this.getRecipes();
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    const filePath = path.join(this.dataPath, 'receitas.json');
    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    return newRecipe;
  }
  
  async updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe> {
    const recipes = await this.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Receita não encontrada');
    recipes[index] = { ...recipes[index], ...recipe, updatedAt: new Date().toISOString() };
    const filePath = path.join(this.dataPath, 'receitas.json');
    fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
    return recipes[index];
  }
  
  async deleteRecipe(id: string): Promise<void> {
    const recipes = await this.getRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    const filePath = path.join(this.dataPath, 'receitas.json');
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
  }
  
  async uploadImage(file: File, entityType: string, entityId?: string): Promise<string> {
    return '/uploads/temp/placeholder.jpg';
  }
  
  async deleteImage(url: string): Promise<void> {}
  
  async getMediaByEntity(entityId: string, entityType: string): Promise<MediaFile[]> {
    return [];
  }
  
  async isOnline(): Promise<boolean> {
    return true;
  }
  
  async getPendingSyncCount(): Promise<number> {
    return 0;
  }
  
  async sync(): Promise<SyncResult> {
    return { success: 0, failed: 0 };
  }
}
