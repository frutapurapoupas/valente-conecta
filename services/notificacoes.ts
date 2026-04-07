// services/notificacoes.ts - VERSÃO CORRIGIDA

// Enviar WhatsApp sem pedir instalação
export function enviarWhatsApp(telefone: string, mensagem: string): void {
  if (!telefone || telefone.length < 10) {
    console.log('Telefone inválido')
    return
  }
  
  const telefoneLimpo = telefone.replace(/\D/g, '')
  let telefoneInternacional = telefoneLimpo
  if (!telefoneLimpo.startsWith('55')) {
    telefoneInternacional = `55${telefoneLimpo}`
  }
  
  const mensagemCodificada = encodeURIComponent(mensagem)
  
  // Usar api.whatsapp.com/send (não pede instalação)
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefoneInternacional}&text=${mensagemCodificada}`
  
  // Abrir em nova aba
  window.open(linkWhatsApp, '_blank')
}

// Push notification simplificada
export function enviarPushNotification(titulo: string, corpo: string): void {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    new Notification(titulo, { body: corpo, icon: '/icone.png' })
  }
}

// Notificações
export function notificarCompraFiado(clienteNome: string, clienteTelefone: string, total: number, vencimento: Date): void {
  const mensagem = `🛍️ VALENTE CONECTA\n\nOlá ${clienteNome}!\nSua compra foi registrada.\nValor: R$ ${total.toFixed(2)}\nVence: ${vencimento.toLocaleDateString()}`
  
  if (clienteTelefone && clienteTelefone.length >= 10) {
    enviarWhatsApp(clienteTelefone, mensagem)
  }
  enviarPushNotification('Venda no Fiado', `R$ ${total.toFixed(2)} - ${clienteNome}`)
}

export function notificarCompraConfirmada(clienteTelefone: string, total: number, metodo: string): void {
  const mensagem = `✅ VALENTE CONECTA\n\nCompra confirmada!\nValor: R$ ${total.toFixed(2)}\nPagamento: ${metodo}`
  
  if (clienteTelefone && clienteTelefone.length >= 10) {
    enviarWhatsApp(clienteTelefone, mensagem)
  }
  enviarPushNotification('Compra Confirmada', `R$ ${total.toFixed(2)}`)
}