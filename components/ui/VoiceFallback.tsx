// components/ui/VoiceFallback.tsx
'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, AlertCircle } from 'lucide-react'

interface VoiceFallbackProps {
  onTextSearch: (text: string) => void
}

export function VoiceFallback({ onTextSearch }: VoiceFallbackProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  useEffect(() => {
    // Detectar se é Safari (que tem mais restrições)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isSafari || isIOS) {
      setShowFallback(true)
      setSuggestion('No iPhone, vá em Configurações → Safari → Microfone → Permitir')
    }
  }, [])

  if (!showFallback) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Dica: {suggestion}</span>
      </div>
    </div>
  )
}