// app/admin/cozinha/dashboard/page.tsx
// Responsabilidade: APENAS montar os componentes na tela
// NÃO contém lógica de dados, NÃO contém cores/hardcoded

'use client';

import { useDashboardData } from './useDashboardData';
import { dashboardDesign as design } from './design.config';
import {
  RefreshCw, Loader2, ChefHat, Package, TrendingDown, DollarSign,
  TrendingUp, ShoppingBag, Users, Award, Clock, BarChart3, PieChart as PieChartIcon,
  Wallet, Crown, CreditCard, Landmark, Coins, HandCoins, PiggyBank
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const { metrics, isLoading, error, reload } = useDashboardData();

  if (isLoading) {
    return (
      <div className={design.classes.container}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">{design.titles.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={design.classes.container}>
        <div className="text-center py-12">
          <p className="text-red-600">{design.titles.error}</p>
          <button onClick={reload} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            {design.titles.retry}
          </button>
        </div>
      </div>
    );
  }

  // Calcular total para porcentagens
  const totalPagamentos = metrics.pagamentosParaGrafico.reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className={design.classes.container}>
      {/* Header */}
      <div className={design.classes.header}>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-green-600" />
            {design.titles.main}
          </h1>
          <p className="text-gray-500 mt-1">{design.titles.subtitle}</p>
        </div>
        <button onClick={reload} className={design.classes.refreshButton}>
          <RefreshCw className="w-4 h-4" />
          {design.titles.refresh}
        </button>
      </div>

      {/* LINHA 1: Ingredientes */}
      <div className={design.classes.grid4}>
        <div className={`bg-gradient-to-br ${design.cardColors.ingredients} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">{design.labels.totalIngredients}</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalIngredientes}</p>
            </div>
            <div className={design.classes.cardIcon}><Package className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.lowStock} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm">{design.labels.lowStock}</p>
              <p className="text-3xl font-bold mt-1">{metrics.itensEstoqueBaixo}</p>
            </div>
            <div className={design.classes.cardIcon}><TrendingDown className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.stockValue} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">{design.labels.stockValue}</p>
              <p className="text-2xl font-bold mt-1">{design.formatCurrency(metrics.valorEstoque)}</p>
            </div>
            <div className={design.classes.cardIcon}><DollarSign className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.avgPrice} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-teal-100 text-sm">{design.labels.avgPrice}</p>
              <p className="text-2xl font-bold mt-1">{design.formatCurrency(metrics.precoMedioIngredientes)}</p>
            </div>
            <div className={design.classes.cardIcon}><Wallet className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* LINHA 2: Vendas */}
      <div className={design.classes.grid4}>
        <div className={`bg-gradient-to-br ${design.cardColors.revenueToday} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm">{design.labels.revenueToday}</p>
              <p className="text-2xl font-bold mt-1">{design.formatCurrency(metrics.faturamentoHoje)}</p>
              <p className="text-emerald-100 text-xs mt-1">{metrics.totalPedidosHoje} pedidos</p>
            </div>
            <div className={design.classes.cardIcon}><TrendingUp className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.revenueMonth} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-100 text-sm">{design.labels.revenueMonth}</p>
              <p className="text-2xl font-bold mt-1">{design.formatCurrency(metrics.faturamentoMes)}</p>
              <p className="text-cyan-100 text-xs mt-1">{metrics.totalPedidosMes} pedidos</p>
            </div>
            <div className={design.classes.cardIcon}><ShoppingBag className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.ordersToday} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">{design.labels.averageTicket}</p>
              <p className="text-3xl font-bold mt-1">{design.formatCurrency(metrics.ticketMedio)}</p>
            </div>
            <div className={design.classes.cardIcon}><Users className="w-6 h-6" /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${design.cardColors.totalClients} ${design.classes.card}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-pink-100 text-sm">{design.labels.totalClients}</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalClientes}</p>
            </div>
            <div className={design.classes.cardIcon}><Crown className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* LINHA 3: Gráfico de Métodos de Pagamento */}
      <div className={design.classes.grid2}>
        <div className={design.classes.chartContainer}>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className={design.classes.chartTitle}>{design.labels.paymentMethods} - {design.labels.paymentByValue}</h2>
          </div>
          {totalPagamentos > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={metrics.pagamentosParaGrafico.filter(p => p.valor > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="valor"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.pagamentosParaGrafico.filter(p => p.valor > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => design.formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-5 gap-2 mt-4">
                {metrics.pagamentosParaGrafico.map(p => (
                  <div key={p.name} className={design.classes.miniCard}>
                    <p className="text-xs text-gray-500">{p.name}</p>
                    <p className="text-sm font-bold" style={{ color: p.cor }}>{design.formatCurrency(p.valor)}</p>
                    <p className="text-xs text-gray-400">{p.quantidade} pedidos</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">Aguardando dados de pagamentos</div>
          )}
        </div>

        <div className={design.classes.chartContainer}>
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-green-600" />
            <h2 className={design.classes.chartTitle}>{design.labels.paymentMethods} - {design.labels.paymentByCount}</h2>
          </div>
          {totalPagamentos > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.pagamentosParaGrafico.filter(p => p.quantidade > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} pedidos`, 'Quantidade']} />
                <Legend />
                <Bar dataKey="quantidade" fill={design.chartColors.barFill} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">Aguardando dados de pagamentos</div>
          )}
        </div>
      </div>

      {/* LINHA 4: Vendas por Dia e Top Produtos */}
      <div className={design.classes.grid2}>
        <div className={design.classes.chartContainer}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <h2 className={design.classes.chartTitle}>{design.labels.salesByDay}</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => design.formatCurrency(v)} />
              <Tooltip formatter={(v) => design.formatCurrency(v as number)} />
              <Legend />
              <Bar dataKey="vendas" fill={design.chartColors.barFill} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={design.classes.chartContainer}>
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-green-600" />
            <h2 className={design.classes.chartTitle}>{design.labels.topProducts}</h2>
          </div>
          <div className="space-y-3">
            {metrics.topProdutos.length > 0 ? (
              metrics.topProdutos.map((item, idx) => (
                <div key={idx} className={design.classes.topItem}>
                  <div className="flex items-center gap-3">
                    <div className={design.classes.topItemNumber}>{idx + 1}</div>
                    <div>
                      <p className={design.classes.topItemName}>{item.nome}</p>
                      <p className={design.classes.topItemQuantity}>{design.formatNumber(item.quantidade)} {design.labels.units}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={design.classes.topItemValue}>{design.formatCurrency(item.receita)}</p>
                    <p className={design.classes.topItemLabel}>{design.labels.revenue}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">Aguardando dados de vendas</div>
            )}
          </div>
        </div>
      </div>

      {/* LINHA 5: Top Clientes */}
      <div className={design.classes.chartContainer}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h2 className={design.classes.chartTitle}>{design.labels.topClients}</h2>
        </div>
        <div className="space-y-3">
          {metrics.topClientes.length > 0 ? (
            metrics.topClientes.map((cliente, idx) => (
              <div key={idx} className={design.classes.topItem}>
                <div className="flex items-center gap-3">
                  <div className={design.classes.topItemNumber}>{idx + 1}</div>
                  <div>
                    <p className={design.classes.topItemName}>{cliente.nome}</p>
                    <p className={design.classes.topItemQuantity}>{design.formatNumber(cliente.pedidos)} pedidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={design.classes.topItemValue}>{design.formatCurrency(cliente.totalGasto)}</p>
                  <p className={design.classes.topItemLabel}>{design.labels.spent}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">Aguardando dados de clientes</div>
          )}
        </div>
      </div>

      {/* Alertas */}
      {metrics.alerts.length > 0 && (
        <div className={design.classes.alertContainer}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h2 className={design.classes.chartTitle}>{design.labels.alerts}</h2>
          </div>
          {metrics.alerts.map((alert, idx) => (
            <div key={idx} className={design.classes.alertBox}>
              {alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
