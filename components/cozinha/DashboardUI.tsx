// components/cozinha/DashboardUI.tsx
// 🎨 UI - Dashboard Cozinha (Layout Principal)

"use client";

import Link from 'next/link';
import {
  Utensils,
  Package,
  Factory,
  DollarSign,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DashboardStats } from '@/types/cozinha';

// ============================================================
// CHART.JS - REGISTRO DE COMPONENTES
// ============================================================
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// ============================================================
// COMPONENTES UI
// ============================================================

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  trend,
  trendValue
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color: string; 
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  return (
    <div className={`p-4 rounded-xl border ${color} bg-gray-800/50 hover:bg-gray-800/70 transition`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend && trendValue && (
            <p className={`text-xs ${trendColors[trend]} mt-1 flex items-center gap-1`}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              {trendValue}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('border', 'bg').replace('/30', '/20')} flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function AlertCard({ 
  title, 
  message, 
  type,
  action,
  onAction
}: { 
  title: string; 
  message: string; 
  type: 'warning' | 'danger' | 'success' | 'info';
  action?: string;
  onAction?: () => void;
}) {
  const colors = {
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    danger: 'border-red-500/30 bg-red-500/10 text-red-400',
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
  };

  const icons = {
    warning: AlertCircle,
    danger: AlertCircle,
    success: CheckCircle,
    info: Clock
  };

  const Icon = icons[type];

  return (
    <div className={`p-3 rounded-lg border ${colors[type]} flex items-start gap-3`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs opacity-80">{message}</p>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition whitespace-nowrap"
        >
          {action}
        </button>
      )}
    </div>
  );
}

function QuickLink({ 
  href, 
  icon: Icon, 
  title, 
  description,
  badge
}: { 
  href: string; 
  icon: any; 
  title: string; 
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/50 hover:bg-gray-800 transition-all group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-green-400 group-hover:text-green-300" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {badge && (
          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </Link>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function DashboardUI({
  stats,
  loading,
  error,
  onRefresh,
  pizzaData,
  barData,
  lineData,
  chartOptions,
  pizzaOptions
}: {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;          // ✅ Mantido como void (não async)
  pizzaData: any;
  barData: any;
  lineData: any;
  chartOptions: any;
  pizzaOptions: any;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando dados da cozinha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-center text-red-400">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-900">
        <div className="text-center text-gray-400">
          <p className="text-lg">Nenhum dado disponível</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Carregar dados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="text-green-400" />
            Dashboard Cozinha
          </h1>
          <p className="text-sm text-gray-400">Visão geral da gestão da cozinha</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin-master/cozinha-chef/pratos"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <Utensils size={16} /> Gerenciar Pratos
          </Link>
          <Link
            href="/admin-master/cozinha-chef/receitas"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <Eye size={16} /> Receitas
          </Link>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
          >
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {stats.insumosBaixos > 0 && (
          <AlertCard
            type="warning"
            title={`${stats.insumosBaixos} insumos com estoque baixo`}
            message="Alguns insumos estão abaixo do mínimo. Gere uma lista de compras."
            action="Ver lista"
            onAction={() => window.location.href = '/admin-master/cozinha-chef/compras'}
          />
        )}
        {stats.producaoPendente > 0 && (
          <AlertCard
            type="info"
            title={`${stats.producaoPendente} produções pendentes`}
            message="Acompanhe o status da produção para concluir os pedidos."
            action="Ver produção"
            onAction={() => window.location.href = '/admin-master/cozinha-chef/producao'}
          />
        )}
        {stats.margem < 30 && stats.margem > 0 && (
          <AlertCard
            type="danger"
            title={`Margem baixa: ${stats.margem.toFixed(1)}%`}
            message="Considere ajustar os preços ou reduzir custos."
          />
        )}
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Pratos"
          value={stats.pratosAtivos}
          icon={Utensils}
          color="border-green-500/30"
          subtitle={`Total: ${stats.totalPratos}`}
          trend="up"
          trendValue={`${stats.pratosAtivos} ativos`}
        />
        <StatCard
          title="Insumos"
          value={stats.totalInsumos}
          icon={Package}
          color="border-blue-500/30"
          subtitle={`⚠️ ${stats.insumosBaixos} baixos`}
          trend={stats.insumosBaixos > 5 ? 'down' : 'up'}
          trendValue={stats.insumosBaixos > 5 ? 'Alerta de estoque' : 'Estoque OK'}
        />
        <StatCard
          title="Produção"
          value={`${stats.producaoConcluida}/${stats.producaoHoje}`}
          icon={Factory}
          color="border-purple-500/30"
          subtitle={`${stats.producaoPendente} pendentes`}
          trend={stats.producaoPendente > 0 ? 'down' : 'up'}
          trendValue={stats.producaoPendente > 0 ? 'Produção pendente' : 'Tudo concluído'}
        />
        <StatCard
          title="Lucro do Mês"
          value={`R$ ${stats.lucroMes.toFixed(2)}`}
          icon={DollarSign}
          color={stats.lucroMes >= 0 ? 'border-green-500/30' : 'border-red-500/30'}
          subtitle={`Margem: ${stats.margem.toFixed(1)}%`}
          trend={stats.lucroMes >= 0 ? 'up' : 'down'}
          trendValue={stats.lucroMes >= 0 ? 'Lucrativo' : 'Prejuízo'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">📊 Distribuição de Pratos</h3>
          <div className="h-48 flex items-center justify-center">
            <Pie data={pizzaData} options={pizzaOptions} />
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">📊 Status da Produção</h3>
          <div className="h-48 flex items-center justify-center">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">📊 Financeiro</h3>
          <div className="h-48 flex items-center justify-center">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink 
          href="/admin-master/cozinha-chef/pratos"
          icon={Utensils}
          title="Pratos"
          description="Gerenciar cardápio"
          badge={`${stats.pratosAtivos} ativos`}
        />
        <QuickLink 
          href="/admin-master/cozinha-chef/estoque"
          icon={Package}
          title="Estoque"
          description="Controle de insumos"
          badge={`${stats.insumosBaixos} alertas`}
        />
        <QuickLink 
          href="/admin-master/cozinha-chef/producao"
          icon={Factory}
          title="Produção"
          description="Acompanhar status"
          badge={`${stats.producaoPendente} pendentes`}
        />
        <QuickLink 
          href="/admin-master/cozinha-chef/financeiro"
          icon={DollarSign}
          title="Financeiro"
          description="Custos e lucros"
          badge={`R$ ${stats.lucroMes.toFixed(0)}`}
        />
      </div>

      {/* Rodapé */}
      <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
        <span>Última atualização: {new Date().toLocaleString()}</span>
        <span>Dashboard Cozinha v2.0</span>
      </div>
    </div>
  );
}

export default DashboardUI;