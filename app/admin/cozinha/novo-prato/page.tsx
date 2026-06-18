'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Camera, X, Package, RotateCcw, CheckSquare, Square } from 'lucide-react';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentPrice: number;
  stock: number;
  volumeMl?: number;
};

type RecipeIngredient = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  isLiquid: boolean;
  originalUnit: string;
  isEmbalagem?: boolean;
};

type EmbalagemOpcao = {
  id: string;
  nome: string;
  pesoMaximo: number;
  unidade: string;
  preco: number;
};

const categorias = [
  { id: 'prato', nome: '🍽️ Prato Principal', cor: 'bg-red-600' },
  { id: 'sobremesa_doce', nome: '🍰 Sobremesa Doce', cor: 'bg-pink-600' },
  { id: 'sobremesa_salgado', nome: '🥟 Salgado', cor: 'bg-orange-600' },
  { id: 'bebida', nome: '🥤 Bebida', cor: 'bg-blue-600' }
];

const STORAGE_KEY = 'novo_prato_rascunho';

export default function NovoPrato() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [embalagens, setEmbalagens] = useState<EmbalagemOpcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasRascunho, setHasRascunho] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [incluirEmbalagemNosIngredientes, setIncluirEmbalagemNosIngredientes] = useState(false);

  const [produto, setProduto] = useState({
    name: '',
    description: '',
    category: 'prato',
    preparationTime: 30,
    sellingPrice: 0,
    imageUrl: '',
    embalagemId: '',
    descontoParceiro: 0
  });

  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [selectedUnit, setSelectedUnit] = useState<'g' | 'ml'>('g');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const rascunho = JSON.parse(saved);
        if (rascunho.produto?.name || rascunho.selectedIngredients?.length > 0) {
          setHasRascunho(true);
          if (confirm('📝 Você tem um rascunho não finalizado. Deseja continuar de onde parou?')) {
            setProduto(rascunho.produto || produto);
            setSelectedIngredients(rascunho.selectedIngredients || []);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar rascunho:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      const rascunho = { produto, selectedIngredients, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rascunho));
    }
  }, [produto, selectedIngredients, loading]);

  const descartarRascunho = () => {
    if (confirm('⚠️ Tem certeza que deseja descartar o rascunho atual?')) {
      localStorage.removeItem(STORAGE_KEY);
      setProduto({
        name: '',
        description: '',
        category: 'prato',
        preparationTime: 30,
        sellingPrice: 0,
        imageUrl: '',
        embalagemId: embalagens[0]?.id || '',
        descontoParceiro: 0
      });
      setSelectedIngredients([]);
      setHasRascunho(false);
      alert('✅ Rascunho descartado!');
    }
  };

  const limparRascunho = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasRascunho(false);
  };

  useEffect(() => {
    carregarIngredientes();
  }, []);

  const carregarIngredientes = async () => {
    try {
      const response = await fetch('/api/cozinha/ingredients');
      const data = await response.json();
      if (data.success) {
        // Carregar ingredientes (excluindo embalagens da lista principal)
        const ingredientesFiltrados = data.data.filter((i: Ingredient) => 
          i.category !== 'embalagem' && !i.name.toLowerCase().includes('embalagem')
        );
        setIngredients(ingredientesFiltrados);

        // Carregar embalagens separadamente
        const embItems = data.data.filter((i: Ingredient) => 
          i.category === 'embalagem' || i.name.toLowerCase().includes('embalagem')
        ).map((i: Ingredient) => ({
          id: i.id,
          nome: i.name,
          pesoMaximo: i.name.toLowerCase().includes('500g') ? 500 :
                      i.name.toLowerCase().includes('700g') ? 700 :
                      i.name.toLowerCase().includes('300g') ? 300 : 500,
          unidade: i.unit,
          preco: i.currentPrice
        }));

        setEmbalagens(embItems);

        if (embItems.length > 0 && !produto.embalagemId) {
          setProduto(prev => ({ ...prev, embalagemId: embItems[0].id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', produto.name || 'produto');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        setProduto(prev => ({ ...prev, imageUrl: data.url }));
        alert('Imagem enviada com sucesso!');
      } else {
        alert(data.error || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const removerImagem = () => {
    setProduto(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const adicionarIngrediente = () => {
    const ingredient = ingredients.find(i => i.id === selectedIngredientId);
    if (!ingredient) return;

    const isLiquid = ingredient.category === 'liquido' || ingredient.unit === 'L' || ingredient.unit === 'mL';
    const originalUnit = ingredient.unit;

    let cost = 0;
    let finalQuantity = selectedQuantity;
    let finalUnit = selectedUnit;

    if (isLiquid) {
      finalUnit = 'ml';
      finalQuantity = selectedQuantity;

      if (ingredient.volumeMl && ingredient.volumeMl > 0) {
        const precoPorMl = ingredient.currentPrice / ingredient.volumeMl;
        cost = precoPorMl * finalQuantity;
      } else if (ingredient.unit === 'L') {
        const precoPorMl = ingredient.currentPrice / 1000;
        cost = precoPorMl * finalQuantity;
      } else if (ingredient.unit === 'mL') {
        cost = ingredient.currentPrice * finalQuantity;
      } else {
        let precoPorGrama = ingredient.currentPrice;
        if (ingredient.unit === 'kg') precoPorGrama = ingredient.currentPrice / 1000;
        else if (ingredient.unit === 'g') precoPorGrama = ingredient.currentPrice;
        cost = precoPorGrama * finalQuantity;
      }
    } else {
      finalUnit = 'g';
      finalQuantity = selectedQuantity;
      let precoPorGrama = ingredient.currentPrice;
      if (ingredient.unit === 'kg') precoPorGrama = ingredient.currentPrice / 1000;
      else if (ingredient.unit === 'g') precoPorGrama = ingredient.currentPrice;
      cost = precoPorGrama * finalQuantity;
    }

    setSelectedIngredients([...selectedIngredients, {
      ingredientId: ingredient.id,
      name: `${ingredient.name}${isLiquid ? ' (líquido)' : ''}`,
      quantity: finalQuantity,
      unit: finalUnit,
      cost: cost,
      isLiquid: isLiquid,
      originalUnit: originalUnit
    }]);

    setSelectedIngredientId('');
    setSelectedQuantity(100);
    setSelectedUnit('g');
  };

  // NOVA FUNÇÃO: Adicionar embalagem como ingrediente
  const adicionarEmbalagemComoIngrediente = () => {
    const embalagemAtual = embalagens.find(e => e.id === produto.embalagemId);
    if (!embalagemAtual) {
      alert('Selecione uma embalagem primeiro!');
      return;
    }

    // Verificar se a embalagem já foi adicionada
    const embalagemJaAdicionada = selectedIngredients.some(ing => ing.isEmbalagem === true);
    if (embalagemJaAdicionada) {
      alert('Embalagem já foi adicionada à lista de ingredientes!');
      return;
    }

    const novaEmbalagem: RecipeIngredient = {
      ingredientId: embalagemAtual.id,
      name: `📦 ${embalagemAtual.nome} (embalagem)`,
      quantity: 1,
      unit: 'un',
      cost: embalagemAtual.preco,
      isLiquid: false,
      originalUnit: 'unidade',
      isEmbalagem: true
    };

    setSelectedIngredients([...selectedIngredients, novaEmbalagem]);
    alert(`✅ Embalagem "${embalagemAtual.nome}" adicionada ao custo do produto!`);
  };

  const removerIngrediente = (index: number) => {
    const newList = [...selectedIngredients];
    newList.splice(index, 1);
    setSelectedIngredients(newList);
  };

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) return;
    const newList = [...selectedIngredients];
    const ingredient = ingredients.find(i => i.id === newList[index].ingredientId);
    if (ingredient && !newList[index].isEmbalagem) {
      const isLiquid = newList[index].isLiquid;
      let cost = 0;

      if (isLiquid) {
        if (ingredient.volumeMl && ingredient.volumeMl > 0) {
          const precoPorMl = ingredient.currentPrice / ingredient.volumeMl;
          cost = precoPorMl * novaQuantidade;
        } else if (ingredient.unit === 'L') {
          const precoPorMl = ingredient.currentPrice / 1000;
          cost = precoPorMl * novaQuantidade;
        } else if (ingredient.unit === 'mL') {
          cost = ingredient.currentPrice * novaQuantidade;
        } else {
          let precoPorGrama = ingredient.currentPrice;
          if (ingredient.unit === 'kg') precoPorGrama = ingredient.currentPrice / 1000;
          else if (ingredient.unit === 'g') precoPorGrama = ingredient.currentPrice;
          cost = precoPorGrama * novaQuantidade;
        }
      } else {
        let precoPorGrama = ingredient.currentPrice;
        if (ingredient.unit === 'kg') precoPorGrama = ingredient.currentPrice / 1000;
        else if (ingredient.unit === 'g') precoPorGrama = ingredient.currentPrice;
        cost = precoPorGrama * novaQuantidade;
      }

      newList[index].quantity = novaQuantidade;
      newList[index].cost = cost;
      setSelectedIngredients(newList);
    }
  };

  const calcularPesoTotal = () => {
    // Peso total só considera ingredientes normais, não a embalagem
    return selectedIngredients.reduce((total, ing) => {
      if (ing.isEmbalagem) return total;
      return total + ing.quantity;
    }, 0);
  };

  const embalagemSelecionada = embalagens.find(e => e.id === produto.embalagemId);
  const pesoTotal = calcularPesoTotal();
  const excedePeso = embalagemSelecionada && embalagemSelecionada.pesoMaximo > 0 && pesoTotal > embalagemSelecionada.pesoMaximo;
  const pesoRestante = embalagemSelecionada ? Math.max(0, embalagemSelecionada.pesoMaximo - pesoTotal) : 0;

  const calcularCustoTotal = () => {
    const custoIngredientes = selectedIngredients.reduce((total, ing) => total + ing.cost, 0);
    // Embora a embalagem já esteja nos ingredientes, não adicionamos custo extra aqui
    // para não duplicar (a embalagem como ingrediente já tem seu custo)
    const custoEmbalagem = 0; // A embalagem já está nos selectedIngredients
    return custoIngredientes + custoEmbalagem;
  };

  const calcularLucro = () => {
    return produto.sellingPrice - calcularCustoTotal();
  };

  const calcularMargem = () => {
    if (produto.sellingPrice === 0) return 0;
    return (calcularLucro() / produto.sellingPrice) * 100;
  };

  const precoParceiro = produto.sellingPrice * (1 - (produto.descontoParceiro || 0) / 100);

  const getCategoriaInfo = () => {
    return categorias.find(c => c.id === produto.category) || categorias[0];
  };

  const salvarProduto = async () => {
    if (!produto.name) {
      alert('Digite o nome do produto');
      return;
    }
    if (!produto.embalagemId) {
      alert('Selecione uma embalagem');
      return;
    }
    if (excedePeso) {
      alert(`⚠️ O peso total (${pesoTotal}g) excede o limite da embalagem (${embalagemSelecionada?.pesoMaximo}g).`);
      return;
    }

    setSaving(true);

    try {
      const recipeResponse = await fetch('/api/cozinha/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: produto.name,
          description: produto.description,
          price: produto.sellingPrice,
          cost: calcularCustoTotal(),
          category: produto.category,
          preparationTime: produto.preparationTime,
          image: produto.imageUrl,
          descontoParceiro: produto.descontoParceiro || 0
        })
      });

      const recipeData = await recipeResponse.json();

      if (recipeData.success) {
        const recipeId = recipeData.data.id;

        for (const ing of selectedIngredients) {
          await fetch('/api/cozinha/recipe-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipeId,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
              cost: ing.cost,
              isLiquid: ing.isLiquid || false
            })
          });
        }

        await fetch(`/api/cozinha/recipes?id=${recipeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embalagemId: produto.embalagemId,
            embalagemNome: embalagemSelecionada?.nome,
            embalagemCusto: embalagemSelecionada?.preco || 0,
            pesoFinal: embalagemSelecionada?.pesoMaximo || pesoTotal
          })
        });

        alert('✅ Produto criado com sucesso!');
        limparRascunho();
        setProduto({ 
          name: '', 
          description: '', 
          category: 'prato', 
          preparationTime: 30, 
          sellingPrice: 0, 
          imageUrl: '',
          embalagemId: embalagens[0]?.id || '',
          descontoParceiro: 0
        });
        setSelectedIngredients([]);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const categoriaInfo = getCategoriaInfo();
  const custoTotal = calcularCustoTotal();
  const custoIngredientes = custoTotal; // Agora a embalagem já está incluída nos ingredientes

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className={`${categoriaInfo.cor} rounded-2xl p-4 mb-6 flex justify-between items-center`}>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {categoriaInfo.nome === '🍽️ Prato Principal' && '🍳 Criar Novo Prato'}
              {categoriaInfo.nome === '🍰 Sobremesa Doce' && '🍰 Criar Nova Sobremesa Doce'}
              {categoriaInfo.nome === '🥟 Salgado' && '🥟 Criar Novo Salgado'}
              {categoriaInfo.nome === '🥤 Bebida' && '🥤 Criar Nova Bebida'}
            </h1>
            <p className="text-white/80">Preencha os dados abaixo para cadastrar um novo item no cardápio</p>
          </div>
          {hasRascunho && (
            <button onClick={descartarRascunho} className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm">
              <RotateCcw size={16} /> Descartar Rascunho
            </button>
          )}
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Informações do Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Tipo de Produto *</label>
              <div className="flex gap-2 flex-wrap">
                {categorias.map(cat => (
                  <button key={cat.id} onClick={() => setProduto({...produto, category: cat.id})} className={`px-4 py-2 rounded-lg font-bold transition ${produto.category === cat.id ? `${cat.cor} text-white` : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'}`}>{cat.nome}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Nome do Produto *</label>
              <input type="text" value={produto.name} onChange={(e) => setProduto({...produto, name: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Ex: Pudim de Leite, Coxinha, Bolo de Chocolate..." />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-400 flex items-center gap-2"><Package size={16} /> Embalagem (do estoque)</label>
                <button
                  type="button"
                  onClick={adicionarEmbalagemComoIngrediente}
                  className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg transition flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar ao custo
                </button>
              </div>
              {embalagens.length === 0 ? (
                <div className="p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">⚠️ Nenhuma embalagem cadastrada. Cadastre um ingrediente na categoria "embalagem" primeiro.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {embalagens.map(emb => (
                    <button key={emb.id} type="button" onClick={() => setProduto({...produto, embalagemId: emb.id})} className={`p-3 rounded-lg border-2 transition-all ${produto.embalagemId === emb.id ? 'border-yellow-500 bg-yellow-500/20' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500'}`}>
                      <div className="text-sm font-semibold">{emb.nome}</div>
                      <div className="text-xs text-gray-400">Limite: {emb.pesoMaximo > 0 ? `${emb.pesoMaximo}g` : 'Sem limite'}</div>
                      <div className="text-xs text-green-400">Custo: R$ {emb.preco.toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">Clique em "Adicionar ao custo" para incluir a embalagem na lista de ingredientes</p>
              {excedePeso && <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">⚠️ Peso total ({pesoTotal}g) excede o limite da embalagem ({embalagemSelecionada?.pesoMaximo}g)</div>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Imagem do Produto</label>
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center">
                {produto.imageUrl ? (
                  <div className="relative inline-block">
                    <img src={produto.imageUrl} alt={produto.name || "Prévia da imagem"} className="w-48 h-48 object-cover rounded-lg mx-auto" />
                    <button onClick={removerImagem} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"><X size={16} /></button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-8">
                    <Camera size={48} className="mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-400">Clique para selecionar uma imagem</p>
                    <p className="text-gray-500 text-sm mt-1">PNG, JPG até 2MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading && <div className="mt-2 text-yellow-400"><div className="animate-spin inline-block w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full mr-2"></div> Enviando imagem...</div>}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Descrição</label>
              <textarea value={produto.description} onChange={(e) => setProduto({...produto, description: e.target.value})} className="w-full bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" rows={3} placeholder="Descreva o produto..." />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tempo de Preparo (minutos)</label>
              <input type="number" value={produto.preparationTime} onChange={(e) => setProduto({...produto, preparationTime: parseInt(e.target.value)})} className="w-full bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preço de Venda (R$)</label>
              <input type="number" step="0.01" value={produto.sellingPrice} onChange={(e) => setProduto({...produto, sellingPrice: parseFloat(e.target.value)})} className="w-full bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Ex: 19.90" />
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🥬 Ingredientes</h2>
            {embalagemSelecionada && (
              <button
                type="button"
                onClick={adicionarEmbalagemComoIngrediente}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <Package size={14} /> Adicionar embalagem aos ingredientes
              </button>
            )}
          </div>
          
          <div className="flex gap-4 mb-4 flex-wrap">
            <select value={selectedIngredientId} onChange={(e) => setSelectedIngredientId(e.target.value)} className="flex-1 min-w-[200px] bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Selecione um ingrediente...</option>
              {ingredients.map(ing => {
                const isLiquid = ing.category === 'liquido' || ing.unit === 'L' || ing.unit === 'mL';
                return (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} {isLiquid ? '💧' : '🥩'} (R$ {ing.currentPrice.toFixed(2)}/{ing.unit})
                    {isLiquid && ing.volumeMl ? ` - ${ing.volumeMl}ml` : ''}
                  </option>
                );
              })}
            </select>
            
            <input type="number" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value))} className="w-32 bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Qtd" />
            
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value as 'g' | 'ml')} className="w-20 bg-zinc-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="g">g</option>
              <option value="ml">ml</option>
            </select>
            
            <button onClick={adicionarIngrediente} disabled={!selectedIngredientId} className="bg-green-600 hover:bg-green-700 px-6 rounded-lg font-bold transition disabled:opacity-50"><Plus size={20} /></button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-2 text-gray-400">Ingrediente</th>
                  <th className="text-left py-2 px-2 text-gray-400">Quantidade</th>
                  <th className="text-left py-2 px-2 text-gray-400">Custo (R$)</th>
                  <th className="text-left py-2 px-2 text-gray-400">Ação</th>
                </tr>
              </thead>
              <tbody>
                {selectedIngredients.map((ing, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-2 px-2">
                      {ing.name} 
                      {ing.isLiquid && !ing.isEmbalagem && <span className="text-xs text-blue-400 ml-1">💧</span>}
                      {ing.isEmbalagem && <span className="text-xs text-green-400 ml-1">📦</span>}
                    </td>
                    <td className="py-2 px-2">
                      {ing.isEmbalagem ? (
                        <span className="text-gray-400">1 un</span>
                      ) : (
                        <input type="number" value={ing.quantity} onChange={(e) => atualizarQuantidade(index, parseInt(e.target.value) || 0)} className="w-20 bg-zinc-800 rounded px-2 py-1 text-center" />
                      )} {ing.unit}
                    </td>
                    <td className="py-2 px-2">R$ {ing.cost.toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <button onClick={() => removerIngrediente(index)} className="text-red-500 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {selectedIngredients.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum ingrediente adicionado</p>}
          
          {embalagemSelecionada && embalagemSelecionada.pesoMaximo > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span>Peso total: {pesoTotal}g</span><span>Limite: {embalagemSelecionada.pesoMaximo}g</span></div>
              <div className="w-full bg-zinc-800 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${excedePeso ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (pesoTotal / embalagemSelecionada.pesoMaximo) * 100)}%` }} /></div>
              {pesoRestante > 0 && !excedePeso && <p className="text-xs text-gray-500 mt-1">Ainda pode adicionar {pesoRestante}g</p>}
            </div>
          )}
        </div>
        
        <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">💰 Resumo Financeiro</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Ingredientes + Embalagem:</span><span>R$ {custoIngredientes.toFixed(2)}</span></div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold"><span>Custo Total:</span><span className="text-red-400">R$ {custoTotal.toFixed(2)}</span></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-center"><p className="text-gray-400 text-sm">Preço Venda</p><p className="text-2xl font-bold text-green-400">R$ {produto.sellingPrice.toFixed(2)}</p></div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center"><p className="text-gray-400 text-sm">Lucro</p><p className="text-2xl font-bold text-yellow-400">R$ {calcularLucro().toFixed(2)}</p></div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center"><p className="text-gray-400 text-sm">Margem</p><p className="text-2xl font-bold text-blue-400">{calcularMargem().toFixed(1)}%</p></div>
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Desconto Parceiro</p>
              <div className="flex items-center justify-center gap-2">
                <input type="number" step="1" min="0" max="100" value={produto.descontoParceiro} onChange={(e) => setProduto({...produto, descontoParceiro: parseInt(e.target.value) || 0})} className="w-20 bg-zinc-700 rounded-lg p-2 text-center text-yellow-400 font-bold" /> <span className="text-sm">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Preço p/ parceiro: R$ {precoParceiro.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <button onClick={salvarProduto} disabled={saving || !produto.name || selectedIngredients.length === 0 || !produto.embalagemId || excedePeso} className="w-full bg-yellow-600 hover:bg-yellow-700 py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <>Salvando...</> : <><Save size={20} /> Salvar Produto</>}
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-4">💾 Os dados são salvos automaticamente enquanto você digita. Você pode sair e voltar depois.</p>
      </div>
    </div>
  );
}