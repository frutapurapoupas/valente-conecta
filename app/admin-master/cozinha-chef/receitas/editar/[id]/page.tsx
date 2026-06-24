'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import ModalFotoProduto from '@/components/cozinha/ModalFotoProduto';
import { useComprasRequests } from '@/hooks/cozinha/useComprasRequests';
import { supabase } from '@/lib/supabase';

// ============================================================
// DESIGN
// ============================================================
const design = {
  container: "p-6 bg-gray-50 min-h-screen",
  maxWidth: "max-w-7xl mx-auto",
  header: "flex flex-wrap items-center justify-between gap-4 mb-6",
  title: "text-2xl font-bold text-gray-800",
  subtitle: "text-sm text-gray-500",
  card: "bg-white rounded-lg shadow-md p-6 mb-6",
  cardTitle: "text-lg font-semibold text-gray-800 mb-4",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-4",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  select: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  textarea: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]",
  btnPrimary: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2",
  btnSecondary: "px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition flex items-center gap-2",
  btnDanger: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2",
  btnPurple: "px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2",
  table: "min-w-full divide-y divide-gray-200",
  th: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  td: "px-4 py-3 text-sm text-gray-900",
  statCard: "bg-gray-50 rounded-lg p-4 text-center",
  statValue: "text-2xl font-bold",
  statLabel: "text-sm text-gray-500",
  progressContainer: "mt-6 pt-4 border-t border-gray-200",
  progressBar: "w-full bg-gray-200 rounded-full h-6 overflow-hidden",
  progressFill: "h-6 rounded-full transition-all duration-500 flex items-center justify-center text-xs font-bold text-white",
  progressLabel: "text-xs text-gray-400 mt-1 flex justify-between",
  cardDuplo: "grid grid-cols-1 md:grid-cols-2 gap-6",
  cardAnalise: "bg-white rounded-lg shadow-md p-6",
  cardAnaliseTitle: "text-lg font-semibold text-gray-800 mb-4"
};

interface IngredienteReceita {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  price?: number;
  totalPrice?: number;
}

interface IngredienteEstoque {
  id: string;
  name: string;
  currentPrice: number;
  unit: string;
  stock?: number;
}

interface Receita {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: IngredienteReceita[];
  preparationTime: number;
  servings: number;
  isAvailable: boolean;
  images?: string[];
}

