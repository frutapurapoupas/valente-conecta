// services/notificacoes.ts

// ============================================
// WHATSAPP - Link direto (funciona sem API)
// ============================================
export function enviarWhatsApp(telefone: string, mensagem: string): void {
  if (!telefone || telefone.length < 10) {
    console.log('Telefone inválido para notificação:', telefone)
    return
  }
  
  // Limpar telefone
  const telefoneLimpo = telefone.replace(/\D/g, '')
  
  // Formatar para padrão internacional
  let telefoneInternacional = telefoneLimpo
  if (!telefoneLimpo.startsWith('55') && telefoneLimpo.length === 11) {
    telefoneInternacional = `55${telefoneLimpo}`
  } else if (!telefoneLimpo.startsWith('55') && telefoneLimpo.length === 10) {
    telefoneInternacional = `55${telefoneLimpo}`
  }
  
  // Codificar mensagem
  const mensagemCodificada = encodeURIComponent(mensagem)
  
  // Usar api.whatsapp.com/send (não pede instalação)
  const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefoneInternacional}&text=${mensagemCodificada}`
  
  // Abrir em nova aba
  window.open(linkWhatsApp, '_blank')
  
  // Salvar notificação
  salvarNotificacao({
    tipo: 'whatsapp',
    destinatario: telefone,
    mensagem,
    data: new Date().toISOString(),
    link: linkWhatsApp
  })
  
  console.log(`📱 WhatsApp enviado para ${telefone}`)
}

// ============================================
// PUSH NOTIFICATION (API nativa do navegador)
// ============================================

export async function inicializarPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export function enviarPushNotification(titulo: string, corpo: string, dados?: any): void {
  if (typeof window === 'undefined') return
  
  if (!('Notification' in window)) {
    console.log('Navegador não suporta notificações')
    return
  }
  
  if (Notification.permission === 'granted') {
    try {
      const notificacao = new Notification(titulo, {
        body: corpo,
        icon: '/icone.png',
        badge: '/icone.png',
        tag: 'valente-conecta',
        requireInteraction: true,
        data: dados
      })
      
      notificacao.onclick = () => {
        window.focus()
        if (dados?.url) {
          window.open(dados.url, '_blank')
        }
      }
      
      console.log(`📱 Push enviado: ${titulo} - ${corpo}`)
    } catch (error) {
      console.error('Erro ao enviar push:', error)
    }
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        enviarPushNotification(titulo, corpo, dados)
      }
    })
  }
  
  // Salvar notificação
  salvarNotificacao({
    tipo: 'push',
    titulo,
    mensagem: corpo,
    dados,
    data: new Date().toISOString()
  })
}

// ============================================
// FUNÇÕES GERAIS
// ============================================

interface Notificacao {
  id?: string
  tipo: 'whatsapp' | 'push' | 'sms'
  destinatario?: string
  titulo?: string
  mensagem: string
  dados?: any
  link?: string
  data: string
  lida?: boolean
}

function salvarNotificacao(notificacao: Omit<Notificacao, 'id'>): void {
  try {
    const saved = localStorage.getItem('notificacoes_enviadas')
    const lista = saved ? JSON.parse(saved) : []
    lista.push({
      ...notificacao,
      id: Date.now().toString(),
      lida: false
    })
    localStorage.setItem('notificacoes_enviadas', JSON.stringify(lista))
  } catch (error) {
    console.error('Erro ao salvar notificação:', error)
  }
}

// ============================================
// NOTIFICAÇÕES DO PDV - VERSÃO CORRIGIDA
// ============================================

interface LojaInfo {
  nome: string
  endereco: string
  cidade: string
  telefone: string
}

export function notificarCompraFiado(
  clienteNome: string,
  clienteTelefone: string,
  total: number,
  vencimento: Date,
  lojaInfo?: LojaInfo,
  saldoFiadoDisponivel: number = 500
): void {
  // Dados da loja (padrão ou do parâmetro)
  const loja = lojaInfo || {
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA',
    telefone: '(00) 00000-0000'
  }
  
  const dataVencimento = vencimento.toLocaleDateString('pt-BR')
  const saldoRestante = saldoFiadoDisponivel - total
  
  // Mensagem completa para WhatsApp
  const mensagemWhatsApp = `✅ *VALENTE CONECTA* - SUA COMPRA FOI REALIZADA COM SUCESSO!

🏪 *Loja:* ${loja.nome}
📍 *Endereço:* ${loja.endereco}
📞 *Telefone:* ${loja.telefone}

👤 *Cliente:* ${clienteNome}
💰 *Valor da compra:* R$ ${total.toFixed(2)}
📅 *Data de vencimento:* ${dataVencimento}

💳 *Limite de fiado disponível:* R$ ${saldoRestante.toFixed(2)}

✅ Seu pedido foi aprovado e registrado em nosso sistema.

*Formas de pagamento disponíveis:*
• Dinheiro
• PIX
• Cartão
• Moeda Conecta

Agradecemos pela preferência! 🙏

---
Valente Conecta - Seu PDV Colaborativo`

  // Mensagem resumida para Push
  const mensagemPush = `✅ Compra realizada com sucesso!\n\nLoja: ${loja.nome}\nValor: R$ ${total.toFixed(2)}\nVence: ${dataVencimento}\nSaldo disponível: R$ ${saldoRestante.toFixed(2)}`

  // Enviar WhatsApp
  if (clienteTelefone && clienteTelefone.length >= 10) {
    enviarWhatsApp(clienteTelefone, mensagemWhatsApp)
  }
  
  // Enviar Push (para o lojista e para o cliente se tiver permissão)
  enviarPushNotification('🛍️ Venda no Fiado Registrada', mensagemPush, { 
    clienteNome, 
    total, 
    lojaNome: loja.nome,
    url: '/pdv/fiado'
  })
  
  // Registrar no console
  console.log(`✅ Notificação enviada para ${clienteNome} (${clienteTelefone})`)
  console.log(`💰 Valor: R$ ${total.toFixed(2)} | Vence: ${dataVencimento}`)
}

export function notificarCompraConfirmada(
  clienteTelefone: string,
  total: number,
  metodo: string,
  lojaInfo?: LojaInfo
): void {
  const loja = lojaInfo || {
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coité - BA',
    telefone: '(00) 00000-0000'
  }
  
  const mensagemWhatsApp = `✅ *VALENTE CONECTA* - COMPRA CONFIRMADA!

🏪 *Loja:* ${loja.nome}
📍 *Endereço:* ${loja.endereco}

💰 *Valor:* R$ ${total.toFixed(2)}
💳 *Pagamento:* ${metodo.toUpperCase()}

✅ Sua compra foi finalizada com sucesso!

Volte sempre! 🛍️

---
Valente Conecta - Seu PDV Colaborativo`

  const mensagemPush = `✅ Compra confirmada!\nValor: R$ ${total.toFixed(2)}\nMétodo: ${metodo}`

  if (clienteTelefone && clienteTelefone.length >= 10) {
    enviarWhatsApp(clienteTelefone, mensagemWhatsApp)
  }
  enviarPushNotification('Compra Confirmada', mensagemPush, { total, metodo })
}

export function notificarProdutoPendente(
  lojaNome: string,
  produtoNome: string
): void {
  const mensagemPush = `📦 Novo produto pendente!\nLoja: ${lojaNome}\nProduto: ${produtoNome}`
  
  enviarPushNotification('Produto Aguardando Validação', mensagemPush, { lojaNome, produtoNome })
}