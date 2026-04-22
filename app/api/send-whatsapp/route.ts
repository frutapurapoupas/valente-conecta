import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telefone, mensagem } = body

    if (!telefone || !mensagem) {
      return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 })
    }

    // Número no formato internacional (ex: 5575988881111)
    const numeroFormatado = telefone.replace(/\D/g, '')
    
    // Em desenvolvimento, apenas loga a mensagem
    console.log('📱 Mensagem enviada para:', numeroFormatado)
    console.log('📝 Conteúdo:', mensagem)
    
    // Simula sucesso sem abrir WhatsApp
    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}