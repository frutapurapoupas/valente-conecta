// ============================================
// SCRIPT PARA POPULAR INGREDIENTES
// Execute: node scripts/popular_ingredientes.js
// ============================================

const ingredients = [
  // Carnes
  { name: "Carne bovina (coxão mole)", category: "alimento", unit: "kg", currentPrice: 42.90, minStock: 10 },
  { name: "Carne bovina (acém/músculo)", category: "alimento", unit: "kg", currentPrice: 38.90, minStock: 10 },
  { name: "Carne moída", category: "alimento", unit: "kg", currentPrice: 32.90, minStock: 10 },
  { name: "Peito de frango", category: "alimento", unit: "kg", currentPrice: 22.90, minStock: 15 },
  { name: "Frango desfiado", category: "alimento", unit: "kg", currentPrice: 24.90, minStock: 10 },
  
  // Grãos e acompanhamentos
  { name: "Arroz branco", category: "alimento", unit: "kg", currentPrice: 6.50, minStock: 20 },
  { name: "Purê de batata", category: "alimento", unit: "kg", currentPrice: 6.50, minStock: 10 },
  { name: "Batata", category: "alimento", unit: "kg", currentPrice: 4.50, minStock: 15 },
  
  // Legumes típicos da Bahia
  { name: "Cenoura", category: "alimento", unit: "kg", currentPrice: 3.90, minStock: 10 },
  { name: "Abóbora (Bahia)", category: "alimento", unit: "kg", currentPrice: 3.50, minStock: 8 },
  { name: "Maxixe", category: "alimento", unit: "kg", currentPrice: 4.20, minStock: 5 },
  { name: "Quiabo", category: "alimento", unit: "kg", currentPrice: 5.90, minStock: 5 },
  
  // Temperos
  { name: "Alho", category: "tempero", unit: "kg", currentPrice: 12.90, minStock: 3 },
  { name: "Cebola", category: "tempero", unit: "kg", currentPrice: 4.50, minStock: 5 },
  { name: "Coentro", category: "tempero", unit: "kg", currentPrice: 15.90, minStock: 2 },
  { name: "Salsa", category: "tempero", unit: "kg", currentPrice: 13.90, minStock: 2 },
  { name: "Sal", category: "tempero", unit: "kg", currentPrice: 2.50, minStock: 5 },
  
  // Molhos e complementos
  { name: "Creme de leite", category: "alimento", unit: "L", currentPrice: 6.50, minStock: 10 },
  { name: "Extrato de tomate", category: "alimento", unit: "kg", currentPrice: 5.90, minStock: 8 },
  { name: "Creme de milho", category: "alimento", unit: "kg", currentPrice: 7.90, minStock: 8 },
  
  // Embalagem
  { name: "Embalagem plástica", category: "embalagem", unit: "unidade", currentPrice: 0.80, minStock: 200 }
];

async function popularIngredientes() {
  console.log('\n📦 POPULANDO INGREDIENTES...\n');
  
  for (const ing of ingredients) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ing)
      });
      
      if (response.ok) {
        console.log(`✅ ${ing.name} - R$ ${ing.currentPrice}/${ing.unit}`);
      } else {
        console.log(`⚠️ ${ing.name} - já existe`);
      }
    } catch (error) {
      console.log(`❌ Erro ao criar ${ing.name}`);
    }
  }
  
  console.log('\n✅ INGREDIENTES POPULADOS!\n');
}

popularIngredientes();