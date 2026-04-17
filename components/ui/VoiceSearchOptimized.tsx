'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

// Cache global para instâncias de reconhecimento
const recognitionCache = new Map<string, any>()
const MAX_CACHE_SIZE = 10

// Rate limiting por usuário
const userRateLimit = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10

export default function VoiceSearchOptimized({ onSearch, placeholder = "Clique para pesquisar com voz", className = "" }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const recognitionRef = useRef<any>(null)
  const userIdRef = useRef<string>(`user_${Date.now()}_${Math.random()}`)

  // Rate limiting check
  const checkRateLimit = useCallback(() => {
    const now = Date.now()
    const userLimit = userRateLimit.get(userIdRef.current)
    
    if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
      userRateLimit.set(userIdRef.current, { count: 1, lastReset: now })
      return true
    }
    
    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
      return false
    }
    
    userLimit.count++
    return true
  }, [])

  // Cleanup de cache antigo
  const cleanupCache = useCallback(() => {
    if (recognitionCache.size > MAX_CACHE_SIZE) {
      // Limpar instâncias mais antigas
      const keysToDelete = Array.from(recognitionCache.keys()).slice(0, MAX_CACHE_SIZE / 2)
      keysToDelete.forEach(key => {
        const recognition = recognitionCache.get(key)
        if (recognition) {
          try {
            recognition.stop()
            recognition.abort()
          } catch (e) {
            // Ignorar erros de cleanup
          }
        }
        recognitionCache.delete(key)
      })
    }
  }, [])

  // Obter ou criar instância de reconhecimento com cache
  const getRecognitionInstance = useCallback(() => {
    const cacheKey = `recognition_${userIdRef.current}`
    
    if (recognitionCache.has(cacheKey)) {
      return recognitionCache.get(cacheKey)
    }

    // Verificar suporte para Web Speech API
    const hasWebkitSpeech = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
    const hasSpeechRecognition = typeof window !== 'undefined' && 'SpeechRecognition' in window
    
    if (!hasWebkitSpeech && !hasSpeechRecognition) {
      return null
    }

    cleanupCache()
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    // Configurações otimizadas para performance
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'pt-BR'
    recognition.maxAlternatives = 1
    
    // Configurações específicas para mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      recognition.continuous = false
      recognition.interimResults = false // Reduzir load em mobile
      recognition.maxAlternatives = 1
    }

    // Event handlers otimizados
    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setTranscript('')
      setIsLoading(false)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else if (!isMobile) { // Apenas interim results em desktop
          interimTranscript += result[0].transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      // Processamento otimizado para resultado final
      if (finalTranscript) {
        const cleanQuery = finalTranscript.trim()
        
        // Timeout otimizado por dispositivo
        const timeout = isMobile ? 1200 : 800
        
        setTimeout(() => {
          setIsListening(false)
          setTranscript('')
          onSearch(cleanQuery)
          
          // Limpar instância após uso
          try {
            recognition.stop()
          } catch (e) {
            // Ignorar
          }
        }, timeout)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz otimizado:', event.error)
      
      const errorMap: Record<string, string> = {
        'no-speech': 'Nenhuma fala detectada. Tente novamente.',
        'audio-capture': 'Erro ao acessar microfone.',
        'not-allowed': 'Permissão do microfone negada.',
        'network': 'Erro de conexão.',
        'service-not-allowed': 'Serviço não permitido.',
        'aborted': 'Reconhecimento interrompido.'
      }

      setError(errorMap[event.error] || 'Erro no reconhecimento de voz.')
      setIsListening(false)
      setTranscript('')
      setIsLoading(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setIsLoading(false)
    }

    // Adicionar ao cache
    recognitionCache.set(cacheKey, recognition)
    
    return recognition
  }, [onSearch, cleanupCache])

  useEffect(() => {
    const recognition = getRecognitionInstance()
    if (recognition) {
      setIsSupported(true)
      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
      setError('Seu navegador não suporta busca por voz.')
    }

    return () => {
      // Cleanup otimizado
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          recognitionRef.current.abort()
        } catch (e) {
          // Ignorar erros de cleanup
        }
      }
    }
  }, [getRecognitionInstance])

  const toggleListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isLoading) return

    if (isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error)
      }
    } else {
      // Rate limiting
      if (!checkRateLimit()) {
        setError('Muitas tentativas. Aguarde um momento.')
        return
      }

      // Validação HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Busca por voz requer HTTPS no celular.')
        return
      }

      try {
        setError('')
        setTranscript('')
        setIsLoading(true)
        
        // Timeout de segurança para inicialização
        const initTimeout = setTimeout(() => {
          if (isLoading) {
            setIsLoading(false)
            setError('Timeout ao iniciar microfone. Tente novamente.')
          }
        }, 5000)

        recognitionRef.current.start()
        
        // Limpar timeout quando iniciar
        recognitionRef.current.onstart = () => {
          clearTimeout(initTimeout)
          setIsListening(true)
          setError('')
          setTranscript('')
          setIsLoading(false)
        }
        
      } catch (err) {
        console.error('Erro ao iniciar reconhecimento:', err)
        setError('Erro ao iniciar reconhecimento.')
        setIsLoading(false)
      }
    }
  }, [isListening, isSupported, isLoading, checkRateLimit])

  // Componente otimizado com memoização implícita
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
        onTouchStart={toggleListening}
        onTouchEnd={(e) => e.preventDefault()}
        disabled={isLoading}
        className={`p-2 transition-all touch-manipulation ${
          isListening
            ? 'text-red-500 animate-pulse'
            : isLoading
            ? 'text-yellow-500 animate-spin'
            : 'text-gray-400 hover:text-gray-600 active:text-gray-700'
        } ${isLoading ? 'cursor-not-allowed' : ''} ${isListening ? 'scale-110' : 'hover:scale-105'}`}
        style={{ 
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          outline: 'none',
          zIndex: 50
        }}
        title={isLoading ? "Iniciando..." : isListening ? "Parar gravação" : "Pesquisar com voz"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {isListening && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-500/90 p-2 rounded-lg text-xs text-white whitespace-nowrap">
          {isLoading ? 'Iniciando...' : 'Ouvindo...'}
          {transcript && <div className="italic mt-1">"{transcript}"</div>}
        </div>
      )}

      {error && !isListening && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-500/90 p-2 rounded-lg text-xs text-white whitespace-nowrap max-w-[200px] text-center">
          {error}
        </div>
      )}
    </div>
  )
}
