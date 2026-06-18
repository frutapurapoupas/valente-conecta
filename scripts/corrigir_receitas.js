// ============================================
// SCRIPT PARA ATUALIZAR RECEITAS
// ============================================

const recipeIngredients = {
  "Picadinho de carne + arroz + legumes": [
    { nome: "Carne bovina (coxão mole)", quantidade: 0.200, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.150, unidade: "kg" },
    { nome: "Cenoura", quantidade: 0.070, unidade: "kg" },
    { nome: "Abóbora (Bahia)", quantidade: 0.070, unidade: "kg" },
    { nome: "Alho", quantidade: 0.002, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.002, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.001, unidade: "kg" },
    { nome: "Sal", quantidade: 0.005, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Frango em cubos + arroz + purê": [
    { nome: "Peito de frango", quantidade: 0.200, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.140, unidade: "kg" },
    { nome: "Purê de batata", quantidade: 0.140, unidade: "kg" },
    { nome: "Alho", quantidade: 0.004, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.004, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.002, unidade: "kg" },
    { nome: "Sal", quantidade: 0.006, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Carne moída + arroz + legumes": [
    { nome: "Carne moída", quantidade: 0.200, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.140, unidade: "kg" },
    { nome: "Maxixe", quantidade: 0.070, unidade: "kg" },
    { nome: "Quiabo", quantidade: 0.070, unidade: "kg" },
    { nome: "Alho", quantidade: 0.004, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.004, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.002, unidade: "kg" },
    { nome: "Sal", quantidade: 0.006, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Strogonoff de frango + arroz": [
    { nome: "Peito de frango", quantidade: 0.200, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.185, unidade: "kg" },
    { nome: "Creme de leite", quantidade: 0.050, unidade: "L" },
    { nome: "Extrato de tomate", quantidade: 0.050, unidade: "kg" },
    { nome: "Alho", quantidade: 0.004, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.004, unidade: "kg" },
    { nome: "Salsa", quantidade: 0.002, unidade: "kg" },
    { nome: "Sal", quantidade: 0.005, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Carne de panela + arroz + purê": [
    { nome: "Carne bovina (acém/músculo)", quantidade: 0.200, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.140, unidade: "kg" },
    { nome: "Purê de batata", quantidade: 0.140, unidade: "kg" },
    { nome: "Alho", quantidade: 0.004, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.004, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.002, unidade: "kg" },
    { nome: "Sal", quantidade: 0.006, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Frango em cubos + arroz": [
    { nome: "Peito de frango", quantidade: 0.250, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.230, unidade: "kg" },
    { nome: "Alho", quantidade: 0.006, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.006, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.003, unidade: "kg" },
    { nome: "Sal", quantidade: 0.005, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Escondidinho de frango (purê batata)": [
    { nome: "Frango desfiado", quantidade: 0.200, unidade: "kg" },
    { nome: "Purê de batata", quantidade: 0.280, unidade: "kg" },
    { nome: "Alho", quantidade: 0.006, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.006, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.003, unidade: "kg" },
    { nome: "Sal", quantidade: 0.005, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ],
  "Fricassê de Frango": [
    { nome: "Frango desfiado", quantidade: 0.200, unidade: "kg" },
    { nome: "Creme de milho", quantidade: 0.150, unidade: "kg" },
    { nome: "Arroz branco", quantidade: 0.130, unidade: "kg" },
    { nome: "Alho", quantidade: 0.004, unidade: "kg" },
    { nome: "Cebola", quantidade: 0.004, unidade: "kg" },
    { nome: "Coentro", quantidade: 0.002, unidade: "kg" },
    { nome: "Sal", quantidade: 0.005, unidade: "kg" },
    { nome: "Embalagem plástica", quantidade: 1, unidade: "unidade" }
  ]
};

async function corrigirReceitas() {
  console.log('\n🔧 CORRIGINDO RECEITAS...\n');
  
  const ingResp = await fetch('http://localhost:3000/api/admin/ingredients');
  const ingredientes = await ingResp.json();
  const ingMap = {};
  ingredientes.forEach(ing => { ingMap[ing.name] = ing; });
  
  const recResp = await fetch('http://localhost:3000/api/admin/recipes');
  const receitas = await recResp.json();
  
  let atualizadas = 0;
  
  for (const receita of receitas) {
    const lista = recipeIngredients[receita.name];
    if (!lista) continue;
    
    const items = [];
    let custoTotal = 0;
    
    for (const item of lista) {
      const ing = ingMap[item.nome];
      if (ing) {
        custoTotal += item.quantidade * ing.currentPrice;
        items.push({ ingredientId: ing.id, quantity: item.quantidade, unit: item.unidade });
      }
    }
    
    const updateBody = {
      id: receita.id,
      name: receita.name,
      description: receita.description,
      category: receita.category,
      sellingPrice: receita.sellingPrice,
      preparationTime: receita.preparationTime,
      isActive: receita.isActive,
      items: items
    };
    
    const response = await fetch('http://localhost:3000/api/admin/recipes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody)
    });
    
    if (response.ok) {
      atualizadas++;
      console.log(`✅ ${receita.name} - Custo: R$ ${custoTotal.toFixed(2)} - Lucro: R$ ${(receita.sellingPrice - custoTotal).toFixed(2)}`);
    }
  }
  
  console.log(`\n✅ ${atualizadas} receitas atualizadas!\n`);
}

corrigirReceitas();
