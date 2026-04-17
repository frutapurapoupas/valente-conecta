import { NextRequest, NextResponse } from 'next/server'

interface UserControlConfig {
  maxMockUsers: number
  currentActiveUsers: number
  useMockData: boolean
  transitionDate?: string
}

// Cache para controle de usuários
let userControlCache: UserControlConfig = {
  maxMockUsers: 100,
  currentActiveUsers: 0,
  useMockData: true
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'status'

  console.log('User Control API:', { action, currentConfig: userControlCache })

  try {
    switch (action) {
      case 'status':
        return NextResponse.json({
          ...userControlCache,
          canUseMockData: userControlCache.currentActiveUsers < userControlCache.maxMockUsers,
          shouldTransitionToReal: userControlCache.currentActiveUsers >= userControlCache.maxMockUsers
        })

      case 'increment':
        const newCount = userControlCache.currentActiveUsers + 1
        userControlCache.currentActiveUsers = newCount
        
        // Se atingiu o limite, desativar dados mock
        if (newCount >= userControlCache.maxMockUsers && userControlCache.useMockData) {
          userControlCache.useMockData = false
          userControlCache.transitionDate = new Date().toISOString()
          console.log('TRANSIÇÃO: Dados mock desativados. Usando apenas dados reais.')
        }
        
        return NextResponse.json({
          success: true,
          currentActiveUsers: newCount,
          useMockData: userControlCache.useMockData,
          message: newCount >= userControlCache.maxMockUsers 
            ? 'Limite atingido. Transição para dados reais iniciada.'
            : 'Usuário adicionado com sucesso.'
        })

      case 'decrement':
        const decrementedCount = Math.max(0, userControlCache.currentActiveUsers - 1)
        userControlCache.currentActiveUsers = decrementedCount
        
        return NextResponse.json({
          success: true,
          currentActiveUsers: decrementedCount,
          useMockData: userControlCache.useMockData,
          message: 'Contador de usuários atualizado.'
        })

      case 'force-transition':
        userControlCache.useMockData = false
        userControlCache.transitionDate = new Date().toISOString()
        
        return NextResponse.json({
          success: true,
          useMockData: false,
          transitionDate: userControlCache.transitionDate,
          message: 'Transição forçada para dados reais.'
        })

      default:
        return NextResponse.json({
          error: 'Ação inválida',
          validActions: ['status', 'increment', 'decrement', 'force-transition']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro no User Control API:', error)
    return NextResponse.json({
      error: 'Erro interno no servidor',
      message: 'Tente novamente mais tarde.'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentActiveUsers, forceTransition } = body

    if (typeof currentActiveUsers === 'number') {
      userControlCache.currentActiveUsers = currentActiveUsers
    }

    if (forceTransition === true) {
      userControlCache.useMockData = false
      userControlCache.transitionDate = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      config: userControlCache,
      message: 'Configuração atualizada com sucesso.'
    })

  } catch (error) {
    console.error('Erro no POST User Control:', error)
    return NextResponse.json({
      error: 'Erro ao processar requisição',
      message: 'Verifique o formato dos dados enviados.'
    }, { status: 400 })
  }
}
