'use client';

import { useEffect, useState } from 'react';

interface Ingrediente {
  id: string;
  name: string;
  stock: number;
  unit: string;
  currentPrice: number;
}

interface Receita {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
}

interface ItemProducao {
  receitaId: string;
  receitaNome: string;
  quantidade: number;
}

interface ItemListaCompra {
  ingredienteId: string;
  nome: string;
  quantidadeNecessaria: number;
  quantidadeEmEstoque: number;
  quantidadeFaltante: number;
  unidade: string;
  custoUnitario: number;
  custoTotal: number;
}

// ============================================================
// FUNÇÕES DE CONVERSÃO DE UNIDADES
// ============================================================

function converterParaUnidadePadrao(quantidade: number, unidade: string): number {
  // Converter tudo para KG ou L para cálculo
  if (unidade === 'g') return quantidade / 1000;
  if (unidade === 'kg') return quantidade;
  if (unidade === 'ml') return quantidade / 1000;
  if (unidade === 'L') return quantidade;
  return quantidade;
}

function formatarQuantidade(quantidade: number, unidade: string): string {
  if (unidade === 'g' && quantidade >= 1000) {
    return `${(quantidade / 1000).toFixed(2)} kg`;
  }
  if (unidade === 'ml' && quantidade >= 1000) {
    return `${(quantidade / 1000).toFixed(2)} L`;
  }
  return `${quantidade} ${unidade}`;
}

function calcularCusto(
  quantidade: number,
  unidadeQuantidade: string,
  precoUnitario: number,
  unidadePreco: string
): number {
  // Converter para unidade comum (KG ou L)
  let qtdEmKg = quantidade;
  if (unidadeQuantidade === 'g') qtdEmKg = quantidade / 1000;
  if (unidadeQuantidade === 'kg') qtdEmKg = quantidade;
  
  let precoPorKg = precoUnitario;
  if (unidadePreco === 'g') precoPorKg = precoUnitario * 1000;
  if (unidadePreco === 'kg') precoPorKg = precoUnitario;
  
  // Para líquidos
  let qtdEmL = quantidade;
  if (unidadeQuantidade === 'ml') qtdEmL = quantidade / 1000;
  if (unidadeQuantidade === 'L') qtdEmL = quantidade;
  
  let precoPorL = precoUnitario;
  if (unidadePreco === 'ml') precoPorL = precoUnitario * 1000;
  if (unidadePreco === 'L') precoPorL = precoUnitario;
  
  // Escolher o cálculo correto baseado na unidade
  if (unidadeQuantidade === 'g' || unidadeQuantidade === 'kg') {
    return qtdEmKg * precoPorKg;
  } else {
    return qtdEmL * precoPorL;
  }
}

