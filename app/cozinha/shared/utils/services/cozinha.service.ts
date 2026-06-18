const API = '/api/cozinha';

export const CozinhaService = {
  // DASHBOARD
  async getDashboard() {
    const res = await fetch(`${API}/dashboard`);
    return res.json();
  },

  // RECEITAS
  async getRecipes() {
    const res = await fetch(`${API}/recipes`);
    return res.json();
  },

  async createRecipe(data: any) {
    const res = await fetch(`${API}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // INGREDIENTES
  async getIngredients() {
    const res = await fetch(`${API}/ingredients`);
    return res.json();
  },

  // COMPRAS
  async getShoppingList() {
    const res = await fetch(`${API}/shopping-list`);
    return res.json();
  },

  // MOVIMENTAÇÕES
  async getStockMovements() {
    const res = await fetch(`${API}/stock-movements`);
    return res.json();
  },

  // ORDERS
  async getOrders() {
    const res = await fetch(`${API}/orders`);
    return res.json();
  },
};