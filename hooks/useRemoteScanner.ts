'use client'

import { useState, useEffect, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface RemoteScannerState {
  sessionId: string | null
  isConnected: boolean
  isWaiting: boolean
  scannedCode: string | null
  error: string | null
}

export function useRemoteScanner() {
  const [state, setState] = useState<RemoteScannerState>({
    sessionId: null,
    isConnected: false,
    isWaiting: false,
    scannedCode: null,
    error: null
  })

  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Gerar sessionId único
  const generateSessionId = useCallback(() => {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Gerar URL com QR Code
  const generateScannerUrl = useCallback((sessionId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `${baseUrl}/scanner-remote?session=${sessionId}`
  }, [])

  // Iniciar sessão de scanner remoto
  const startRemoteSession = useCallback(() => {
    const sessionId = generateSessionId()
    
    setState(prev => ({
      ...prev,
      sessionId,
      isConnected: false,
      isWaiting: true,
      scannedCode: null,
      error: null
    }))

    try {
      // Criar canal Supabase Realtime com tratamento de erro
      const newChannel = supabase
        .channel(`scanner_${sessionId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'code_scanned' }, (payload) => {
          console.log('Código recebido:', payload)
          setState(prev => ({
            ...prev,
            scannedCode: payload.payload?.code || payload.code,
            isWaiting: false
          }))
        })
        .on('broadcast', { event: 'mobile_connected' }, () => {
          console.log('Mobile conectado')
          setState(prev => ({
            ...prev,
            isConnected: true
          }))
        })
        .on('broadcast', { event: 'mobile_disconnected' }, () => {
          console.log('Mobile desconectado')
          setState(prev => ({
            ...prev,
            isConnected: false
          }))
        })
        .subscribe((status, err) => {
          console.log('Status do canal:', status, err)
          if (status === 'SUBSCRIBED') {
            console.log('Canal scanner remoto conectado:', sessionId)
            // Enviar ping inicial para testar
            setTimeout(() => {
              newChannel.send({
                type: 'broadcast',
                event: 'ping'
              })
            }, 1000)
          } else if (status === 'CHANNEL_ERROR' || err) {
            console.error('Erro no canal:', err)
            setState(prev => ({
              ...prev,
              error: 'Erro ao conectar canal de comunicação. Verifique sua conexão.',
              isWaiting: false
            }))
          } else if (status === 'TIMED_OUT') {
            setState(prev => ({
              ...prev,
              error: 'Timeout na conexão. Tente novamente.',
              isWaiting: false
            }))
          } else if (status === 'CLOSED') {
            setState(prev => ({
              ...prev,
              isConnected: false,
              isWaiting: false
            }))
          }
        })

      setChannel(newChannel)
      return sessionId
    } catch (error) {
      console.error('Erro ao criar canal:', error)
      setState(prev => ({
        ...prev,
        error: 'Erro ao inicializar comunicação. Tente novamente.',
        isWaiting: false
      }))
      return sessionId
    }
  }, [generateSessionId])

  // Parar sessão
  const stopRemoteSession = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setChannel(null)
    }
    
    setState({
      sessionId: null,
      isConnected: false,
      isWaiting: false,
      scannedCode: null,
      error: null
    })
  }, [channel])

  // Limpar canal ao desmontar
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel])

  return {
    ...state,
    startRemoteSession,
    stopRemoteSession,
    generateScannerUrl
  }
}

// Hook para o mobile scanner
export function useMobileScanner() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Conectar à sessão
  const connectToSession = useCallback((sessionId: string) => {
    setSessionId(sessionId)
    
    try {
      const newChannel = supabase
        .channel(`scanner_${sessionId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'ping' }, () => {
          console.log('Ping recebido, respondendo...')
          // Enviar resposta de conexão
          newChannel.send({
            type: 'broadcast',
            event: 'mobile_connected'
          })
        })
        .subscribe((status, err) => {
          console.log('Status mobile:', status, err)
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            console.log('Mobile conectado à sessão:', sessionId)
            // Notificar desktop que mobile conectou
            newChannel.send({
              type: 'broadcast',
              event: 'mobile_connected'
            })
          } else if (status === 'CHANNEL_ERROR' || err) {
            console.error('Erro na conexão mobile:', err)
            setIsConnected(false)
          } else if (status === 'TIMED_OUT') {
            console.error('Timeout na conexão mobile')
            setIsConnected(false)
          } else if (status === 'CLOSED') {
            console.log('Canal mobile fechado')
            setIsConnected(false)
          }
        })

      setChannel(newChannel)
    } catch (error) {
      console.error('Erro ao conectar mobile:', error)
      setIsConnected(false)
    }
  }, [])

  // Enviar código escaneado
  const sendScannedCode = useCallback((code: string) => {
    if (channel && isConnected) {
      console.log('Enviando código:', code)
      try {
        channel.send({
          type: 'broadcast',
          event: 'code_scanned',
          payload: { code }
        })
        
        // Retry após 500ms se não receber confirmação
        setTimeout(() => {
          if (channel && isConnected) {
            console.log('Retry envio código:', code)
            channel.send({
              type: 'broadcast',
              event: 'code_scanned',
              payload: { code }
            })
          }
        }, 500)
      } catch (error) {
        console.error('Erro ao enviar código:', error)
      }
    } else {
      console.error('Não conectado para enviar código')
    }
  }, [channel, isConnected])

  // Desconectar
  const disconnect = useCallback(() => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'mobile_disconnected'
      })
      supabase.removeChannel(channel)
      setChannel(null)
    }
    setIsConnected(false)
    setSessionId(null)
  }, [channel])

  // Limpar canal ao desmontar
  useEffect(() => {
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [channel])

  return {
    sessionId,
    isConnected,
    connectToSession,
    sendScannedCode,
    disconnect
  }
}
