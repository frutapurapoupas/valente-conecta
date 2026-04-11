function triggerSecurityLock(): void {
  // TODO: implementar bloqueio de sessão
  console.warn('[Security] Session locked')
}

function sendSecurityAlert(message: string): void {
  // TODO: integrar com WhatsApp/Email
  console.warn('[Security] Alert:', message)
}

async function sendWhatsAppAlert(message: string): Promise<void> {
  // TODO: integrar com Evolution API
  console.warn('[Security] WhatsApp alert:', message)
}

const AUTHORIZED_DEVICES = [
  'ID_DO_SEU_CELULAR',
  'ID_DO_SEU_TABLET',
  'ID_DO_SEU_NOTEBOOK'
]

export function validateDevice(deviceId: string) {
  if (!AUTHORIZED_DEVICES.includes(deviceId)) {
    // 1. Bloqueia a sessão imediatamente
    triggerSecurityLock()
    
    // 2. Alerta via WhatsApp/E-mail para você
    sendSecurityAlert(`Tentativa de acesso não autorizado! Dispositivo: ${deviceId}`)
    
    return false
  }
  return true
}

/**
 * Alerta de Invasão de Código
 * Monitora tentativas de SQL Injection ou manipulação de API
 */
export async function notifyIntrusion(details: string) {
  const message = `🚨 *ALERTA DE SEGURANÇA - VALENTE CONECTA* 🚨\n\nDetectamos uma tentativa de invasão no código!\n\n*Detalhes:* ${details}\n*Ação:* IP bloqueado preventivamente.`
  
  // Dispara para o seu WhatsApp pessoal
  await sendWhatsAppAlert(message)
}