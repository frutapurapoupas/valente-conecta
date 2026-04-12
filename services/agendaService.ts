import type { Agendamento, AgendamentoStatus, NovoAgendamentoInput } from '@/types/agenda'

const STORAGE_KEY = 'vc_agendamentos'

const PROFISSIONAIS_SEED = [
  { id: 'p1', nome: 'Naiara Designer' },
  { id: 'p2', nome: 'Rafa Barber' },
  { id: 'p3', nome: 'Camila Nails' },
]

function agoraIso() {
  return new Date().toISOString()
}

function addHours(base: Date, horas: number) {
  const d = new Date(base)
  d.setHours(d.getHours() + horas)
  return d
}

function gerarSeed(): Agendamento[] {
  const base = new Date()
  base.setMinutes(0, 0, 0)

  const slots = [10, 13, 15, 17]

  return slots.map((h, i) => {
    const profissional = PROFISSIONAIS_SEED[i % PROFISSIONAIS_SEED.length]
    const inicio = new Date(base)
    inicio.setDate(base.getDate() + i)
    inicio.setHours(h, 0, 0, 0)
    const fim = addHours(inicio, 1)

    return {
      id: `ag_seed_${i + 1}`,
      profissionalId: profissional.id,
      profissionalNome: profissional.nome,
      clienteNome: ['Jorge Lima', 'Ana Rocha', 'Paula Silva', 'Marta Vieira'][i],
      clienteTelefone: ['75999112233', '75988334455', '75999776611', '75998880022'][i],
      servico: ['Corte + Barba', 'Design de Sobrancelha', 'Manicure Completa', 'Escova + Prancha'][i],
      valor: [55, 35, 45, 60][i],
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      status: i === 0 ? 'confirmado' : i === 3 ? 'cancelado' : 'pendente',
      criadoEm: agoraIso(),
      observacoes: i === 1 ? 'Cliente prefere atendimento pontual.' : undefined,
    }
  })
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function save(data: Agendamento[]) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function listarAgendamentos(): Agendamento[] {
  if (!isBrowser()) return []

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = gerarSeed()
    save(seed)
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as Agendamento[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function listarAgendamentosProfissional(profissionalId: string): Agendamento[] {
  return listarAgendamentos().filter(item => item.profissionalId === profissionalId)
}

export function criarAgendamento(input: NovoAgendamentoInput): Agendamento {
  const novo: Agendamento = {
    id: `ag_${Date.now()}`,
    ...input,
    status: 'pendente',
    criadoEm: agoraIso(),
  }

  const atual = listarAgendamentos()
  const proximo = [novo, ...atual]
  save(proximo)
  return novo
}

export function atualizarStatusAgendamento(id: string, status: AgendamentoStatus): Agendamento[] {
  const atual = listarAgendamentos()
  const proximo = atual.map(item => (item.id === id ? { ...item, status } : item))
  save(proximo)
  return proximo
}
