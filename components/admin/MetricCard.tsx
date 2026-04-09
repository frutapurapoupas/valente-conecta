'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  icon: ReactNode
  trend?: number
}

export default function MetricCard({ title, value, icon, trend = 12 }: MetricCardProps) {
  const isPositive = trend > 0

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-3/80 to-dark-2/80 backdrop-blur-sm border border-primary/20 shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 animate-fade-up">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl" />
      </div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm animate-glow">
            <div className="text-primary">{icon}</div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        </div>
        <h3 className="text-4xl font-bold text-white tracking-tight">{value.toLocaleString()}</h3>
        <p className="text-sm text-gray-400 mt-2 font-medium">{title}</p>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full w-0 rounded-b-2xl" />
      </div>
    </div>
  )
}