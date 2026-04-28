import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configura o SDK do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || ''
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, price, quantity = 1, tipo, dados } = body

    // Cria a preferência de pagamento
    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [
          {
            title: title || 'Item de teste',
            unit_price: price || 1,
            quantity: quantity,
            currency_id: 'BRL'
          }
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/pagamento/falha`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/pagamento/pendente`
        },
        auto_return: 'approved',
        external_reference: `valente-conecta-${Date.now()}`
      }
    })

    // Salva pagamento pendente no localStorage (simulado via resposta)
    const pagamentoId = `pag-${Date.now()}`
    const pagamento = {
      id: pagamentoId,
      tipo: tipo || 'curriculo',
      valor: price || 1,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
      preferenceId: result.id,
      dados: dados || {}
    }

    // Retorna o pagamento para ser salvo no frontend
    return NextResponse.json({
      init_point: result.init_point,
      preference_id: result.id,
      pagamento
    })
  } catch (error) {
    console.error('Erro ao criar preferência:', error)
    return NextResponse.json(
      { error: 'Erro ao criar preferência de pagamento' },
      { status: 500 }
    )
  }
}
