import { NextRequest, NextResponse } from 'next/server'

interface SearchSuggestion {
  id: string
  text: string
  category?: string
  store?: string
  price?: number
  distance?: number
}

interface SuggestionsResponse {
  suggestions: SearchSuggestion[]
  popular: SearchSuggestion[]
  trending: SearchSuggestion[]
}

// Banco de dados simulado de sugestões
const mockSuggestions = {
  populares: [
    'arroz 5kg', 'feijão 1kg', 'óleo de soja', 'açúcar cristal', 'café 500g',
    'detergente em pó', 'sabonete', 'papel higiênico', 'shampoo', 'condicionador'
  ],
  categorias: ['alimentos', 'bebidas', 'limpeza', 'higiene pessoal'],
  tendencias: [
    { query: 'feijão preto', category: 'alimentos' },
    { query: 'café especial', category: 'bebidas' },
    { query: 'detergente ecológico', category: 'limpeza' }
  ]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '5')

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const queryLower = query.toLowerCase()

  // Gerar sugestões populares
  const popularSuggestions: SearchSuggestion[] = mockSuggestions.populares
    .filter(item => item.includes(queryLower) || queryLower.includes(item))
    .slice(0, limit)
    .map((item, index) => ({
      id: `popular_${index}`,
      text: item,
      type: 'popular'
    }))

  // Gerar sugestões por categoria
  const categorySuggestions: SearchSuggestion[] = []
  mockSuggestions.categorias.forEach(category => {
    if (category.includes(queryLower) || queryLower.includes(category)) {
      categorySuggestions.push({
        id: `cat_${category}`,
        text: category,
        type: 'category',
        category
      })
    }
  })

  // Gerar sugestões em tendência
  const trendingSuggestions: SearchSuggestion[] = mockSuggestions.tendencias
    .filter(trend => 
      trend.query.includes(queryLower) || queryLower.includes(trend.query) ||
      trend.category?.includes(queryLower) || queryLower.includes(trend.category || '')
    )
    .slice(0, Math.max(0, limit - popularSuggestions.length - categorySuggestions.length))
    .map((trend, index) => ({
      id: `trending_${index}`,
      text: trend.query,
      type: 'trending',
      category: trend.category
    }))

  const allSuggestions = [...popularSuggestions, ...categorySuggestions, ...trendingSuggestions]

  return NextResponse.json({
    suggestions: allSuggestions.slice(0, limit),
    popular: popularSuggestions,
    trending: trendingSuggestions,
    query
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache de 5 minutos
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 5 } = body

    // Aqui você pode implementar lógica para salvar sugestões personalizadas
    // baseadas no comportamento do usuário
    
    return NextResponse.json({
      success: true,
      message: 'Sugestão recebida com sucesso'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar sugestão'
    }, { status: 500 })
  }
}
