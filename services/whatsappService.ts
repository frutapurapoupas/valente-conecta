function generateToken(phone: string): string {
  return Buffer.from(`${phone}-${Date.now()}`).toString('base64url')
}

/**
 * Envia o link de acesso personalizado e instruções de instalação
 */
export async function sendWelcomeMessage(phone: string, name: string) {
  const welcomeLink = `https://valenteconecta.com.br/login?token=${generateToken(phone)}`
  
  const message = `Olá ${name}! 👋 
  
Bem-vindo ao *Valente Conecta*. Seu perfil básico foi criado com sucesso!

🚀 *Próximo passo:*
Clique no link abaixo para acessar seu painel e adicione o ícone do App à sua tela inicial para não perder nenhuma oferta:

🔗 ${welcomeLink}

Atenciosamente,
Equipe Valente Conecta ⚡`

  // Aqui você integraria com sua API de WhatsApp (Evolution API, Z-API, etc.)
  return await fetch('SUA_API_WHATSAPP_URL', {
    method: 'POST',
    body: JSON.stringify({ number: phone, message: message })
  })
}