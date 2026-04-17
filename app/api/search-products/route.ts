import { NextRequest, NextResponse } from 'next/server'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  store: {
    id: string
    name: string
    location: {
      lat: number
      lng: number
      address: string
    }
  }
  distance?: number
  isUserPublished?: boolean
  isPrecoDaHora?: boolean
  isGoogleResult?: boolean
  precoMinimo?: number
  precoMaximo?: number
  estabelecimentos?: number
  endereco_completo?: string
  score?: number
}

interface SearchResponse {
  products: Product[]
  source: "local" | "external"
  fallbackUsed: boolean
  suggestions: string[]
  intent: string
  total: number
  query: string
  correctedQuery?: string
  hasMore: boolean
}

// Cache em memória para performance (5 minutos)
const searchCache = new Map<string, { data: SearchResponse; timestamp: number }>()

// Função para calcular distância entre dois pontos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Arredondar para 2 casas decimais
}

// Função para buscar produtos no Supabase (dados internos)
async function buscarProdutosLocais(query: string, category: string, minPrice: number, maxPrice: number): Promise<Product[]> {
  try {
    // Simulação de busca no Supabase
    // Na implementação real, usar: supabase.from('products').select('*').or(...)
    
    const mockLocalProducts: Product[] = [
      {
        id: 'local_1',
        name: 'Feijão Carioca 1kg',
        description: 'Feijão carioca tipo 1, grãos selecionados - Produto local',
        price: 8.90,
        image: 'https://picsum.photos/seed/feijao_local/200/200',
        category: 'alimentos',
        store: {
          id: 'local_store_1',
          name: 'Mercado Central Valente',
          location: {
            lat: -11.3217,
            lng: -41.8655,
            address: 'Rua Principal, 123 - Centro, Valente-BA'
          }
        },
        isUserPublished: true,
        score: 10
      },
      {
        id: 'local_2',
        name: 'Feijão Preto 1kg',
        description: 'Feijão preto tipo 1, qualidade premium - Produto local',
        price: 9.50,
        image: 'https://picsum.photos/seed/feijao_preto_local/200/200',
        category: 'alimentos',
        store: {
          id: 'local_store_2',
          name: 'Atacadão de Valente',
          location: {
            lat: -11.3456,
            lng: -41.8456,
            address: 'BR-116, Km 123 - Zona Rural, Valente-BA'
          }
        },
        isUserPublished: true,
        score: 9
      },
      {
        id: 'local_3',
        name: 'Óleo de Soja 900ml',
        description: 'Óleo de soja premium, ideal para frituras - Produto local',
        price: 12.90,
        image: 'https://picsum.photos/seed/oleo_local/200/200',
        category: 'alimentos',
        store: {
          id: 'local_store_3',
          name: 'Supermercado São José',
          location: {
            lat: -11.3100,
            lng: -41.8900,
            address: 'Rua das Flores, 456 - Centro, Valente-BA'
          }
        },
        isUserPublished: true,
        score: 8
      }
    ]

    // Filtrar produtos locais
    const queryNormalized = query.toLowerCase().trim()
    const filteredLocal = mockLocalProducts.filter(product => {
      const nameNormalized = product.name.toLowerCase()
      const descriptionNormalized = product.description.toLowerCase()
      
      const matchesQuery = !query || 
        nameNormalized.includes(queryNormalized) || 
        queryNormalized.includes(nameNormalized) || 
        descriptionNormalized.includes(queryNormalized) || 
        queryNormalized.includes(descriptionNormalized)
      
      const matchesCategory = !category || product.category.toLowerCase() === category.toLowerCase()
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice
      
      return matchesQuery && matchesCategory && matchesPrice
    })

    console.log(`Busca local - Encontrados ${filteredLocal.length} produtos`)
    return filteredLocal

  } catch (error) {
    console.error('Erro na busca local:', error)
    return []
  }
}

