// services/pagamentos.ts

export interface Cliente {
  id: string
  nome: string
  telefone: string
  limite_fiado: number
  divida_atual: number
  carteira_conecta: number
}

export interface PagamentoResultado {
  status: 'PAGO' | 'PENDENTE' | 'FIADO_REGISTRADO' | 'PAGO_COM_CONECTA' | 'ERRO'
  mensagem: string
  troco?: number
  qrCodePix?: string
}

// Validar cliente para fiado
export function validarClienteFiado(cliente: Cliente | null, total: number): { valido: boolean; mensagem: string } {
  if (!cliente) {
    return { valido: false, mensagem: 'Cliente não encontrado. Cadastre o cliente primeiro.' }
  }
  
  const novoSaldo = cliente.divida_atual + total
  if (novoSaldo > cliente.limite_fiado) {
    return { 
      valido: false, 
      mensagem: `Limite de fiado excedido. Limite: R$ ${cliente.limite_fiado.toFixed(2)} | Dívida atual: R$ ${cliente.divida_atual.toFixed(2)}` 
    }
  }
  
  return { valido: true, mensagem: 'Cliente válido para fiado' }
}

// Validar saldo da moeda Conecta
export function validarSaldoConecta(cliente: Cliente | null, total: number): { valido: boolean; mensagem: string; saldo: number } {
  if (!cliente) {
    return { valido: false, mensagem: 'Cliente não encontrado.', saldo: 0 }
  }
  
  const saldo = cliente.carteira_conecta || 0
  if (saldo < total) {
    return { 
      valido: false, 
      mensagem: `Saldo insuficiente na moeda Conecta. Saldo: R$ ${saldo.toFixed(2)} | Total: R$ ${total.toFixed(2)}`,
      saldo
    }
  }
  
  return { valido: true, mensagem: 'Saldo suficiente', saldo }
}

// Processar pagamento em dinheiro
export function processarDinheiro(valorRecebido: number, total: number): PagamentoResultado {
  if (valorRecebido < total) {
    return { status: 'ERRO', mensagem: `Valor insuficiente. Total: R$ ${total.toFixed(2)} | Recebido: R$ ${valorRecebido.toFixed(2)}` }
  }
  
  const troco = valorRecebido - total
  return { status: 'PAGO', mensagem: 'Pagamento em dinheiro confirmado', troco }
}

// Processar pagamento PIX
export function processarPIX(total: number): PagamentoResultado {
  // Gerar QR Code PIX (simulação)
  const qrCodePix = `00020126580014BR.GOV.BCB.PIX0136${Date.now()}5204000053039865404${total.toFixed(2)}5802BR5925Valente Conecta6009SAO PAULO62070503***6304`
  return { status: 'PENDENTE', mensagem: 'Aguardando confirmação do PIX', qrCodePix }
}

// Processar pagamento com cartão
export function processarCartao(tipo: 'debito' | 'credito', parcelas: number = 1): PagamentoResultado {
  return { status: 'PAGO', mensagem: `Pagamento com cartão de ${tipo} confirmado${parcelas > 1 ? ` em ${parcelas}x` : ''}` }
}

// Processar fiado
export function processarFiado(cliente: Cliente, total: number): PagamentoResultado {
  // Atualizar dívida do cliente
  cliente.divida_atual += total
  
  // Salvar no localStorage
  const clientes = localStorage.getItem('clientes_fiado')
  const listaClientes = clientes ? JSON.parse(clientes) : []
  const clienteIndex = listaClientes.findIndex((c: any) => c.id === cliente.id)
  if (clienteIndex !== -1) {
    listaClientes[clienteIndex].divida_atual = cliente.divida_atual
    localStorage.setItem('clientes_fiado', JSON.stringify(listaClientes))
  }
  
  return { status: 'FIADO_REGISTRADO', mensagem: `Fiado registrado. Vencimento em 30 dias. Saldo devedor: R$ ${cliente.divida_atual.toFixed(2)}` }
}

// Processar pagamento com moeda Conecta
export function processarMoedaConecta(cliente: Cliente, total: number): PagamentoResultado {
  // Debitar da carteira
  cliente.carteira_conecta -= total
  
  // Salvar no localStorage
  const clientes = localStorage.getItem('clientes_fiado')
  const listaClientes = clientes ? JSON.parse(clientes) : []
  const clienteIndex = listaClientes.findIndex((c: any) => c.id === cliente.id)
  if (clienteIndex !== -1) {
    listaClientes[clienteIndex].carteira_conecta = cliente.carteira_conecta
    localStorage.setItem('clientes_fiado', JSON.stringify(listaClientes))
  }
  
  return { status: 'PAGO_COM_CONECTA', mensagem: `Pagamento realizado com Moeda Conecta. Saldo restante: R$ ${cliente.carteira_conecta.toFixed(2)}` }
}

// Buscar cliente por telefone
export function buscarClientePorTelefone(telefone: string): Cliente | null {
  const clientes = localStorage.getItem('clientes_fiado')
  if (!clientes) return null
  
  const listaClientes = JSON.parse(clientes)
  return listaClientes.find((c: any) => c.telefone === telefone) || null
}

// Criar novo cliente
export function criarCliente(nome: string, telefone: string): Cliente {
  const novoCliente: Cliente = {
    id: Date.now().toString(),
    nome,
    telefone,
    limite_fiado: 500,
    divida_atual: 0,
    carteira_conecta: 0
  }
  
  const clientes = localStorage.getItem('clientes_fiado')
  const listaClientes = clientes ? JSON.parse(clientes) : []
  listaClientes.push(novoCliente)
  localStorage.setItem('clientes_fiado', JSON.stringify(listaClientes))
  
  return novoCliente
}

// Enviar notificação
export function enviarNotificacao(cliente: Cliente, total: number, formaPagamento: string): void {
  console.log(`📱 Notificação enviada para ${cliente.telefone}: Compra de R$ ${total.toFixed(2)} realizada com ${formaPagamento}`)
  
  // Salvar notificação no localStorage
  const notificacoes = localStorage.getItem('notificacoes_clientes')
  const listaNotificacoes = notificacoes ? JSON.parse(notificacoes) : []
  listaNotificacoes.push({
    id: Date.now(),
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    clienteTelefone: cliente.telefone,
    valor: total,
    formaPagamento,
    data: new Date().toISOString(),
    lida: false
  })
  localStorage.setItem('notificacoes_clientes', JSON.stringify(listaNotificacoes))
}