'use client'
import { useState } from 'react'
import {
  Star, Clock, Zap, AlertCircle,
  type AlertaCartao,
} from 'lucide-react'

interface BannerAlertaProps {
  alerta: AlertaCartao
}

export default function BannerAlerta({ alerta }: BannerAlertaProps) {
  const cls = {
    info:    'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    aviso:   'bg-amber-500/15 border-amber-500/30 text-amber-300',
    critico: 'bg-red-500/15 border-red-500/30 text-red-300',
  }[alerta.urgencia]

  const icon = {
    melhor_dia:      <Star className="w-4 h-4 flex-shrink-0" />,
    fatura_proxima:  <Clock className="w-4 h-4 flex-shrink-0" />,
    fatura_hoje:     <Zap className="w-4 h-4 flex-shrink-0" />,
    fatura_atrasada: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
  }[alerta.tipo]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${cls}`}>
      {icon}
      <span>{alerta.mensagem}</span>
    </div>
  )
}
