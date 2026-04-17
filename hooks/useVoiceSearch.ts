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
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'pt-BR'

      recognitionInstance.onstart = () => {
        setIsListening(true)
        setError('')
        setTranscript('')
        options.onStart?.()
      }

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)
        options.onResult?.(transcript, event)
      }

      recognitionInstance.onerror = (event: any) => {
        let errorMessage = 'Erro na busca por voz'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhum discurso detectado'
            break
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio'
            break
          case 'not-allowed':
            errorMessage = 'Permissão de microfone negada'
            break
          case 'network':
            errorMessage = 'Erro de conexão'
            break
          case 'service-not-allowed':
            errorMessage = 'Serviço de reconhecimento não permitido'
            break
          default:
            errorMessage = `Erro: ${event.error}`
        }

        setError(errorMessage)
        options.onError?.(errorMessage)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
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
      recognition.start()
    } catch (err) {
      const errorMessage = 'Erro ao iniciar busca por voz'
      setError(errorMessage)
      options.onError?.(errorMessage)
    }
  }, [recognition, error, options])

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