function normalizarNome(valor: string) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// ============================================================
// FUNÇÃO PARA CALCULAR CUSTO REAL
// ============================================================
function calcularCustoReal(ingredientes: IngredienteReceita[], estoque: IngredienteEstoque[]): {
  total: number;
  ingredientes: IngredienteReceita[];
} {
  let custoTotal = 0;
  const ingredientesComPreco = ingredientes.map(ing => {
    const itemEstoque = estoque.find(e => e.id === ing.ingredientId);
    let preco = 0;
    let totalPrice = 0;
    
    if (itemEstoque) {
      let quantidade = ing.quantity;
      
      // Normalizar unidades
      if (ing.unit === 'g' && itemEstoque.unit === 'kg') {
        quantidade = ing.quantity / 1000;
      } else if (ing.unit === 'ml' && itemEstoque.unit === 'L') {
        quantidade = ing.quantity / 1000;
      } else if (ing.unit === 'kg' && itemEstoque.unit === 'g') {
        quantidade = ing.quantity * 1000;
      } else if (ing.unit === 'L' && itemEstoque.unit === 'ml') {
        quantidade = ing.quantity * 1000;
      }
      
      preco = itemEstoque.currentPrice;
      totalPrice = quantidade * preco;
      custoTotal += totalPrice;
    }
    
    return {
      ...ing,
      price: preco,
      totalPrice: totalPrice
    };
  });
  
  return {
    total: custoTotal,
    ingredientes: ingredientesComPreco
  };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EditarReceitaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { create: criarSolicitacaoCompra } = useComprasRequests();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoCompra, setEnviandoCompra] = useState(false);
  const [receita, setReceita] = useState<Receita | null>(null);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<IngredienteEstoque[]>([]);
  const [novoIngrediente, setNovoIngrediente] = useState({ id: '', quantidade: 100, unidade: 'g' });
  const [modalFotoAberto, setModalFotoAberto] = useState(false);
  const [custoReal, setCustoReal] = useState(0);
  const [custoRealPorPorcao, setCustoRealPorPorcao] = useState(0);
  const [margemLucro, setMargemLucro] = useState(0);
  const [margemLucroPorPorcao, setMargemLucroPorPorcao] = useState(0);
  const [quantidadeProduzir, setQuantidadeProduzir] = useState(1);
  const [ingredientesComPreco, setIngredientesComPreco] = useState<IngredienteReceita[]>([]);
  const [ultimaSolicitacao, setUltimaSolicitacao] = useState<any | null>(null);

  async function sincronizarReceitaComPratoLegacy(receitaSalva: Receita) {
    try {
      const nomeNorm = normalizarNome(receitaSalva.name);

      const { data: pratosExistentes, error: listarError } = await supabase
        .from('pratos')
        .select('*')
        .limit(500);

      if (listarError) throw listarError;

      const pratoExistente = (pratosExistentes || []).find((p: any) => {
        const nomePrato = normalizarNome(p.nome || '');
        return nomePrato === nomeNorm;
      });

      const payloadPrato = {
        nome: receitaSalva.name,
        descricao: receitaSalva.description || '',
        categoria: receitaSalva.category || 'prato',
        preco: Number(receitaSalva.price || 0),
        custo: Number(custoReal || 0),
        margem: Number(margemLucro || 0),
        tempo_preparo: Number(receitaSalva.preparationTime || 30),
        porcoes: Number(receitaSalva.servings || 1),
        ingredientes: Array.isArray(receitaSalva.ingredients) ? receitaSalva.ingredients : [],
        imagem_url: (receitaSalva.images || [])[0] || '',
        ativo: receitaSalva.isAvailable !== false,
        destaque: false,
        updated_at: new Date().toISOString()
      };

      if (pratoExistente?.id) {
        const { error: updateError } = await supabase
          .from('pratos')
          .update(payloadPrato)
          .eq('id', pratoExistente.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('pratos')
          .insert([{ ...payloadPrato, created_at: new Date().toISOString() }]);
        if (insertError) throw insertError;
      }
    } catch (syncError) {
      console.error('⚠️ Falha na sincronização com pratos legacy:', syncError);
      // Não interrompe o fluxo de salvar receita.
    }
  }

  // 🔥 VERIFICAR SE É "NOVO"
  const isNovo = params.id === 'novo';

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        // Se for novo, criar receita vazia
        if (isNovo) {
          setReceita({
            id: 'novo',
            name: '',
            description: '',
            price: 0,
            category: 'prato',
            ingredients: [],
            preparationTime: 30,
            servings: 1,
            isAvailable: true,
            images: []
          });
          setLoading(false);
          return;
        }

        // Buscar receita existente
        const resRec = await fetch(`/api/cozinha/recipes?id=${params.id}`);
        const dataRec = await resRec.json();
        
        if (dataRec.success && dataRec.data) {
          const imagensUnicas = Array.from(new Set((dataRec.data.images || []).filter(Boolean)));
          setReceita({ ...dataRec.data, images: imagensUnicas });
        } else {
          alert('Receita não encontrada');
          router.push('/admin-master/cozinha-chef/receitas');
        }

        const resIng = await fetch('/api/cozinha/ingredients');
        const dataIng = await resIng.json();
        if (dataIng.success) {
          setIngredientesDisponiveis(dataIng.data || []);
        }
      } catch (error) {
        console.error('❌ Erro:', error);
        alert('Erro ao carregar receita');
      } finally {
        setLoading(false);
      }
    }
    
    carregarDados();
  }, [params.id, isNovo, router]);

  // Calcular custo e margem
  useEffect(() => {
    if (receita && ingredientesDisponiveis.length > 0) {
      const { total, ingredientes } = calcularCustoReal(receita.ingredients, ingredientesDisponiveis);
      setCustoReal(total);
      setIngredientesComPreco(ingredientes);
      
      const porcoes = receita.servings || 1;
      const custoPorPorcao = total / porcoes;
      setCustoRealPorPorcao(custoPorPorcao);
      
      if (receita.price > 0) {
        const margem = ((receita.price - total) / receita.price) * 100;
        setMargemLucro(Math.max(0, margem));
        
        const margemPorPorcao = ((receita.price - custoPorPorcao) / receita.price) * 100;
        setMargemLucroPorPorcao(Math.max(0, margemPorPorcao));
      }
    }
  }, [receita?.ingredients, receita?.price, receita?.servings, ingredientesDisponiveis]);

  // Calcular custo total para quantidade produzida
  const custoTotalProduzir = custoReal * quantidadeProduzir;
  const precoTotalProduzir = (receita?.price || 0) * quantidadeProduzir;
  const lucroTotalProduzir = precoTotalProduzir - custoTotalProduzir;
  const margemTotalProduzir = precoTotalProduzir > 0 ? (lucroTotalProduzir / precoTotalProduzir) * 100 : 0;

  // Calcular peso total dos ingredientes
  const pesoTotal = receita?.ingredients?.reduce((acc, ing) => {
    let qtd = ing.quantity;
    if (ing.unit === 'g' || ing.unit === 'ml') {
      // já está em gramas/ml
    } else if (ing.unit === 'kg' || ing.unit === 'L') {
      qtd = qtd * 1000;
    }
    return acc + qtd;
  }, 0) || 0;

  async function salvarReceita() {
    if (!receita) return;

    const receitaNormalizada = {
      ...receita,
      images: Array.from(new Set((receita.images || []).filter(Boolean)))
    };
    
    // Se for novo, criar via POST
    if (isNovo) {
      setSalvando(true);
      try {
        const response = await fetch('/api/cozinha/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receitaNormalizada)
        });
        const data = await response.json();
        if (data.success) {
          await sincronizarReceitaComPratoLegacy(data.data);
          alert('✅ Receita criada com sucesso!');
          router.push('/admin-master/cozinha-chef/receitas');
        } else {
          alert('❌ Erro ao criar: ' + data.error);
        }
      } catch (error) {
        alert('❌ Erro de conexão');
      } finally {
        setSalvando(false);
      }
      return;
    }

    // Atualizar receita existente
    setSalvando(true);
    try {
      const response = await fetch(`/api/cozinha/recipes?id=${receita.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receitaNormalizada)
      });
      const data = await response.json();
      if (data.success) {
        await sincronizarReceitaComPratoLegacy(data.data);
        alert('✅ Receita salva com sucesso!');
        router.push('/admin-master/cozinha-chef/receitas');
      } else {
        alert('❌ Erro ao salvar: ' + data.error);
      }
    } catch (error) {
      alert('❌ Erro de conexão');
    } finally {
      setSalvando(false);
    }
  }

  function adicionarIngrediente() {
    if (!receita) return;
    if (!novoIngrediente.id) {
      alert('Selecione um ingrediente');
      return;
    }
    if (novoIngrediente.quantidade <= 0) {
      alert('Quantidade deve ser maior que 0');
      return;
    }

    const ingredienteSelecionado = ingredientesDisponiveis.find(i => i.id === novoIngrediente.id);
    if (!ingredienteSelecionado) return;

    const novoIng = {
      ingredientId: ingredienteSelecionado.id,
      ingredientName: ingredienteSelecionado.name,
      quantity: novoIngrediente.quantidade,
      unit: novoIngrediente.unidade
    };

    setReceita({
      ...receita,
      ingredients: [...receita.ingredients, novoIng]
    });

    setNovoIngrediente({ id: '', quantidade: 100, unidade: 'g' });
  }

  function removerIngrediente(index: number) {
    if (!receita) return;
    const novosIngredientes = receita.ingredients.filter((_, i) => i !== index);
    setReceita({ ...receita, ingredients: novosIngredientes });
  }

  function salvarFoto(url: string) {
    if (!receita) return;
    const imagensAtuais = receita.images || [];
    if (imagensAtuais.includes(url)) return;
    const novasImagens = [...imagensAtuais, url];
    setReceita({ ...receita, images: novasImagens });
  }

  function removerFoto(index: number) {
    if (!receita) return;
    const novasImagens = (receita.images || []).filter((_, i) => i !== index);
    setReceita({ ...receita, images: novasImagens });
  }

  async function enviarParaListaCompras() {
    if (!receita) return;
    if (!receita.ingredients || receita.ingredients.length === 0) {
      alert('Adicione ingredientes antes de enviar para compras');
      return;
    }

    setEnviandoCompra(true);
    try {
      const ingredientesCalculados = receita.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName,
        quantidade: Number(ing.quantity || 0) * quantidadeProduzir,
        unit: ing.unit,
        price: ingredientesComPreco.find((i) => i.ingredientId === ing.ingredientId)?.price || 0
      }));

      const payload = {
        receitaId: receita.id,
        receitaNome: receita.name,
        quantidadeProduzir,
        ingredientes: ingredientesCalculados
      };

      const result = await criarSolicitacaoCompra(payload);
      if (result?.success) {
        setUltimaSolicitacao(result.data);
        alert('✅ Solicitação enviada para aprovação na lista de compras');
      } else {
        alert('❌ Não foi possível enviar solicitação para compras');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao enviar solicitação para compras');
    } finally {
      setEnviandoCompra(false);
    }
  }

  if (loading) {
    return (
      <div className={design.container}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Carregando receita...</p>
        </div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className={design.container}>
        <div className="text-center py-12 text-red-600">
          <p className="text-xl">❌ Receita não encontrada</p>
          <button
            onClick={() => router.push('/admin-master/cozinha-chef/receitas')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={design.container}>
      <div className={design.maxWidth}>
        {/* HEADER */}
        <div className={design.header}>
          <div>
            <h1 className={design.title}>
              {isNovo ? '➕ Nova Receita' : `✏️ Editar: ${receita.name}`}
            </h1>
            <p className={design.subtitle}>
              {isNovo ? 'Crie uma nova receita para o cardápio' : 'Edite os detalhes da receita'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/admin-master/cozinha-chef/receitas')}
              className={design.btnSecondary}
            >
              <ArrowLeft size={18} /> Voltar
            </button>
            <button
              onClick={salvarReceita}
              disabled={salvando}
              className={design.btnPrimary}
            >
              <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* INFO BÁSICA */}
        <div className={design.card}>
          <h2 className={design.cardTitle}>📋 Informações Básicas</h2>
          <div className={design.grid2}>
            <div>
              <label className={design.label}>Nome da Receita *</label>
              <input
                type="text"
                value={receita.name}
                onChange={(e) => setReceita({ ...receita, name: e.target.value })}
                className={design.input}
                placeholder="Ex: Picadinho de carne"
              />
            </div>
            <div>
              <label className={design.label}>Categoria *</label>
              <select
                value={receita.category}
                onChange={(e) => setReceita({ ...receita, category: e.target.value })}
                className={design.select}
              >
                <option value="prato">🍽️ Prato Principal</option>
                <option value="sobremesa">🍰 Sobremesa</option>
                <option value="bolo">🧁 Bolo</option>
                <option value="lanche">🥪 Lanche</option>
                <option value="doce">🍬 Doce</option>
                <option value="salgado">🧂 Salgado</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className={design.label}>Descrição</label>
            <textarea
              value={receita.description}
              onChange={(e) => setReceita({ ...receita, description: e.target.value })}
              className={design.textarea}
              placeholder="Descreva os detalhes da receita..."
            />
          </div>

          <div className={design.grid3}>
            <div>
              <label className={design.label}>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={receita.price}
                onChange={(e) => setReceita({ ...receita, price: parseFloat(e.target.value) || 0 })}
                className={design.input}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={design.label}>Tempo de preparo (min)</label>
              <input
                type="number"
                value={receita.preparationTime}
                onChange={(e) => setReceita({ ...receita, preparationTime: parseInt(e.target.value) || 0 })}
                className={design.input}
              />
            </div>
            <div>
              <label className={design.label}>Porções</label>
              <input
                type="number"
                value={receita.servings}
                onChange={(e) => setReceita({ ...receita, servings: parseInt(e.target.value) || 1 })}
                className={design.input}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={receita.isAvailable}
                onChange={(e) => setReceita({ ...receita, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-blue-600"
              />
              Disponível no cardápio
            </label>
          </div>
        </div>

        {/* IMAGENS */}
        <div className={design.card}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={design.cardTitle}>🖼️ Imagens</h2>
            <button
              onClick={() => setModalFotoAberto(true)}
              className={design.btnPurple}
            >
              <ImageIcon size={18} /> Adicionar Foto
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {(receita.images || []).map((img, index) => (
              <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removerFoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(receita.images || []).length === 0 && (
              <p className="text-gray-400 text-sm">Nenhuma imagem adicionada</p>
            )}
          </div>
        </div>

        {/* INGREDIENTES */}
        <div className={design.card}>
          <h2 className={design.cardTitle}>🥘 Ingredientes</h2>
          
          {/* Adicionar ingrediente */}
          <div className={design.grid3}>
            <div>
              <label className={design.label}>Ingrediente</label>
              <select
                value={novoIngrediente.id}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, id: e.target.value })}
                className={design.select}
              >
                <option value="">Selecione...</option>
                {ingredientesDisponiveis.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={design.label}>Quantidade</label>
              <input
                type="number"
                value={novoIngrediente.quantidade}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: parseFloat(e.target.value) || 0 })}
                className={design.input}
              />
            </div>
            <div>
              <label className={design.label}>Unidade</label>
              <select
                value={novoIngrediente.unidade}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, unidade: e.target.value })}
                className={design.select}
              >
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilos (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="L">Litros (L)</option>
                <option value="un">Unidade</option>
              </select>
            </div>
          </div>
          <button
            onClick={adicionarIngrediente}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Ingrediente
          </button>

          {/* Tabela com preços relativos */}
          <div className="mt-4 overflow-x-auto">
            <table className={design.table}>
              <thead className="bg-gray-50">
                <tr>
                  <th className={design.th}>Ingrediente</th>
                  <th className={design.th}>Qtd</th>
                  <th className={design.th}>Unidade</th>
                  <th className={design.th}>Preço Unit.</th>
                  <th className={design.th}>Preço Total</th>
                  <th className={design.th}>% do Custo</th>
                  <th className={design.th}>Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredientesComPreco.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-400">
                      Nenhum ingrediente adicionado
                    </td>
                  </tr>
                ) : (
                  ingredientesComPreco.map((ing, index) => {
                    const percentual = custoReal > 0 ? ((ing.totalPrice || 0) / custoReal) * 100 : 0;
                    return (
                      <tr key={index}>
                        <td className={design.td}>{ing.ingredientName}</td>
                        <td className={design.td}>{ing.quantity}</td>
                        <td className={design.td}>{ing.unit}</td>
                        <td className={design.td}>R$ {(ing.price || 0).toFixed(2)}</td>
                        <td className={design.td}>R$ {(ing.totalPrice || 0).toFixed(2)}</td>
                        <td className={design.td}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{percentual.toFixed(1)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(percentual, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className={design.td}>
                          <button
                            onClick={() => removerIngrediente(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 🆕 BARRA DE PROGRESSO - PESO DOS ITENS */}
          <div className={design.progressContainer}>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>⚖️ Peso total dos ingredientes</span>
              <span className="font-bold">{pesoTotal > 1000 ? `${(pesoTotal / 1000).toFixed(2)}kg` : `${pesoTotal.toFixed(0)}g`}</span>
            </div>
            <div className={design.progressBar}>
              <div 
                className={`${design.progressFill} bg-blue-500`}
                style={{ width: `${Math.min((pesoTotal / 2000) * 100, 100)}%` }}
              >
                {pesoTotal > 0 ? `${pesoTotal.toFixed(0)}g` : '0g'}
              </div>
            </div>
            <div className={design.progressLabel}>
              <span>0g</span>
              <span>1kg</span>
              <span>2kg</span>
            </div>
          </div>
        </div>

        {/* 🆕 2 CARDS - ANÁLISE FINANCEIRA */}
        <div className={design.cardDuplo}>
          {/* CARD ESQUERDO - Produção em Massa */}
          <div className={design.cardAnalise}>
            <h3 className={design.cardAnaliseTitle}>🏭 Produção em Massa</h3>
            
            <div className="mb-4">
              <label className={design.label}>Quantidade a produzir</label>
              <input
                type="number"
                value={quantidadeProduzir}
                onChange={(e) => setQuantidadeProduzir(Math.max(1, parseInt(e.target.value) || 1))}
                className={design.input}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Custo total</span>
                <span className="text-xl font-bold text-red-500">
                  R$ {custoTotalProduzir.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Receita total</span>
                <span className="text-xl font-bold text-blue-600">
                  R$ {precoTotalProduzir.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Lucro total</span>
                <span className={`text-xl font-bold ${lucroTotalProduzir > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lucroTotalProduzir.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Margem</span>
                <span className={`text-xl font-bold ${
                  margemTotalProduzir >= 50 ? 'text-green-600' :
                  margemTotalProduzir >= 30 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {margemTotalProduzir.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Margem da produção</span>
                <span>{margemTotalProduzir.toFixed(1)}%</span>
              </div>
              <div className={design.progressBar}>
                <div 
                  className={`${design.progressFill} ${
                    margemTotalProduzir >= 50 ? 'bg-green-500' :
                    margemTotalProduzir >= 30 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(margemTotalProduzir, 100)}%` }}
                >
                  {margemTotalProduzir.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* CARD DIREITO - Produto Único */}
          <div className={design.cardAnalise}>
            <h3 className={design.cardAnaliseTitle}>🍽️ Produto Único</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Preço de venda</span>
                <span className="text-xl font-bold text-blue-600">
                  R$ {receita.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Custo total</span>
                <span className="text-xl font-bold text-red-500">
                  R$ {custoReal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Lucro</span>
                <span className={`text-xl font-bold ${(receita.price - custoReal) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(receita.price - custoReal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Margem</span>
                <span className={`text-xl font-bold ${
                  margemLucro >= 50 ? 'text-green-600' :
                  margemLucro >= 30 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {margemLucro.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Margem do produto</span>
                <span>{margemLucro.toFixed(1)}%</span>
              </div>
              <div className={design.progressBar}>
                <div 
                  className={`${design.progressFill} ${
                    margemLucro >= 50 ? 'bg-green-500' :
                    margemLucro >= 30 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(margemLucro, 100)}%` }}
                >
                  {margemLucro.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÃO DE COMPRAS POSICIONADA AO LADO DOS CÁLCULOS */}
        <div className={design.card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={design.cardTitle}>🛒 Envio para Lista de Compras</h2>
              <p className="text-sm text-gray-500">
                Usa a quantidade de produção definida acima para calcular ingredientes e enviar para aprovação.
              </p>
            </div>
            <button
              onClick={enviarParaListaCompras}
              disabled={enviandoCompra || !receita.ingredients?.length}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Calculator size={18} /> {enviandoCompra ? 'Enviando...' : 'Enviar para Compras'}
            </button>
          </div>
        </div>

        {/* CARD DE RASTREIO DA SOLICITAÇÃO */}
        {ultimaSolicitacao && (
          <div className={design.card}>
            <h2 className={design.cardTitle}>🧾 Solicitação de Compra Enviada</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Prato</p>
                <p className="font-semibold text-gray-900">{ultimaSolicitacao.receitaNome}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-amber-700">Pendente de aprovação</p>
              </div>
              <div>
                <p className="text-gray-500">Data/Hora</p>
                <p className="font-semibold text-gray-900">
                  {new Date(ultimaSolicitacao.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Ingredientes enviados</p>
                <p className="font-semibold text-gray-900">{ultimaSolicitacao.ingredientes?.length || 0}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Após aprovação, os itens serão consolidados em lista única de compras com itens exclusivos.
            </p>
          </div>
        )}
      </div>

      {/* ✅ MODAL FOTO - CORRIGIDO */}
      <ModalFotoProduto
        isOpen={modalFotoAberto}
        onClose={() => setModalFotoAberto(false)}
        onSave={salvarFoto}
        id={receita.id}
        tipo="receita"
      />
    </div>
  );
}