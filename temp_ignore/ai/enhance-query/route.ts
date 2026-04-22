import { NextRequest, NextResponse } from 'next/server'

interface QueryEnhanceRequest {
  query: string
}

interface QueryEnhanceResponse {
  original: string
  corrected: string
  suggestions: string[]
  intent: string
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryEnhanceRequest = await request.json()
    const { query } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        error: 'Query é obrigatória'
      }, { status: 400 })
    }

    console.log('Query original recebida:', query)

    // Tentar integração com DeepSeek
    let enhancedResponse: QueryEnhanceResponse | null = null

    try {
      const deepseekResponse = await callDeepSeekAPI(query)
      enhancedResponse = deepseekResponse
      console.log('DeepSeek response:', enhancedResponse)
    } catch (deepseekError) {
      console.error('Erro na API DeepSeek:', deepseekError)
      console.log('Usando fallback local')
    }

    // Fallback local se DeepSeek falhar
    if (!enhancedResponse) {
      enhancedResponse = enhanceQueryLocally(query)
      console.log('Fallback local aplicado:', enhancedResponse)
    }

    return NextResponse.json(enhancedResponse, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache de 5 minutos
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Erro no enhance-query:', error)
    return NextResponse.json({
      error: 'Erro interno no servidor'
    }, { status: 500 })
  }
}

// Chamada direta à API DeepSeek
async function callDeepSeekAPI(query: string): Promise<QueryEnhanceResponse> {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
  
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY não configurada')
  }

  const prompt = `Corrija e melhore a busca do usuário em português. Retorne APENAS JSON válido com:
{
  "corrected": "termo corrigido",
  "suggestions": ["sugestão1", "sugestão2", "sugestão3", "sugestão4", "sugestão5"],
  "intent": "produto|marca|categoria|outro"
}

Query do usuário: "${query}"

Regras:
- Corrigir erros de português (ex: feijao -> feijão)
- Manter o mesmo contexto
- Sugestões devem ser relevantes
- Intent deve identificar o tipo de busca
- Retornar apenas JSON, sem texto adicional`

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em corrigir e melhorar buscas de produtos em português. Sempre retorne JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Resposta vazia da DeepSeek')
  }

  // Tentar fazer parse do JSON
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta')
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Validar estrutura
    if (!parsed.corrected || !Array.isArray(parsed.suggestions) || !parsed.intent) {
      throw new Error('Estrutura JSON inválida')
    }

    return {
      original: query,
      corrected: parsed.corrected,
      suggestions: parsed.suggestions.slice(0, 5), // Limitar a 5 sugestões
      intent: parsed.intent
    }

  } catch (parseError) {
    console.error('Erro ao parsear JSON DeepSeek:', parseError, 'Content:', content)
    throw new Error('Resposta JSON inválida da DeepSeek')
  }
}

// Fallback local para correção básica
function enhanceQueryLocally(query: string): QueryEnhanceResponse {
  const original = query.trim()
  let corrected = original.toLowerCase()

  // Correções básicas comuns
  const corrections: { [key: string]: string } = {
    'feijao': 'feijão',
    'oleo': 'óleo',
    'pao': 'pão',
    'cafe': 'café',
    'leite': 'leite',
    'acucar': 'açúcar',
    'arroz': 'arroz',
    'detergente': 'detergente',
    'sabonete': 'sabonete',
    'shampoo': 'shampoo',
    'condicionador': 'condicionador',
    'papel higienico': 'papel higiênico',
    'papel': 'papel',
    'agua': 'água',
    'suco': 'suco',
    'refrigerante': 'refrigerante',
    'cerveja': 'cerveja',
    'vinho': 'vinho',
    'carne': 'carne',
    'frango': 'frango',
    'peixe': 'peixe',
    'ovo': 'ovo',
    'queijo': 'queijo',
    'manteiga': 'manteiga',
    'margarina': 'margarina',
    'sal': 'sal',
    'tempero': 'tempero',
    'farinha': 'farinha',
    'macarrao': 'macarrão',
    'tomate': 'tomate',
    'cebola': 'cebola',
    'alho': 'alho',
    'batata': 'batata',
    'cenoura': 'cenoura',
    'banana': 'banana',
    'maça': 'maçã',
    'laranja': 'laranja',
    'limao': 'limão'
  }

  // Aplicar correções
  Object.keys(corrections).forEach(incorrect => {
    const regex = new RegExp(incorrect, 'gi')
    corrected = corrected.replace(regex, corrections[incorrect])
  })

  // Capitalizar primeira letra
  corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1)

  // Gerar sugestões baseadas na query
  const suggestions = generateSuggestions(corrected)

  // Determinar intent
  const intent = determineIntent(corrected)

  console.log('Correção local aplicada:', { original, corrected, suggestions, intent })

  return {
    original,
    corrected,
    suggestions,
    intent
  }
}

// Gerar sugestões locais
function generateSuggestions(query: string): string[] {
  const suggestions: string[] = []
  const lowerQuery = query.toLowerCase()

  // Sugestões baseadas em produtos populares
  const popularProducts = [
    'feijão', 'arroz', 'óleo', 'açúcar', 'café',
    'detergente', 'sabonete', 'shampoo', 'papel higiênico',
    'leite', 'pão', 'manteiga', 'queijo', 'ovos'
  ]

  // Adicionar sugestões similares
  popularProducts.forEach(product => {
    if (product.includes(lowerQuery) || lowerQuery.includes(product)) {
      suggestions.push(product)
    }
  })

  // Adicionar variações
  if (lowerQuery.includes('feijão')) {
    suggestions.push('feijão carioca', 'feijão preto', 'feijão fradinho')
  }
  if (lowerQuery.includes('arroz')) {
    suggestions.push('arroz branco', 'arroz integral', 'arroz parboilizado')
  }
  if (lowerQuery.includes('óleo')) {
    suggestions.push('óleo de soja', 'óleo de girassol', 'óleo de canola')
  }

  return suggestions.slice(0, 5)
}

// Determinar intent
function determineIntent(query: string): string {
  const lowerQuery = query.toLowerCase()

  // Categorias
  const categories = ['limpeza', 'higiene', 'bebidas', 'alimentos', 'frutas', 'verduras']
  if (categories.some(cat => lowerQuery.includes(cat))) {
    return 'categoria'
  }

  // Marcas comuns
  const brands = ['nestlé', 'unilever', 'p&g', 'colgate', 'gillette']
  if (brands.some(brand => lowerQuery.includes(brand))) {
    return 'marca'
  }

  // Produtos específicos
  const products = ['feijão', 'arroz', 'óleo', 'detergente', 'sabonete', 'shampoo']
  if (products.some(product => lowerQuery.includes(product))) {
    return 'produto'
  }

  return 'outro'
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
