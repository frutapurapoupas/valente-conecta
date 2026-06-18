const ingredientes = {
  "Carne bovina (coxão mole)": { id: null, price: 42.90 },
  "Carne bovina (acém/músculo)": { id: null, price: 38.90 },
  "Carne moída": { id: null, price: 32.90 },
  "Peito de frango": { id: null, price: 22.90 },
  "Frango desfiado": { id: null, price: 24.90 },
  "Arroz branco": { id: null, price: 6.50 },
  "Purê de batata": { id: null, price: 6.50 },
  "Cenoura": { id: null, price: 3.90 },
  "Abóbora (Bahia)": { id: null, price: 3.50 },
  "Maxixe": { id: null, price: 4.20 },
  "Quiabo": { id: null, price: 5.90 },
  "Alho": { id: null, price: 12.90 },
  "Cebola": { id: null, price: 4.50 },
  "Coentro": { id: null, price: 15.90 },
  "Salsa": { id: null, price: 13.90 },
  "Sal": { id: null, price: 2.50 },
  "Creme de leite": { id: null, price: 6.50 },
  "Extrato de tomate": { id: null, price: 5.90 },
  "Creme de milho": { id: null, price: 7.90 },
  "Embalagem plástica": { id: null, price: 0.80 }
};

const recipes = [
  {
    name: "Picadinho de carne + arroz + legumes",
    price: 18.90,
    desc: "Delicioso picadinho de carne acompanhado de arroz branco e legumes frescos.",
    items: [
      { nome: "Carne bovina (coxão mole)", q: 0.200, u: "kg" },
      { nome: "Arroz branco", q: 0.150, u: "kg" },
      { nome: "Cenoura", q: 0.070, u: "kg" },
      { nome: "Abóbora (Bahia)", q: 0.070, u: "kg" },
      { nome: "Alho", q: 0.002, u: "kg" },
      { nome: "Cebola", q: 0.002, u: "kg" },
      { nome: "Coentro", q: 0.001, u: "kg" },
      { nome: "Sal", q: 0.005, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Frango em cubos + arroz + purê",
    price: 16.90,
    desc: "Delicioso frango em cubos com arroz branco e purê de batata cremoso.",
    items: [
      { nome: "Peito de frango", q: 0.200, u: "kg" },
      { nome: "Arroz branco", q: 0.140, u: "kg" },
      { nome: "Purê de batata", q: 0.140, u: "kg" },
      { nome: "Alho", q: 0.004, u: "kg" },
      { nome: "Cebola", q: 0.004, u: "kg" },
      { nome: "Coentro", q: 0.002, u: "kg" },
      { nome: "Sal", q: 0.006, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Carne moída + arroz + legumes",
    price: 17.90,
    desc: "Saborosa carne moída com arroz e legumes típicos da Bahia.",
    items: [
      { nome: "Carne moída", q: 0.200, u: "kg" },
      { nome: "Arroz branco", q: 0.140, u: "kg" },
      { nome: "Maxixe", q: 0.070, u: "kg" },
      { nome: "Quiabo", q: 0.070, u: "kg" },
      { nome: "Alho", q: 0.004, u: "kg" },
      { nome: "Cebola", q: 0.004, u: "kg" },
      { nome: "Coentro", q: 0.002, u: "kg" },
      { nome: "Sal", q: 0.006, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Strogonoff de frango + arroz",
    price: 17.90,
    desc: "Cremoso strogonoff de frango com arroz branco.",
    items: [
      { nome: "Peito de frango", q: 0.200, u: "kg" },
      { nome: "Arroz branco", q: 0.185, u: "kg" },
      { nome: "Creme de leite", q: 0.050, u: "L" },
      { nome: "Extrato de tomate", q: 0.050, u: "kg" },
      { nome: "Alho", q: 0.004, u: "kg" },
      { nome: "Cebola", q: 0.004, u: "kg" },
      { nome: "Salsa", q: 0.002, u: "kg" },
      { nome: "Sal", q: 0.005, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Carne de panela + arroz + purê",
    price: 18.90,
    desc: "Macia carne de panela com arroz e purê de batata.",
    items: [
      { nome: "Carne bovina (acém/músculo)", q: 0.200, u: "kg" },
      { nome: "Arroz branco", q: 0.140, u: "kg" },
      { nome: "Purê de batata", q: 0.140, u: "kg" },
      { nome: "Alho", q: 0.004, u: "kg" },
      { nome: "Cebola", q: 0.004, u: "kg" },
      { nome: "Coentro", q: 0.002, u: "kg" },
      { nome: "Sal", q: 0.006, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Frango em cubos + arroz",
    price: 14.90,
    desc: "Frango em cubos saboroso com arroz branco soltinho.",
    items: [
      { nome: "Peito de frango", q: 0.250, u: "kg" },
      { nome: "Arroz branco", q: 0.230, u: "kg" },
      { nome: "Alho", q: 0.006, u: "kg" },
      { nome: "Cebola", q: 0.006, u: "kg" },
      { nome: "Coentro", q: 0.003, u: "kg" },
      { nome: "Sal", q: 0.005, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Escondidinho de frango (purê batata)",
    price: 16.90,
    desc: "Delicioso escondidinho de frango com purê de batata gratinado.",
    items: [
      { nome: "Frango desfiado", q: 0.200, u: "kg" },
      { nome: "Purê de batata", q: 0.280, u: "kg" },
      { nome: "Alho", q: 0.006, u: "kg" },
      { nome: "Cebola", q: 0.006, u: "kg" },
      { nome: "Coentro", q: 0.003, u: "kg" },
      { nome: "Sal", q: 0.005, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  },
  {
    name: "Fricassê de Frango",
    price: 18.90,
    desc: "Suculento fricassê de frango com creme de milho e arroz.",
    items: [
      { nome: "Frango desfiado", q: 0.200, u: "kg" },
      { nome: "Creme de milho", q: 0.150, u: "kg" },
      { nome: "Arroz branco", q: 0.130, u: "kg" },
      { nome: "Alho", q: 0.004, u: "kg" },
      { nome: "Cebola", q: 0.004, u: "kg" },
      { nome: "Coentro", q: 0.002, u: "kg" },
      { nome: "Sal", q: 0.005, u: "kg" },
      { nome: "Embalagem plástica", q: 1, u: "unidade" }
    ]
  }
];

async function criarReceitas() {
  console.log("\n🔧 CRIANDO RECEITAS...\n");

  // Buscar IDs dos ingredientes
  const ingResp = await fetch("http://localhost:3000/api/admin/ingredients");
  const ings = await ingResp.json();
  ings.forEach(ing => { if (ingredientes[ing.name]) ingredientes[ing.name].id = ing.id; });

  let criadas = 0;
  for (const rec of recipes) {
    const items = [];
    let custoTotal = 0;

    for (const item of rec.items) {
      const ing = ingredientes[item.nome];
      if (ing && ing.id) {
        items.push({ ingredientId: ing.id, quantity: item.q, unit: item.u });
        custoTotal += item.q * ing.price;
      } else {
        console.log(`   ⚠️ Ingrediente não encontrado: ${item.nome}`);
      }
    }

    const body = {
      name: rec.name,
      description: rec.desc,
      category: "prato",
      sellingPrice: rec.price,
      preparationTime: 30,
      isActive: true,
      items: items
    };

    const res = await fetch("http://localhost:3000/api/admin/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      criadas++;
      console.log(`✅ ${rec.name} - Custo: R$ ${custoTotal.toFixed(2)} - Lucro: R$ ${(rec.price - custoTotal).toFixed(2)}`);
    } else {
      const err = await res.text();
      console.log(`❌ ${rec.name} - ${err}`);
    }
  }

  console.log(`\n✅ ${criadas} receitas criadas!\n`);
}

criarReceitas();
