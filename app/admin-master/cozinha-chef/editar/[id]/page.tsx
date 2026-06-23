'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, ShoppingCart, Calculator, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Plus, Trash2, Edit2
} from 'lucide-react';

// ============================================================
// DESIGN SEPARADO (CORRIGIDO)
// ============================================================
const design = {
  container: "min-h-screen bg-gray-50 p-6",
  maxWidth: "max-w-6xl mx-auto",
  
  header: "flex flex-wrap items-center justify-between gap-4 mb-6",
  title: "text-2xl font-bold text-gray-800",
  subtitle: "text-sm text-gray-500",
  
  card: "bg-white rounded-lg shadow-md p-6 mb-6",
  cardTitle: "text-lg font-semibold text-gray-800 mb-4",
  cardSubtitle: "text-sm text-gray-500",
  
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-4",
  
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  select: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  textarea: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]",
  
  btnPrimary: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2",
  btnSecondary: "px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center gap-2",
  btnDanger: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2",
  btnSuccess: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2",
  btnWarning: "px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2",
  
  table: "min-w-full divide-y divide-gray-200",
  th: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  td: "px-4 py-3 whitespace-nowrap text-sm text-gray-900",
  tdCenter: "px-4 py-3 whitespace-nowrap text-sm text-center",
  
  badge: "px-2 py-1 text-xs rounded-full",
  badgeLow: "bg-red-100 text-red-800",
  badgeMedium: "bg-yellow-100 text-yellow-800",
  badgeGood: "bg-green-100 text-green-800",
  
  // BARRA DE PROGRESSO ÚNICA
  progressContainer: "mt-4 pt-4 border-t border-gray-200",
  progressHeader: "flex justify-between text-sm text-gray-600 mb-1",
  progressBar: "w-full bg-gray-200 rounded-full h-3",
  progressFill: "h-3 rounded-full transition-all duration-500",
  progressLabel: "text-xs text-gray-500 mt-1",
  
  statCard: "bg-gray-50 rounded-lg p-4 text-center",
  statValue: "text-2xl font-bold",
  statLabel: "text-sm text-gray-500"
};

// ============================================================
// TIPOS
// ============================================================
interface Ingrediente {
  id: string;
  name: string;
  unit: string;
  currentPrice: number;
  stock: number;
}

interface IngredienteReceita {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost?: number;
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
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EditarReceitaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [receita, setReceita] = useState<Receita | null>(null);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<Ingrediente[]>([]);
  
  const [novoIngrediente, setNovoIngrediente] = useState({ id: '', quantidade: 100, unidade: 'g' });
  const [porcoes, setPorcoes] = useState(1);
  const [mostrarCalculo, setMostrarCalculo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [params.id]);