// Função para buscar em fontes externas (fallback controlado)
async function buscarFontesExternas(query: string, userLat: number, userLng: number): Promise<Product[]> {
  const startTime = Date.now()
  let externalProducts: Product[] = []

  try {
    // 1. Tentar Preço da Hora
    console.log('Fallback: Buscando Preço da Hora...')
    const precoDaHoraUrl = `http://localhost:3000/api/preco-da-hora?q=${encodeURIComponent(query)}&limit=10`
    
    const precoDaHoraResponse = await fetch(precoDaHoraUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache'
      }
    })

    if (precoDaHoraResponse.ok) {
      const precoDaHoraData = await precoDaHoraResponse.json()
      
      if (precoDaHoraData.produtos && precoDaHoraData.produtos.length > 0) {
        externalProducts = precoDaHoraData.produtos.slice(0, 3).map((item: any, index: number) => ({
          id: `external_ph_${index}`,
          name: item.nome,
          description: `${item.nome_estabelecimento || 'Estabelecimento'} - Preço médio: R$ ${item.preco_medio.toFixed(2)}`,
          price: item.preco_medio,
          image: `https://picsum.photos/seed/${item.codigo_barras || item.id}/200/200`,
          category: item.categoria,
          store: {
            id: 'external_ph',
            name: item.nome_estabelecimento || 'Estabelecimento',
            location: {
              lat: -12.9714,
              lng: -38.5014,
              address: `Dados externos - ${item.nome_estabelecimento || 'Estabelecimento'}`
            }
          },
          distance: userLat && userLng ? calculateDistance(userLat, userLng, -12.9714, -38.5014) : undefined,
          isPrecoDaHora: true,
          score: 5
        }))
        
        console.log(`Fallback: Preço da Hora retornou ${externalProducts.length} produtos`)
      }
    }
  } catch (error) {
    console.error('Fallback: Erro no Preço da Hora:', error)
  }

  // 2. Se Preço da Hora falhar, tentar Google Maps (apenas com localização)
  if (externalProducts.length === 0 && userLat && userLng) {
    try {
      console.log('Fallback: Buscando Google Maps...')
      const googleResults: Product[] = [
        {
          id: 'external_google_1',
          name: `${query} - Google Maps`,
          description: 'Produto encontrado via Google Maps',
          price: Math.random() * 50 + 10,
          image: `https://picsum.photos/seed/${query}_google/200/200`,
          category: 'geral',
          store: {
            id: 'external_google',
            name: 'Loja Google Maps',
            location: {
              lat: userLat + (Math.random() - 0.5),
              lng: userLng + (Math.random() - 0.5),
              address: 'Endereço via Google Maps'
            }
          },
          distance: Math.random() * 10,
          isGoogleResult: true,
          score: 3
        }
      ]
      
      externalProducts = googleResults.slice(0, 1)
      console.log(`Fallback: Google Maps retornou ${externalProducts.length} produtos`)
    } catch (error) {
      console.error('Fallback: Erro no Google Maps:', error)
    }
  }

  const responseTime = Date.now() - startTime
  console.log(`Fallback: Busca externa concluída em ${responseTime}ms`)
  
  return externalProducts
}

