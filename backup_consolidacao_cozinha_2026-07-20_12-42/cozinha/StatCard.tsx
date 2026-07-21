// components/cozinha/StatCard.tsx
// ðŸŽ¨ UI - Card de EstatÃ­stica

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

// âœ… EXPORTAÃ‡ÃƒO NOMEADA
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
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className={`p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/50 transition`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend && trendValue && (
            <p className={`text-xs ${trendColors[trend]} mt-1 flex items-center gap-1`}>
              {trend === 'up' && <TrendingUp size={12} />}
              {trend === 'down' && <TrendingDown size={12} />}
              <span>{trendValue}</span>
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-gray-100 flex-shrink-0`}>
          <Icon size={20} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
}

// âœ… EXPORTAÃ‡ÃƒO DEFAULT (para compatibilidade)
export default StatCard;


