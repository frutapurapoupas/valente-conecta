// src/modules/cozinha/utils/formatadores.ts
// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatPercent = (value: number): string => {
  return value.toFixed(1) + '%'
}

export const formatWeight = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + ' kg'
  }
  return value.toFixed(0) + ' g'
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return hours + 'h ' + mins + 'min'
  }
  return mins + 'min'
}

export const formatStatus = (status: string): { label: string; color: string } => {
  const statusMap: Record<string, { label: string; color: string }> = {
    rascunho: { label: 'Rascunho', color: 'gray' },
    ativa: { label: 'Ativa', color: 'green' },
    inativa: { label: 'Inativa', color: 'red' },
    pendente: { label: 'Pendente', color: 'yellow' },
    confirmado: { label: 'Confirmado', color: 'blue' },
    entregue: { label: 'Entregue', color: 'green' },
    cancelado: { label: 'Cancelado', color: 'red' },
    agendado: { label: 'Agendado', color: 'blue' },
    em_producao: { label: 'Em Produção', color: 'orange' },
    concluido: { label: 'Concluído', color: 'green' },
    solicitado: { label: 'Solicitado', color: 'yellow' },
    aprovado: { label: 'Aprovado', color: 'blue' },
    recebido: { label: 'Recebido', color: 'green' },
    ativo: { label: 'Ativo', color: 'green' },
    inativo: { label: 'Inativo', color: 'gray' },
    ok: { label: 'OK', color: 'green' },
    baixo: { label: 'Baixo', color: 'yellow' },
    critico: { label: 'Crítico', color: 'red' },
    planejado: { label: 'Planejado', color: 'blue' },
    aprovada: { label: 'Aprovada', color: 'blue' },
    recebida: { label: 'Recebida', color: 'green' }
  }
  return statusMap[status] || { label: status, color: 'gray' }
}