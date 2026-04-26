'use client'

import { useAgendamento } from '@/hooks/useAgendamento'
import { FilaEspera } from '@/components/agendamento/FilaEspera'

export default function FilaEsperaPage() {
  const agendamentoData = useAgendamento()

  return <FilaEspera {...agendamentoData} />
}
