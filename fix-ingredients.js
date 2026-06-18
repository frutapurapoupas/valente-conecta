const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 APLICANDO CORREÇÕES...\n");
  
  // 1. Corrigir unidades
  const correcoesUnidade = [
    { nome: "Alho", unidade: "kg" },
    { nome: "Cebola", unidade: "kg" },
    { nome: "Coentro", unidade: "maco" },
    { nome: "Sal", unidade: "kg" },
    { nome: "Salsa", unidade: "maco" }
  ];
  
  for (const cor of correcoesUnidade) {
    const result = await prisma.ingredient.updateMany({
      where: { name: cor.nome },
      data: { unit: cor.unidade }
    });
    if (result.count > 0) {
      console.log(`   ✅ ${cor.nome}: unidade → ${cor.unidade}`);
    }
  }
  
  // 2. Corrigir preços
  const correcoesPreco = {
    "Abobora": 2.00,
    "Alho": 18.00,
    "Arroz branco": 5.00,
    "Carne bovina": 16.00,
    "Carne de frango": 8.50,
    "Cebola": 2.80,
    "Cenoura": 2.50,
    "Coentro": 1.50,
    "Creme de leite": 12.00,
    "Creme de milho": 8.00,
    "Maxixe": 4.00,
    "Pure de batata": 4.00,
    "Quiabo": 5.00,
    "Sal": 1.50,
    "Salsa": 1.50
  };
  
  for (const [nome, preco] of Object.entries(correcoesPreco)) {
    const result = await prisma.ingredient.updateMany({
      where: { name: nome },
      data: { currentPrice: preco }
    });
    if (result.count > 0) {
      console.log(`   ✅ ${nome}: preço → R$ ${preco.toFixed(2)}`);
    }
  }
  
  // 3. Verificar resultado final
  console.log("\n📋 RESULTADO FINAL:");
  const all = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });
  console.log("-".repeat(60));
  console.log(`${"NOME".padEnd(25)} ${"UNIDADE".padEnd(10)} ${"PREÇO".padEnd(10)}`);
  console.log("-".repeat(60));
  all.forEach(i => {
    console.log(`${i.name.padEnd(25)} ${i.unit.padEnd(10)} R$ ${i.currentPrice.toFixed(2)}`);
  });
  console.log("-".repeat(60));
  console.log(`TOTAL: ${all.length} ingredientes corrigidos`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
