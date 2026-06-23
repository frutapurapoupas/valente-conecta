// components/cozinha/StatCard.tsx
// 🎨 UI - Card de Estatística

"use client";

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

// ✅ EXPORTAÇÃO NOMEADA
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  trend,
  trendValue
}: StatCardProps) {
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

// ✅ EXPORTAÇÃO DEFAULT (para compatibilidade)
export default StatCard;