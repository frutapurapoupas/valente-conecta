import { IStorageAdapter, SyncResult } from './index';
import { Ingredient, Recipe, MediaFile } from '@/lib/cozinha/types';
import fs from 'fs';
import path from 'path';

export class LocalAdapter implements IStorageAdapter {
  private dataPath: string;
  
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data');
    this.ensureDataDirectory();
  }
  
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    const files = ['ingredientes.json', 'receitas.json', 'media.json'];
    for (const file of files) {
      const filePath = path.join(this.dataPath, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }
  }
  
  private readJSON<T>(filename: string): T[] {
    const filePath = path.join(this.dataPath, filename);
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  
  private writeJSON<T>(filename: string, data: T[]): void {
    const filePath = path.join(this.dataPath, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
  
  // INGREDIENTES
  async getIngredients(): Promise<Ingredient[]> {
    return this.readJSON<Ingredient>('ingredientes.json');
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
    this.writeJSON('ingredientes.json', ingredients);
    return newIngredient;
  }
  
  async updateIngredient(id: string, ing: Partial<Ingredient>): Promise<Ingredient> {
    const ingredients = await this.getIngredients();
    const index = ingredients.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Ingrediente não encontrado');
    ingredients[index] = { ...ingredients[index], ...ing, updatedAt: new Date().toISOString() };
    this.writeJSON('ingredientes.json', ingredients);
    return ingredients[index];
  }
  
  async deleteIngredient(id: string): Promise<void> {
    const ingredients = await this.getIngredients();
    const filtered = ingredients.filter(i => i.id !== id);
    this.writeJSON('ingredientes.json', filtered);
  }
  
  // RECEITAS
  async getRecipes(): Promise<Recipe[]> {
    return this.readJSON<Recipe>('receitas.json');
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
      ingredients: recipe.ingredients || []
    };
    recipes.push(newRecipe);
    this.writeJSON('receitas.json', recipes);
    return newRecipe;
  }
  
  async updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe> {
    const recipes = await this.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Receita não encontrada');
    recipes[index] = { ...recipes[index], ...recipe, updatedAt: new Date().toISOString() };
    this.writeJSON('receitas.json', recipes);
    return recipes[index];
  }
  
  async deleteRecipe(id: string): Promise<void> {
    const recipes = await this.getRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    this.writeJSON('receitas.json', filtered);
  }
  
  // MÍDIA (implementações básicas)
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

