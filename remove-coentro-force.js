const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const coentro = await prisma.ingredient.findUnique({
    where: { name: 'Coentro' }
  });
  
  if (!coentro) {
    console.log("❌ Coentro não encontrado");
    return;
  }
  
  console.log(`\n📋 Removendo Coentro (ID: ${coentro.id})...`);
  
  // Remover referências primeiro
  const deletedRecipeItems = await prisma.recipeItem.deleteMany({
    where: { ingredientId: coentro.id }
  });
  console.log(`   ✅ Removidas ${deletedRecipeItems.count} referências em recipe_items`);
  
  const deletedMovements = await prisma.stockMovement.deleteMany({
    where: { ingredientId: coentro.id }
  });
  console.log(`   ✅ Removidas ${deletedMovements.count} referências em stock_movements`);
  
  const deletedPurchaseItems = await prisma.purchaseItem.deleteMany({
    where: { ingredientId: coentro.id }
  });
  console.log(`   ✅ Removidas ${deletedPurchaseItems.count} referências em purchase_items`);
  
  // Remover o ingrediente
  await prisma.ingredient.delete({
    where: { id: coentro.id }
  });
  console.log(`\n✅ Coentro removido com sucesso!`);
}

main().finally(() => prisma.$disconnect());
