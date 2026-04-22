// app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Configurar com seu número do WhatsApp Business API
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { agendamentoId, status, tipo } = body
  
  // Buscar dados do agendamento e cliente
  const agendamento = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agendamentos/${agendamentoId}`)
  const dados = await agendamento.json()
  
  let mensagem = ''
  
  switch (tipo) {
    case 'NOVO':
      mensagem = `📅 *Novo Agendamento*\n\nCliente: ${dados.cliente_nome}\nServiço: ${dados.servico?.nome}\nData: ${new Date(dados.data).toLocaleDateString('pt-BR')}\nHorário: ${dados.horario}\n\nPara confirmar, acesse o app.`
      break
    case 'CONFIRMADO':
      mensagem = `✅ *Agendamento Confirmado*\n\nOlá ${dados.cliente_nome}, seu agendamento para ${dados.servico?.nome} foi confirmado!\n\nData: ${new Date(dados.data).toLocaleDateString('pt-BR')}\nHorário: ${dados.horario}\n\nAté lá! 🎉`
      break
    case 'CANCELADO':
      mensagem = `❌ *Agendamento Cancelado*\n\nOlá ${dados.cliente_nome}, seu agendamento foi cancelado.\n\nPara remarcar, acesse o app.`
      break
    case 'ALTERACAO':
      mensagem = `🔄 *Alteração no Agendamento*\n\nOlá ${dados.cliente_nome}, seu horário foi alterado.\n\nNovo horário: ${dados.horario}\nData: ${new Date(dados.data).toLocaleDateString('pt-BR')}\n\nConfirme no app.`
      break
    case 'LEMBRETE':
      mensagem = `⏰ *Lembrete*\n\nOlá ${dados.cliente_nome}, seu agendamento é amanhã!\n\nHorário: ${dados.horario}\n\nConfirme sua presença.`
      break
  }
  
  // Enviar via WhatsApp Business API
  if (WHATSAPP_TOKEN && dados.cliente_telefone) {
    const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: dados.cliente_telefone,
        type: 'text',
        text: { body: mensagem }
      })
    })
    
    const result = await response.json()
    console.log('WhatsApp enviado:', result)
  }
  
  return NextResponse.json({ success: true })
}