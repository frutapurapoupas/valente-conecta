'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  lowStockCount: number;
  totalRecipes: number;
  activeRecipes: number;
  totalSuppliers: number;
  pendingPurchases: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    stock: number;
    minStock: number;
    unit: string;
  }>;
  recentMovements: Array<{
    id: string;
    type: string;
    quantity: number;
    reason: string;
    createdAt: string;
    ingredient: { name: string };
  }>;
  topRecipes: Array<{
    id: string;
    name: string;
    sellingPrice: number;
  }>;
}

export default function CozinhaDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
    loadShoppingList();
    const interval = setInterval(() => {
      loadDashboard();
      loadShoppingList();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/cozinha/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingList = async () => {
    try {
      const response = await fetch('/api/cozinha/shopping-list');
      const data = await response.json();
      setShoppingList(data);
    } catch (error) {
      console.error('Erro ao carregar lista de compras:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-900 dark:text-gray-100">Carregando dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard da Cozinha</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Estoque Baixo</div>
          <div className={`text-2xl font-bold ${stats?.lowStockCount && stats.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {stats?.lowStockCount || 0}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">itens precisam reposição</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Receitas</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalRecipes || 0}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{stats?.activeRecipes || 0} ativas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Fornecedores</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalSuppliers || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Compras Pendentes</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingPurchases || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Lista de Compras</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{shoppingList?.totalItems || 0}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            R$ {shoppingList?.totalEstimatedCost?.toFixed(2) || '0'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Itens com estoque baixo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">⚠️ Itens com Estoque Baixo</h2>
          </div>
          <div className="p-4">
            {stats?.lowStockItems?.length === 0 ? (
              <p className="text-green-600 dark:text-green-400 text-center py-4">✅ Todos os itens estão com estoque OK!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats?.lowStockItems?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <div className="text-right">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {item.stock} / {item.minStock} {item.unit}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Faltam {(item.minStock - item.stock).toFixed(2)} {item.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Compras */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🛒 Lista de Compras Sugerida</h2>
          </div>
          <div className="p-4">
            {shoppingList?.shoppingList?.length === 0 ? (
              <p className="text-green-600 dark:text-green-400 text-center py-4">✅ Nenhum item precisa ser comprado!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shoppingList?.groupedBySupplier && Object.entries(shoppingList.groupedBySupplier).map(([key, group]: [string, any]) => (
                  <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{group.supplierName}</div>
                    {group.items.map((item: any) => (
                      <div key={item.ingredientId} className="flex justify-between text-sm py-1 text-gray-600 dark:text-gray-400">
                        <span>{item.ingredientName}</span>
                        <span className="font-mono">
                          {item.neededQuantity.toFixed(2)} {item.unit} 
                          (R$ {item.estimatedCost.toFixed(2)})
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 text-right font-semibold text-gray-900 dark:text-white">
                      Total: R$ {group.totalCost.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Últimas movimentações */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Últimas Movimentações</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2">Data</th>
                  <th className="pb-2">Ingrediente</th>
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Quantidade</th>
                  <th className="pb-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentMovements?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                ) : (
                  stats?.recentMovements?.map((movement) => (
                    <tr key={movement.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 text-sm text-gray-600 dark:text-gray-400">{new Date(movement.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 text-gray-900 dark:text-white">{movement.ingredient?.name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          movement.type === 'entrada' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{movement.quantity}</td>
                      <td className="py-2 text-sm text-gray-500 dark:text-gray-400">{movement.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}