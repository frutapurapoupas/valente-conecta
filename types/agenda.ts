export type AgendamentoStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado'

export interface Agendamento {
  id: string
  profissionalId: string
  profissionalNome: string
  clienteNome: string
  clienteTelefone: string
  servico: string
  valor: number
  inicio: string
  fim: string
  status: AgendamentoStatus
  observacoes?: string
  criadoEm: string
}

export interface NovoAgendamentoInput {
  profissionalId: string
  profissionalNome: string
  clienteNome: string
  clienteTelefone: string
  servico: string
  valor: number
  inicio: string
  fim: string
  observacoes?: string
}
