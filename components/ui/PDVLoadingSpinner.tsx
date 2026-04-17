'use client'

import { Loader2 } from 'lucide-react'

interface PDVLoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PDVLoadingSpinner({ message = 'Processando...', size = 'md' }: PDVLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Loader2 className={`text-yellow-500 animate-spin ${sizeClasses[size]}`} />
      <p className="text-zinc-400 text-sm">{message}</p>
    </div>
  )
}
