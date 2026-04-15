'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function useVoiceSearch(onSearchComplete: (text: string, data: any) => void) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'pt-BR'
      recognitionRef.current.continuous = false
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        
        // Dados para o Admin Master: Termo, Localização e Estratégia de Busca
        const searchMetadata = {
          term: transcript,
          timestamp: new Date().toISOString(),
          city: 'Valente-BA',
          priority: 'LOCAL_FIRST'
        }
        
        onSearchComplete(transcript, searchMetadata)
      }

      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onerror = () => setIsListening(false)
    }
  }, [onSearchComplete])

  const toggleListening = useCallback(() => {
    if (isListening) recognitionRef.current?.stop()
    else { setIsListening(true); recognitionRef.current?.start() }
  }, [isListening])

  return { isListening, toggleListening }
}