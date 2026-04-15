// components/ui/PerformanceOptimizer.tsx
'use client'

import { useEffect, useState } from 'react'

interface PerformanceOptimizerProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  timeout?: number
}

export function PerformanceOptimizer({ 
  children, 
  fallback, 
  timeout = 3000 
}: PerformanceOptimizerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTime, setLoadTime] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    
    // Timeout de segurança
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('Carregamento lento detectado, forçando renderização')
        setIsLoading(false)
        setHasError(true)
      }
    }, timeout)

    // Monitorar quando a página estiver completamente carregada
    const handleLoad = () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      setLoadTime(duration)
      
      // Registrar métrica
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // @ts-ignore
        gtag('event', 'page_load_time', {
          'event_category': 'performance',
          'value': Math.round(duration)
        })
      }
      
      setIsLoading(false)
      clearTimeout(timer)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(timer)
      }
    }
  }, [timeout, isLoading])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-yellow-500 text-xs font-bold">VALENTE</span>
            </div>
          </div>
          <p className="text-zinc-400 mt-4 text-sm">Carregando sua experiência...</p>
          <p className="text-zinc-500 text-xs mt-2">Valente Conecta</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-bold text-white mb-2">Aguarde um momento</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Estamos otimizando sua conexão para uma experiência melhor
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}