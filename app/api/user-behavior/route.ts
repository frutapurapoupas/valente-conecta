import { NextRequest, NextResponse } from 'next/server'

interface UserBehavior {
  lastSearches: string[]
  preferredCategories: string[]
  preferredStores: string[]
  searchFrequency: { [key: string]: number }
  locationData: {
    enabled: boolean
    coordinates?: { lat: number; lng: number }
  }
  sessionData: {
    startTime: number
    duration: number
    searchPatterns: {
      morningSearches: number
      eveningSearches: number
      weekendSearches: number
    }
  }
}

// Banco de dados em memória para comportamento do usuário
const userBehaviorData = new Map<string, UserBehavior>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'anonymous'

  try {
    const behavior = userBehaviorData.get(userId) || {
      lastSearches: [],
      preferredCategories: [],
      preferredStores: [],
      searchFrequency: {},
      locationData: { enabled: false },
      sessionData: { startTime: Date.now(), duration: 0, searchPatterns: { morningSearches: 0, eveningSearches: 0, weekendSearches: 0 } }
    }

    return NextResponse.json({
      success: true,
      behavior,
      userId,
      message: 'Comportamento do usuário recuperado com sucesso'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache de 5 minutos
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Erro ao recuperar comportamento do usuário:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, data } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'ID do usuário é obrigatório'
      }, { status: 400 })
    }

    let behavior = userBehaviorData.get(userId) || {
      lastSearches: [],
      preferredCategories: [],
      preferredStores: [],
      searchFrequency: {},
      locationData: { enabled: false },
      sessionData: { startTime: Date.now(), duration: 0, searchPatterns: { morningSearches: 0, eveningSearches: 0, weekendSearches: 0 } }
    }

    switch (action) {
      case 'update_searches':
        if (data.searches && Array.isArray(data.searches)) {
          behavior.lastSearches = [...behavior.lastSearches.slice(-9), ...data.searches]
        }
        break

      case 'update_categories':
        if (data.categories && Array.isArray(data.categories)) {
          behavior.preferredCategories = data.categories
        }
        break

      case 'update_stores':
        if (data.stores && Array.isArray(data.stores)) {
          behavior.preferredStores = data.stores
        }
        break

      case 'update_frequency':
        if (data.frequency && typeof data.frequency === 'object') {
          behavior.searchFrequency = { ...behavior.searchFrequency, ...data.frequency }
        }
        break

      case 'update_location':
        behavior.locationData = {
          ...behavior.locationData,
          ...data.location
        }
        break

      case 'update_session':
        behavior.sessionData = {
          ...behavior.sessionData,
          ...data.session
        }
        break

      case 'update_patterns':
        behavior.sessionData = {
          ...behavior.sessionData,
          searchPatterns: {
            ...behavior.sessionData.searchPatterns,
            ...data.patterns
          }
        }
        break

      case 'clear':
        behavior = {
          lastSearches: [],
          preferredCategories: [],
          preferredStores: [],
          searchFrequency: {},
          locationData: { enabled: false },
          sessionData: { startTime: Date.now(), duration: 0, searchPatterns: { morningSearches: 0, eveningSearches: 0, weekendSearches: 0 } }
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação inválida',
          validActions: ['update_searches', 'update_categories', 'update_stores', 'update_frequency', 'update_location', 'update_session', 'update_patterns', 'clear']
        }, { status: 400 })
    }

    // Salvar comportamento atualizado
    userBehaviorData.set(userId, behavior)

    return NextResponse.json({
      success: true,
      behavior,
      message: 'Comportamento do usuário atualizado com sucesso'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Erro ao atualizar comportamento do usuário:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor'
    }, { status: 500 })
  }
}
