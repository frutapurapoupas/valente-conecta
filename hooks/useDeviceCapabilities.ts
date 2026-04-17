'use client'

import { useState, useEffect } from 'react'

export interface DeviceCapabilities {
  hasCamera: boolean
  hasMediaDevices: boolean
  isSecureContext: boolean
  browserSupport: 'full' | 'partial' | 'none'
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browserName: string
  browserVersion: string
  os: string
  memoryLimit: number
  connectionType: string
  batteryLevel?: number
}

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        // Detecção básica de navegador
        const userAgent = navigator.userAgent.toLowerCase()
        const browserMatch = userAgent.match(/(chrome|firefox|safari|edge|opera)\/?\s*(\d+)/i)
        const browserName = browserMatch ? browserMatch[1] : 'unknown'
        const browserVersion = browserMatch ? browserMatch[2] : '0'

        // Detecção de SO
        let os = 'unknown'
        if (userAgent.includes('windows')) os = 'windows'
        else if (userAgent.includes('mac')) os = 'macos'
        else if (userAgent.includes('linux')) os = 'linux'
        else if (userAgent.includes('android')) os = 'android'
        else if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios'

        // Detecção de tipo de dispositivo
        const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent)
        const isTablet = userAgent.includes('tablet') || userAgent.includes('ipad')
        const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop')

        // Capacidades de mídia
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        const hasCamera = hasMediaDevices && 'mediaDevices' in navigator
        const isSecureContext = window.isSecureContext || 
                               location.protocol === 'https:' || 
                               location.hostname === 'localhost' ||
                               location.hostname === '127.0.0.1' ||
                               location.hostname.startsWith('192.168.') ||
                               location.hostname.startsWith('10.') ||
                               location.hostname.startsWith('172.')

        // Suporte do navegador
        let browserSupport: 'full' | 'partial' | 'none' = 'full'
        
        if (!hasMediaDevices) {
          browserSupport = 'none'
        } else if (!isSecureContext) {
          browserSupport = 'partial'
        } else if (browserName === 'safari' && parseInt(browserVersion) < 14) {
          browserSupport = 'partial' // Safari antigo
        } else if (browserName === 'chrome' && parseInt(browserVersion) < 60) {
          browserSupport = 'partial' // Chrome antigo
        } else if (browserName === 'firefox' && parseInt(browserVersion) < 55) {
          browserSupport = 'partial' // Firefox antigo
        }

        // Memória do dispositivo
        const memoryLimit = (navigator as any).deviceMemory || 4 // GB padrão

        // Tipo de conexão
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        const connectionType = connection ? (connection.effectiveType || 'unknown') : 'unknown'

        // Bateria (se disponível)
        let batteryLevel: number | undefined
        try {
          if ('getBattery' in navigator) {
            const battery = await (navigator as any).getBattery()
            batteryLevel = battery.level * 100
          }
        } catch (e) {
          // Bateria não disponível
        }

        const caps: DeviceCapabilities = {
          hasCamera,
          hasMediaDevices,
          isSecureContext,
          browserSupport,
          deviceType,
          browserName,
          browserVersion,
          os,
          memoryLimit,
          connectionType,
          batteryLevel
        }

        setCapabilities(caps)
      } catch (error) {
        console.error('Error detecting device capabilities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    detectCapabilities()
  }, [])

  return { capabilities, isLoading }
}

// Função para determinar se deve usar fallback
export function shouldUseFallback(capabilities: DeviceCapabilities): boolean {
  return capabilities.browserSupport === 'none' || 
         !capabilities.hasCamera || 
         !capabilities.isSecureContext
}

// Função para otimizar com base no dispositivo
export function getOptimizationSettings(capabilities: DeviceCapabilities) {
  return {
    // Para dispositivos limitados
    lowPerformanceMode: capabilities.memoryLimit < 4 || 
                       capabilities.connectionType === 'slow-2g' ||
                       capabilities.connectionType === '2g',
    
    // Para mobile
    mobileOptimizations: capabilities.deviceType === 'mobile',
    
    // Para tablets
    tabletOptimizations: capabilities.deviceType === 'tablet',
    
    // Para navegadores antigos
    legacyMode: capabilities.browserSupport === 'partial',
    
    // Para bateria baixa
    batterySaver: capabilities.batteryLevel && capabilities.batteryLevel < 20
  }
}