  async function carregarDados() {
    setLoading(true);
    try {
      const resReceita = await fetch(`/api/cozinha/recipes?id=${params.id}`);
      const dataReceita = await resReceita.json();
      if (dataReceita.success) {
        setReceita(dataReceita.data);
        setPorcoes(dataReceita.data.servings || 1);
      }

      const resIng = await fetch('/api/cozinha/ingredients');
      const dataIng = await resIng.json();
      if (dataIng.success) {
        setIngredientesDisponiveis(dataIng.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function calcularCustoTotal(ingredientes: IngredienteReceita[]): number {
    return ingredientes.reduce((total, ing) => {
      const disponivel = ingredientesDisponiveis.find(i => i.id === ing.ingredientId);
      const preco = disponivel?.currentPrice || 0;
      return total + (ing.quantity * preco);
    }, 0);
  }

  function calcularProgressoGeral(ingredientes: IngredienteReceita[]): number {
    if (ingredientes.length === 0) return 0;
    
    let totalMeta = 0;
    let totalAtual = 0;
    
    ingredientes.forEach(ing => {
      const disponivel = ingredientesDisponiveis.find(i => i.id === ing.ingredientId);
      if (disponivel) {
        totalMeta += ing.quantity;
        totalAtual += Math.min(disponivel.stock, ing.quantity);
      }
    });
    
    return totalMeta > 0 ? (totalAtual / totalMeta) * 100 : 0;
  }

  function temIngredienteFaltando(ingredientes: IngredienteReceita[]): boolean {
    return ingredientes.some(ing => {
      const disponivel = ingredientesDisponiveis.find(i => i.id === ing.ingredientId);
      return !disponivel || disponivel.stock < ing.quantity;
    });
  }

  function adicionarIngrediente() {
    if (!novoIngrediente.id || !receita) return;
    
    const ingrediente = ingredientesDisponiveis.find(i => i.id === novoIngrediente.id);
    if (!ingrediente) return;
    
    const novoIng: IngredienteReceita = {
      ingredientId: ingrediente.id,
      ingredientName: ingrediente.name,
      quantity: novoIngrediente.quantidade,
      unit: novoIngrediente.unidade
    };
    
    setReceita({
      ...receita,
      ingredients: [...receita.ingredients, novoIng]
    });
    
    setNovoIngrediente({ id: '', quantidade: 100, unidade: 'g' });
  }

  function removerIngrediente(ingredientId: string) {
    if (!receita) return;
    setReceita({
      ...receita,
      ingredients: receita.ingredients.filter(i => i.ingredientId !== ingredientId)
    });
  }

  async function salvarReceita() {
    if (!receita) return;
    
    setSalvando(true);
    try {
      const response = await fetch(`/api/cozinha/recipes?id=${receita.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receita)
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Receita salva com sucesso!');
        router.push('/admin-master/cozinha-chef/receitas');
      } else {
        alert('❌ Erro ao salvar: ' + data.error);
      }
    } catch (error) {
      alert('❌ Erro de conexão ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className={design.container}>
        <div className="text-center py-12">Carregando receita...</div>
      </div>
    );
  }

  if (!receita) {
    return (
      <div className={design.container}>
        <div className="text-center py-12 text-red-600">Receita não encontrada</div>
      </div>
    );
  }

  const custoTotal = calcularCustoTotal(receita.ingredients);
  const progressoGeral = calcularProgressoGeral(receita.ingredients);
  const faltando = temIngredienteFaltando(receita.ingredients);
  const lucro = receita.price - custoTotal;
  const margem = receita.price > 0 ? (lucro / receita.price) * 100 : 0;

  return (
    <div className={design.container}>
      <div className={design.maxWidth}>
        {/* Header */}
        <div className={design.header}>
          <div>
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className={design.title}>Editar: {receita.name}</h1>
            <p className={design.subtitle}>Edite os ingredientes e informações da receita</p>
          </div>
          <div className="flex gap-2">
            <button className={design.btnSecondary}><ShoppingCart size={16} /> Enviar para Compras</button>
            <button onClick={salvarReceita} disabled={salvando} className={design.btnPrimary}>
              <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Dados da Receita */}
        <div className={design.card}>
          <h2 className={design.cardTitle}>📋 Dados da Receita</h2>
          <div className={design.grid2}>
            <div>
              <label className={design.label}>Nome</label>
              <input 
                type="text" 
                value={receita.name} 
                onChange={(e) => setReceita({ ...receita, name: e.target.value })}
                className={design.input}
              />
            </div>
            <div>
              <label className={design.label}>Categoria</label>
              <select 
                value={receita.category} 
                onChange={(e) => setReceita({ ...receita, category: e.target.value })}
                className={design.select}
              >
                <option value="prato">Prato Principal</option>
                <option value="sobremesa">Sobremesa</option>
                <option value="lanche">Lanche</option>
                <option value="bebida">Bebida</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={design.label}>Descrição</label>
            <textarea 
              value={receita.description || ''} 
              onChange={(e) => setReceita({ ...receita, description: e.target.value })}
              className={design.textarea}
            />
          </div>
          <div className={design.grid3}>
            <div>
              <label className={design.label}>Porções</label>
              <input 
                type="number" 
                value={receita.servings || 1} 
                onChange={(e) => setReceita({ ...receita, servings: parseInt(e.target.value) || 1 })}
                className={design.input}
              />
            </div>
            <div>
              <label className={design.label}>Preço Sugerido (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={receita.price || 0} 
                onChange={(e) => setReceita({ ...receita, price: parseFloat(e.target.value) || 0 })}
                className={design.input}
              />
            </div>
            <div>
              <label className={design.label}>Tempo de Preparo (min)</label>
              <input 
                type="number" 
                value={receita.preparationTime || 30} 
                onChange={(e) => setReceita({ ...receita, preparationTime: parseInt(e.target.value) || 30 })}
                className={design.input}
              />
            </div>
          </div>
        </div>

        {/* Ingredientes */}
        <div className={design.card}>
          <h2 className={design.cardTitle}>🧪 Ingredientes</h2>
          
          <div className="flex gap-2 mb-4">
            <select 
              value={novoIngrediente.id}
              onChange={(e) => setNovoIngrediente({ ...novoIngrediente, id: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Selecione um ingrediente...</option>
              {ingredientesDisponiveis.filter(i => !receita.ingredients.some(r => r.ingredientId === i.id)).map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
              ))}
            </select>
            <input 
              type="number" 
              value={novoIngrediente.quantidade}
              onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: parseFloat(e.target.value) || 0 })}
              className="w-24 border border-gray-300 rounded-lg px-4 py-2 text-center"
            />
            <select 
              value={novoIngrediente.unidade}
              onChange={(e) => setNovoIngrediente({ ...novoIngrediente, unidade: e.target.value })}
              className="w-20 border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="un">un</option>
            </select>
            <button onClick={adicionarIngrediente} className={design.btnPrimary}>
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {receita.ingredients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={design.table}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className={design.th}>Ingrediente</th>
                    <th className={design.th}>Quantidade</th>
                    <th className={design.th}>Meta</th>
                    <th className={design.th}>Progresso</th>
                    <th className={design.th}>Custo</th>
                    <th className={design.th}>Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receita.ingredients.map(ing => {
                    const disponivel = ingredientesDisponiveis.find(i => i.id === ing.ingredientId);
                    const temEstoque = disponivel && disponivel.stock >= ing.quantity;
                    const progresso = disponivel ? Math.min(100, (disponivel.stock / ing.quantity) * 100) : 0;
                    const custo = disponivel ? ing.quantity * disponivel.currentPrice : 0;
                    
                    return (
                      <tr key={ing.ingredientId}>
                        <td className={design.td}>{ing.ingredientName}</td>
                        <td className={design.td}>{ing.quantity} {ing.unit}</td>
                        <td className={design.td}>{disponivel?.stock || 0} {ing.unit}</td>
                        <td className={design.td}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{Math.round(progresso)}%</span>
                            <span className={progresso >= 100 ? 'text-green-600' : 'text-yellow-600'}>
                              {progresso >= 100 ? '✅' : '⚠️'}
                            </span>
                          </div>
                        </td>
                        <td className={design.td}>R$ {custo.toFixed(2)}</td>
                        <td className={design.td}>
                          <button onClick={() => removerIngrediente(ing.ingredientId)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Custo Total</td>
                    <td className="px-4 py-3 font-bold text-blue-600">R$ {custoTotal.toFixed(2)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">Nenhum ingrediente adicionado</div>
          )}

          {/* 🎯 BARRA DE PROGRESSO ÚNICA */}
          {receita.ingredients.length > 0 && (
            <div className={design.progressContainer}>
              <div className={design.progressHeader}>
                <span>Progresso Geral do Estoque</span>
                <span>{Math.round(progressoGeral)}%</span>
              </div>
              <div className={design.progressBar}>
                <div 
                  className={`${design.progressFill} ${
                    progressoGeral >= 100 ? 'bg-green-500' : 
                    progressoGeral >= 50 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, progressoGeral)}%` }}
                />
              </div>
              <div className={design.progressLabel}>
                {progressoGeral >= 100 ? (
                  <span className="text-green-600">✅ Todos os ingredientes têm estoque suficiente</span>
                ) : (
                  <span className="text-yellow-600">⚠️ {Math.round(100 - progressoGeral)}% dos ingredientes estão com estoque abaixo do necessário</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cálculo e Resumo Financeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={design.card}>
            <h2 className={design.cardTitle}>📊 Calcular em X Quantidades</h2>
            <div className="flex items-center gap-4 mb-4">
              <label className={design.label}>Quantas porções?</label>
              <input 
                type="number" 
                value={porcoes} 
                onChange={(e) => setPorcoes(parseInt(e.target.value) || 1)}
                className="w-24 border border-gray-300 rounded-lg px-4 py-2 text-center"
              />
              <button className={design.btnSecondary}><Calculator size={16} /> Calcular</button>
            </div>
            
            <div className={design.grid3}>
              <div className={design.statCard}>
                <div className={design.statValue}>R$ {(custoTotal * porcoes).toFixed(2)}</div>
                <div className={design.statLabel}>Custo Total</div>
              </div>
              <div className={design.statCard}>
                <div className={design.statValue}>R$ {(custoTotal).toFixed(2)}</div>
                <div className={design.statLabel}>Custo por Porção</div>
              </div>
              <div className={design.statCard}>
                <div className={`${design.statValue} ${lucro > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(receita.price - custoTotal).toFixed(2)}
                </div>
                <div className={design.statLabel}>Lucro Estimado</div>
              </div>
            </div>
            
            <button className={`${design.btnSuccess} w-full mt-4`}>
              <ShoppingCart size={16} /> Enviar para Compras
            </button>
          </div>

          <div className={design.card}>
            <h2 className={design.cardTitle}>💰 Resumo Financeiro</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Custo Total</span>
                <span className="font-semibold">R$ {custoTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Custo por Porção</span>
                <span className="font-semibold">R$ {(custoTotal / (receita.servings || 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Preço Total</span>
                <span className="font-semibold">R$ {receita.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-gray-600">Lucro Líquido</span>
                <span className={`font-bold ${lucro > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lucro.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-gray-600">Margem</span>
                <span className={`font-bold ${margem > 30 ? 'text-green-600' : margem > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {margem.toFixed(1)}%
                </span>
              </div>
            </div>

            {margem < 30 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">⚠️ Margem baixa!</p>
                  <p className="text-sm text-yellow-700">Considere ajustar o preço ou reduzir custos.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dicas */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">💡 <strong>Dicas de Otimização</strong></p>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            <li>• A barra de progresso mostra o nível geral de estoque para esta receita</li>
            <li>• O lucro líquido é calculado automaticamente com base no preço sugerido</li>
            <li>• Ingredientes podem ser enviados diretamente para a lista de compras</li>
          </ul>
        </div>
      </div>
    </div>
  );
}