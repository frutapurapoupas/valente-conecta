// app/api/search/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Banco de dados em memória (substituir por MongoDB/PostgreSQL em produção)
interface SearchRecord {
  id: string
  term: string
  timestamp: string
  city: string
  priority: string
  source: 'voice' | 'text'
  location: string
  userAgent?: string
}

let searchDatabase: SearchRecord[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.term || !body.timestamp) {
      return NextResponse.json(
        { error: 'Termo e timestamp são obrigatórios' },
        { status: 400 }
      )
    }
    
    const searchRecord: SearchRecord = {
      id: `search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      term: body.term,
      timestamp: body.timestamp,
      city: body.city || 'Valente-BA',
      priority: body.priority || 'LOCAL_FIRST',
      source: body.source || 'text',
      location: body.location || 'Valente-BA',
      userAgent: request.headers.get('user-agent') || undefined
    }
    
    // Armazena busca
    searchDatabase.unshift(searchRecord)
    
    // Mantém apenas últimas 10.000 buscas
    if (searchDatabase.length > 10000) {
      searchDatabase = searchDatabase.slice(0, 10000)
    }
    
    // Log para Admin Master
    console.log(`[ADMIN MASTER] Nova busca: "${searchRecord.term}" (${searchRecord.source}) - ${searchRecord.city}`)
    
    return NextResponse.json({ 
      success: true, 
      id: searchRecord.id,
      message: 'Busca registrada com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao registrar busca:', error)
    return NextResponse.json(
      { error: 'Erro interno ao registrar busca' },
      { status: 500 }
    )
  }
}

// Endpoint para Admin Master consultar estatísticas
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'stats') {
    // Estatísticas para o Admin Master
    const total = searchDatabase.length
    const voiceCount = searchDatabase.filter(s => s.source === 'voice').length
    const textCount = searchDatabase.filter(s => s.source === 'text').length
    
    // Top 10 termos mais buscados
    const termFrequency: Record<string, number> = {}
    searchDatabase.forEach(search => {
      const term = search.term.toLowerCase()
      termFrequency[term] = (termFrequency[term] || 0) + 1
    })
    
    const topTerms = Object.entries(termFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count, percentage: ((count / total) * 100).toFixed(2) }))
    
    return NextResponse.json({
      total,
      sources: {
        voice: voiceCount,
        text: textCount,
        voicePercentage: total ? ((voiceCount / total) * 100).toFixed(2) : 0
      },
      topTerms,
      lastSearches: searchDatabase.slice(0, 20)
    })
  }
  
  return NextResponse.json({ 
    searches: searchDatabase.slice(0, 100),
    total: searchDatabase.length 
  })
}