'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, RefreshCw, Plus, Edit, Trash2, 
  Utensils, Cake, Coffee, AlertCircle, CheckCircle 
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================
interface Ingrediente {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

interface Receita {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: Ingrediente[];
  preparationTime: number;
  servings: number;
  isAvailable: boolean;
  images?: string[];
  createdAt: string;
}

// ============================================================
// DESIGN SEPARADO
// ============================================================
const design = {
  container: "p-6 bg-gray-50 min-h-screen",
  maxWidth: "max-w-7xl mx-auto",
  
  header: "flex flex-wrap items-center justify-between gap-4 mb-6",
  title: "text-2xl font-bold text-gray-800 flex items-center gap-2",
  subtitle: "text-sm text-gray-500",
  
  stats: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6",
  statCard: "bg-white rounded-lg shadow p-4 text-center",
  statValue: "text-2xl font-bold",
  statLabel: "text-xs text-gray-500 uppercase",
  
  tabsContainer: "flex flex-wrap gap-2 mb-6 border-b border-gray-200",
  tab: "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer",
  tabActive: "bg-blue-600 text-white",
  tabInactive: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  
  searchContainer: "flex gap-3 mb-6",
  searchInput: "flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
  btnRefresh: "p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition",
  btnNew: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2",
  
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  card: "bg-white rounded-lg shadow hover:shadow-md transition p-4 border border-gray-100",
  cardHeader: "flex justify-between items-start",
  cardName: "font-semibold text-lg text-gray-800",
  cardCategory: "text-xs bg-gray-100 px-2 py-1 rounded-full",
  cardDescription: "text-sm text-gray-500 mt-1 line-clamp-2",
  cardMeta: "flex flex-wrap gap-3 mt-3 text-xs text-gray-400",
  cardFooter: "flex justify-between items-center mt-3 pt-3 border-t border-gray-100",
  cardPrice: "text-lg font-bold text-green-600",
  cardActions: "flex gap-1",
  btnAction: "p-1.5 rounded hover:bg-gray-100 transition",
  
  emptyState: "text-center py-12 text-gray-500",
  loadingState: "text-center py-12"
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ReceitasPage() {
  const router = useRouter();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todas');

  const abas = [
    { id: 'todas', label: '📋 Todas' },
    { id: 'prato', label: '🍽️ Pratos' },
    { id: 'sobremesa', label: '🍰 Sobremesas' },
    { id: 'bolo', label: '🧁 Bolos' }
  ];

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/recipes');
      const result = await response.json();
      if (result.success) {
        setReceitas(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function excluirReceita(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    try {
      const response = await fetch(`/api/cozinha/recipes?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        await carregarReceitas();
      } else {
        alert('Erro ao excluir receita.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Filtrar por aba
  const receitasFiltradas = receitas.filter((r: Receita) => {
    const matchSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '';
    const matchAba = abaAtiva === 'todas' || r.category === abaAtiva;
    return matchSearch && matchAba;
  });

  // Estatísticas
  const totalReceitas = receitas.length;
  const totalPratos = receitas.filter((r: Receita) => r.category === 'prato').length;
  const totalSobremesas = receitas.filter((r: Receita) => r.category === 'sobremesa').length;
  const totalBolos = receitas.filter((r: Receita) => r.category === 'bolo').length;

  if (loading) {
    return <div className={design.loadingState}>Carregando receitas...</div>;
  }

  return (
    <div className={design.container}>
      <div className={design.maxWidth}>
        {/* Header */}
        <div className={design.header}>
          <div>
            <h1 className={design.title}>📋 Receitas</h1>
            <p className={design.subtitle}>Gerencie os pratos, sobremesas e bolos</p>
          </div>
          {/* 🔥 CORRIGIDO: Botão Nova Receita aponta para /pratos/novo */}
          <button 
            onClick={() => router.push('/admin-master/cozinha-chef/pratos/novo')}
            className={design.btnNew}
          >
            <Plus size={18} /> Nova Receita
          </button>
        </div>

        {/* Estatísticas */}
        <div className={design.stats}>
          <div className={design.statCard}>
            <div className={design.statValue}>{totalReceitas}</div>
            <div className={design.statLabel}>Total de Receitas</div>
          </div>
          <div className={design.statCard}>
            <div className={design.statValue}>{totalPratos}</div>
            <div className={design.statLabel}>🍽️ Pratos</div>
          </div>
          <div className={design.statCard}>
            <div className={design.statValue}>{totalSobremesas}</div>
            <div className={design.statLabel}>🍰 Sobremesas</div>
          </div>
          <div className={design.statCard}>
            <div className={design.statValue}>{totalBolos}</div>
            <div className={design.statLabel}>🧁 Bolos</div>
          </div>
        </div>

        {/* Abas */}
        <div className={design.tabsContainer}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`${design.tab} ${abaAtiva === aba.id ? design.tabActive : design.tabInactive}`}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className={design.searchContainer}>
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar receita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${design.searchInput} pl-10`}
            />
          </div>
          <button onClick={carregarReceitas} className={design.btnRefresh} title="Atualizar">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Grid de Receitas */}
        {receitasFiltradas.length === 0 ? (
          <div className={design.emptyState}>
            <p>Nenhuma receita encontrada</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou criar uma nova receita</p>
          </div>
        ) : (
          <div className={design.grid}>
            {receitasFiltradas.map((receita: Receita) => (
              <div key={receita.id} className={design.card}>
                <div className={design.cardHeader}>
                  <h3 className={design.cardName}>{receita.name}</h3>
                  <span className={design.cardCategory}>
                    {receita.category === 'prato' ? '🍽️ Prato' : 
                     receita.category === 'sobremesa' ? '🍰 Sobremesa' : 
                     receita.category === 'bolo' ? '🧁 Bolo' : receita.category}
                  </span>
                </div>
                <p className={design.cardDescription}>{receita.description || 'Sem descrição'}</p>
                <div className={design.cardMeta}>
                  <span>🍽️ {receita.servings || 1} porções</span>
                  <span>📦 {receita.ingredients?.length || 0} ingredientes</span>
                </div>
                <div className={design.cardFooter}>
                  <span className={design.cardPrice}>{formatCurrency(receita.price || 0)}</span>
                  <div className={design.cardActions}>
                    <button
                      onClick={() => router.push(`/admin-master/cozinha-chef/receitas/editar/${receita.id}`)}
                      className={design.btnAction}
                      title="Editar"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => excluirReceita(receita.id, receita.name)}
                      className={design.btnAction}
                      title="Excluir"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}