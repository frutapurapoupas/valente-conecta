'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

// ============================================================
// DESIGN
// ============================================================
const design = {
  container: "p-6 bg-gray-50 min-h-screen",
  maxWidth: "max-w-5xl mx-auto",
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
  btnSuccess: "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2",
  table: "min-w-full divide-y divide-gray-200",
  th: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
  td: "px-4 py-3 whitespace-nowrap text-sm text-gray-900",
  statCard: "bg-gray-50 rounded-lg p-4 text-center",
  statValue: "text-2xl font-bold",
  statLabel: "text-sm text-gray-500"
};

// ============================================================
// TIPOS
// ============================================================
interface Ingrediente {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  ingredientId: string;
}

interface IngredienteEstoque {
  id: string;
  name: string;
  currentPrice: number;
  unit: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function NovoPratoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState<IngredienteEstoque[]>([]);
  
  // Dados do prato
  const [prato, setPrato] = useState({
    nome: '',
    descricao: '',
    categoria: 'prato',
    tempoPreparo: 30,
    porcoes: 1,
    preco: 0,
    ativo: true,
    destaque: false,
    imagem: ''
  });

  // Ingredientes do prato
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [novoIngrediente, setNovoIngrediente] = useState({ id: '', quantidade: 100, unidade: 'g' });

  useEffect(() => {
    carregarIngredientes();
  }, []);

  async function carregarIngredientes() {
    try {
      const response = await fetch('/api/cozinha/ingredients');
      const data = await response.json();
      if (data.success) {
        setIngredientesDisponiveis(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
    }
  }

  // 🔥 FUNÇÃO CORRIGIDA PARA CALCULAR CUSTO TOTAL
  const calcularCustoTotal = () => {
    return ingredientes.reduce((total, ing) => {
      const preco = ing.precoUnitario || 0;
      let quantidade = ing.quantidade;
      
      // 🔥 CONVERTER GRAMAS PARA KG
      if (ing.unidade === 'g') {
        quantidade = ing.quantidade / 1000; // 160g → 0,16kg
      } else if (ing.unidade === 'ml') {
        quantidade = ing.quantidade / 1000; // ml → L
      }
      
      return total + (quantidade * preco);
    }, 0);
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.id || novoIngrediente.quantidade <= 0) {
      alert('Selecione um ingrediente e defina a quantidade');
      return;
    }

    const item = ingredientesDisponiveis.find(i => i.id === novoIngrediente.id);
    if (!item) return;

    // 🔥 BUSCAR PREÇO DO INGREDIENTE NO ESTOQUE
    const precoUnitario = item.currentPrice || 0;

    const novoIng: Ingrediente = {
      id: Date.now().toString(),
      nome: item.name,
      quantidade: novoIngrediente.quantidade,
      unidade: novoIngrediente.unidade,
      precoUnitario: precoUnitario,
      ingredientId: item.id
    };

    setIngredientes([...ingredientes, novoIng]);
    setNovoIngrediente({ id: '', quantidade: 100, unidade: 'g' });
  };

  const removerIngrediente = (id: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      // Preparar dados para API
      const dados = {
        name: prato.nome,
        description: prato.descricao,
        category: prato.categoria,
        preparationTime: prato.tempoPreparo,
        servings: prato.porcoes,
        price: prato.preco,
        isAvailable: prato.ativo,
        featured: prato.destaque,
        images: prato.imagem ? [prato.imagem] : [],
        ingredients: ingredientes.map(ing => ({
          ingredientId: ing.ingredientId,
          ingredientName: ing.nome,
          quantity: ing.quantidade,
          unit: ing.unidade
        }))
      };

      const response = await fetch('/api/cozinha/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Prato criado com sucesso!');
        router.push('/admin-master/cozinha-chef/receitas');
      } else {
        alert('❌ Erro ao criar prato: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro de conexão');
    } finally {
      setSalvando(false);
    }
  };

  const custoTotal = calcularCustoTotal();
  const lucro = prato.preco - custoTotal;
  const margem = prato.preco > 0 ? (lucro / prato.preco) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const ingredientesDisponiveisParaAdicionar = ingredientesDisponiveis.filter(
    item => !ingredientes.some(ing => ing.ingredientId === item.id)
  );

