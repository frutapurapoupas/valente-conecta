// ============================================
// SCRIPT PARA POPULAR RECEITAS
// Execute: node scripts/popular_receitas.js
// ============================================

const recipes = [
  {
    name: "Picadinho de carne + arroz + legumes",
    description: "Delicioso picadinho de carne acompanhado de arroz branco e legumes frescos.",
    category: "prato",
    sellingPrice: 18.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Frango em cubos + arroz + purê",
    description: "Delicioso frango em cubos com arroz branco e purê de batata cremoso.",
    category: "prato",
    sellingPrice: 16.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Carne moída + arroz + legumes",
    description: "Saborosa carne moída com arroz e legumes típicos da Bahia (maxixe e quiabo).",
    category: "prato",
    sellingPrice: 17.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Strogonoff de frango + arroz",
    description: "Cremoso strogonoff de frango com arroz branco.",
    category: "prato",
    sellingPrice: 17.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Carne de panela + arroz + purê",
    description: "Macia carne de panela com arroz e purê de batata.",
    category: "prato",
    sellingPrice: 18.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Frango em cubos + arroz",
    description: "Frango em cubos saboroso com arroz branco soltinho.",
    category: "prato",
    sellingPrice: 14.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Escondidinho de frango (purê batata)",
    description: "Delicioso escondidinho de frango com purê de batata gratinado.",
    category: "prato",
    sellingPrice: 16.90,
    preparationTime: 30,
    isActive: true
  },
  {
    name: "Fricassê de Frango",
    description: "Suculento fricassê de frango com creme de milho e arroz.",
    category: "prato",
    sellingPrice: 18.90,
    preparationTime: 30,
    isActive: true
  }
];

async function popularReceitas() {
  console.log('\n🍳 POPULANDO RECEITAS...\n');
  
  for (const recipe of recipes) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
      
      if (response.ok) {
        console.log(`✅ ${recipe.name} - R$ ${recipe.sellingPrice}`);
      } else {
        console.log(`⚠️ ${recipe.name} - já existe`);
      }
    } catch (error) {
      console.log(`❌ Erro ao criar ${recipe.name}`);
    }
  }
  
  console.log('\n✅ RECEITAS POPULADAS!\n');
}

popularReceitas();