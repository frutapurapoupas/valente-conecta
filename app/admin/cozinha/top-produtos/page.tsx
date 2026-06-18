'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Award, Package, DollarSign, Calendar } from 'lucide-react';

type ProdutoRanking = {
  name: string;
  quantity: number;
  revenue: number;
  orders: number;
};

export default function TopProdutos() {
  const [produtos, setProdutos] = useState<ProdutoRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'total'>('mes');
  const [totalGeral, setTotalGeral] = useState({ quantity: 0, revenue: 0 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const carregarTopProdutos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/orders');
      const data = await response.json();
      
      if (data.success && data.data) {
        const agora = new Date();
        const limite = new Date();
        if (periodo === 'semana') limite.setDate(agora.getDate() - 7);
        if (periodo === 'mes') limite.setDate(agora.getDate() - 30);
        
        const produtosMap: Record<string, ProdutoRanking> = {};
        let totalQuantity = 0;
        let totalRevenue = 0;
        
        data.data.forEach((order: any) => {
          const dataOrder = new Date(order.createdAt);
          if (periodo !== 'total' && dataOrder < limite) return;
          
          const items = JSON.parse(order.items || '[]');
          items.forEach((item: any) => {
            if (!produtosMap[item.name]) {
              produtosMap[item.name] = { name: item.name, quantity: 0, revenue: 0, orders: 0 };
            }
            produtosMap[item.name].quantity += item.quantity;
            produtosMap[item.name].revenue += item.price * item.quantity;
            produtosMap[item.name].orders++;
            totalQuantity += item.quantity;
            totalRevenue += item.price * item.quantity;
          });
        });
        
        const ranking = Object.values(produtosMap).sort((a, b) => b.quantity - a.quantity);
        setProdutos(ranking);
        setTotalGeral({ quantity: totalQuantity, revenue: totalRevenue });
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTopProdutos();
  }, [periodo]);

  const getMedalha = (posicao: number) => {
    if (posicao === 0) return '🥇';
    if (posicao === 1) return '🥈';
    if (posicao === 2) return '🥉';
    return `${posicao + 1}º`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Produtos Mais Vendidos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ranking de produtos por quantidade vendida</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === 'semana' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === 'mes' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Último Mês
          </button>
          <button
            onClick={() => setPeriodo('total')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodo === 'total' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Total Geral
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Receita</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {produtos.map((produto, idx) => (
                      <tr key={produto.name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-center">{getMedalha(idx)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{produto.name}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-blue-600">{produto.quantity}x</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600">{formatCurrency(produto.revenue)}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">{produto.orders}</td>
                      </tr>
                    ))}
                    {produtos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Nenhum produto vendido no período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Award size={24} />
                <h3 className="font-bold">Top Produto</h3>
              </div>
              {produtos[0] ? (
                <>
                  <p className="text-2xl font-bold mt-2">{produtos[0].name}</p>
                  <p className="text-sm opacity-90 mt-1">{produtos[0].quantity} unidades vendidas</p>
                  <p className="text-sm opacity-90">{formatCurrency(produtos[0].revenue)}</p>
                </>
              ) : (
                <p className="mt-2">Nenhum dado disponível</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Total de Unidades</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalGeral.quantity}</p>
              <p className="text-sm text-gray-500">produtos vendidos</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-green-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Receita Total</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalGeral.revenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}