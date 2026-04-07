export function notificarCompraFiado(
  clienteNome: string,
  clienteTelefone: string,
  total: number,
  vencimento: Date,
  lojaNome: string = 'Valente Conecta',
  lojaEndereco: string = 'Rua Principal, 123 - Centro',
  saldoFiadoDisponivel: number = 500
): void {
  const mensagemWhatsApp = `✅ *VALENTE CONECTA* - SUA COMPRA FOI REALIZADA COM SUCESSO!

🏪 *Loja:* ${lojaNome}
📍 *Endereço:* ${lojaEndereco}

👤 *Cliente:* ${clienteNome}
💰 *Valor da compra:* R$ ${total.toFixed(2)}
📅 *Data de vencimento:* ${vencimento.toLocaleDateString('pt-BR')}

💳 *Saldo de fiado disponível:* R$ ${saldoFiadoDisponivel.toFixed(2)}

✅ Seu pedido foi aprovado e registrado em nosso sistema.

Agradecemos pela preferência! 🙏

*Valente Conecta - Seu PDV Colaborativo*`

  const mensagemPush = `✅ Compra realizada com sucesso!\nLoja: ${lojaNome}\nValor: R$ ${total.toFixed(2)}\nVence: ${vencimento.toLocaleDateString('pt-BR')}`

  if (clienteTelefone && clienteTelefone.length >= 10) {
    enviarWhatsApp(clienteTelefone, mensagemWhatsApp)
  }
  enviarPushNotification('Compra Realizada com Sucesso!', mensagemPush, { clienteNome, total, lojaNome })
}