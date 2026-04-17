'use client'

import { useState, useEffect } from 'react'

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      const hasShown = localStorage.getItem('pwa-banner-shown')
      if (!hasShown) {
        setTimeout(() => setShowBanner(true), 5000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('PWA instalado')
      }
      setDeferredPrompt(null)
    }
    setShowBanner(false)
    localStorage.setItem('pwa-banner-shown', 'true')
  }

  const handleClose = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-banner-shown', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-5 left-5 right-5 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 flex-wrap md:left-auto md:right-5 md:min-w-[320px]">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 rounded-xl p-2 w-10 h-10 flex items-center justify-center">
          📱
        </div>
        <div>
          <div className="font-bold text-white text-sm">Instale o Valente Conecta</div>
          <div className="text-white/80 text-xs">Tenha acesso mais rápido</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleClose}
          className="px-3 py-1.5 bg-white/20 rounded-xl text-white text-sm hover:bg-white/30 transition"
        >
          Agora não
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition"
        >
          Instalar
        </button>
      </div>
    </div>
  )
}