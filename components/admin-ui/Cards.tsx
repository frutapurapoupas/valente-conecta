'use client'

import { Users, Building2, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface CardData {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  color: string
  description?: string
}

interface CardsProps {
  data: CardData[]
}

export default function Cards({ data }: CardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((card, index) => {
        const Icon = card.icon
        const changeColor = card.changeType === 'positive' ? 'text-green-600' :
                           card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
        const ChangeIcon = card.changeType === 'positive' ? TrendingUp :
                           card.changeType === 'negative' ? TrendingDown : null

        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.description && (
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                )}

                {card.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-2 ${changeColor}`}>
                    {ChangeIcon && <ChangeIcon size={14} />}
                    <span className="text-sm font-medium">
                      {card.change > 0 ? '+' : ''}{card.change}%
                    </span>
                    <span className="text-xs text-gray-500">vs mês anterior</span>
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-lg ${card.color} flex-shrink-0`}>
                <Icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function createCardData(
  title: string,
  value: string | number,
  icon: React.ElementType,
  color: string,
  change?: number,
  changeType?: 'positive' | 'negative' | 'neutral'
): CardData {
  return { title, value, icon, color, change, changeType }
}

export const defaultCardData: CardData[] = [
  createCardData('Total de Usuários', '1,234', Users, 'bg-blue-500', 12, 'positive'),
  createCardData('Empresas Ativas', '89', Building2, 'bg-green-500', -3, 'negative'),
  createCardData('Produtos', '456', Package, 'bg-purple-500', 8, 'positive'),
  createCardData('Receita Mensal', 'R$ 45.678', DollarSign, 'bg-emerald-500', 15, 'positive'),
]