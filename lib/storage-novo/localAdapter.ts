import { Ingredient, Recipe } from '@/lib/cozinha-novo/types';
import fs from 'fs';
import path from 'path';

export class LocalAdapter {
  private dataPath: string;
  
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'cozinha-novo');
    this.ensureDataDirectory();
  }
  
  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    const files = ['ingredientes.json', 'receitas.json'];
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
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  
  async getIngredients(): Promise<Ingredient[]> {
    return this.readJSON<Ingredient>('ingredientes.json');
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
  
  async getRecipes(): Promise<Recipe[]> {
    return this.readJSON<Recipe>('receitas.json');
  }
  
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const recipes = await this.getRecipes();
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
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
}

