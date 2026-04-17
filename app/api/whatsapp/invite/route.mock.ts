import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { storeName, responsibleName, whatsapp, referralId, referrerName } = await request.json()

    if (!storeName || !responsibleName || !whatsapp || !referralId) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Limpar número de WhatsApp
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    if (cleanWhatsapp.length < 10) {
      return NextResponse.json({ error: 'Número de WhatsApp inválido' }, { status: 400 })
    }

    // Gerar código único para o convite
    const inviteCode = generateInviteCode()
    
    console.log('MOCK: Processando convite WhatsApp:', {
      storeName,
      responsibleName,
      whatsapp: cleanWhatsapp,
      referralId,
      referrerName,
      inviteCode
    })
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Salvar convite em memória (mock)
    const invite = {
      id: Date.now().toString(),
      referral_id: referralId,
      store_name: storeName,
      responsible_name: responsibleName,
      whatsapp: cleanWhatsapp,
      invite_code: inviteCode,
      status: 'pending',
      sent_at: new Date().toISOString()
    }

    // Simular envio WhatsApp
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/convite/${inviteCode}`
    const message = formatWhatsAppMessage(storeName, responsibleName, referrerName, inviteLink)
    
    console.log('MOCK: Mensagem WhatsApp gerada:', message)
    console.log('MOCK: Link do convite:', inviteLink)

    return NextResponse.json({
      success: true,
      inviteId: invite.id,
      inviteCode,
      message: 'Convite enviado com sucesso!'
    })

  } catch (error) {
    console.error('MOCK: Erro no envio do convite:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function formatWhatsAppMessage(storeName: string, responsibleName: string, referrerName: string, inviteLink: string): string {
  return `Olá ${responsibleName}! 

Você foi convidado(a) para cadastrar a loja "${storeName}" no Valente Conecta.

O convite foi feito por: ${referrerName}

Clique no link abaixo para aceitar e completar o cadastro:
${inviteLink}

O Valente Conecta é um aplicativo que ajuda lojas locais a venderem mais e clientes a encontrarem os melhores produtos da região.

Com o app você poderá:
- Cadastrar seus produtos
- Receber pedidos pelo WhatsApp
- Aumentar suas vendas

É grátis e rápido! 

Qualquer dúvida, estamos à disposição!`
}
