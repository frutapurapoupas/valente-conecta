'use client';

import { useCallback, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, Users, Calendar, ArrowUp, ArrowDown, Radio } from 'lucide-react';
import { useUsuariosRealtime } from '@/lib/hooks/useUsuariosRealtime';
import { CardsResumoUsuarios, GraficoCadastrosPorDia, GraficoPorCidade, GraficoPorStatus, type MetricasUsuarios } from '../components/GraficosUsuarios';

type Metricas = {
  faturamentoHoje: number;
  faturamentoMes: number;
  faturamentoOntem: number;
  totalPedidosHoje: number;
  totalPedidosMes: number;
  totalProdutosVendidos: number;
  ticketMedio: number;
  margemMedia: number;
  topProdutos: { name: string; quantity: number; revenue: number }[];
  vendasPorDia: { dia: string; total: number; pedidos: number }[];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export default function DashboardMetricas() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [metricasUsuarios, setMetricasUsuarios] = useState<MetricasUsuarios | null>(null);

  const carregarUsuarios = useCallback(async () => {
    const res = await fetch('/api/admin-master/usuarios-metricas', { cache: 'no-store' }).then((r) => r.json());
    if (res.success) setMetricasUsuarios(res.data);
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  useUsuariosRealtime(carregarUsuarios);

  const carregarMetricas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cozinha/orders');
      const data = await response.json();
      
      if (data.success && data.data) {
        const orders = data.data;
        const hoje = new Date().toDateString();
        const ontem = new Date(Date.now() - 86400000).toDateString();
        const mesAtual = new Date().getMonth();
        
        const pedidosHoje = orders.filter((o: any) => new Date(o.createdAt).toDateString() === hoje);
        const pedidosOntem = orders.filter((o: any) => new Date(o.createdAt).toDateString() === ontem);
        const pedidosMes = orders.filter((o: any) => new Date(o.createdAt).getMonth() === mesAtual);
        
        const faturamentoHoje = pedidosHoje.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const faturamentoOntem = pedidosOntem.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const faturamentoMes = pedidosMes.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        
        const ticketMedio = pedidosHoje.length > 0 ? faturamentoHoje / pedidosHoje.length : 0;
        
        const produtosVendidos: Record<string, { name: string; quantity: number; revenue: number }> = {};
        orders.forEach((order: any) => {
          const items = JSON.parse(order.items || '[]');
          items.forEach((item: any) => {
            if (!produtosVendidos[item.name]) {
              produtosVendidos[item.name] = { name: item.name, quantity: 0, revenue: 0 };
            }
            produtosVendidos[item.name].quantity += item.quantity || 0;
            produtosVendidos[item.name].revenue += (item.price || 0) * (item.quantity || 0);
          });
        });
        
        const topProdutos = Object.values(produtosVendidos)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const vendasPorDia = dias.map((dia, idx) => {
          const pedidosDia = orders.filter((o: any) => new Date(o.createdAt).getDay() === idx);
          return {
            dia,
            total: pedidosDia.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
            pedidos: pedidosDia.length
          };
        });
        
        setMetricas({
          faturamentoHoje,
          faturamentoMes,
          faturamentoOntem,
          totalPedidosHoje: pedidosHoje.length,
          totalPedidosMes: pedidosMes.length,
          totalProdutosVendidos: Object.values(produtosVendidos).reduce((sum, p) => sum + p.quantity, 0),
          ticketMedio,
          margemMedia: 65,
          topProdutos,
          vendasPorDia
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarMetricas();
    const interval = setInterval(carregarMetricas, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const variacao = metricas 
    ? ((metricas.faturamentoHoje - metricas.faturamentoOntem) / (metricas.faturamentoOntem || 1)) * 100 
    : 0;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!metricas) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Nenhum dado disponível</p>
          <button 
            onClick={carregarMetricas} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Dashboard de Métricas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Análise de desempenho da cozinha</p>
          </div>
          <button
            onClick={carregarMetricas}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <TrendingUp size={18} /> Atualizar
          </button>
        </div>
        
        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metricas.faturamentoHoje)}</p>
                <div className={`flex items-center gap-1 mt-1 text-sm ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {variacao >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>{Math.abs(variacao).toFixed(1)}% vs ontem</span>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Pedidos Hoje</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metricas.totalPedidosHoje}</p>
                <p className="text-sm text-gray-500 mt-1">Ticket médio: {formatCurrency(metricas.ticketMedio)}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Produtos Vendidos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metricas.totalProdutosVendidos}</p>
                <p className="text-sm text-gray-500 mt-1">Itens no total</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Margem Média</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metricas.margemMedia.toFixed(1)}%</p>
                <p className="text-sm text-green-600 mt-1">? 2.5% vs mês anterior</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Faturamento do Mês + Top Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold mb-4">💰 Faturamento do Mês</h2>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{formatCurrency(metricas.faturamentoMes)}</p>
              <p className="text-sm text-gray-500 mt-1">Total de {metricas.totalPedidosMes} pedidos</p>
            </div>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min(100, (metricas.faturamentoHoje / (metricas.faturamentoMes / 30 || 1)) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Top Produtos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-bold mb-4">🏆 Mais Vendidos</h2>
            <div className="space-y-3">
              {metricas.topProdutos.length > 0 ? (
                metricas.topProdutos.map((produto, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                      <span className="text-sm font-medium truncate">{produto.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{produto.quantity}x</span>
                      <span className="text-sm text-gray-500 ml-2">{formatCurrency(produto.revenue)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum produto vendido ainda</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Usuários */}
        {metricasUsuarios && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Users size={18} /> Usuários</h2>
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <Radio className="w-3 h-3 animate-pulse" /> Ao vivo
              </span>
            </div>
            <CardsResumoUsuarios metricas={metricasUsuarios} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <GraficoCadastrosPorDia dados={metricasUsuarios.cadastrosPorDia} />
              <GraficoPorCidade dados={metricasUsuarios.porCidade} />
              <GraficoPorStatus status={metricasUsuarios.porStatus} />
            </div>
          </div>
        )}

        {/* Vendas por Dia da Semana */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-bold mb-4">📅 Vendas por Dia da Semana</h2>
          <div className="space-y-3">
            {metricas.vendasPorDia.map((dia) => {
              const maxTotal = Math.max(...metricas.vendasPorDia.map(d => d.total));
              return (
                <div key={dia.dia}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dia.dia}</span>
                    <span className="font-semibold">{formatCurrency(dia.total)} ({dia.pedidos} pedidos)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${maxTotal > 0 ? (dia.total / maxTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

