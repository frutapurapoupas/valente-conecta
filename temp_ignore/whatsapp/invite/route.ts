import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    
    // Salvar convite no banco
    const { data: invite, error: inviteError } = await supabase
      .from('store_invites')
      .insert({
        referral_id: referralId,
        store_name: storeName,
        responsible_name: responsibleName,
        whatsapp: cleanWhatsapp,
        invite_code: inviteCode,
        status: 'pending',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Erro ao salvar convite:', inviteError)
      return NextResponse.json({ error: 'Erro ao processar convite' }, { status: 500 })
    }

    // Enviar mensagem WhatsApp (simulação - em produção usar WhatsApp API)
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${inviteCode}`
    const message = formatWhatsAppMessage(storeName, responsibleName, referrerName, inviteLink)
    
    // Simular envio (em produção integrar com Twilio/WhatsApp Business API)
    await sendWhatsAppMessage(cleanWhatsapp, message)

    return NextResponse.json({
      success: true,
      inviteId: invite.id,
      inviteCode,
      message: 'Convite enviado com sucesso!'
    })

  } catch (error) {
    console.error('Erro no envio do convite:', error)
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

async function sendWhatsAppMessage(whatsapp: string, message: string) {
  // Simulação de envio - em produção usar:
  // - Twilio WhatsApp API
  // - WhatsApp Business API
  // - Z-API
  // ou outro serviço
  
  console.log(`=== SIMULAÇÃO DE ENVIO WHATSAPP ===`)
  console.log(`Para: +55${whatsapp}`)
  console.log(`Mensagem: ${message}`)
  console.log(`====================================`)
  
  // Exemplo com Twilio (descomentar em produção):
  /*
  const twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
  
  await twilio.messages.create({
    body: message,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:+55${whatsapp}`
  })
  */
}
