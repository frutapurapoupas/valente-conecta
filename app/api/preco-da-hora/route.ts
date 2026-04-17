import { NextRequest, NextResponse } from 'next/server'

interface PrecoDaHoraProduct {
  id: string
  nome: string
  marca?: string
  codigo_barras?: string
  categoria: string
  preco_medio: number
  preco_minimo: number
  preco_maximo: number
  estabelecimentos: number
  nome_estabelecimento?: string
  endereco?: string
  endereco_completo?: string
  data_atualizacao: string
}

interface PrecoDaHoraResponse {
  produtos: PrecoDaHoraProduct[]
  total: number
  fontes: string[]
}

// 🧠 Cache inteligente (com limite)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000
const MAX_CACHE_SIZE = 100

// 🔤 Normalização (remove acento e padroniza)
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// 🧠 Score inteligente
const scoreProduct = (product: PrecoDaHoraProduct, query: string) => {
  const name = normalize(product.nome)
  const brand = normalize(product.marca || '')
  const q = normalize(query)

  let score = 0

  if (!q) return score

  if (name === q) score += 100
  if (name.startsWith(q)) score += 60
  if (name.includes(q)) score += 30
  if (brand.includes(q)) score += 15
  if (product.codigo_barras === query) score += 200

  return score
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const categoria = searchParams.get('categoria') || ''
  const limit = parseInt(searchParams.get('limit') || '10')

  console.log('🔎 Busca Preço da Hora:', { query, categoria, limit })

  try {
    const cacheKey = `${query}-${categoria}-${limit}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('⚡ Cache hit')
      return NextResponse.json(cached.data)
    }

    // Tentar buscar dados reais do Preço da Hora
    let realData: PrecoDaHoraResponse | null = null
    
    try {
      console.log('Tentando buscar dados reais do Preço da Hora...')
      
      // Headers para simular navegador real e evitar bloqueio
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
      
      // Tentativa de buscar dados reais (com fallback para mock)
      const searchUrl = `https://precodahora.ba.gov.br/api/search?q=${encodeURIComponent(query)}`
      
      const response = await fetch(searchUrl, { 
        headers,
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dados reais obtidos do Preço da Hora:', data)
        
        // Converter formato real para nosso formato
        if (data.produtos || data.products) {
          const produtos = data.produtos || data.products
          
          // Agrupar produtos por estabelecimento (permite múltiplos produtos por loja)
          const produtosPorEstabelecimento = new Map<string, any[]>()
          
          produtos.forEach((item: any) => {
            const nomeEstabelecimento = item.estabelecimento || item.loja || item.store || 'Estabelecimento'
            const enderecoEstabelecimento = item.endereco || item.address || 'Endereço não informado'
            
            if (!produtosPorEstabelecimento.has(nomeEstabelecimento)) {
              produtosPorEstabelecimento.set(nomeEstabelecimento, [])
            }
            
            // Adicionar todos os produtos do estabelecimento (sem limite)
            produtosPorEstabelecimento.get(nomeEstabelecimento)!.push({
              ...item,
              endereco_completo: `${nomeEstabelecimento} - ${enderecoEstabelecimento}`
            })
          })
          
          // Limitar a 10 estabelecimentos diferentes
          let contadorEstabelecimentos = 0
          const estabelecimentosLimitados = new Map<string, any[]>()
          
          produtosPorEstabelecimento.forEach((produtosDoEstabelecimento, nomeEstabelecimento) => {
            if (contadorEstabelecimentos < 10) {
              estabelecimentosLimitados.set(nomeEstabelecimento, produtosDoEstabelecimento)
              contadorEstabelecimentos++
            }
          })
          
          // Converter para nosso formato com endereço completo
          const produtosLimitados = Array.from(estabelecimentosLimitados.values()).flat()
          
          realData = {
            produtos: produtosLimitados.map((item: any) => ({
              id: item.id || `real_${Date.now()}`,
              nome: item.nome || item.name,
              marca: item.marca || item.brand,
              codigo_barras: item.codigo_barras || item.barcode,
              categoria: item.categoria || item.category,
              preco_medio: item.preco_medio || item.price || item.preco,
              preco_minimo: item.preco_minimo || item.min_price,
              preco_maximo: item.preco_maximo || item.max_price,
              estabelecimentos: item.estabelecimentos || item.stores || item.lojas,
              nome_estabelecimento: item.estabelecimento || item.loja || item.store || 'Estabelecimento',
              endereco: item.endereco || item.address || 'Endereço não informado',
              endereco_completo: item.endereco_completo || `${item.estabelecimento || 'Estabelecimento'} - ${item.endereco || item.address || 'Endereço não informado'}`,
              data_atualizacao: item.data_atualizacao || new Date().toISOString()
            })),
            total: produtosLimitados.length,
            fontes: ['Preço da Hora Bahia - Dados Reais', 'Notas Fiscais Eletrônicas']
          }
        }
      } else {
        console.log('Resposta não OK do Preço da Hora:', response.status)
      }
    } catch (error) {
      console.log('Erro ao buscar dados reais, usando fallback mock:', error instanceof Error ? error.message : String(error))
    }
    
    // Fallback para dados mock se não conseguir dados reais
    const mockData: PrecoDaHoraResponse = {
      produtos: [
        {
          id: 'ph1',
          nome: 'Arroz Tipo 1 5kg',
          marca: 'Tio João',
          codigo_barras: '7896000112345',
          categoria: 'alimentos',
          preco_medio: 25.9,
          preco_minimo: 22.5,
          preco_maximo: 29.9,
          estabelecimentos: 156,
          data_atualizacao: new Date().toISOString()
        },
        {
          id: 'ph2',
          nome: 'Arroz Branco 5kg',
          marca: 'Camil',
          codigo_barras: '7896000999999',
          categoria: 'alimentos',
          preco_medio: 24.9,
          preco_minimo: 21.9,
          preco_maximo: 28.5,
          estabelecimentos: 120,
          data_atualizacao: new Date().toISOString()
        },
        {
          id: 'ph3',
          nome: 'Feijão Carioca 1kg',
          marca: 'Camil',
          codigo_barras: '7896000123456',
          categoria: 'alimentos',
          preco_medio: 8.5,
          preco_minimo: 7.2,
          preco_maximo: 9.8,
          estabelecimentos: 142,
          data_atualizacao: new Date().toISOString()
        },
        {
          id: 'ph4',
          nome: 'Óleo de Soja 900ml',
          marca: 'Liza',
          codigo_barras: '7896000134567',
          categoria: 'alimentos',
          preco_medio: 12.9,
          preco_minimo: 11.5,
          preco_maximo: 14.2,
          estabelecimentos: 98,
          data_atualizacao: new Date().toISOString()
        },
        {
          id: 'ph5',
          nome: 'Detergente em Pó 500g',
          marca: 'Ypê',
          codigo_barras: '7896000145678',
          categoria: 'limpeza',
          preco_medio: 15.75,
          preco_minimo: 13.9,
          preco_maximo: 17.5,
          estabelecimentos: 87,
          data_atualizacao: new Date().toISOString()
        }
      ],
      total: 5,
      fontes: ['Preço da Hora Bahia - Mock', 'Notas Fiscais Eletrônicas']
    }
    
    // Usar dados reais se disponíveis, senão usar mock
    const finalData = realData || mockData
    console.log('Usando dados:', realData ? 'REAIS' : 'MOCK')

    const queryNormalized = normalize(query)
    const categoriaNormalized = normalize(categoria)

    // 🔎 FILTRO INTELIGENTE MELHORADO
    let filtered = finalData.produtos.filter(product => {
      const name = normalize(product.nome)
      const brand = normalize(product.marca || '')
      const category = normalize(product.categoria)

      // Busca mais flexível - verifica se contém qualquer parte da query
      const matchesQuery =
        !query ||
        name.includes(queryNormalized) ||
        queryNormalized.includes(name) ||
        brand.includes(queryNormalized) ||
        queryNormalized.includes(brand) ||
        product.codigo_barras?.includes(query) ||
        query.includes(product.codigo_barras || '')

      const matchesCategory =
        !categoria ||
        category.includes(categoriaNormalized) ||
        categoriaNormalized.includes(category)

      // Debug: mostrar o que está sendo filtrado
      if (query) {
        console.log(`Filtrando produto: "${product.nome}" - Query: "${query}" - Match: ${matchesQuery}`)
      }

      return matchesQuery && matchesCategory
    })

    // 🧠 RANKEAMENTO
    const ranked = filtered
      .map(p => ({
        ...p,
        score: scoreProduct(p, query)
      }))
      .sort((a, b) => b.score - a.score)

    const limited = ranked.slice(0, limit)

    const response = {
      produtos: limited,
      total: filtered.length,
      fontes: mockData.fontes,
      query,
      categoria,
      cache: false
    }

    // 🧠 Controle de cache (evita crescimento infinito)
    if (cache.size > MAX_CACHE_SIZE) {
      cache.clear()
      console.log('🧹 Cache limpo')
    }

    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    console.log('✅ Resultados:', limited.length)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('❌ Erro na API:', error)

    return NextResponse.json({
      error: 'Erro ao buscar dados',
      produtos: [],
      total: 0,
      fontes: []
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