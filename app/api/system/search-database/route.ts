import { NextRequest, NextResponse } from 'next/server'

interface SearchRecord {
  id: string
  query: string
  timestamp: number
  results: number
  source: 'user_products' | 'preco_da_hora' | 'google_maps' | 'fallback'
  userLocation?: {
    lat: number
    lng: number
  }
  products: any[]
}

// Banco de dados em memória para pesquisas
const searchDatabase: SearchRecord[] = []
const MAX_RECORDS = 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, results, source, userLocation, products } = body

    console.log('Salvando pesquisa no banco:', { query, results, source })

    const searchRecord: SearchRecord = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query: query.toLowerCase().trim(),
      timestamp: Date.now(),
      results: results || 0,
      source: source || 'fallback',
      userLocation: userLocation || undefined,
      products: products || []
    }

    // Adicionar ao banco
    searchDatabase.push(searchRecord)

    // Manter apenas os registros mais recentes
    if (searchDatabase.length > MAX_RECORDS) {
      searchDatabase.splice(0, searchDatabase.length - MAX_RECORDS)
    }

    console.log(`Pesquisa "${query}" salva com ${results} resultados da fonte ${source}`)

    return NextResponse.json({
      success: true,
      record: searchRecord,
      totalRecords: searchDatabase.length
    })

  } catch (error) {
    console.error('Erro ao salvar pesquisa:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar pesquisa no banco'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'list'
  const query = searchParams.get('query')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    switch (action) {
      case 'list':
        let filteredRecords = searchDatabase

        // Filtrar por query se fornecida
        if (query) {
          const queryLower = query.toLowerCase().trim()
          filteredRecords = searchDatabase.filter(record => 
            record.query.includes(queryLower) || 
            queryLower.includes(record.query)
          )
        }

        // Ordenar por timestamp (mais recente primeiro)
        filteredRecords.sort((a, b) => b.timestamp - a.timestamp)

        // Limitar resultados
        const limitedRecords = filteredRecords.slice(0, limit)

        return NextResponse.json({
          success: true,
          records: limitedRecords,
          total: filteredRecords.length,
          query: query || null
        })

      case 'stats':
        const stats = {
          totalSearches: searchDatabase.length,
          uniqueQueries: [...new Set(searchDatabase.map(r => r.query))].length,
          sources: {
            user_products: searchDatabase.filter(r => r.source === 'user_products').length,
            preco_da_hora: searchDatabase.filter(r => r.source === 'preco_da_hora').length,
            google_maps: searchDatabase.filter(r => r.source === 'google_maps').length,
            fallback: searchDatabase.filter(r => r.source === 'fallback').length
          },
          topQueries: [...new Set(searchDatabase.map(r => r.query))]
            .map(query => ({
              query,
              count: searchDatabase.filter(r => r.query === query).length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        }

        return NextResponse.json({
          success: true,
          stats
        })

      case 'clear':
        const countBefore = searchDatabase.length
        searchDatabase.length = 0
        return NextResponse.json({
          success: true,
          message: `Banco de pesquisas limpo. ${countBefore} registros removidos.`
        })

      default:
        return NextResponse.json({
          error: 'Ação inválida',
          validActions: ['list', 'stats', 'clear']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro no banco de pesquisas:', error)
    return NextResponse.json({
      error: 'Erro interno no servidor',
      message: 'Tente novamente mais tarde.'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const recordId = searchParams.get('id')

  if (!recordId) {
    return NextResponse.json({
      error: 'ID do registro não fornecido'
    }, { status: 400 })
  }

  try {
    const index = searchDatabase.findIndex(record => record.id === recordId)
    
    if (index === -1) {
      return NextResponse.json({
        error: 'Registro não encontrado'
      }, { status: 404 })
    }

    const deletedRecord = searchDatabase.splice(index, 1)[0]
    
    return NextResponse.json({
      success: true,
      deletedRecord,
      message: 'Registro removido com sucesso.'
    })

  } catch (error) {
    console.error('Erro ao deletar registro:', error)
    return NextResponse.json({
      error: 'Erro interno no servidor'
    }, { status: 500 })
  }
}
