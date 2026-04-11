import { createClient } from '@supabase/supabase-js'

export type WebhookEventType =
  | 'nova_venda'
  | 'pagamento_confirmado'
  | 'novo_usuario'
  | 'nova_empresa'
  | 'novo_profissional'
  | 'plano_contratado'
  | 'plano_cancelado'
  | 'resgate_pix'
  | 'empresa_aprovada'
  | 'empresa_rejeitada'
  | 'compensacao_mensal'

export interface WebhookPayload {
  evento: WebhookEventType
  timestamp: string
  dados: Record<string, unknown>
}

async function getWebhookUrl(): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await supabase
      .from('admin_configs')
      .select('integracoes')
      .limit(1)
      .single()
    return data?.integracoes?.webhookUrl || null
  } catch {
    return null
  }
}

/**
 * Dispara um evento POST para a URL de webhook configurada no Admin.
 * Falha silenciosa — nunca bloqueia a operação principal.
 */
export async function dispatchWebhook(
  evento: WebhookEventType,
  dados: Record<string, unknown>,
): Promise<void> {
  try {
    const url = await getWebhookUrl()
    if (!url || !url.startsWith('https://')) return

    const payload: WebhookPayload = {
      evento,
      timestamp: new Date().toISOString(),
      dados,
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Falha silenciosa — não interrompe o fluxo principal
  }
}
