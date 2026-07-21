// src/modules/cozinha/components/StatusBadge.tsx
// ============================================
// BADGE DE STATUS
// ============================================

import React from 'react'

interface StatusBadgeProps {
  status: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; color: string }> = {
  // Estoque
  ok: { label: 'OK', color: 'bg-green-100 text-green-700' },
  baixo: { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700' },
  critico: { label: 'Crítico', color: 'bg-red-100 text-red-700' },
  
  // Produção
  planejado: { label: 'Planejado', color: 'bg-blue-100 text-blue-700' },
  em_producao: { label: 'Em Produção', color: 'bg-orange-100 text-orange-700' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  
  // Compras
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  aprovada: { label: 'Aprovada', color: 'bg-blue-100 text-blue-700' },
  recebida: { label: 'Recebida', color: 'bg-green-100 text-green-700' },
  
  // Geral
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
  inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-700' },
  rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  size = 'md' 
}) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' }
  
  return (
    <span className={\inline-flex items-center rounded-full font-medium \ \\}>
      {label || config.label}
    </span>
  )
}
