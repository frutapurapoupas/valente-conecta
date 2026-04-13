import type { Agendamento, AgendamentoStatus, NovoAgendamentoInput } from '@/types/agenda'
import { supabase } from '@/lib/supabase'

// Listar todos os agendamentos
export async function listarAgendamentos(): Promise<Agendamento[]> {
  const { data, error } = await supabase.from('agendamentos').select('*').order('inicio', { ascending: true })
	if (error) throw error
	return data as Agendamento[]
}

// Listar agendamentos de um profissional
export async function listarAgendamentosProfissional(profissionalId: string): Promise<Agendamento[]> {
  const { data, error } = await supabase.from('agendamentos').select('*').eq('profissionalId', profissionalId).order('inicio', { ascending: true })
  if (error) throw error
  return data as Agendamento[]
}

// Verificar conflitos de horário
export async function existeConflito(profissionalId: string, inicio: string, fim: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('profissionalId', profissionalId)
    .or(`status.eq.confirmado,status.eq.pendente`)
    .filter('inicio', 'lt', fim)
    .filter('fim', 'gt', inicio)
  if (error) throw error
  return (data?.length ?? 0) > 0
}

// Criar novo agendamento (com prevenção de conflito)
export async function criarAgendamento(input: NovoAgendamentoInput): Promise<{ agendamento?: Agendamento; conflito?: boolean }> {
  const conflito = await existeConflito(input.profissionalId, input.inicio, input.fim)
  if (conflito) return { conflito: true }
  const { data, error } = await supabase.from('agendamentos').insert([{ ...input, status: 'pendente', criadoEm: new Date().toISOString() }]).select().single()
  if (error) throw error
  return { agendamento: data as Agendamento }
}

// Atualizar status do agendamento
export async function atualizarStatusAgendamento(id: string, status: AgendamentoStatus): Promise<Agendamento> {
  const { data, error } = await supabase.from('agendamentos').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data as Agendamento
}

// Listar horários livres para um profissional em um dia
export async function listarHorariosLivres(profissionalId: string, dia: string, duracaoMinutos = 60): Promise<string[]> {
  // dia: '2026-04-13' (YYYY-MM-DD)
  const inicioDia = `${dia}T00:00:00.000Z`
  const fimDia = `${dia}T23:59:59.999Z`
  const { data, error } = await supabase
    .from('agendamentos')
    .select('inicio,fim')
    .eq('profissionalId', profissionalId)
    .or('status.eq.confirmado,status.eq.pendente')
    .gte('inicio', inicioDia)
    .lte('fim', fimDia)
    .order('inicio', { ascending: true })
  if (error) throw error
  // Gera slots livres (exemplo: 08:00 às 18:00)
  const ocupados = (data ?? []).map(a => [new Date(a.inicio), new Date(a.fim)])
  const slotsLivres: string[] = []
  const horaAbertura = 8
  const horaFechamento = 18
  for (let h = horaAbertura; h < horaFechamento; h++) {
    const slotInicio = new Date(`${dia}T${h.toString().padStart(2, '0')}:00:00.000Z`)
    const slotFim = new Date(slotInicio)
    slotFim.setMinutes(slotFim.getMinutes() + duracaoMinutos)
    const conflito = ocupados.some(([ini, fim]) => slotInicio < fim && slotFim > ini)
    if (!conflito && slotFim.getHours() <= horaFechamento) {
      slotsLivres.push(slotInicio.toISOString())
    }
  }
  return slotsLivres
}

// Fila de espera: adicionar cliente à fila para um horário ocupado
export async function adicionarFilaEspera(profissionalId: string, inicio: string, clienteNome: string, clienteTelefone: string) {
  const { error } = await supabase.from('fila_espera').insert({ profissionalId, inicio, clienteNome, clienteTelefone })
  if (error) throw error
  return true
}

// Verificar se cliente já possui agendamento no mesmo dia
export async function clienteJaAgendadoNoDia(clienteTelefone: string, dia: string): Promise<boolean> {
  const inicioDia = `${dia}T00:00:00.000Z`
  const fimDia = `${dia}T23:59:59.999Z`
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id')
    .eq('clienteTelefone', clienteTelefone)
    .gte('inicio', inicioDia)
    .lte('fim', fimDia)
    .or('status.eq.confirmado,status.eq.pendente')
  if (error) throw error
  return (data?.length ?? 0) > 0
}