  return (
    <div className={design.container}>
      <div className={design.maxWidth}>
        {/* Header */}
        <div className={design.header}>
          <div>
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className={design.title}>🍽️ Novo Prato</h1>
            <p className={design.subtitle}>Crie um novo prato para o cardápio</p>
          </div>
          <button onClick={handleSubmit} disabled={salvando} className={design.btnPrimary}>
            <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar Prato'}
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {/* Dados do Prato */}
          <div className={design.card}>
            <h2 className={design.cardTitle}>📋 Dados do Prato</h2>
            <div className="mb-4">
              <label className={design.label}>Nome do Prato *</label>
              <input
                type="text"
                value={prato.nome}
                onChange={(e) => setPrato({ ...prato, nome: e.target.value })}
                placeholder="Ex: Filé à Parmegiana"
                className={design.input}
                required
              />
            </div>

            <div className="mb-4">
              <label className={design.label}>Descrição</label>
              <textarea
                value={prato.descricao}
                onChange={(e) => setPrato({ ...prato, descricao: e.target.value })}
                placeholder="Descreva o prato..."
                className={design.textarea}
              />
            </div>

            <div className={design.grid3}>
              <div>
                <label className={design.label}>Categoria</label>
                <select
                  value={prato.categoria}
                  onChange={(e) => setPrato({ ...prato, categoria: e.target.value })}
                  className={design.select}
                >
                  <option value="prato">🍝 Prato Principal</option>
                  <option value="sobremesa">🍰 Sobremesa</option>
                  <option value="lanche">🥪 Lanche</option>
                  <option value="bolo">🧁 Bolo</option>
                </select>
              </div>

              <div>
                <label className={design.label}>Tempo de Preparo (min)</label>
                <input
                  type="number"
                  value={prato.tempoPreparo}
                  onChange={(e) => setPrato({ ...prato, tempoPreparo: parseInt(e.target.value) || 0 })}
                  className={design.input}
                />
              </div>

              <div>
                <label className={design.label}>Porções</label>
                <input
                  type="number"
                  value={prato.porcoes}
                  onChange={(e) => setPrato({ ...prato, porcoes: parseInt(e.target.value) || 0 })}
                  className={design.input}
                />
              </div>
            </div>

            <div>
              <label className={design.label}>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={prato.preco}
                onChange={(e) => setPrato({ ...prato, preco: parseFloat(e.target.value) || 0 })}
                className={design.input}
              />
            </div>
          </div>

          {/* Ingredientes */}
          <div className={design.card}>
            <h2 className={design.cardTitle}>🧪 Ingredientes</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              <select
                value={novoIngrediente.id}
                onChange={(e) => setNovoIngrediente({ ...novoIngrediente, id: e.target.value })}
                className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Selecione um ingrediente...</option>
                {ingredientesDisponiveisParaAdicionar
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
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
              <button type="button" onClick={adicionarIngrediente} className={design.btnPrimary}>
                <Plus size={16} /> Adicionar
              </button>
            </div>

            {ingredientes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={design.table}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={design.th}>Ingrediente</th>
                      <th className={design.th}>Quantidade</th>
                      <th className={design.th}>Unidade</th>
                      <th className={design.th}>Custo</th>
                      <th className={design.th}>Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ingredientes.map((ing) => {
                      // 🔥 CALCULAR CUSTO CORRETO
                      let quantidade = ing.quantidade;
                      if (ing.unidade === 'g') quantidade = ing.quantidade / 1000;
                      else if (ing.unidade === 'ml') quantidade = ing.quantidade / 1000;
                      const custo = quantidade * ing.precoUnitario;
                      
                      return (
                        <tr key={ing.id}>
                          <td className={design.td}>{ing.nome}</td>
                          <td className={design.td}>{ing.quantidade}</td>
                          <td className={design.td}>{ing.unidade}</td>
                          <td className={design.td}>{formatCurrency(custo)}</td>
                          <td className={design.td}>
                            <button type="button" onClick={() => removerIngrediente(ing.id)} className="text-red-600">
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
                      <td colSpan={2} className="px-4 py-3 font-bold text-blue-600">{formatCurrency(custoTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">Nenhum ingrediente adicionado</div>
            )}
          </div>

          {/* Status */}
          <div className={design.card}>
            <h2 className={design.cardTitle}>⚙️ Status</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prato.ativo}
                  onChange={(e) => setPrato({ ...prato, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                Prato Ativo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prato.destaque}
                  onChange={(e) => setPrato({ ...prato, destaque: e.target.checked })}
                  className="w-4 h-4"
                />
                ⭐ Destaque
              </label>
            </div>
          </div>

          {/* Imagem */}
          <div className={design.card}>
            <h2 className={design.cardTitle}>🖼️ Imagem</h2>
            <div>
              <label className={design.label}>URL da imagem</label>
              <input
                type="text"
                value={prato.imagem}
                onChange={(e) => setPrato({ ...prato, imagem: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className={design.input}
              />
              <p className="text-xs text-gray-400 mt-1">Deixe em branco para usar placeholder automático</p>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className={design.card}>
            <h2 className={design.cardTitle}>💰 Resumo</h2>
            <div className={design.grid3}>
              <div className={design.statCard}>
                <div className={design.statValue}>{formatCurrency(custoTotal)}</div>
                <div className={design.statLabel}>Custo Total</div>
              </div>
              <div className={design.statCard}>
                <div className={design.statValue}>{formatCurrency(prato.preco)}</div>
                <div className={design.statLabel}>Preço de Venda</div>
              </div>
              <div className={`${design.statCard} ${lucro > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`${design.statValue} ${lucro > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(lucro)}
                </div>
                <div className={design.statLabel}>Lucro</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className={`px-4 py-2 rounded-lg font-bold ${margem > 30 ? 'bg-green-100 text-green-800' : margem > 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                Margem: {margem.toFixed(1)}%
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}