// app/api/cozinha/notify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId, customerName, customerPhone, total } = await request.json();
    
    // Opção 1: Enviar para WebSocket dos admins
    // Opção 2: Enviar email
    // Opção 3: Enviar notificação push
    // Opção 4: Enviar SMS
    
    // Exemplo: Registrar no console (a cozinha vê no dashboard)
    console.log(`
    🍳 NOVO PEDIDO #${orderId}
    👤 Cliente: ${customerName}
    📱 Telefone: ${customerPhone}
    💰 Total: R$ ${total}
    `);
    
    // Aqui você pode integrar com:
    // - Discord Webhook
    // - Telegram Bot
    // - Slack
    // - Email
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}