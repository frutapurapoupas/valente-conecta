// ============================================================================
// ARQUIVO 1: app/api/telegram/send/route.ts
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7596732182:AAH_oZ3cQ_v8lRKWCLU2_5MOM2j_7hxvPKA';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@valenteconecta';

export async function POST(request: NextRequest) {
  try {
    const { chatId, message, parseMode = 'Markdown' } = await request.json();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId || TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: false
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Telegram:', data);
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao enviar mensagem Telegram:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Webhook para receber mensagens do Telegram
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const update = searchParams.get('update');
  
  console.log('Webhook Telegram recebido:', update);
  
  return NextResponse.json({ status: 'ok', message: 'Webhook do Telegram ativo', bot: '@valenteconecta_bot' });
}

