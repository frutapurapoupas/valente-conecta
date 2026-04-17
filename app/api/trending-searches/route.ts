import { NextRequest, NextResponse } from 'next/server'

interface TrendingSearch {
  query: string
  category: string
  count: number
  timestamp: number
  growth: number
}

interface TrendingResponse {
  trends: TrendingSearch[]
  total: number
  timeWindow: string
}

// Banco de dados simulado de tendências
const mockTrends: TrendingSearch[] = [
  { query: 'feijão preto', category: 'alimentos', count: 156, timestamp: Date.now() - 86400000, growth: 12.5 },
  { query: 'café especial', category: 'bebidas', count: 89, timestamp: Date.now() - 3600000, growth: 8.3 },
  { query: 'detergente ecológico', category: 'limpeza', count: 67, timestamp: Date.now() - 7200000, growth: 15.2 },
  { query: 'pão caseiro', category: 'alimentos', count: 45, timestamp: Date.now() - 18000000, growth: 6.7 },
  { query: 'sabonete líquido', category: 'higiene', count: 34, timestamp: Date.now() - 14400000, growth: 4.1 },
  { query: 'óleo de girassol', category: 'alimentos', count: 78, timestamp: Date.now() - 21600000, growth: 9.8 }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const category = searchParams.get('category')

  try {
    let trends = mockTrends

    // Filtrar por categoria se especificada
    if (category) {
      trends = trends.filter(trend => trend.category === category)
    }

    // Ordenar por contagem e crescimento
    trends.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      if (b.growth !== a.growth) return b.growth - a.growth
      return b.timestamp - a.timestamp
    })

    const response: TrendingResponse = {
      trends: trends.slice(0, limit),
      total: trends.length,
      timeWindow: 'Últimos 7 dias'
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache de 30 minutos para tendências
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Erro ao buscar tendências:', error)
    return NextResponse.json({
      error: 'Erro ao buscar tendências de busca'
    }, { status: 500 })
  }
}
