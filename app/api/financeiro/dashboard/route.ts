// app/api/financeiro/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Dados do Financeiro v5.0 - RESTAURADO COMPLETO
  const financeiroData = {
    saldoTotal: 24750.89,
    receitasHoje: 1890.45,
    receitasMes: 45280.75,
    despesasMes: 15230.90,
    lucroLiquido: 30049.85,
    ultimasTransacoes: [
      {
        id: '1',
        descricao: 'Venda - Restaurante do João',
        valor: 450.00,
        tipo: 'receita',
        data: new Date().toISOString(),
        status: 'concluido'
      },
      {
        id: '2',
        descricao: 'Venda - Mercado Bom Preço',
        valor: 1280.50,
        tipo: 'receita',
        data: new Date().toISOString(),
        status: 'concluido'
      },
      {
        id: '3',
        descricao: 'Comissão - Indicação João Silva',
        valor: 50.00,
        tipo: 'despesa',
        data: new Date().toISOString(),
        status: 'concluido'
      },
      {
        id: '4',
        descricao: 'Venda - TechValente',
        valor: 890.00,
        tipo: 'receita',
        data: new Date().toISOString(),
        status: 'concluido'
      },
      {
        id: '5',
        descricao: 'Venda - Moda Fashion',
        valor: 340.00,
        tipo: 'receita',
        data: new Date().toISOString(),
        status: 'concluido'
      },
      {
        id: '6',
        descricao: 'Taxa de Serviço - PDV',
        valor: 25.00,
        tipo: 'despesa',
        data: new Date().toISOString(),
        status: 'pendente'
      },
      {
        id: '7',
        descricao: 'Venda - Farmácia Central',
        valor: 567.80,
        tipo: 'receita',
        data: new Date(Date.now() - 86400000).toISOString(),
        status: 'concluido'
      },
      {
        id: '8',
        descricao: 'Anúncio - Destaque Semanal',
        valor: 120.00,
        tipo: 'receita',
        data: new Date(Date.now() - 172800000).toISOString(),
        status: 'concluido'
      }
    ],
    vendasPorCategoria: [
      { categoria: 'Alimentação', valor: 18450.00, porcentagem: 48 },
      { categoria: 'Varejo', valor: 8450.00, porcentagem: 22 },
      { categoria: 'Serviços', valor: 6200.00, porcentagem: 16 },
      { categoria: 'Tecnologia', valor: 4200.00, porcentagem: 11 },
      { categoria: 'Saúde', valor: 1150.00, porcentagem: 3 }
    ],
    metricas: {
      ticketMedio: 89.50,
      clientesAtivos: 347,
      taxaConversao: 68.5,
      recorrencia: 42.3
    }
  }
  
  return NextResponse.json(financeiroData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

// Suporte para método POST se necessário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Aqui você pode adicionar lógica para salvar transações
    console.log('Nova transação recebida:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Transação registrada com sucesso' 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erro ao processar requisição' 
    }, { status: 400 })
  }
}