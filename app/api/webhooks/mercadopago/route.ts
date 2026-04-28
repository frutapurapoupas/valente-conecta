import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log para confirmar recebimento do webhook
    console.log('Webhook Mercado Pago recebido:', JSON.stringify(body, null, 2))
    
    // Aqui você pode processar o pagamento:
    // - Verificar o status (approved, rejected, pending)
    // - Atualizar o banco de dados
    // - Enviar notificações
    
    const status = body.status
    const externalReference = body.external_reference
    const paymentId = body.data?.id
    
    console.log(`Status: ${status}, External Reference: ${externalReference}, Payment ID: ${paymentId}`)
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