export default function ProducaoPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [producao, setProducao] = useState<ItemProducao[]>([]);
  const [listaCompras, setListaCompras] = useState<ItemListaCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const [receitasRes, ingredientesRes] = await Promise.all([
        fetch('/api/cozinha/recipes'),
        fetch('/api/cozinha/ingredients')
      ]);
      
      const receitasData = await receitasRes.json();
      const ingredientesData = await ingredientesRes.json();
      
      if (receitasData.success) setReceitas(receitasData.data || []);
      if (ingredientesData.success) setIngredientes(ingredientesData.data || []);
      
      setProducao([]);
      setListaCompras([]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function adicionarProducao(receita: Receita) {
    setProducao(prev => {
      const existe = prev.find(p => p.receitaId === receita.id);
      if (existe) {
        return prev.map(p =>
          p.receitaId === receita.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        );
      }
      return [...prev, { receitaId: receita.id, receitaNome: receita.name, quantidade: 1 }];
    });
    setListaCompras([]);
  }

  function removerProducao(receitaId: string) {
    setProducao(prev => prev.filter(p => p.receitaId !== receitaId));
    setListaCompras([]);
  }

  function atualizarQuantidade(receitaId: string, quantidade: number) {
    if (quantidade <= 0) {
      removerProducao(receitaId);
      return;
    }
    setProducao(prev =>
      prev.map(p =>
        p.receitaId === receitaId ? { ...p, quantidade } : p
      )
    );
    setListaCompras([]);
  }

  function calcularListaCompras() {
    const necessidade = new Map<string, { quantidade: number; nome: string; unidade: string }>();
    
    for (const item of producao) {
      const receita = receitas.find(r => r.id === item.receitaId);
      if (!receita) continue;
      
      for (const ing of receita.ingredients) {
        const total = (necessidade.get(ing.ingredientId)?.quantidade || 0) + (ing.quantity * item.quantidade);
        necessidade.set(ing.ingredientId, {
          quantidade: total,
          nome: ing.ingredientName,
          unidade: ing.unit
        });
      }
    }
    
    const lista: ItemListaCompra[] = [];
    for (const [ingredienteId, need] of necessidade) {
      const ingrediente = ingredientes.find(i => i.id === ingredienteId);
      if (!ingrediente) continue;
      
      const estoque = ingrediente.stock || 0;
      const faltante = Math.max(0, need.quantidade - estoque);
      
      // Calcular custo CORRETAMENTE com conversão de unidades
      const custoTotal = calcularCusto(
        faltante,
        need.unidade,
        ingrediente.currentPrice,
        ingrediente.unit
      );
      
      lista.push({
        ingredienteId,
        nome: need.nome,
        quantidadeNecessaria: need.quantidade,
        quantidadeEmEstoque: estoque,
        quantidadeFaltante: faltante,
        unidade: need.unidade,
        custoUnitario: ingrediente.currentPrice,
        custoTotal: custoTotal
      });
    }
    
    setListaCompras(lista);
  }

  async function finalizarProducao() {
    if (producao.length === 0) {
      alert('Nenhum item selecionado para produção');
      return;
    }
    
    const necessidadeTotal = new Map<string, { quantidade: number; unidade: string }>();
    for (const item of producao) {
      const receita = receitas.find(r => r.id === item.receitaId);
      if (!receita) continue;
      for (const ing of receita.ingredients) {
        const total = (necessidadeTotal.get(ing.ingredientId)?.quantidade || 0) + (ing.quantity * item.quantidade);
        necessidadeTotal.set(ing.ingredientId, { quantidade: total, unidade: ing.unit });
      }
    }
    
    const faltantes = [];
    for (const [id, need] of necessidadeTotal) {
      const ingrediente = ingredientes.find(i => i.id === id);
      if (ingrediente && ingrediente.stock < need.quantidade) {
        const faltando = need.quantidade - ingrediente.stock;
        faltantes.push(`${ingrediente.name}: precisa ${formatarQuantidade(need.quantidade, need.unidade)}, faltam ${formatarQuantidade(faltando, need.unidade)}`);
      }
    }
    
    if (faltantes.length > 0) {
      alert(`Estoque insuficiente!\n\n${faltantes.join('\n')}\n\nGere a lista de compras primeiro.`);
      return;
    }
    
    for (const [id, need] of necessidadeTotal) {
      const ingrediente = ingredientes.find(i => i.id === id);
      if (ingrediente) {
        const novoEstoque = ingrediente.stock - need.quantidade;
        await fetch(`/api/cozinha/ingredients?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: novoEstoque })
        });
      }
    }
    
    alert(`✅ Produção finalizada!\n${producao.map(p => `${p.quantidade}x ${p.receitaNome}`).join('\n')}`);
    
    setProducao([]);
    setListaCompras([]);
    await carregarDados();
  }

  const totalCusto = listaCompras.reduce((sum, i) => sum + i.custoTotal, 0);
  const totalNecessidade = producao.reduce((sum, p) => sum + p.quantidade, 0);

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">🍳 Produção</h1>
        <p className="text-gray-600 mt-2">Gerencie a produção de pratos e crie listas de compras</p>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setModoEdicao(!modoEdicao)} className="text-sm text-blue-600 hover:text-blue-800">
          {modoEdicao ? '← Voltar para produção' : 'Gerenciar receitas →'}
        </button>
      </div>

      {!modoEdicao ? (
        <>
          {/* Produção do Dia */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Produção de Hoje</h2>
            
            {producao.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum item selecionado para produção</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-3 text-left">Receita</th><th className="px-4 py-3 text-left">Quantidade</th><th className="px-4 py-3 text-left">Ações</th></tr>
                  </thead>
                  <tbody>
                    {producao.map(item => (
                      <tr key={item.receitaId}>
                        <td className="px-4 py-3">{item.receitaNome}</td>
                        <td className="px-4 py-3">
                          <input type="number" min="1" value={item.quantidade} onChange={(e) => atualizarQuantidade(item.receitaId, parseInt(e.target.value) || 0)} className="w-20 border rounded px-2 py-1 text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => removerProducao(item.receitaId)} className="text-red-600 hover:text-red-800">Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total: {totalNecessidade} itens para produzir</span>
              <div className="flex gap-3">
                <button onClick={calcularListaCompras} disabled={producao.length === 0} className="px-4 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50">📋 Calcular Lista de Compras</button>
                <button onClick={finalizarProducao} disabled={producao.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">✅ Finalizar Produção</button>
              </div>
            </div>
          </div>

          {/* Lista de Compras */}
          {listaCompras.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">🛒 Lista de Compras</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Ingrediente</th>
                      <th className="px-4 py-3 text-left">Necessário</th>
                      <th className="px-4 py-3 text-left">Em Estoque</th>
                      <th className="px-4 py-3 text-left">Faltante</th>
                      <th className="px-4 py-3 text-left">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaCompras.filter(i => i.quantidadeFaltante > 0).map(item => (
                      <tr key={item.ingredienteId}>
                        <td className="px-4 py-3">{item.nome}</td>
                        <td className="px-4 py-3">{formatarQuantidade(item.quantidadeNecessaria, item.unidade)}</td>
                        <td className="px-4 py-3">{formatarQuantidade(item.quantidadeEmEstoque, item.unidade)}</td>
                        <td className="px-4 py-3 font-semibold text-red-600">{formatarQuantidade(item.quantidadeFaltante, item.unidade)}</td>
                        <td className="px-4 py-3">R$ {item.custoTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr><td colSpan={4} className="px-4 py-3 text-right font-bold">Total para comprar:</td><td className="px-4 py-3 font-bold text-blue-600">R$ {totalCusto.toFixed(2)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Cardápio */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📖 Cardápio - Selecione para Produzir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receitas.map(receita => (
                <div key={receita.id} className="border rounded-lg p-4 hover:shadow-md">
                  <h3 className="font-semibold text-lg">{receita.name}</h3>
                  <p className="text-gray-500 text-sm">R$ {receita.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mb-3">{receita.ingredients?.length || 0} ingredientes</p>
                  <button onClick={() => adicionarProducao(receita)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Adicionar à Produção</button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">Para gerenciar receitas (editar/excluir), acesse:</p>
          <a href="/admin/cozinha/receitas" className="text-blue-600 hover:text-blue-800 underline">/admin/cozinha/receitas</a>
        </div>
      )}
    </div>
  );
}
