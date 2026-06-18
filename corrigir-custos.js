// arquivo: corrigir-custos.js
const https = require('http');

async function corrigir() {
  console.log('CORRIGINDO CUSTOS DIRETO NO BANCO...\n');

  try {
    // Buscar ingredientes
    const ingRes = await fetch('http://localhost:3000/api/cozinha/ingredients');
    const ingData = await ingRes.json();
    const mapa = new Map();
    
    ingData.data.forEach(i => {
      mapa.set(i.id, { preco: i.currentPrice, unidade: i.unit });
      console.log(`Ingrediente: ${i.name} - R$ ${i.currentPrice}/${i.unit}`);
    });
    
    console.log(`\nTotal de ingredientes: ${mapa.size}\n`);

    // Buscar receitas
    const recRes = await fetch('http://localhost:3000/api/cozinha/recipes');
    const recData = await recRes.json();
    
    console.log(`Total de receitas: ${recData.data.length}\n`);

    for (const rec of recData.data) {
      console.log(`\nProcessando: ${rec.name}`);
      let total = 0;
      
      for (const item of rec.ingredients) {
        const ing = mapa.get(item.ingredientId);
        if (ing) {
          let custo = 0;
          const qtd = item.quantity;
          const preco = ing.preco;
          const unidade = ing.unidade;
          
          if (unidade === 'kg' || unidade === 'g' || unidade === 'L' || unidade === 'mL') {
            custo = (qtd / 1000) * preco;
          } else {
            custo = qtd * preco;
          }
          
          item.cost = custo;
          total += custo;
          console.log(`   ${item.name}: ${qtd}${item.unit} = R$ ${custo.toFixed(4)}`);
        }
      }
      
      rec.cost = total;
      
      // Atualizar no banco
      const updateRes = await fetch(`http://localhost:3000/api/cozinha/recipes?id=${rec.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec)
      });
      
      if (updateRes.ok) {
        console.log(`   ATUALIZADO! Custo total: R$ ${total.toFixed(2)}`);
      } else {
        console.log(`   ERRO ao atualizar ${rec.name}`);
      }
    }
    
    console.log('\nCORRECAO CONCLUIDA!');
    console.log('Reinicie o servidor e recarregue a pagina.');
  } catch (error) {
    console.error('Erro:', error);
  }
}

corrigir();