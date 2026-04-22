import { NextRequest, NextResponse } from 'next/server'
import { dispatchWebhook, WebhookEventType } from '@/lib/webhookDispatch'

// Rota interna usada pelos hooks/serviços para disparar eventos de webhook
export async function POST(request: NextRequest) {
  try {
    const { evento, dados, webhookUrl } = await request.json()

    if (!evento) {
      return NextResponse.json({ success: false, error: 'evento obrigatório' }, { status: 400 })
    }

    // Se vier URL direta (ex: teste manual), usa ela sem consultar Supabase
    if (webhookUrl && webhookUrl.startsWith('https://')) {
      const payload = { evento, timestamp: new Date().toISOString(), dados: dados ?? {} }
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      })
      return NextResponse.json({ success: true })
    }

    await dispatchWebhook(evento as WebhookEventType, dados ?? {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
