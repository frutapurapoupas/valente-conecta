// hooks/useVoiceSearch.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchMetadata {
  term: string
  timestamp: string
  city: string
  priority: string
  source: 'voice'
  location: string
}

export function useVoiceSearch(onSearchComplete: (text: string, data: SearchMetadata) => void) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)

  useEffect(() => {
    // Verifica suporte ao microfone
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const hasSupport = !!SpeechRecognition
    setHasRecognitionSupport(hasSupport)
    
    if (hasSupport) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'pt-BR'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        
        // Metadados completos para o Admin Master
        const searchMetadata: SearchMetadata = {
          term: transcript,
          timestamp: new Date().toISOString(),
          city: 'Valente-BA',
          priority: 'LOCAL_FIRST',
          source: 'voice',
          location: 'Valente-BA'
        }
        
        // Registra no Admin Master (sem bloquear a UI)
        fetch('/api/search/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchMetadata)
        }).catch(err => console.error('Erro ao registrar busca:', err))
        
        onSearchComplete(transcript, searchMetadata)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [onSearchComplete])

  const toggleListening = useCallback(() => {
    if (!hasRecognitionSupport) {
      alert('Seu navegador não suporta busca por voz. Use Chrome, Edge ou Safari.')
      return
    }
    
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (error) {
        console.error('Erro ao iniciar reconhecimento:', error)
        setIsListening(false)
      }
    }
  }, [isListening, hasRecognitionSupport])

  return { isListening, toggleListening }
}