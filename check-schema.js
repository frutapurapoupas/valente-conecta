const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("\n📊 TABELAS DO BANCO DE DADOS:\n");
    
    // Verificar se existe tabela de movimentações
    const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name LIKE '%moviment%' OR table_name LIKE '%compra%' OR table_name LIKE '%historico%'
    `;
    
    if (tables.length > 0) {
        console.log("✅ Tabelas encontradas:");
        tables.forEach(t => console.log(`   • ${t.table_name}`));
    } else {
        console.log("⚠️ Nenhuma tabela de movimentação encontrada");
        console.log("   Sugestão: Criar tabela 'purchase_history'");
    }
    
    // Verificar estrutura da tabela recipe_items
    const recipeItems = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'recipe_items'
        AND column_name IN ('cost', 'lastPurchasePrice', 'averageCost')
    `;
    
    if (recipeItems.length > 0) {
        console.log("\n✅ Campos na tabela recipe_items:");
        recipeItems.forEach(c => console.log(`   • ${c.column_name} (${c.data_type})`));
    } else {
        console.log("\n⚠️ Sugestão: Adicionar campos de controle de preço na recipe_items");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
