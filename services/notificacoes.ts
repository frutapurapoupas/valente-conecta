// services/notificacoes.ts

// ============================================
// WHATSAPP - Link direto (funciona sem API)
// ============================================
export function enviarWhatsApp(telefone: string, mensagem: string): void {
  if (!telefone || telefone.length < 10) {
    console.log('Telefone invalido para notificacao:', telefone)
    return
  }
  
  // Limpar telefone
  const telefoneLimpo = telefone.replace(/\D/g, '')
  
  // Formatar para padrao internacional
  let telefoneInternacional = telefoneLimpo
  if (!telefoneLimpo.startsWith('55') && telefoneLimpo.length === 11) {
    telefoneInternacional = `55${telefoneLimpo}`
  } else if (!telefoneLimpo.startsWith('55') && telefoneLimpo.length === 10) {
    telefoneInternacional = `55${telefoneLimpo}`
  }
  
  // Codificar mensagem
  const mensagemCodificada = encodeURIComponent(mensagem)
  
  // Salvar notificacao (sem abrir WhatsApp)
  salvarNotificacao({
    tipo: 'whatsapp',
    destinatario: telefone,
    mensagem,
    data: new Date().toISOString(),
    link: "https://api.whatsapp.com/send?phone=" + telefoneInternacional + "&text=" + mensagemCodificada
  })
  
  console.log('Notificacao WhatsApp registrada para ' + telefone)
}

// ============================================
// PUSH NOTIFICATION (API nativa do navegador)
// ============================================

export async function inicializarPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  if (!('Notification' in window)) {
    console.log('Este navegador nao suporta notificacoes')
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
    console.log('Navegador nao suporta notificacoes')
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
      
      console.log(`Push enviado: ${titulo} - ${corpo}`)
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
  
  // Salvar notificacao
  salvarNotificacao({
    tipo: 'push',
    titulo,
    mensagem: corpo,
    dados,
    data: new Date().toISOString()
  })
}

// ============================================
// FUNCOES GERAIS
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
    console.error('Erro ao salvar notificacao:', error)
  }
}

// ============================================
// NOTIFICACOES DO PDV - VERSAO CORRIGIDA
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
  // Dados da loja (padrao ou do parametro)
  const loja = lojaInfo || {
    nome: 'Valente Conecta',
    endereco: 'Rua Principal, 123 - Centro',
    cidade: 'Coite - BA',
    telefone: '(00) 00000-0000'
  }
  
  const dataVencimento = vencimento.toLocaleDateString('pt-BR')
  const saldoRestante = saldoFiadoDisponivel - total
  
  // Mensagem completa para WhatsApp
  const mensagemWhatsApp = "VALENTE CONECTA - SUA COMPRA FOI REALIZADA COM SUCESSO!\n\nLoja: " + loja.nome + "\nEndereco: " + loja.endereco + "\nTelefone: " + loja.telefone + "\n\nCliente: " + clienteNome + "\nValor da compra: R$ " + total.toFixed(2) + "\nData de vencimento: " + dataVencimento + "\n\nLimite de fiado disponivel: R$ " + saldoRestante.toFixed(2) + "\n\nSeu pedido foi aprovado e registrado em nosso sistema.\n\nFormas de pagamento disponiveis:\n• Dinheiro\n• PIX\n• Cartao\n• Moeda Conecta\n\nAgradecemos pela preferencia!\n\n---\nValente Conecta - Seu PDV Colaborativo"

  // Mensagem resumida para Push
  const mensagemPush = "Compra realizada com sucesso!\n\nLoja: " + loja.nome + "\nValor: R$ " + total.toFixed(2) + "\nVence: " + dataVencimento + "\nSaldo disponivel: R$ " + saldoRestante.toFixed(2)

  // Enviar WhatsApp (apenas registrar, sem abrir)
  if (clienteTelefone && clienteTelefone.length >= 10) {
    // Salvar notificacao sem abrir WhatsApp
    salvarNotificacao({
      tipo: 'whatsapp',
      destinatario: clienteTelefone,
      mensagem: mensagemWhatsApp,
      data: new Date().toISOString(),
      link: "https://api.whatsapp.com/send?phone=" + (clienteTelefone.replace(/\D/g, '').startsWith('55') ? clienteTelefone.replace(/\D/g, '') : "55" + clienteTelefone.replace(/\D/g, '')) + "&text=" + encodeURIComponent(mensagemWhatsApp)
    })
  }
  
  // Enviar Push (para o lojista e para o cliente se tiver permissao)
  enviarPushNotification('Venda no Fiado Registrada', mensagemPush, { 
    clienteNome, 
    total, 
    lojaNome: loja.nome,
    url: '/admin-fiado'
  })
  
  // Registrar no console
  console.log('Notificacao enviada para ' + clienteNome + ' (' + clienteTelefone + ')')
  console.log('Valor: R$ ' + total.toFixed(2) + ' | Vence: ' + dataVencimento)
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
    cidade: 'Coite - BA',
    telefone: '(00) 00000-0000'
  }
  
  const mensagemWhatsApp = "VALENTE CONECTA - COMPRA CONFIRMADA!\n\nLoja: " + loja.nome + "\nEndereco: " + loja.endereco + "\n\nValor: R$ " + total.toFixed(2) + "\nPagamento: " + metodo.toUpperCase() + "\n\nSua compra foi finalizada com sucesso!\n\nVolte sempre!\n\n---\nValente Conecta - Seu PDV Colaborativo"

  const mensagemPush = "Compra confirmada!\nValor: R$ " + total.toFixed(2) + "\nMetodo: " + metodo

  if (clienteTelefone && clienteTelefone.length >= 10) {
    // Salvar notificacao sem abrir WhatsApp
    salvarNotificacao({
      tipo: 'whatsapp',
      destinatario: clienteTelefone,
      mensagem: mensagemWhatsApp,
      data: new Date().toISOString(),
      link: "https://api.whatsapp.com/send?phone=" + (clienteTelefone.replace(/\D/g, '').startsWith('55') ? clienteTelefone.replace(/\D/g, '') : "55" + clienteTelefone.replace(/\D/g, '')) + "&text=" + encodeURIComponent(mensagemWhatsApp)
    })
  }
  enviarPushNotification('Compra Confirmada', mensagemPush, { total, metodo })
}

export function notificarProdutoPendente(
  lojaNome: string,
  produtoNome: string
): void {
  const mensagemPush = "Novo produto pendente!\nLoja: " + lojaNome + "\nProduto: " + produtoNome
  
  enviarPushNotification('Produto Aguardando Validacao', mensagemPush, { lojaNome, produtoNome })
}
