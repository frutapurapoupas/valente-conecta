import { NextResponse } from 'next/server'

// Armazenamento global dos produtos (temporário - em produção use banco de dados)
let produtosGlobal: any[] = []

export async function GET() {
  return NextResponse.json({ produtos: produtosGlobal })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, dados, produtos, timestamp } = body
    
    // Atualizar produtos globais
    const novoProduto = {
      id: Date.now().toString(),
      tipo,
      dados,
      produtos,
      timestamp,
      profissionalNome: tipo === 'empresa' ? dados.nomeFantasia : dados.nome,
      cidade: dados.cidade,
      bairro: dados.bairro
    }
    
    // Adicionar ao array global
    produtosGlobal.push(novoProduto)
    
    // Manter apenas os últimos 100 produtos
    if (produtosGlobal.length > 100) {
      produtosGlobal = produtosGlobal.slice(-100)
    }
    
    console.log(`✅ Produto sincronizado: ${novoProduto.profissionalNome} - ${produtos.length} itens`)
    
    return NextResponse.json({ success: true, produtos: produtosGlobal })
  } catch (error) {
    console.error('Erro na sincronização:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}