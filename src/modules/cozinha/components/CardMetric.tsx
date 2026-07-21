// src/modules/cozinha/components/CardMetric.tsx
// ============================================
// CARD DE MÉTRICA
// ============================================

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface CardMetricProps {
  title: string
  value: string | number
  icon: LucideIcon | string
  subtitle?: string
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700'
}

export const CardMetric: React.FC<CardMetricProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'blue'
}) => {
  const isLucideIcon = typeof Icon !== 'string'
  
  return (
    <div className={`rounded-lg border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
        </div>
        {isLucideIcon ? (
          <Icon className="h-8 w-8 opacity-50" />
        ) : (
          <span className="text-3xl opacity-50">{Icon}</span>
        )}
      </div>
    </div>
  )
}