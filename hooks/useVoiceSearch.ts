'use client'

import { useState, useEffect, useCallback } from 'react'

interface VoiceSearchOptions {
  onResult?: (text: string, data?: any) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

interface VoiceSearchResult {
  isSupported: boolean
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  error?: string
  browserInfo: {
    name: string
    version: string
    supportsSpeech: boolean
    supportsHTTPS: boolean
    hasMicrophone: boolean
  }
}

export function useVoiceSearch(options: VoiceSearchOptions = {}): VoiceSearchResult {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string>('')
  const [recognition, setRecognition] = useState<any>(null)
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    supportsSpeech: false,
    supportsHTTPS: false,
    hasMicrophone: false
  })

  // Detecção automática de capacidades do navegador
  useEffect(() => {
    // Detectar navegador
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = ''

    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : ''
    }

    // Verificar suporte a Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const supportsSpeech = !!SpeechRecognition

    // Verificar HTTPS
    const supportsHTTPS = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'

    // Verificar microfone (assíncrono)
    const checkMicrophone = async () => {
      try {
        await navigator.mediaDevices?.getUserMedia({ audio: true })
        setBrowserInfo(prev => ({ ...prev, hasMicrophone: true }))
      } catch {
        setBrowserInfo(prev => ({ ...prev, hasMicrophone: false }))
      }
    }

    checkMicrophone()

    // Configurar reconhecimento se suportado
    if (supportsSpeech && supportsHTTPS) {
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true // Habilitar resultados intermediários
      recognitionInstance.lang = 'pt-BR'
      recognitionInstance.maxAlternatives = 3 // Mais alternativas para melhor precisão

      let timeoutId: NodeJS.Timeout | null = null

      recognitionInstance.onstart = () => {
        // Limpar timeout anterior se existir
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        setIsListening(true)
        setError('')
        setTranscript('')
        options.onStart?.()
      }

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        // Processar todos os resultados
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        // Atualizar transcript intermediário durante a fala
        if (interimTranscript) {
          setTranscript(interimTranscript)
        }

        // Processar resultado final
        if (finalTranscript) {
          const cleanTranscript = finalTranscript.trim().toLowerCase()
          setTranscript(finalTranscript)
          
          // Verificar se não é apenas uma palavra aleatória
          if (cleanTranscript.length > 2) {
            options.onResult?.(finalTranscript, event)
          }
        }
      }

      recognitionInstance.onerror = (event: any) => {
        let errorMessage = 'Erro na busca por voz'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhum discurso detectado. Fale claramente.'
            break
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio. Verifique o microfone.'
            break
          case 'not-allowed':
            errorMessage = 'Permissão do microfone negada. Permita o acesso.'
            break
          case 'network':
            errorMessage = 'Erro de conexão. Verifique sua internet.'
            break
          case 'service-not-allowed':
            errorMessage = 'Serviço de reconhecimento não permitido.'
            break
          case 'aborted':
            errorMessage = 'Reconhecimento interrompido.'
            break
          default:
            errorMessage = `Erro: ${event.error}`
        }

        setIsListening(false)
        setError(errorMessage)
        options.onError?.(errorMessage)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        
        // Limpar timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        options.onEnd?.()
      }

      setRecognition(recognitionInstance)
    }

    // Definir informações do navegador
    const info = {
      name: browserName,
      version: browserVersion,
      supportsSpeech,
      supportsHTTPS,
      hasMicrophone: false // Será atualizado assincronamente
    }

    setBrowserInfo(info)

    // Mensagem específica baseada no problema detectado
    if (!supportsSpeech || !supportsHTTPS) {
      let errorMessage = ''
      
      if (!supportsHTTPS) {
        errorMessage = 'Busca por voz requer HTTPS (exceto localhost)'
      } else if (!supportsSpeech) {
        errorMessage = `Navegador ${browserName} ${browserVersion} não suporta busca por voz`
      } else {
        errorMessage = 'Recurso de busca por voz indisponível'
      }

      setError(errorMessage)
      options.onError?.(errorMessage)
    }
  }, []) // Array de dependências vazio para executar apenas uma vez

  const startListening = useCallback(() => {
    if (!recognition) {
      const errorMessage = error || 'Busca por voz não disponível neste navegador'
      setError(errorMessage)
      options.onError?.(errorMessage)
      return
    }

    try {
      // Limpar estados anteriores
      setError('')
      setTranscript('')
      
      // Iniciar reconhecimento
      recognition.start()
      
      // Timeout automático após 8 segundos
      setTimeout(() => {
        if (recognition && isListening) {
          recognition.stop()
          setError('Tempo esgotado. Fale mais rápido ou tente novamente.')
        }
      }, 8000)
      
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento:', err)
      const errorMessage = 'Erro ao iniciar busca por voz. Verifique as permissões.'
      setError(errorMessage)
      options.onError?.(errorMessage)
    }
  }, [recognition, error, options, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }, [recognition, isListening])

  return {
    isSupported: browserInfo.supportsSpeech && browserInfo.supportsHTTPS,
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    browserInfo
  }
}
