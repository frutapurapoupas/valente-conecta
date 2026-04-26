import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const catalogosPath = path.join(process.cwd(), 'catalogos.json')

// Função para buscar no Google Places API (fallback)
async function buscarGooglePlaces(termo: string, cidade: string = 'Valente - BA') {
  try {
    // Nota: Em produção, usar uma API key real do Google Places
    // Aqui simulamos uma resposta para demonstração
    const mockGoogleResults = [
      {
        id: 'google_1',
        nome: termo,
        descricao: 'Encontrado via Google Places',
        preco: null,
        precoOriginal: null,
        unidade: 'un',
        foto: null,
        loja: 'Fornecedor Externo',
        lojaId: 'google_external',
        cidade: cidade,
        bairro: 'Centro',
        endereco: 'Endereço não disponível',
        telefone: null,
        tipo: 'externo',
        avaliacao: 4.0,
        pontuacao: 0.5,
        matchTipo: 'google_places',
        fonte: 'google'
      }
    ]
    return mockGoogleResults
  } catch (error) {
    console.error('Erro ao buscar no Google Places:', error)
    return []
  }
}

// Função para remover acentos e caracteres especiais
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove símbolos
    .trim()
}

// Função para calcular similaridade entre textos (Levenshtein simples)
function similaridade(a: string, b: string): number {
  const aNorm = normalizarTexto(a)
  const bNorm = normalizarTexto(b)
  
  if (aNorm === bNorm) return 1
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8
  
  // Verificar palavras individuais
  const palavrasA = aNorm.split(' ')
  const palavrasB = bNorm.split(' ')
  
  for (const palavraA of palavrasA) {
    for (const palavraB of palavrasB) {
      if (palavraA === palavraB) return 0.7
      if (palavraA.length > 3 && palavraB.length > 3) {
        if (palavraA.includes(palavraB) || palavraB.includes(palavraA)) return 0.6
      }
    }
  }
  
  return 0
}

function lerCatalogos() {
  try {
    if (!fs.existsSync(catalogosPath)) {
      return []
    }
    const data = fs.readFileSync(catalogosPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const termoNormalizado = normalizarTexto(q)
  
  const catalogos = lerCatalogos()
  const resultados: any[] = []
  const termosBuscados: string[] = []
  
  // Gerar variações do termo para busca mais flexível
  const gerarVariacoes = (termo: string): string[] => {
    const variacoes: string[] = [termo]
    // Adicionar versão sem espaços
    variacoes.push(termo.replace(/\s/g, ''))
    // Adicionar versão com apenas primeiras letras
    if (termo.includes(' ')) {
      variacoes.push(termo.split(' ').map(p => p[0]).join(''))
    }
    return [...new Set(variacoes)]
  }
  
  const variacoesBusca = gerarVariacoes(termoNormalizado)
  
  for (const catalogo of catalogos) {
    if (catalogo.itens && catalogo.itens.length > 0) {
      for (const item of catalogo.itens) {
        const nomeProfissional = catalogo.tipo === 'empresa' 
          ? (catalogo.dados.nomeFantasia || catalogo.dados.nome)
          : catalogo.dados.nome
        
        const itemNomeNorm = normalizarTexto(item.nome)
        const itemDescNorm = normalizarTexto(item.descricao || '')
        const lojaNorm = normalizarTexto(nomeProfissional)
        const cidadeNorm = normalizarTexto(catalogo.dados.cidade || '')
        
        let pontuacao = 0
        let matchTipo = ''
        
        // Verificar correspondência exata ou por similaridade
        for (const variacao of variacoesBusca) {
          if (itemNomeNorm.includes(variacao) || variacao.includes(itemNomeNorm)) {
            pontuacao = 1
            matchTipo = 'produto'
            break
          }
          if (itemDescNorm.includes(variacao)) {
            pontuacao = 0.9
            matchTipo = 'descricao'
            break
          }
          if (lojaNorm.includes(variacao)) {
            pontuacao = 0.8
            matchTipo = 'loja'
            break
          }
          if (cidadeNorm.includes(variacao)) {
            pontuacao = 0.7
            matchTipo = 'cidade'
            break
          }
        }
        
        // Se não encontrou exato, tentar similaridade
        if (pontuacao === 0 && termoNormalizado.length > 2) {
          const simProduto = similaridade(itemNomeNorm, termoNormalizado)
          const simLoja = similaridade(lojaNorm, termoNormalizado)
          
          if (simProduto > 0.5) {
            pontuacao = simProduto
            matchTipo = 'produto_similar'
          } else if (simLoja > 0.5) {
            pontuacao = simLoja
            matchTipo = 'loja_similar'
          }
        }
        
        if (pontuacao > 0) {
          resultados.push({
            id: `${catalogo.id}_${item.id}`,
            nome: item.nome,
            descricao: item.descricao || '',
            preco: item.preco,
            precoOriginal: item.precoOriginal,
            unidade: item.unidade || 'un',
            foto: item.foto,
            loja: nomeProfissional,
            lojaId: catalogo.id,
            cidade: catalogo.dados.cidade || 'Valente',
            bairro: catalogo.dados.bairro || 'Centro',
            endereco: catalogo.dados.endereco || '',
            telefone: catalogo.dados.telefone,
            tipo: catalogo.tipo,
            avaliacao: 4.5,
            pontuacao: pontuacao,
            matchTipo: matchTipo
          })
          termosBuscados.push(item.nome)
        }
      }
    }
  }
  
  // Ordenar por pontuação - catálogos publicados têm prioridade
  resultados.sort((a, b) => b.pontuacao - a.pontuacao)
  
  // Separar resultados por fonte
  const resultadosLocais = resultados.filter(r => r.fonte !== 'google')
  const resultadosExternos = resultados.filter(r => r.fonte === 'google')
  
  // Se não houver resultados locais, buscar no Google Places
  let resultadosFinais = resultadosLocais
  if (resultadosLocais.length === 0 && termoNormalizado.length > 2) {
    const googleResults = await buscarGooglePlaces(q)
    resultadosFinais = [...resultadosLocais, ...googleResults]
  }
  
  // Sugestões inteligentes
  const sugestoesInteligentes = [...new Set(resultadosFinais.map(r => r.nome))].slice(0, 8)
  
  // Se ainda não houver resultados, buscar sugestões de termos similares nos catálogos
  if (resultadosFinais.length === 0 && termoNormalizado.length > 2) {
    const todosTermos: string[] = []
    for (const catalogo of catalogos) {
      if (catalogo.itens) {
        for (const item of catalogo.itens) {
          todosTermos.push(item.nome)
          todosTermos.push(catalogo.tipo === 'empresa' 
            ? (catalogo.dados.nomeFantasia || catalogo.dados.nome)
            : catalogo.dados.nome)
        }
      }
    }
    const sugestoes = [...new Set(todosTermos)].filter(t => similaridade(normalizarTexto(t), termoNormalizado) > 0.3).slice(0, 5)
    return NextResponse.json({ results: [], suggestions: sugestoes, termoOriginal: q, fonte: 'catalogo_sugestoes' })
  }
  
  return NextResponse.json({ 
    results: resultadosFinais,
    suggestions: sugestoesInteligentes,
    total: resultadosFinais.length,
    termoOriginal: q,
    fonte: resultadosFinais.some(r => r.fonte === 'google') ? 'híbrido' : 'catalogo'
  })
}