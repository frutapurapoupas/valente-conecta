'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function VoiceSearch({
  onSearch,
  placeholder = "Clique para pesquisar com voz",
  className = ""
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const hasWebkitSpeech = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
    const hasSpeechRecognition = typeof window !== 'undefined' && 'SpeechRecognition' in window

    if (hasWebkitSpeech || hasSpeechRecognition) {
      setIsSupported(true)

      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition

      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'pt-BR'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError('')
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          const cleanQuery = finalTranscript.trim()

          setIsListening(false)
          setTranscript('')
          onSearch(cleanQuery)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Erro voz:', event.error)

        const errorMap: Record<string, string> = {
          'no-speech': 'Nenhuma fala detectada. Tente novamente.',
          'audio-capture': 'Erro ao acessar microfone.',
          'not-allowed': 'Permissão do microfone negada.',
          'network': 'Erro de conexão.',
          'service-not-allowed': 'Serviço não permitido.'
        }

        setError(errorMap[event.error] || 'Erro no reconhecimento de voz.')
        setIsListening(false)
        setTranscript('')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError('Seu navegador não suporta busca por voz.')
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [onSearch])

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      // 🚨 valida HTTPS (CRÍTICO PRA MOBILE)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Busca por voz requer HTTPS no celular.')
        return
      }

      try {
        setError('')
        setTranscript('')
        recognitionRef.current.start()
      } catch (err) {
        console.error('Erro ao iniciar:', err)
        setError('Erro ao iniciar reconhecimento.')
      }
    }
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <MicOff className="w-5 h-5 text-zinc-400" />
        <span className="text-xs text-zinc-400">
          Voz não suportada
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        className={`p-2 transition-all ${
          isListening
            ? 'text-red-500 animate-pulse'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title={isListening ? "Parar gravação" : "Pesquisar com voz"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {isListening && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-500/90 p-2 rounded-lg text-xs text-white">
          Ouvindo...
          {transcript && <div className="italic mt-1">"{transcript}"</div>}
        </div>
      )}

      {error && !isListening && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-500/90 p-2 rounded-lg text-xs text-white">
          {error}
        </div>
      )}
    </div>
  )
}