'use client'
import { useState } from 'react'
import {
  Star, Clock, Zap, AlertCircle,
} from 'lucide-react'

interface BannerAlertaProps {
  urgencia: 'info' | 'aviso' | 'critico'
  tipo: 'melhor_dia' | 'fatura_proxima' | 'fatura_hoje' | 'fatura_atrasada'
  mensagem: string
}

export default function BannerAlerta({ urgencia, tipo, mensagem }: BannerAlertaProps) {
  const cls: Record<string, string> = {
    info:    'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    aviso:   'bg-amber-500/15 border-amber-500/30 text-amber-300',
    critico: 'bg-red-500/15 border-red-500/30 text-red-300',
  }

  const icon = {
    melhor_dia:      <Star className="w-4 h-4 flex-shrink-0" />,
    fatura_proxima:  <Clock className="w-4 h-4 flex-shrink-0" />,
    fatura_hoje:     <Zap className="w-4 h-4 flex-shrink-0" />,
    fatura_atrasada: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${cls[urgencia]}`}>
      {icon[tipo]}
      <span>{mensagem}</span>
    </div>
  )
}