// Função para registrar produtos não encontrados (aprendizado do sistema)
async function registrarMissingProduct(query: string): Promise<void> {
  try {
    // Simulação de registro no banco
    // Na implementação real, usar: supabase.from('missing_products').upsert(...)
    
    console.log(`Aprendizado: Registrando busca sem resultado local - "${query}"`)
    
    // Aqui poderia incrementar contador e salvar timestamp
    const missingData = {
      query: query.trim().toLowerCase(),
      quantidade_buscas: 1,
      ultima_busca: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    console.log('Aprendizado: Dados registrados para análise futura:', missingData)
  } catch (error) {
    console.error('Aprendizado: Erro ao registrar produto ausente:', error)
  }
}

// Função de ordenação padrão (preço, distância, relevância)
function ordenarProdutos(produtos: Product[], userLat: number, userLng: number): Product[] {
  return produtos.sort((a: Product, b: Product) => {
    // 1. Menor preço (prioridade principal)
    if (a.price !== b.price) {
      return a.price - b.price
    }
    
    // 2. Menor distância (se tiver localização)
    if (userLat && userLng && a.distance !== undefined && b.distance !== undefined) {
      const distanceDiff = (a.distance || 0) - (b.distance || 0)
      if (Math.abs(distanceDiff) < 5) { // Se diferença < 5km, dar preferência
        return distanceDiff
      }
    }
    
    // 3. Maior relevância/score
    if (a.score !== undefined && b.score !== undefined) {
      return (b.score || 0) - (a.score || 0)
    }
    
    // 4. Ordem alfabética como último critério
    return a.name.localeCompare(b.name, 'pt-BR')
  })
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    let query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const userLat = parseFloat(searchParams.get('userLat') || '0')
    const userLng = parseFloat(searchParams.get('userLng') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('=== INÍCIO DA BUSCA HÍBRIDA ===')
    console.log('Parâmetros:', { query, category, minPrice, maxPrice, userLat, userLng, page, limit })

    // Verificar cache
    const cacheKey = `${query}_${category}_${minPrice}_${maxPrice}_${userLat}_${userLng}`
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutos
      console.log('Cache HIT: Retornando resultados em cache')
      return NextResponse.json(cached.data)
    }

    // AI: Enhance query com DeepSeek
    let enhancedQuery = query
    let querySuggestions: string[] = []
    let queryIntent = 'produto'

    if (query && query.trim().length > 0) {
      try {
        console.log('IA: Chamando enhance-query para:', query)
        const enhanceResponse = await fetch('http://localhost:3000/api/ai/enhance-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim() })
        })

        if (enhanceResponse.ok) {
          const enhanceData = await enhanceResponse.json()
          enhancedQuery = enhanceData.corrected || query
          querySuggestions = enhanceData.suggestions || []
          queryIntent = enhanceData.intent || 'produto'
          
          console.log('IA: Query enhanced com sucesso:', {
            original: query,
            corrected: enhancedQuery,
            suggestions: querySuggestions,
            intent: queryIntent
          })
        }
      } catch (aiError) {
        console.error('IA: Erro no enhance-query:', aiError)
      }
    }

    const searchQuery = enhancedQuery || query
    let products: Product[] = []
    let source: "local" | "external" = "local"
    let fallbackUsed = false

    // PRIORIDADE 1: Buscar dados internos (Supabase)
    console.log('ORIGEM: Buscando dados internos (Supabase)...')
    products = await buscarProdutosLocais(searchQuery, category, minPrice, maxPrice)

    if (products.length > 0) {
      console.log('ORIGEM: Dados internos encontrados - SEM FALLBACK')
      source = "local"
      fallbackUsed = false
    } else {
      console.log('ORIGEM: Nenhum dado interno encontrado - ATIVANDO FALLBACK')
      
      // Registrar produto ausente para aprendizado
      await registrarMissingProduct(searchQuery)
      
      // PRIORIDADE 2: Fallback controlado para fontes externas
      products = await buscarFontesExternas(searchQuery, userLat, userLng)
      source = "external"
      fallbackUsed = true
      
      // Modo global: limitar a 3 resultados
      products = products.slice(0, 3)
      console.log('ORIGEM: Fallback ativado - limitado a 3 resultados')
    }

    // Calcular distância se tiver localização
    if (userLat && userLng) {
      products = products.map(product => ({
        ...product,
        distance: calculateDistance(userLat, userLng, product.store.location.lat, product.store.location.lng)
      }))
    }

    // Aplicar ordenação padrão
    products = ordenarProdutos(products, userLat, userLng)

    // Paginação
    const startIndex = (page - 1) * limit
    const paginatedProducts = products.slice(startIndex, startIndex + limit)

    // Salvar no banco de dados
    try {
      await fetch('http://localhost:3000/api/system/search-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          correctedQuery: enhancedQuery !== query ? enhancedQuery : undefined,
          suggestions: querySuggestions,
          intent: queryIntent,
          results: products.length,
          source: source,
          fallbackUsed: fallbackUsed,
          userLocation: userLat && userLng ? { lat: userLat, lng: userLng } : undefined,
          products: products.map((p: Product) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            store: p.store?.name,
            source: p.isPrecoDaHora ? 'preco_da_hora' : p.isUserPublished ? 'local' : p.isGoogleResult ? 'google_maps' : 'fallback'
          }))
        })
      })
    } catch (error) {
      console.error('Erro ao salvar pesquisa no banco:', error)
    }

    const responseTime = Date.now() - startTime
    console.log(`=== BUSCA CONCLUÍDA EM ${responseTime}MS ===`)
    console.log(`ORIGEM: ${source}`)
    console.log(`FALLBACK: ${fallbackUsed}`)
    console.log(`RESULTADOS: ${products.length}`)
    console.log(`=== FIM DA BUSCA ===`)

    const response: SearchResponse = {
      products: paginatedProducts,
      source: source,
      fallbackUsed: fallbackUsed,
      suggestions: querySuggestions,
      intent: queryIntent,
      total: products.length,
      query: query,
      correctedQuery: enhancedQuery !== query ? enhancedQuery : undefined,
      hasMore: products.length >= limit
    }

    // Salvar no cache
    searchCache.set(cacheKey, { data: response, timestamp: Date.now() })

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`ERRO NA BUSCA (${responseTime}ms):`, error)
    return NextResponse.json({ 
      error: 'Erro interno no servidor',
      products: [],
      source: "external",
      fallbackUsed: true,
      suggestions: [],
      intent: 'erro',
      total: 0,
      query: '',
      hasMore: false
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
